using System;
using System.Collections.Generic;

namespace CopilotChat.WebApi.Models.Request;

public class UserFeedbackFilter
{
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool? IsPositive { get; set; }
    public string? ChatId { get; set; }
    public string? SpecializationId { get; set; }
    public CopilotChatMessageSortOption? SortBy { get; set; }
}
