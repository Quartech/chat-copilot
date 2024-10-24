using System;
using System.Text.Json.Serialization;

namespace CopilotChat.WebApi.Models.Request;

public class QSpecializationSwapOrder
{
    [JsonPropertyName("fromId")]
    public Guid FromId { get; set; }

    [JsonPropertyName("fromOrder")]
    public int FromOrder { get; set; }

    [JsonPropertyName("toId")]
    public Guid ToId { get; set; }

    [JsonPropertyName("toOrder")]
    public int ToOrder { get; set; }
}
