// Copyright (c) Quartech. All rights reserved.
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace CopilotChat.WebApi.Models.Request;

/// <summary>
/// Request definition for DeleteAllChats.
/// </summary>
public class DeleteAllChatsParameters
{
    /// <summary>
    /// Chat Ids to delete.
    /// </summary>
    [JsonPropertyName("chatIds")]
    public List<string> ChatIds { get; set; } = new List<string>();
}
