// Copyright (c) Quartech. All rights reserved.

using System;
using CopilotChat.WebApi.Storage;

namespace CopilotChat.WebApi.Models.Storage;

public class SpecializationIndex : IStorageEntity
{
    public string Id { get; set; }

    public string Partition => this.Id;

    public string Name { get; set; }

    public string QueryType { get; set; }

    public string AISearchDeploymentConnection { get; set; }

    public string OpenAIDeploymentConnection { get; set; }

    public string EmbeddingDeployment { get; set; }

    public int Order { get; set; }

    public SpecializationIndex(
        string Name,
        string QueryType,
        string AISearchDeploymentConnection,
        string OpenAIDeploymentConnection,
        string EmbeddingDeployment,
        int Order
    )
    {
        this.Id = Guid.NewGuid().ToString();
        this.Name = Name;
        this.QueryType = QueryType;
        this.AISearchDeploymentConnection = AISearchDeploymentConnection;
        this.OpenAIDeploymentConnection = OpenAIDeploymentConnection;
        this.EmbeddingDeployment = EmbeddingDeployment;
        this.Order = Order;
    }
}
