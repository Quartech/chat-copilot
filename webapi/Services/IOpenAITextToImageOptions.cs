namespace CopilotChat.WebApi.Services;

public class IOpenAITextToImageOptions
{
    public string Deployment { get; } = string.Empty;
    public string Endpoint { get; } = string.Empty;
    public string ApiKey { get; } = string.Empty;
}
