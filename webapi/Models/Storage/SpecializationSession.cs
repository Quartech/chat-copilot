// Copyright (c) Quartech. All rights reserved.

namespace CopilotChat.WebApi.Models.Storage;

/// <summary>
/// A specialization session
/// </summary>
public class SpecializationSession
{
    /// <summary>
    /// Key that is persistent and unique.
    /// </summary>
    public string Key { get; set; }

    /// <summary>
    /// Name of the specialization.
    /// </summary>
    public string Name { get; set; }

    /// <summary>
    /// Description of the specialization.
    /// </summary>
    public string Description { get; set; }

    /// <summary>
    /// Image URL for pictorial description of specialization.
    /// </summary>
    public string ImageFilepath { get; set; }

    /// <summary>
    /// Image URL for pictorial description of logo.
    /// </summary>
    public string IconFilepath { get; set; }

    public SpecializationSession(
        string Key,
        string Name,
        string Description,
        string ImageFilepath,
        string IconFilepath
    )
    {
        this.Key = Key;
        this.Name = Name;
        this.Description = Description;
        this.ImageFilepath = ImageFilepath;
        this.IconFilepath = IconFilepath;
    }
}
