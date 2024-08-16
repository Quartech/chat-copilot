// Copyright (c) Quartech. All rights reserved.

using System.Collections.Generic;

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
    /// Image URL for icon description of specialization.
    /// </summary>
    public string IconFilepath { get; set; }

    /// <summary>
    /// List of group memberships for the user.
    /// </summary>
    public IList<string> GroupMemberships { get; set; }

    public SpecializationSession(
        string Key,
        string Name,
        string Description,
        string ImageFilepath,
        string IconFilepath,
        IList<string> GroupMemberships
    )
    {
        this.Key = Key;
        this.Name = Name;
        this.Description = Description;
        this.ImageFilepath = ImageFilepath;
        this.IconFilepath = IconFilepath;
        this.GroupMemberships = GroupMemberships;
    }
}
