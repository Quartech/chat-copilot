using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using CopilotChat.WebApi.Models.Request;
using CopilotChat.WebApi.Models.Response;
using CopilotChat.WebApi.Models.Storage;
using CopilotChat.WebApi.Storage;
using CopilotChat.WebApi.Utilities;

namespace CopilotChat.WebApi.Services;

public class UserFeedbackService : IUserFeedbackService
{
    private ChatSessionRepository _sessionRepository;
    private ChatMessageRepository _messageRepository;

    private readonly Regex _dateRegex = new(@"^\[(?<date>\d{2}/\d{2}/\d{4}\s+\d{2}:\d{2}:\d{2}\s+[AP]M)\]");

    public UserFeedbackService(ChatSessionRepository sessionRepository, ChatMessageRepository messageRepository)
    {
        this._sessionRepository = sessionRepository;
        this._messageRepository = messageRepository;
    }

    /// <summary>
    /// Searches for user feedback items based on the provided filter criteria.
    /// </summary>
    /// <param name="filter">An object containing filter parameters like start date, end date, feedback positivity, and specialization ID.</param>
    /// <returns>A task that represents an asynchronous operation returning a <see cref="UserFeedbackResult"/> containing matched feedback items.</returns>
    public async Task<UserFeedbackResult> Search(UserFeedbackFilter filter)
    {
        Expression<Func<CopilotChatMessage, bool>> messagePredicate = this.BuildMessagesQueryPredicate(filter);
        var chatMessages = await this._messageRepository.QueryEntitiesAsync(messagePredicate, filter.SortBy);

        Expression<Func<ChatSession, bool>> sessionPredicate = this.BuildSessionsQueryPredicate(filter, chatMessages);
        var chatSessions = await this._sessionRepository.QueryEntitiesAsync(sessionPredicate);

        var userFeedbackResult = new UserFeedbackResult();
        foreach (var chatMessage in chatMessages)
        {
            var chatSession = chatSessions.FirstOrDefault(c => c.Id == chatMessage.ChatId);
            if (chatSession == null)
            {
                continue;
            }
            userFeedbackResult.Items.Add(
                new UserFeedbackItem
                {
                    MessageId = chatMessage.Id,
                    ChatId = chatSession.Id,
                    SpecializationId = chatSession.specializationId,
                    UserFeedback = chatMessage.UserFeedback,
                    Prompt = this.GetUserPrompt(chatMessage.Prompt),
                    Content = chatMessage.Content,
                    Timestamp = chatMessage.Timestamp,
                }
            );
        }
        return userFeedbackResult;
    }

    /// <summary>
    /// Constructs a predicate for querying <see cref="CopilotChatMessage"/> based on the specified filter.
    /// </summary>
    /// <param name="filter">The filter containing criteria for querying messages.</param>
    /// <returns>An expression that can be used to filter messages by feedback, date, and type.</returns>
    private Expression<Func<CopilotChatMessage, bool>> BuildMessagesQueryPredicate(UserFeedbackFilter filter)
    {
        Expression<Func<CopilotChatMessage, bool>> predicate = m => m.UserFeedback != null;

        if (filter.StartDate.HasValue)
        {
            predicate = predicate.And(m => m.Timestamp >= filter.StartDate.Value);
        }

        if (filter.EndDate.HasValue)
        {
            predicate = predicate.And(m => m.Timestamp <= filter.EndDate.Value.AddDays(1).AddSeconds(-1));
        }

        if (filter.IsPositive.HasValue)
        {
            predicate = predicate.And(m =>
                m.UserFeedback == (filter.IsPositive.Value ? UserFeedback.Positive : UserFeedback.Negative)
            );
        }

        return predicate;
    }

    /// <summary>
    /// Builds a predicate for querying <see cref="ChatSession"/> objects, filtering by message IDs and optional specialization.
    /// </summary>
    /// <param name="filter">The filter which might include a specialization ID for further filtering.</param>
    /// <param name="chatMessages">The set of messages from which to extract ChatIds to match against sessions.</param>
    /// <returns>An expression to filter chat sessions by.</returns>
    private Expression<Func<ChatSession, bool>> BuildSessionsQueryPredicate(
        UserFeedbackFilter filter,
        IEnumerable<CopilotChatMessage> chatMessages
    )
    {
        var chatSet = new HashSet<string>(chatMessages.Select(c => c.ChatId));

        Expression<Func<ChatSession, bool>> predicate = s => chatSet.Contains(s.Partition);

        if (!string.IsNullOrEmpty(filter.SpecializationId))
        {
            predicate = predicate.And(s => s.specializationId == filter.SpecializationId);
        }

        return predicate;
    }

    /// <summary>
    /// Extracts the user's prompt from a JSON formatted string, optionally removing a date timestamp from the beginning.
    /// </summary>
    /// <param name="prompt">A JSON string that might contain a date timestamp followed by the actual user prompt.</param>
    /// <returns>The user's prompt text, with any leading date timestamp removed if present.</returns>
    private string GetUserPrompt(string prompt)
    {
        var document = JsonDocument.Parse(prompt);
        var root = document.RootElement;

        var metaPromptArray = root.GetProperty("metaPromptTemplate");

        JsonElement lastItem = metaPromptArray.EnumerateArray().Last();

        string userPrompt =
            lastItem.GetProperty("Items").EnumerateArray().FirstOrDefault().GetProperty("Text").GetString()
            ?? "No user prompt found.";

        var match = this._dateRegex.Match(userPrompt);
        if (match.Success)
        {
            userPrompt = userPrompt.Substring(match.Length).TrimStart();
        }

        return userPrompt;
    }
}
