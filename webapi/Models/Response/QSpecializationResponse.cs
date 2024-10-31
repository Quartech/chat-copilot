﻿// Copyright (c) Quartech. All rights reserved.

using System.Collections.Generic;
using System.Text.Json.Serialization;
using CopilotChat.WebApi.Models.Storage;

namespace CopilotChat.WebApi.Models.Response;

/// <summary>
/// Response definition for Specialization
/// </summary>
public class QSpecializationResponse
{
    /// <summary>
    /// Id of the specialization
    /// </summary>
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// Label of the specialization
    /// </summary>
    [JsonPropertyName("label")]
    public string Label { get; set; } = string.Empty;

    /// <summary>
    /// Name of the specialization
    /// </summary>
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Description of the specialization
    /// </summary>
    [JsonPropertyName("description")]
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// RoleInformation of the specialization
    /// </summary>
    [JsonPropertyName("roleInformation")]
    public string RoleInformation { get; set; } = string.Empty;

    /// <summary>
    /// IndexName of the specialization
    /// </summary>
    [JsonPropertyName("indexName")]
    public string? IndexName { get; set; } = string.Empty;

    /// <summary>
    /// Initial chat response of the specialization
    /// </summary>
    [JsonPropertyName("initialChatMessage")]
    public string? InitialChatMessage { get; set; } = string.Empty;

    /// <summary>
    /// Deployment of the specialization
    /// </summary>
    [JsonPropertyName("deployment")]
    public string? Deployment { get; set; } = string.Empty;

    /// <summary>
    /// Image FilePath of the specialization.
    /// </summary>
    [JsonPropertyName("imageFilePath")]
    public string ImageFilePath { get; set; } = string.Empty;

    /// <summary>
    /// Image FilePath of the specialization.
    /// </summary>
    [JsonPropertyName("iconFilePath")]
    public string IconFilePath { get; set; } = string.Empty;

    /// <summary>
    /// Enable/Disable flag of the specialization.
    /// </summary>
    [JsonPropertyName("isActive")]
    public bool isActive { get; set; } = true;

    /// <summary>
    /// Is Default flag of the specialization
    /// </summary>
    [JsonPropertyName("isDefault")]
    public bool? IsDefault { get; set; } = false;

    /// <summary>
    /// Restrict result scope flag of the specialization.
    /// </summary>
    [JsonPropertyName("restrictResultScope")]
    public bool? RestrictResultScope { get; set; } = false;

    /// <summary>
    /// Strictness of the specialization.
    /// </summary>
    [JsonPropertyName("strictness")]
    public int? Strictness { get; set; } = 0;

    /// <summary>
    /// Document count of the specialization.
    /// </summary>
    [JsonPropertyName("documentCount")]
    public int? DocumentCount { get; set; } = 0;

    /// <summary>
    /// Document count of the specialization.
    /// </summary>
    [JsonPropertyName("pastMessagesIncludedCount")]
    public int? PastMessagesIncludedCount { get; set; } = 0;

    /// <summary>
    /// Max response token limit of the specialization.
    /// </summary>
    [JsonPropertyName("maxResponseTokenLimit")]
    public int? MaxResponseTokenLimit { get; set; } = 0;

    /// <summary>
    /// Order of the specialization.
    /// </summary>
    [JsonPropertyName("order")]
    public int? Order { get; set; } = 0;

    /// <summary>
    /// List of group memberships for the user.
    /// </summary>
    public IList<string> GroupMemberships { get; set; } = new List<string>();

    /// <summary>
    /// Creates new instance from SpecializationSource.
    /// </summary>
    public QSpecializationResponse(Specialization specializationSource)
    {
        this.Id = specializationSource.Id;
        this.Label = specializationSource.Label;
        this.Name = specializationSource.Name;
        this.Description = specializationSource.Description;
        this.RoleInformation = specializationSource.RoleInformation;
        this.ImageFilePath = specializationSource.ImageFilePath;
        this.IconFilePath = specializationSource.IconFilePath;
        this.isActive = specializationSource.IsActive;
        this.IsDefault = specializationSource.IsDefault;
        this.RestrictResultScope = specializationSource.RestrictResultScope;
        this.Strictness = specializationSource.Strictness;
        this.DocumentCount = specializationSource.DocumentCount;
        this.PastMessagesIncludedCount = specializationSource.PastMessagesIncludedCount;
        this.MaxResponseTokenLimit = specializationSource.MaxResponseTokenLimit;
        this.GroupMemberships = specializationSource.GroupMemberships;
        this.InitialChatMessage = specializationSource.InitialChatMessage;
        this.Order = specializationSource.Order;
        if (specializationSource.IndexName != null)
        {
            this.IndexName = specializationSource.IndexName;
        }
        if (specializationSource.Deployment != null)
        {
            this.Deployment = specializationSource.Deployment;
        }
    }
}
