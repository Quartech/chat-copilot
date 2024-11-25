using System.Text.Json.Serialization;

namespace CopilotChat.WebApi.Models.Request;

public class QSpecializationIndexBase
{
    [JsonPropertyName("name")]
    public string? Name { get; set; }

    [JsonPropertyName("queryType")]
    public string? QueryType { get; set; }

    [JsonPropertyName("aiSearchDeploymentConnection")]
    public string? AISearchDeploymentConnection { get; set; }

    [JsonPropertyName("openAIDeploymentConnection")]
    public string? OpenAIDeploymentConnection { get; set; }

    [JsonPropertyName("embeddingDeployment")]
    public string? EmbeddingDeployment { get; set; }

    [JsonPropertyName("order")]
    public int? Order { get; set; }
}
