using CopilotChat.WebApi.Models.Request;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace CopilotChat.WebApi.Controllers;

[ApiController]
public class UserFeedbackController : ControllerBase
{
    private readonly ILogger<UserFeedbackController> _logger;

    public UserFeedbackController(ILogger<UserFeedbackController> logger)
    {
        this._logger = logger;
    }

    [HttpPost]
    [Route("userfeedback/search")]
    public IActionResult SearchUserFeedback([FromBody] UserFeedbackFilter filter)
    {
        // Implementation to fetch feedback based on filter
        return this.Ok(/* Feedback results */);
    }
}
