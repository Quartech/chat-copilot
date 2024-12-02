using System.Collections.Generic;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace CopilotChat.WebApi.Auth.Specializations;

public static class AuthorizationTestContext
{
    public static AuthorizationHandlerContext BuildAuthorizationContext(IEnumerable<Claim> claims)
    {
        var requirements = new[] { new SpecializationRequirement() };

        var user = new ClaimsPrincipal(new ClaimsIdentity(claims, "auth"));

        return new(requirements, user, null);
    }
}
