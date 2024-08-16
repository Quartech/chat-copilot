// Copyright (c) Microsoft. All rights reserved.

using System.Collections.Generic;
using System.Threading.Tasks;
using CopilotChat.WebApi.Models.Storage;

namespace CopilotChat.WebApi.Storage;

/// <summary>
/// A repository for chat sessions.
/// </summary>
public class ChatUserRepository : Repository<ChatUser>
{
    /// <summary>
    /// Initializes a new instance of the ChatParticipantRepository class.
    /// </summary>
    /// <param name="storageContext">The storage context.</param>
    public ChatUserRepository(IStorageContext<ChatUser> storageContext)
        : base(storageContext)
    {
    }

    /// <summary>
    /// Finds chat participants by user id.
    /// A user can be part of multiple chats, thus a user can have multiple chat participants.
    /// </summary>
    /// <param name="userId">The user id.</param>
    /// <returns>A list of chat participants of the same user id in different chat sessions.</returns>
    public Task<IEnumerable<ChatUser>> FindByUserIdAsync(string userId)
    {
        return base.StorageContext.QueryEntitiesAsync(e => e.UserId == userId);
    }
}
