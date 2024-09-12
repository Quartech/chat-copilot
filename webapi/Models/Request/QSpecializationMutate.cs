// Copyright (c) Microsoft. All rights reserved.

using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Http;

namespace CopilotChat.WebApi.Models.Request;

/// <summary>
/// Form for mutating a Specialization with a POST Http request.
/// Includes raw files to be added to Blob Storage Container
/// </summary>
public class QSpecializationMutate : QSpecializationBase
{
    /// <summary>
    /// Image file of the Specialization.
    /// </summary>
    [JsonPropertyName("imageFile")]
    public IFormFile? IconFile { get; set; } = null;

    /// <summary>
    /// Icon file of the Specialization.
    /// </summary>
    [JsonPropertyName("iconFile")]
    public IFormFile? ImageFile { get; set; } = null;

    /// <summary>
    /// Overrides the GroupMemberships property from the base class.
    ///
    /// Why? Mutate payloads are `FromForm` ie: `FormData` which expect all property values to be strings.
    /// This value will need to be deserialized into a list of strings.
    /// </summary>
    [JsonPropertyName("groupMemberships")]
    public new string GroupMemberships { get; set; } = string.Empty;

    /// <summary>
    /// Get the QSpecializationParameters object from the QSpecializationMutate object
    /// as the shape of the QSpecializationBase object.
    ///
    /// Note: This does not include the IconFile and ImageFile properties.
    /// They will need to be manually injected into the QSpecializationParameters object.
    ///
    /// Why? The create and update actions need to interact with the blob storage container differently.
    /// </summary>
    /// <returns>QSpecializationBase</returns>
    public QSpecializationParameters GetQSpecializationBaseAsParameters()
    {
        return new QSpecializationParameters
        {
            label = this.label,
            Name = this.Name,
            Description = this.Description,
            RoleInformation = this.RoleInformation,
            // Split the GroupMemberships string into a list of strings
            GroupMemberships = this.GroupMemberships.Split(","),
            IndexName = this.IndexName,
            isActive = this.isActive,
        };
    }
}
