using System.Text.Json.Serialization;

namespace CopilotChat.WebApi.Models.Request;

public class QOpenAIDeploymentCreate : QOpenAIDeploymentBase
{
    [JsonPropertyName("name")]
    public new required string Name { get; set; }

    [JsonPropertyName("endpoint")]
    public new required string Endpoint { get; set; }

    [JsonPropertyName("chatCompletionDeployments")]
    public new required string ChatCompletionDeployments { get; set; }

    [JsonPropertyName("embeddingDeployments")]
    public new required string EmbeddingDeployments { get; set; }

    [JsonPropertyName("imageGenerationDeployments")]
    public new required string ImageGenerationDeployments { get; set; }

    [JsonPropertyName("secretName")]
    public new required string SecretName { get; set; }
}
