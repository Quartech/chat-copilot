using System.Collections.Generic;
using System.Threading.Tasks;
using CopilotChat.WebApi.Models.Request;
using CopilotChat.WebApi.Models.Storage;

namespace CopilotChat.WebApi.Services;

public interface IUserFeedbackService
{
    Task<IEnumerable<CopilotChatMessage>> Search(UserFeedbackFilter filter);
}
