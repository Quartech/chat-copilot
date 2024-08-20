// Copyright (c) Quartech. All rights reserved.

using System.Collections.Generic;
using System.Threading.Tasks;
using CopilotChat.WebApi.Models.Storage;

namespace CopilotChat.WebApi.Storage;

/// <summary>
/// A repository for chat users.
/// </summary>
public class ChatUserRepository : Repository<ChatUser>
{
    /// <summary>
    /// Initializes a new instance of the ChatUserRepository class.
    /// </summary>
    /// <param name="storageContext">The storage context.</param>
    public ChatUserRepository(IStorageContext<ChatUser> storageContext)
        : base(storageContext)
    {
    }

    /// <summary>
    /// Finds user by user id.
    /// </summary>
    /// <param name="userId">The user id.</param>
    /// <returns>A list of the user found.</returns>
    public Task<IEnumerable<ChatUser>> FindByUserIdAsync(string userId)
    {
        return base.StorageContext.QueryEntitiesAsync(e => e.UserId == userId);
    }
}
