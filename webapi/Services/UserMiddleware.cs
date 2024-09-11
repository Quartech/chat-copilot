// Copyright (c) Microsoft. All rights reserved.

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Security.Principal;
using CopilotChat.WebApi.Controllers;
using CopilotChat.WebApi.Hubs;
using CopilotChat.WebApi.Options;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.SemanticKernel;

namespace CopilotChat.WebApi.Services;

/// <summary>
/// Middleware for determining is site is undergoing maintenance.
/// </summary>
public class UserMiddleware
{
    private readonly RequestDelegate _next;
    // private readonly UserPermissions permissions;
    private readonly ILogger<UserMiddleware> _logger;

    public UserMiddleware(
        RequestDelegate next,
        ILogger<UserMiddleware> logger)

    {
        this._next = next;
        this._logger = logger;
    }

    public async Task Invoke(HttpContext ctx, Kernel kernel)
    {
        // List<string> groups = await this.GetGroupsAsync(ctx.User.Identity?.Name);
        // this._logger.LogInformation(groups?.ForEach(Console.WriteLine));
        ctx.Request.Headers.Add("X-Forwarded-Host", ctx.Request.Headers["X-Original-Host"]);
        await this._next(ctx);
    }


    // private async Task<List<string>> GetGroupsAsync(string userName)
    // {
    //     List<string> result = new List<string>();
    //     WindowsIdentity wi = new WindowsIdentity(userName);

    //     foreach (IdentityReference group in wi.Groups)
    //     {
    //         try
    //         {
    //             result.Add(group.Translate(typeof(NTAccount)).ToString());
    //         }
    //         catch (Exception ex) { }
    //     }
    //     result.Sort();
    //     return result;
    // }

}
