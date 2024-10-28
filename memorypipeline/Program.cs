// Copyright (c) Microsoft. All rights reserved.

using System;
using System.Linq;
using CopilotChat.Shared;
using CopilotChat.WebApi.Plugins.Chat.Ext;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.KernelMemory;
using Microsoft.KernelMemory.Diagnostics;

// ********************************************************
// ************** SETUP ***********************************
// ********************************************************

var builder = WebApplication.CreateBuilder();
var qAzureOpenAIChatOptions =
            builder.Configuration.GetSection(QAzureOpenAIChatOptions.PropertyName).Get<QAzureOpenAIChatOptions>()
            ?? new QAzureOpenAIChatOptions { Enabled = false };
var defaultConnection = qAzureOpenAIChatOptions.OpenAIDeploymentConnections.FirstOrDefault(conn =>
    conn.Name.Equals(qAzureOpenAIChatOptions.DefaultConnection, StringComparison.OrdinalIgnoreCase)
);
if (defaultConnection == null)
{
    throw new InvalidOperationException("Default connection not found. Please check the configuration.");
}
var defaultConfig = new DefaultConfiguration(
    qAzureOpenAIChatOptions.DefaultModel,
    qAzureOpenAIChatOptions.DefaultEmbeddingModel,
    defaultConnection.APIKey,
    defaultConnection.Endpoint
);
IKernelMemory memory =
    new KernelMemoryBuilder(builder.Services)
        .FromAppSettings(defaultConfig)
        .WithCustomOcr(builder.Configuration)
        .Build();

builder.Services.AddSingleton(memory);

builder.Services.AddApplicationInsightsTelemetry();

var app = builder.Build();

DateTimeOffset start = DateTimeOffset.UtcNow;

// Simple ping endpoint
app.MapGet("/", () =>
{
    var uptime = DateTimeOffset.UtcNow.ToUnixTimeSeconds() - start.ToUnixTimeSeconds();
    var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
    var message = $"Memory pipeline is running. Uptime: {uptime} secs.";
    if (!string.IsNullOrEmpty(environment))
    {
        message += $" Environment: {environment}";
    }
    return Results.Ok(message);
});

// ********************************************************
// ************** START ***********************************
// ********************************************************

app.Logger.LogInformation(
    "Starting Chat Copilot Memory pipeline service, .NET Env: {0}, Log Level: {1}",
    Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT"),
    app.Logger.GetLogLevelName());

app.Run();
