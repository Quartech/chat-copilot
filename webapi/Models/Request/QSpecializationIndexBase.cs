namespace CopilotChat.WebApi.Models.Request;

public class QSpecializationIndexBase
{
    public string? Name { get; set; }

    public string? QueryType { get; set; }

    public string? AISearchDeploymentConnection { get; set; }

    public string? OpenAIDeploymentConnection { get; set; }

    public string? EmbeddingDeployment { get; set; }
}
