using System.Text.Json.Serialization;
using CopilotChat.WebApi.Models.Storage;

namespace CopilotChat.WebApi.Models.Response;

public class QSpecializationIndexResponse
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("queryType")]
    public string QueryType { get; set; } = string.Empty;

    [JsonPropertyName("aiSearchDeploymentConnection")]
    public string AISearchDeploymentConnection { get; set; } = string.Empty;

    [JsonPropertyName("openAIDeploymentConnection")]
    public string OpenAIDeploymentConnection { get; set; } = string.Empty;

    [JsonPropertyName("embeddingDeployment")]
    public string EmbeddingDeployment { get; set; } = string.Empty;

    public QSpecializationIndexResponse(SpecializationIndex index)
    {
        this.Id = index.Id;
        this.QueryType = index.QueryType;
        this.Name = index.Name;
        this.AISearchDeploymentConnection = index.AISearchDeploymentConnection;
        this.OpenAIDeploymentConnection = index.OpenAIDeploymentConnection;
        this.EmbeddingDeployment = index.EmbeddingDeployment;
    }
}
