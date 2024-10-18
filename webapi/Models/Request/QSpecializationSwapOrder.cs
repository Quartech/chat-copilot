using System;

namespace CopilotChat.WebApi.Models.Request;

public class QSpecializationSwapOrder
{
    public Guid FromId { get; set; }
    public Guid ToId { get; set; }
}
