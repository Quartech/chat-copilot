using System.Threading.Tasks;
using CopilotChat.WebApi.Models.Request;
using CopilotChat.WebApi.Models.Response;

namespace CopilotChat.WebApi.Services;

public interface IUserFeedbackService
{
    Task<UserFeedbackResult> Search(UserFeedbackFilter filter);
}
