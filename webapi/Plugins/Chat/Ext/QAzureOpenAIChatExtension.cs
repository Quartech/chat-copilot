// Copyright (c) Quartech. All rights reserved.

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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

    private readonly QSpecializationIndexService _qSpecializationIndexService;

    private readonly QOpenAIDeploymentService _qOpenAIDeploymentService;

    public QAzureOpenAIChatExtension(
        QAzureOpenAIChatOptions qAzureOpenAIChatOptions,
        SpecializationRepository specializationSourceRepository,
        SpecializationIndexRepository indexRepository,
        OpenAIDeploymentRepository openAIDeploymentRepository
    )
    {
        this._qAzureOpenAIChatOptions = qAzureOpenAIChatOptions;
        this._qSpecializationService = new QSpecializationService(
            specializationSourceRepository,
            qAzureOpenAIChatOptions
        );
        this._qSpecializationIndexService = new QSpecializationIndexService(indexRepository);
        this._qOpenAIDeploymentService = new QOpenAIDeploymentService(openAIDeploymentRepository);
    }

    public bool isEnabled(string? specializationId)
    {
        return this._qAzureOpenAIChatOptions.Enabled && specializationId != this.DefaultSpecialization;
    }

#pragma warning disable AOAI001 // Type is for evaluation purposes only and is subject to change or removal in future updates. Suppress this diagnostic to proceed.
    public async Task<AzureSearchChatDataSource?> GetAzureSearchChatDataSource(Specialization? specialization)
    {
        if (
            specialization == null
            || string.IsNullOrEmpty(specialization.IndexId)
            || !this.isEnabled(specialization.Id)
        )
        {
            return null;
        }

        var qSpecializationIndex = await this._qSpecializationIndexService.GetIndexAsync(specialization.IndexId);
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

        var openAIDeploymentConnection = await this._qOpenAIDeploymentService.GetDeployment(
            specialization?.OpenAIDeploymentId ?? ""
        );
        var apiKey = await this._qOpenAIDeploymentService.GetAPIKeyFromVaultForDeployment(openAIDeploymentConnection);
        if (openAIDeploymentConnection == null || openAIDeploymentConnection.Endpoint == null || apiKey == null)
        {
            throw new InvalidOperationException("Configuration error: OpenAI Deployment Connection is missing.");
        }

        var embeddingEndpoint = this.GenerateEmbeddingEndpoint(
            new Uri(openAIDeploymentConnection.Endpoint),
            qSpecializationIndex
        );
        return new AzureSearchChatDataSource
        {
            IndexName = qSpecializationIndex.Name,
            Endpoint = aiSearchDeploymentConnection.Endpoint,
            Strictness = specialization.Strictness,
            FieldMappings = new DataSourceFieldMappings
            {
                UrlFieldName = null, //qSpecializationIndex.FieldMapping?.UrlFieldName,
                TitleFieldName = null, //qSpecializationIndex.FieldMapping?.TitleFieldName,
                FilePathFieldName = null, //qSpecializationIndex.FieldMapping?.FilepathFieldName,
            },
            SemanticConfiguration = "default", //qSpecializationIndex.SemanticConfiguration,
            QueryType = new DataSourceQueryType(qSpecializationIndex.QueryType),
            InScope = specialization.RestrictResultScope,
            TopNDocuments = specialization.DocumentCount,
            Authentication = DataSourceAuthentication.FromApiKey(aiSearchDeploymentConnection.APIKey),
            VectorizationSource = DataSourceVectorizer.FromEndpoint(
                embeddingEndpoint,
                DataSourceAuthentication.FromApiKey(apiKey)
            ),
        };
    }
#pragma warning restore AOAI001 // Type is for evaluation purposes only and is subject to change or removal in future updates. Suppress this diagnostic to proceed.

    public Uri? GenerateEmbeddingEndpoint(Uri connectionEndpoint, SpecializationIndex qSpecializationIndex)
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

    public async Task<(string? ApiKey, string? Endpoint)> GetAISearchDeploymentConnectionDetails(string indexId)
    {
        var specializationIndex = await this._qSpecializationIndexService.GetIndexAsync(indexId);
        if (specializationIndex == null)
        {
            return (null, null);
        }
        var aiSearchDeploymentConnection = this.GetAISearchDeploymentConnection(
            specializationIndex.AISearchDeploymentConnection
        );
        return (aiSearchDeploymentConnection?.APIKey, aiSearchDeploymentConnection?.Endpoint?.ToString());
    }

    /// <summary>
    /// Retrieve all chat completion deployments from the available OpenAI deployment connections.
    /// </summary>
    // public List<QAzureOpenAIChatOptions.ChatCompletionDeployment> GetAllChatCompletionDeployments()
    // {
    //     var chatCompletionDeployments = new List<QAzureOpenAIChatOptions.ChatCompletionDeployment>();
    //     foreach (
    //         QAzureOpenAIChatOptions.OpenAIDeploymentConnection connection in this._qAzureOpenAIChatOptions.OpenAIDeploymentConnections
    //     )
    //     {
    //         foreach (var deployment in connection.ChatCompletionDeployments)
    //         {
    //             var deploymentWithConnection = new QAzureOpenAIChatOptions.ChatCompletionDeployment
    //             {
    //                 Name = $"{deployment.Name} ({connection.Name})",
    //                 CompletionTokenLimit = deployment.CompletionTokenLimit,
    //             };
    //             chatCompletionDeployments.Add(deploymentWithConnection);
    //         }
    //     }
    //     return chatCompletionDeployments;
    // }

    /// <summary>
    /// Get the default chat completion deployment.
    /// </summary>
#pragma warning disable CA1024
    public string GetDefaultChatCompletionDeployment()
    {
        return this._qAzureOpenAIChatOptions.DefaultModel;
    }
}
