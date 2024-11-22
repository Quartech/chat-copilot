// Copyright (c) Quartech. All rights reserved.
using System.Text.Json.Serialization;

namespace CopilotChat.WebApi.Models.Request;

/// <summary>
/// Request definition for Specialization
/// </summary>
public class DeleteAllChatsParameters
{
    /// <summary>
    /// Image FilePath of the specialization.
    /// </summary>
    [JsonPropertyName("chatIds")]
    public string[]? ChatIds { get; set; }
}
