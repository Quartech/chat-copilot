﻿// Copyright (c) Quartech. All rights reserved.

using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;
using CopilotChat.WebApi.Storage;

namespace CopilotChat.WebApi.Models.Storage;

/// <summary>
/// Information about the specialization
/// </summary>
public class Specialization : IStorageEntity
{
    /// <summary>
    /// ID that is persistent and unique.
    /// </summary>
    public string Id { get; set; }

    /// <summary>
    /// Short representation of specialization.
    /// </summary>
    public string Label { get; set; }

    /// <summary>
    /// Name of the specialization.
    /// </summary>
    public string Name { get; set; }

    /// <summary>
    /// Description of the specialization.
    /// </summary>
    public string Description { get; set; }

    /// <summary>
    /// The initial chat message to display when starting a conversation under this specialization
    /// </summary>
    public string InitialChatMessage { get; set; }

    /// <summary>
    /// Role Information
    /// </summary>
    public string RoleInformation { get; set; }

    /// <summary>
    /// List of group memberships for the user.
    /// </summary>
    public IList<string> GroupMemberships { get; set; } = new List<string>();

    /// <summary>
    /// Specialization index id reference
    /// </summary>
    public string? IndexId { get; set; }

    /// <summary>
    /// Open AI Deployment, which may host several chat completions.
    /// </summary>
    public string? OpenAIDeploymentId { get; set; }

    /// <summary>
    /// Completion deployment name.
    /// </summary>
    public string? CompletionDeploymentName { get; set; }

    /// <summary>
    /// Image URL for pictorial description of specialization.
    /// </summary>
    public string ImageFilePath { get; set; }

    /// <summary>
    /// Icon URL for pictorial description of specialization.
    /// </summary>
    public string IconFilePath { get; set; }

    /// <summary>
    /// The partition key for the specialization session.
    /// </summary>
    [JsonIgnore]
    public string Partition => this.Id;

    /// <summary>
    /// On/oFF switch for the specializations.
    /// </summary>
    public bool IsActive { get; set; }

    /// <summary>
    /// UserId of admin user
    /// </summary>
    public string CreatedBy { get; set; } = "";

    /// <summary>
    /// UserId of admin user
    /// </summary>
    public string UpdatedBy { get; set; } = "";

    /// <summary>
    /// Timestamp of action
    /// </summary>
    public DateTimeOffset CreatedOn { get; set; }

    /// <summary>
    /// Timestamp of action
    /// </summary>>
    public DateTimeOffset UpdatedAt { get; set; }

    /// <summary>
    /// Is Default flag of the specialization
    /// </summary>
    public bool? IsDefault { get; set; }

    /// <summary>
    /// Restrict Result Scope of specialization
    /// </summary>
    public bool? RestrictResultScope { get; set; }

    /// <summary>
    /// Strictness of specialization
    /// </summary>>
    public int? Strictness { get; set; }

    /// <summary>
    /// Document Count of specialization
    /// </summary>>
    public int? DocumentCount { get; set; }

    /// <summary>
    /// Past Messages Included Count of specialization
    /// </summary>>
    public int? PastMessagesIncludedCount { get; set; }

    /// <summary>
    /// Max Response Token Limit of specialization
    /// </summary>>
    public int? MaxResponseTokenLimit { get; set; }

    /// <summary>
    /// Order of the specialization
    /// </summary>>
    public int? Order { get; set; }

    /// <summary>
    /// Whether or not this specialization can create images with dall-e.
    /// </summary>
    public bool CanGenImages { get; set; } = false;

    public Specialization() { }

    public Specialization(
        string Label,
        string Name,
        string Description,
        string RoleInformation,
        string InitialChatMessage,
        string? OpenAIDeploymentId,
        string? CompletionDeploymentName,
        string? IndexId,
        bool? IsDefault,
        bool? RestrictResultScope,
        int? Strictness,
        int? DocumentCount,
        int? PastMessagesIncludedCount,
        int? MaxResponseTokenLimit,
        string ImageFilePath,
        string IconFilePath,
        IList<string> GroupMemberships,
        int? Order,
        bool CanGenImages
    )
    {
        this.Id = Guid.NewGuid().ToString();
        this.Label = Label;
        this.Name = Name;
        this.Description = Description;
        this.RoleInformation = RoleInformation;
        this.OpenAIDeploymentId = OpenAIDeploymentId;
        this.IndexId = IndexId;
        this.IsDefault = IsDefault;
        this.RestrictResultScope = RestrictResultScope;
        this.Strictness = Strictness;
        this.DocumentCount = DocumentCount;
        this.PastMessagesIncludedCount = PastMessagesIncludedCount;
        this.MaxResponseTokenLimit = MaxResponseTokenLimit;
        this.ImageFilePath = ImageFilePath;
        this.IconFilePath = IconFilePath;
        this.GroupMemberships = GroupMemberships;
        this.CreatedOn = DateTimeOffset.Now;
        this.IsActive = true;
        this.InitialChatMessage = InitialChatMessage;
        this.Order = Order;
        this.CanGenImages = CanGenImages;
        this.CompletionDeploymentName = CompletionDeploymentName;
    }
}
