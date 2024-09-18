// Copyright (c) Microsoft. All rights reserved.

using System.IO;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
// using Microsoft.AspNetCore.Routing;

namespace CopilotChat.WebApi.Auth;

/// <summary>
/// Class implementing "authorization" that validates the user has access to a chat.
/// </summary>
public class GroupAuthorizationHandler : AuthorizationHandler<GroupRequirement, HttpContext>
{
    private readonly IAuthInfo _authInfo;

    private readonly GroupRequirement _groupRequirement;

    /// <summary>
    /// Constructor
    /// </summary>
    public GroupAuthorizationHandler(IAuthInfo authInfo, GroupRequirement groupRequirement)
    {
        this._authInfo = authInfo;
        this._groupRequirement = groupRequirement;
    }

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        GroupRequirement requirement,
        HttpContext resource)
    {
        try
        {
            var req = resource.Request;

            req.EnableBuffering();

            // read the body here as a workarond for the JSON parser disposing the stream
            if (req.Body.CanSeek)
            {
                req.Body.Seek(0, SeekOrigin.Begin);

                // if body (stream) can seek, we can read the body to a string for logging purposes
                using (var reader = new StreamReader(
                     req.Body,
                     encoding: Encoding.UTF8,
                     detectEncodingFromByteOrderMarks: false,
                     bufferSize: 8192,
                     leaveOpen: true))
                {
                    var jsonString = await reader.ReadToEndAsync();
                    context.Fail(new AuthorizationFailureReason(this, jsonString));
                    // store into the HTTP context Items["request_body"]
                    resource.Items.Add("request_body", jsonString);
                }

                // go back to beginning so json reader get's the whole thing
                req.Body.Seek(0, SeekOrigin.Begin);
            }

            // string? chatId = resource.GetRouteValue("chatId")?.ToString();
            // if (chatId == null)
            // {
            //     // delegate to downstream validation
            //     context.Succeed(requirement);
            //     return;
            // }

            // var session = await this._chatSessionRepository.FindByIdAsync(chatId);
            // if (session == null)
            // {
            //     // delegate to downstream validation
            //     context.Succeed(requirement);
            //     return;
            // }

            // bool isUserInChat = await this._chatParticipantRepository.IsUserInChatAsync(this._authInfo.UserId, chatId);
            // if (!isUserInChat)
            // {
            //     context.Fail(new AuthorizationFailureReason(this, "User does not have access to the requested chat."));
            // }

            // context.Succeed(requirement);
        }
        catch (Azure.Identity.CredentialUnavailableException ex)
        {
            context.Fail(new AuthorizationFailureReason(this, ex.Message));
        }
    }
}
