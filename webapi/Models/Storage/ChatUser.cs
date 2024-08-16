// Copyright (c) Microsoft. All rights reserved.

using System;
using System.Text.Json.Serialization;
using CopilotChat.WebApi.Storage;

namespace CopilotChat.WebApi.Models.Storage;

public class ChatUserSettings
{
    /// <summary>
    /// Is Dark Mode Enabled
    /// </summary>
    public bool darkMode { get; set; }

    /// <summary>
    /// Are Plugins & Personas Enabled
    /// </summary>
    public bool pluginsPersonas { get; set; }

    /// <summary>
    /// Is Simplified Chat Enabled
    /// </summary>
    public bool simplifiedChat { get; set; }
}

/// <summary>
/// A chat participant is a user that is part of a chat.
/// A user can be part of multiple chats, thus a user can have multiple chat participants.
/// </summary>
public class ChatUser : IStorageEntity
{
    /// <summary>
    /// Participant ID that is persistent and unique.
    /// </summary>
    public string Id { get; set; }

    /// <summary>
    /// User ID that is persistent and unique.
    /// </summary>
    public string UserId { get; set; }

    public ChatUserSettings settings { get; set; }

    /// <summary>
    /// The partition key for the source.
    /// </summary>
    [JsonIgnore]
    public string Partition => this.UserId;

    public ChatUser(string userId)
    {
        this.Id = Guid.NewGuid().ToString();
        this.UserId = userId;
        this.settings = new ChatUserSettings
        {
            darkMode = false,
            pluginsPersonas = false,
            simplifiedChat = true,
        };
    }
}
