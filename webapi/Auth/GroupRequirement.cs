// Copyright (c) Microsoft. All rights reserved.

using Microsoft.AspNetCore.Authorization;

namespace CopilotChat.WebApi.Auth;

/// <summary>
/// Used to require the user to be a member of a specific group.
/// </summary>
public class GroupRequirement : IAuthorizationRequirement
{
}
