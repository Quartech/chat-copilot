using System;

namespace CopilotChat.Shared;
public class DefaultConfiguration
{
    public string DefaultModel { get; set; } = "";
    public string DefaultEmbeddingModel { get; set; } = "";
    public string APIKey { get; set; } = string.Empty;
    public Uri? DefaultEndpoint { get; set; } = null;

    public DefaultConfiguration(string defaultModel, string defaultEmbeddingModel, string apiKey, Uri? defaultEndpoint)
    {
        this.DefaultModel = defaultModel;
        this.DefaultEmbeddingModel = defaultEmbeddingModel;
        this.APIKey = apiKey;
        this.DefaultEndpoint = defaultEndpoint;
    }
}
