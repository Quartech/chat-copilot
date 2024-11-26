using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CopilotChat.WebApi.Context;
using CopilotChat.WebApi.Storage;
using Microsoft.AspNetCore.Authorization;

namespace CopilotChat.WebApi.Auth;

/// <summary>
/// Class implementing "authorization" that validates the user has access to a specialization linked to the chat being targeted.
/// </summary>
public class LinkedToChatHandler(
    SpecializationRepository specializationRepository,
    ChatSessionRepository chatSessionRepository,
    IContextValueAccessor contextValueAccessor
) : AuthorizationHandler<SpecializationRequirement>
{
    private const string GROUP_CLAIM_TYPE = "groups";

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        SpecializationRequirement requirement
    )
    {
        var chatId = contextValueAccessor.GetRouteValue("chatId")?.ToString();

        if (string.IsNullOrEmpty(chatId))
        {
            return;
        }

        var chatSession = await chatSessionRepository.FindByIdAsync(chatId);

        if (chatSession == null)
        {
            return;
        }

        var specializationId = chatSession.specializationId;

        if (string.IsNullOrEmpty(specializationId))
        {
            context.Succeed(requirement);
            return;
        }

        var specialization = await specializationRepository.GetSpecializationAsync(specializationId);

        if (specialization == null)
        {
            return;
        }

        var specializationIds = new HashSet<string>(specialization.GroupMemberships);

        var user = context.User;
        var groupClaims = user.Claims.Where(claim => claim.Type == GROUP_CLAIM_TYPE);
        var groupIds = new HashSet<string>(groupClaims.Select(claim => claim.Value));

        if (groupIds.Overlaps(specializationIds))
        {
            context.Succeed(requirement);
        }
    }
}
