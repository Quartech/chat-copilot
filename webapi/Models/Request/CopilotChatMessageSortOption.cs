using System.Runtime.Serialization;

namespace CopilotChat.WebApi.Models.Request;

public enum CopilotChatMessageSortOption
{
    [EnumMember(Value = "dateDesc")]
    DateDesc,

    [EnumMember(Value = "dateAsc")]
    DateAsc,

    [EnumMember(Value = "feedbackPos")]
    FeedbackPos,

    [EnumMember(Value = "feedbackNeg")]
    FeedbackNeg,
}
