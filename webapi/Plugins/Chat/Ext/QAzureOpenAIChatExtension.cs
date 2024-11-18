// Copyright (c) Quartech. All rights reserved.

using System;
using System.Collections.Generic;
using System.Linq;
using Azure.AI.OpenAI.Chat;
using CopilotChat.WebApi.Models.Storage;
using CopilotChat.WebApi.Services;
using CopilotChat.WebApi.Storage;

namespace CopilotChat.WebApi.Plugins.Chat.Ext;

/// <summary>
/// Chat extension class to support Azure search indexes for bot response.
/// </summary>
public class QAzureOpenAIChatExtension
{
    /// <summary>
    /// Default specialization key.
    /// </summary>
    public string DefaultSpecialization { get; } = "general";

    /// <summary>
    /// Name of the key which carries the specialization
    /// </summary>
    public string ContextKey { get; } = "specialization";

    /// <summary>
    /// Chat Extension Azure OpenAI options
    /// </summary>
    private readonly QAzureOpenAIChatOptions _qAzureOpenAIChatOptions;

    /// <summary>
    /// Specialization data Service.
    /// </summary>
    private readonly QSpecializationService _qSpecializationService;

    public QAzureOpenAIChatExtension(
        QAzureOpenAIChatOptions qAzureOpenAIChatOptions,
        SpecializationRepository specializationSourceRepository
    )
    {
        this._qAzureOpenAIChatOptions = qAzureOpenAIChatOptions;
        this._qSpecializationService = new QSpecializationService(
            specializationSourceRepository,
            qAzureOpenAIChatOptions
        );
    }

    public bool isEnabled(string? specializationId)
    {
        return this._qAzureOpenAIChatOptions.Enabled && specializationId != this.DefaultSpecialization;
    }

#pragma warning disable AOAI001 // Type is for evaluation purposes only and is subject to change or removal in future updates. Suppress this diagnostic to proceed.
    public AzureSearchChatDataSource? GetAzureSearchChatDataSource(Specialization? specialization)
    {
        if (
            specialization == null
            || string.IsNullOrEmpty(specialization.IndexName)
            || !this.isEnabled(specialization.Id)
        )
        {
            return null;
        }

        var qSpecializationIndex = this.GetSpecializationIndexByName(specialization.IndexName);
        if (qSpecializationIndex == null)
        {
            return null;
        }

        var aiSearchDeploymentConnection = this._qAzureOpenAIChatOptions.AISearchDeploymentConnections.FirstOrDefault(
            c => c.Name == qSpecializationIndex.AISearchDeploymentConnection
        );
        if (aiSearchDeploymentConnection == null)
        {
            throw new InvalidOperationException("Configuration error: AI Search Deployment Connection is missing.");
        }

        var openAIDeploymentConnection = this._qAzureOpenAIChatOptions.OpenAIDeploymentConnections.FirstOrDefault(c =>
            c.Name == qSpecializationIndex.OpenAIDeploymentConnection
        );
        if (
            openAIDeploymentConnection == null
            || openAIDeploymentConnection.Endpoint == null
            || openAIDeploymentConnection.APIKey == null
        )
        {
            throw new InvalidOperationException("Configuration error: OpenAI Deployment Connection is missing.");
        }

        var embeddingEndpoint = this.GenerateEmbeddingEndpoint(
            openAIDeploymentConnection.Endpoint,
            qSpecializationIndex
        );
        return new AzureSearchChatDataSource
        {
            IndexName = specialization.IndexName,
            Endpoint = aiSearchDeploymentConnection.Endpoint,
            Strictness = specialization.Strictness,
            FieldMappings = new DataSourceFieldMappings
            {
                UrlFieldName = qSpecializationIndex.FieldMapping?.UrlFieldName,
                TitleFieldName = qSpecializationIndex.FieldMapping?.TitleFieldName,
                FilePathFieldName = qSpecializationIndex.FieldMapping?.FilepathFieldName,
            },
            SemanticConfiguration = qSpecializationIndex.SemanticConfiguration,
            QueryType = new DataSourceQueryType(qSpecializationIndex.QueryType),
            InScope = specialization.RestrictResultScope,
            TopNDocuments = specialization.DocumentCount,
            Authentication = DataSourceAuthentication.FromApiKey(aiSearchDeploymentConnection.APIKey),
            VectorizationSource = DataSourceVectorizer.FromEndpoint(
                embeddingEndpoint,
                DataSourceAuthentication.FromApiKey(openAIDeploymentConnection.APIKey)
            ),
        };
    }
#pragma warning restore AOAI001 // Type is for evaluation purposes only and is subject to change or removal in future updates. Suppress this diagnostic to proceed.

    /// <summary>
    /// Retrieve all configured specialization indexess.
    /// </summary>
    public List<string> GetAllSpecializationIndexNames()
    {
        var indexNames = new List<string>();
        foreach (
            QAzureOpenAIChatOptions.QSpecializationIndex _qSpecializationIndex in this._qAzureOpenAIChatOptions.SpecializationIndexes
        )
        {
            indexNames.Add(_qSpecializationIndex.IndexName);
        }
        return indexNames;
    }

    /// <summary>
    /// Retrieve the specialization Index based on Index name.
    /// </summary>
    public QAzureOpenAIChatOptions.QSpecializationIndex? GetSpecializationIndexByName(string indexName)
    {
        foreach (
            QAzureOpenAIChatOptions.QSpecializationIndex _qSpecializationIndex in this._qAzureOpenAIChatOptions.SpecializationIndexes
        )
        {
            if (_qSpecializationIndex.IndexName == indexName)
            {
                return _qSpecializationIndex;
            }
        }
        return null;
    }

    public Uri? GenerateEmbeddingEndpoint(
        Uri connectionEndpoint,
        QAzureOpenAIChatOptions.QSpecializationIndex qSpecializationIndex
    )
    {
        return new Uri(
            connectionEndpoint,
            $"/openai/deployments/{qSpecializationIndex.EmbeddingDeployment}/embeddings?api-version=2023-05-15"
        );
    }

    public QAzureOpenAIChatOptions.AISearchDeploymentConnection? GetAISearchDeploymentConnection(string connectionName)
    {
        return this._qAzureOpenAIChatOptions.AISearchDeploymentConnections.FirstOrDefault(connection =>
            connection.Name == connectionName
        );
    }

    public (string? ApiKey, string? Endpoint) GetAISearchDeploymentConnectionDetails(string indexName)
    {
        var specializationIndex = this.GetSpecializationIndexByName(indexName);
        if (specializationIndex == null)
        {
            return (null, null);
        }
        var aiSearchDeploymentConnection = this.GetAISearchDeploymentConnection(
            specializationIndex.AISearchDeploymentConnection
        );
        return (aiSearchDeploymentConnection?.APIKey, aiSearchDeploymentConnection?.Endpoint.ToString());
    }

    /// <summary>
    /// Retrieve all chat completion deployments from the available OpenAI deployment connections.
    /// </summary>
    public List<QAzureOpenAIChatOptions.ChatCompletionDeployment> GetAllChatCompletionDeployments()
    {
        var chatCompletionDeployments = new List<QAzureOpenAIChatOptions.ChatCompletionDeployment>();
        foreach (
            QAzureOpenAIChatOptions.OpenAIDeploymentConnection connection in this._qAzureOpenAIChatOptions.OpenAIDeploymentConnections
        )
        {
            foreach (var deployment in connection.ChatCompletionDeployments)
            {
                var deploymentWithConnection = new QAzureOpenAIChatOptions.ChatCompletionDeployment
                {
                    Name = $"{deployment.Name} ({connection.Name})",
                    CompletionTokenLimit = deployment.CompletionTokenLimit,
                };
                chatCompletionDeployments.Add(deploymentWithConnection);
            }
        }
        return chatCompletionDeployments;
    }

    /// <summary>
    /// Get the default chat completion deployment.
    /// </summary>
#pragma warning disable CA1024
    public string GetDefaultChatCompletionDeployment()
    {
        return this._qAzureOpenAIChatOptions.DefaultModel;
    }
}
