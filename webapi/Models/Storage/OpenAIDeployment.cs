using System;
using System.Collections.Generic;
using CopilotChat.WebApi.Storage;

namespace CopilotChat.WebApi.Models.Storage;

public class ChatCompletionDeployment
{
    public string Name { get; set; } = string.Empty;

    public uint CompletionTokenLimit { get; set; } = 0;
}

public class OpenAIDeployment : IStorageEntity
{
    public string Id { get; set; }

    public string Partition => this.Id;

    public string Name { get; set; }

    public string Endpoint { get; set; }

    public string SecretName { get; set; }

    public IList<ChatCompletionDeployment> ChatCompletionDeployments { get; set; }

    public IList<string> EmbeddingDeployments { get; set; }

    public int Order { get; set; }

    public OpenAIDeployment(
        string Name,
        string Endpoint,
        string SecretName,
        IList<ChatCompletionDeployment> ChatCompletionDeployments,
        IList<string> EmbeddingDeployments
    )
    {
        this.Id = Guid.NewGuid().ToString();
        this.Name = Name;
        this.SecretName = SecretName;
        this.Endpoint = Endpoint;
        this.ChatCompletionDeployments = ChatCompletionDeployments;
        this.EmbeddingDeployments = EmbeddingDeployments;
    }
}