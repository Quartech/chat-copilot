// Copyright (c) Quartech. All rights reserved.

using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace CopilotChat.WebApi.Models.Request;

/// <summary>
/// Request definition for Specialization
/// </summary>
public class QSpecializationBase
{
    /// <summary>
    /// Key of the specialization
    /// </summary>
    [JsonPropertyName("label")]
    public string? Label { get; set; }

    /// <summary>
    /// Name of the specialization
    /// </summary>
    [JsonPropertyName("name")]
    public string? Name { get; set; }

    /// <summary>
    /// Description of the specialization
    /// </summary>
    [JsonPropertyName("description")]
    public string? Description { get; set; }

    /// <summary>
    /// RoleInformation of the specialization
    /// </summary>
    [JsonPropertyName("roleInformation")]
    public string? RoleInformation { get; set; }

    /// <summary>
    /// List of group memberships for the user.
    /// </summary>
    [JsonPropertyName("groupMemberships")]
    public IList<string>? GroupMemberships { get; set; }

    /// <summary>
    /// IndexName of the specialization
    /// </summary>
    [JsonPropertyName("indexName")]
    public string? IndexName { get; set; }

    /// <summary>
    /// Enable/Disable flag of the specialization.
    /// </summary>
    [JsonPropertyName("isActive")]
    public bool isActive { get; set; } = true;

    /// <summary>
    /// Deployment of the specialization
    /// </summary>
    [JsonPropertyName("deployment")]
    public string? Deployment { get; set; }

    /// <summary>
    /// Initial chat message that should be displayed to the client for this specialization.
    /// </summary>
    [JsonPropertyName("initialChatMessage")]
    public string? InitialChatMessage { get; set; }

    /// <summary>
    /// Is Default flag of the specialization
    /// </summary>
    [JsonPropertyName("isDefault")]
    public bool? IsDefault { get; set; }

    /// <summary>
    /// Restrict Result Scope of the specialization
    /// </summary>
    [JsonPropertyName("restrictResultScope")]
    public bool? RestrictResultScope { get; set; }

    /// <summary>
    /// Strictness of the specialization
    /// </summary>>
    [JsonPropertyName("strictness")]
    [Range(1, 5, ErrorMessage = "Strictness must be between 1 and 5.")]
    public int? Strictness { get; set; }

    /// <summary>
    /// Document Count of the specialization
    /// </summary>>
    [JsonPropertyName("documentCount")]
    [Range(3, 20, ErrorMessage = "Document count must be between 3 and 20.")]
    public int? DocumentCount { get; set; }

    /// <summary>
    /// Past Messages Included Count of the specialization
    /// </summary>>
    [JsonPropertyName("pastMessagesIncludedCount")]
    [Range(1, 100, ErrorMessage = "Past messages included count must be between 1 and 100.")]
    public int? PastMessagesIncludedCount { get; set; }

    /// <summary>
    /// Max Response Token Limit of the specialization
    /// </summary>>
    [JsonPropertyName("maxResponseTokenLimit")]
    [Range(1, 4096, ErrorMessage = "Max response token limit must be between 1 and 4096.")]
    public int? MaxResponseTokenLimit { get; set; }

    /// <summary>
    /// Document Count of the specialization
    /// </summary>>
    [JsonPropertyName("order")]
    public int? Order { get; set; }
}
