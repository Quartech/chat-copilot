using System.Collections.Generic;
using System.Text.Json.Serialization;
using CopilotChat.WebApi.Models.Storage;

namespace CopilotChat.WebApi.Models.Response;

public class QOpenAIDeploymentResponse
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("endpoint")]
    public string Endpoint { get; set; } = string.Empty;

    [JsonPropertyName("secretName")]
    public string SecretName { get; set; } = string.Empty;

    [JsonPropertyName("chatCompletionDeployments")]
    public IList<ChatCompletionDeployment> ChatCompletionDeployments { get; set; } =
        new List<ChatCompletionDeployment>();

    [JsonPropertyName("embeddingDeployments")]
    public IList<string> EmbeddingDeployments { get; set; } = new List<string>();
    [JsonPropertyName("imageGenerationDeployments")]
    public IList<string> ImageGenerationDeployments { get; set; } = new List<string>();

    [JsonPropertyName("order")]
    public int Order { get; set; } = 0;

    public QOpenAIDeploymentResponse(OpenAIDeployment deployment)
    {
        this.Name = deployment.Name;
        this.Endpoint = deployment.Endpoint;
        this.SecretName = deployment.SecretName;
        this.ChatCompletionDeployments = deployment.ChatCompletionDeployments;
        this.EmbeddingDeployments = deployment.EmbeddingDeployments;
        this.Order = deployment.Order;
        this.ImageGenerationDeployments = deployment.ImageGenerationDeployments;
    }
}
