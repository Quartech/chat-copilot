using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;
using CopilotChat.WebApi.Models.Storage;

namespace CopilotChat.WebApi.Models.Response;

public class UserFeedbackResult
{
    [JsonPropertyName("count")]
    public int Count { get; set; }

    [JsonPropertyName("items")]
    public List<UserFeedbackItem> Items { get; set; } = new List<UserFeedbackItem>();
}

public class UserFeedbackItem
{
    public string ChatId { get; set; } = string.Empty;
    public string MessageId { get; set; } = string.Empty;
    public string SpecializationId { get; set; } = string.Empty;
    public UserFeedback? UserFeedback { get; set; }
    public string Content { get; set; } = string.Empty;
    public string Prompt { get; set; } = string.Empty;
    public DateTimeOffset Timestamp { get; set; }
}
