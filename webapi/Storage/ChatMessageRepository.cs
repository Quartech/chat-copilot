﻿// Copyright (c) Microsoft. All rights reserved.

using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CopilotChat.WebApi.Models.Request;
using CopilotChat.WebApi.Models.Storage;

namespace CopilotChat.WebApi.Storage;

/// <summary>
/// A repository for chat messages.
/// </summary>
public class ChatMessageRepository : CopilotChatMessageRepository
{
    /// <summary>
    /// Initializes a new instance of the ChatMessageRepository class.
    /// </summary>
    /// <param name="storageContext">The storage context.</param>
    public ChatMessageRepository(ICopilotChatMessageStorageContext storageContext)
        : base(storageContext) { }

    /// <summary>
    /// Finds chat messages by chat id.
    /// </summary>
    /// <param name="chatId">The chat id.</param>
    /// <param name="skip">Number of messages to skip before starting to return messages.</param>
    /// <param name="count">The number of messages to return. -1 returns all messages.</param>
    /// <returns>A list of ChatMessages matching the given chatId sorted from most recent to oldest.</returns>
    public Task<IEnumerable<CopilotChatMessage>> FindByChatIdAsync(
        string chatId,
        CopilotChatMessageSortOption? sortOption = null,
        int skip = 0,
        int count = -1
    )
    {
        return base.QueryEntitiesAsync(e => e.ChatId == chatId, sortOption, skip, count);
    }

    /// <summary>
    /// Finds messages by id.
    /// </summary>
    /// <param name="chatId">The chat id.</param>
    /// <param name="messageId">The message id.</param>
    /// <returns>The message if found</returns>
    public Task<CopilotChatMessage> FindByMessageIdAsync(string chatId, string messageId)
    {
        return base.FindByIdAsync(messageId, chatId);
    }

    /// <summary>
    /// Finds the most recent chat message by chat id.
    /// </summary>
    /// <param name="chatId">The chat id.</param>
    /// <returns>The most recent ChatMessage matching the given chatId.</returns>
    public async Task<CopilotChatMessage> FindLastByChatIdAsync(string chatId)
    {
        var chatMessages = await this.FindByChatIdAsync(chatId, null, 0, 1);
        var first = chatMessages.MaxBy(e => e.Timestamp);
        return first ?? throw new KeyNotFoundException($"No messages found for chat '{chatId}'.");
    }
}
