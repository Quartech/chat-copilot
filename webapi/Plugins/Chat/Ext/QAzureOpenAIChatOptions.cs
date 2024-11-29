﻿// Copyright (c) Quartech. All rights reserved.

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CopilotChat.WebApi.Plugins.Chat.Ext;

/// <summary>
/// This class is a representation of Azure AI Chat options.
/// </summary>
public class QAzureOpenAIChatOptions
{
    public const string PropertyName = "QAzureOpenAIChatConfig";
    public bool Enabled { get; set; } = false;
    public string DefaultModel { get; set; } = "";
    public string DefaultEmbeddingModel { get; set; } = "";
    public string DefaultConnection { get; set; } = "";
    public string DefaultSpecializationDescription { get; set; } = "";
    public string DefaultSpecializationImage { get; set; } = "";
    public string DefaultSpecializationIcon { get; set; } = "";
    public string AdminGroupMembershipId { get; set; } = "";
    public bool DefaultRestrictResultScope { get; set; } = false;
    public int DefaultStrictness { get; set; } = 0;
    public int DefaultDocumentCount { get; set; } = 0;
    public int DefaultPastMessagesIncludedCount { get; set; } = 0;
    public int DefaultMaxResponseTokenLimit { get; set; } = 0;

    // [Required]
    // public IList<OpenAIDeploymentConnection> OpenAIDeploymentConnections { get; set; } =
    //     new List<OpenAIDeploymentConnection>();

    [Required]
    public IList<AISearchDeploymentConnection> AISearchDeploymentConnections { get; set; } =
        new List<AISearchDeploymentConnection>();

    [Required]
    public IList<QSpecializationIndex> SpecializationIndexes { get; set; } = new List<QSpecializationIndex>();

    [Required]
    public BlobStorageOption BlobStorage { get; set; } = new BlobStorageOption();

    public class ChatCompletionDeployment
    {
        public string Name { get; set; } = string.Empty;
        public int CompletionTokenLimit { get; set; }
        public int OutputTokens { get; set; }
    }

    public class ImageCompletionDeployment
    {
        // may contain future settings
        public string Name { get; set; } = string.Empty;
    }

    public class OpenAIDeploymentConnection
    {
        public string Name { get; set; } = string.Empty;
        public Uri? Endpoint { get; set; } = null;
        public string APIKey { get; set; } = string.Empty;
        public IList<ChatCompletionDeployment> ChatCompletionDeployments { get; set; } =
            new List<ChatCompletionDeployment>();
        public IList<ImageCompletionDeployment> ImageGenerationDeployments { get; set; } =
            new List<ImageCompletionDeployment>();
        public IList<string> EmbeddingDeployments { get; set; } = new List<string>();
    }

    public class AITextToImageDeploymentConnection
    {
        public string Name { get; set; } = string.Empty;
        public Uri? Endpoint { get; set; } = null;
        public string APIKey { get; set; } = string.Empty;
        public string Deployment { get; set; } = string.Empty;
    }

    public class AISearchDeploymentConnection
    {
        public string Name { get; set; } = string.Empty;
        public Uri? Endpoint { get; set; } = null;
        public string APIKey { get; set; } = string.Empty;
    }

    public class QSpecializationIndex
    {
        public string IndexName { get; set; } = string.Empty;
        public string QueryType { get; set; } = string.Empty;
        public string SemanticConfiguration { get; set; } = "default";
        public bool RestrictResultScope { get; set; } = true;

        public string AISearchDeploymentConnection { get; set; } = string.Empty;
        public string OpenAIDeploymentConnection { get; set; } = string.Empty;
        public string EmbeddingDeployment { get; set; } = string.Empty;
        public FieldMappingOption? FieldMapping { get; set; } = new FieldMappingOption();
    }

    public class FieldMappingOption
    {
#pragma warning disable CA1056
        public string UrlFieldName { get; set; } = "url";
        public string TitleFieldName { get; set; } = "title";
        public string FilepathFieldName { get; set; } = "filepath";
    }

    public class BlobStorageOption
    {
        public string ConnectionString { get; set; } = string.Empty;
        public string SpecializationContainerName { get; set; } = "specialization";
    }
}
