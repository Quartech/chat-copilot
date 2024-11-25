using System.Text.Json.Serialization;

namespace CopilotChat.WebApi.Models.Request;

public class QSpecializationIndexCreate : QSpecializationIndexBase
{
    [JsonPropertyName("name")]
    public new required string Name { get; set; }

    [JsonPropertyName("queryType")]
    public new required string QueryType { get; set; }

    [JsonPropertyName("aiSearchDeploymentConnection")]
    public new required string AISearchDeploymentConnection { get; set; }

    [JsonPropertyName("openAIDeploymentConnection")]
    public new required string OpenAIDeploymentConnection { get; set; }

    [JsonPropertyName("embeddingDeployment")]
    public new required string EmbeddingDeployment { get; set; }
}
