// Copyright (c) Quartech. All rights reserved.

using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using CopilotChat.WebApi.Auth;
using CopilotChat.WebApi.Models.Request;
using CopilotChat.WebApi.Models.Storage;
using CopilotChat.WebApi.Storage;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace CopilotChat.WebApi.Controllers;

/// <summary>
/// Controller responsible for handling loading and updating chat users settings
/// </summary>
[ApiController]
public class UserSettingsController : ControllerBase
{
    private readonly ILogger<UserSettingsController> _logger;
    private readonly IHttpClientFactory _httpClientFactory;

    public UserSettingsController(
        ILogger<UserSettingsController> logger,
        IHttpClientFactory httpClientFactory)
    {
        this._logger = logger;
        this._httpClientFactory = httpClientFactory;
    }

    /// <summary>
    /// Returns the users settings
    /// </summary>
    /// <param name="chatUserRepository">The injected chat user repository</param>
    /// <param name="authInfo">Auth info for the current request.</param>
    /// <returns>Results containing the response from the model.</returns>
    [Route("user-settings")]
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status504GatewayTimeout)]
    public async Task<IActionResult> LoadSettings(
        [FromServices] ChatUserRepository chatUserRepository,
        [FromServices] IAuthInfo authInfo)
    {
        this._logger.LogDebug("Settings request received.");

        var userId = authInfo.UserId;
        System.Collections.Generic.IEnumerable<ChatUser> users = await chatUserRepository.FindByUserIdAsync(authInfo.UserId);
        if (!users.Any())
        {
            var user = new ChatUser(userId);
            await chatUserRepository.CreateAsync(user);
            return this.Ok(user);
        };

        return this.Ok(users.First().settings);
    }

    /// <summary>
    /// Updates a User Setting
    /// </summary>
    /// <param name="chatUserRepository">The injected chat user repository</param>
    /// <param name="authInfo">Auth info for the current request.</param>
    /// <returns>Results containing the response from the model.</returns>
    [Route("user-settings")]
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status504GatewayTimeout)]
    public async Task<IActionResult> UpdateSetting(
        [FromServices] ChatUserRepository chatUserRepository,
        [FromServices] IAuthInfo authInfo,
        [FromBody] UpdateSettings request)
    {
        this._logger.LogDebug("Settings update received.");

        System.Collections.Generic.IEnumerable<ChatUser> users = await chatUserRepository.FindByUserIdAsync(authInfo.UserId);
        if (!users.Any())
        {
            return this.BadRequest("Chat user does not exist.");
        };

        var user = users.First();
        if (request.Setting == "darkMode")
        {
            user.settings.darkMode = request.Enabled;
        }
        await chatUserRepository.UpsertAsync(user);

        return this.Ok(users.First().settings);
    }
}
