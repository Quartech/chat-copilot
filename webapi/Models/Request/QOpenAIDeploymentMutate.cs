using System.Text.Json.Serialization;

namespace CopilotChat.WebApi.Models.Request;

public class QOpenAIDeploymentMutate : QOpenAIDeploymentBase
{
    [JsonPropertyName("chatCompletionDeployments")]
    public new required string ChatCompletionDeployments { get; set; }

    [JsonPropertyName("embeddingDeployments")]
    public new required string EmbeddingDeployments { get; set; }

    [JsonPropertyName("imageGenerationDeployments")]
    public new required string ImageGenerationDeployments { get; set; }
}
