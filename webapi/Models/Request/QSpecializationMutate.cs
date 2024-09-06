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
}
