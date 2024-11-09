using System;

namespace CopilotChat.WebApi.Models.Request;

public class UserFeedbackFilter
{
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool? IsPositive { get; set; }
    public string? ChatId { get; set; }
    public string? UserId { get; set; }
    public UserFeedbackSortOptions SortBy { get; set; }
}

public enum UserFeedbackSortOptions
{
    DateAsc,
    DateDesc,
    FeedbackPosNeg
}
