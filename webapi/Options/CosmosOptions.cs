﻿// Copyright (c) Microsoft. All rights reserved.

using System.ComponentModel.DataAnnotations;

namespace CopilotChat.WebApi.Options;

/// <summary>
/// Configuration settings for connecting to Azure CosmosDB.
/// Note: This class has been modified to support chat specialization.
/// </summary>
public class CosmosOptions
{
    /// <summary>
    /// Gets or sets the Cosmos database name.
    /// </summary>
    [Required, NotEmptyOrWhitespace]
    public string Database { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the Cosmos connection string.
    /// </summary>
    [Required, NotEmptyOrWhitespace]
    public string ConnectionString { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the Cosmos container for chat sessions.
    /// </summary>
    [Required, NotEmptyOrWhitespace]
    public string ChatSessionsContainer { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the Cosmos container for chat messages.
    /// </summary>
    [Required, NotEmptyOrWhitespace]
    public string ChatMessagesContainer { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the Cosmos container for chat memory sources.
    /// </summary>
    [Required, NotEmptyOrWhitespace]
    public string ChatMemorySourcesContainer { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the Cosmos container for chat participants.
    /// </summary>
    [Required, NotEmptyOrWhitespace]
    public string ChatParticipantsContainer { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the Cosmos container for specialization sources.
    /// </summary>
    [Required, NotEmptyOrWhitespace]
    public string SpecializationContainer { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the Cosmos container for index sources.
    /// </summary>
    [Required, NotEmptyOrWhitespace]
    public string SpecializationIndexContainer { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the Cosmos container for deployment sources.
    /// </summary>
    [Required, NotEmptyOrWhitespace]
    public string OpenAIDeploymentContainer { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the Cosmos container for chat users.
    /// /// </summary>
    [Required, NotEmptyOrWhitespace]
    public string ChatUserContainer { get; set; } = string.Empty;
}
