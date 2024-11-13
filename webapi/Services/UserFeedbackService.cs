using System;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using CopilotChat.WebApi.Models.Request;
using CopilotChat.WebApi.Models.Response;
using CopilotChat.WebApi.Storage;

namespace CopilotChat.WebApi.Services;

public class UserFeedbackService : IUserFeedbackService
{
    private ChatSessionRepository _sessionRepository;
    private ChatMessageRepository _messageRepository;

    public UserFeedbackService(ChatSessionRepository sessionRepository, ChatMessageRepository messageRepository)
    {
        this._sessionRepository = sessionRepository;
        this._messageRepository = messageRepository;
    }

    public async Task<UserFeedbackResult> Search(UserFeedbackFilter filter)
    {
        var chatMessages = await this._messageRepository.QueryEntitiesAsync(m => m.UserFeedback != null);
        var chatSessions = await this._sessionRepository.FindByIdsAsync(chatMessages.Select(c => c.ChatId));

        var userFeedbackResult = new UserFeedbackResult();
        foreach (var chatMessage in chatMessages)
        {
            var chatSession = chatSessions.FirstOrDefault(c => c.Id == chatMessage.ChatId);
            if (chatSession == null)
            {
                throw new ArgumentNullException($"Cannot find corresponding chat session id : {chatMessage.ChatId}");
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

    private string GetUserPrompt(string prompt)
    {
        var document = JsonDocument.Parse(prompt);
        var root = document.RootElement;

        var metaPromptArray = root.GetProperty("metaPromptTemplate");

        JsonElement lastItem = metaPromptArray.EnumerateArray().Last();

        string userPrompt =
            lastItem.GetProperty("Items").EnumerateArray().FirstOrDefault().GetProperty("Text").GetString()
            ?? "No user prompt found.";

        return userPrompt;
    }
}
