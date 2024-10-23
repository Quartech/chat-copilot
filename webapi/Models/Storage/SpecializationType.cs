using System.ComponentModel;

namespace CopilotChat.WebApi.Models.Storage;

public enum SpecializationType
{
    [Description("Standard")]
    Standard = 0,

    [Description("General")]
    General = 1,
}
