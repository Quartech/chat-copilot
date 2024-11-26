using System.Collections.Generic;
using System.Text.Json.Serialization;
using CopilotChat.WebApi.Models.Storage;

namespace CopilotChat.WebApi.Models.Request;
public class QOpenAIDeploymentBase
{
    [JsonPropertyName("name")]
    public string? Name { get; set; }
    [JsonPropertyName("endpoint")]
    public string? Endpoint { get; set; }
    [JsonPropertyName("secretName")]
    public string? SecretName { get; set; }
    [JsonPropertyName("chatCompletionDeployments")]
    public IList<ChatCompletionDeployment>? ChatCompletionDeployments { get; set; }
    [JsonPropertyName("embeddingDeployments")]
    public IList<string>? EmbeddingDeployments { get; set; }
    [JsonPropertyName("order")]
    public int? Order { get; set; }
}