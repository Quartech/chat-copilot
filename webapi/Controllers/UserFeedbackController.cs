using System.Threading.Tasks;
using CopilotChat.WebApi.Models.Request;
using CopilotChat.WebApi.Services;
using CopilotChat.WebApi.Storage;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace CopilotChat.WebApi.Controllers;

[ApiController]
public class UserFeedbackController : ControllerBase
{
    private readonly ILogger<UserFeedbackController> _logger;
    private readonly UserFeedbackService _userFeedbackService;

    public UserFeedbackController(
        ILogger<UserFeedbackController> logger,
        ChatSessionRepository sessionRepository,
        ChatMessageRepository messageRepository
    )
    {
        this._logger = logger;
        this._userFeedbackService = new UserFeedbackService(sessionRepository, messageRepository);
    }

    [HttpGet("userfeedback/search")]
    public async Task<IActionResult> SearchUserFeedback([FromQuery] UserFeedbackFilter filter)
    {
        var chatMessages = await this._userFeedbackService.Search(filter);

        return this.Ok(chatMessages);
    }
}
