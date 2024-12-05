// Copyright (c) Microsoft. All rights reserved.

using System;
using System.Collections.Generic;
using System.Net.Http;
using CopilotChat.WebApi.Models.Storage;
using CopilotChat.WebApi.Plugins.Chat.Ext;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Microsoft.KernelMemory;
using Microsoft.SemanticKernel;

namespace CopilotChat.WebApi.Services;

/// <summary>
/// Extension methods for registering Semantic Kernel related services.
/// </summary>
public sealed class SemanticKernelProvider
{
    private readonly Kernel _kernel;

    public SemanticKernelProvider(
        IServiceProvider serviceProvider,
        IConfiguration configuration,
        IHttpClientFactory httpClientFactory,
        QAzureOpenAIChatOptions qAzureOpenAIChatOptions,
        IEnumerable<OpenAIDeployment> openAIDeployments,
        IDictionary<string, string> secretNameKeyMap
    )
    {
        this._kernel = InitializeSemanticKernel(
            serviceProvider,
            configuration,
            httpClientFactory,
            qAzureOpenAIChatOptions,
            openAIDeployments,
            secretNameKeyMap
        );
    }

    /// <summary>
    /// Produce semantic-kernel with completion and dalle-3 services for chat.
    /// </summary>
    public Kernel GetSemanticKernel() => this._kernel.Clone();

    private static Kernel InitializeSemanticKernel(
        IServiceProvider serviceProvider,
        IConfiguration configuration,
        IHttpClientFactory httpClientFactory,
        QAzureOpenAIChatOptions qAzureOpenAIChatOptions,
        IEnumerable<OpenAIDeployment> openAIDeployments,
        IDictionary<string, string> secretNameKeyMap
    )
    {
        var builder = Kernel.CreateBuilder();

        builder.Services.AddLogging();

        var memoryOptions = serviceProvider.GetRequiredService<IOptions<KernelMemoryConfig>>().Value;
        switch (memoryOptions.TextGeneratorType)
        {
            case string x when x.Equals("AzureOpenAI", StringComparison.OrdinalIgnoreCase):
            case string y when y.Equals("AzureOpenAIText", StringComparison.OrdinalIgnoreCase):
                foreach (var openAIDeployment in openAIDeployments)
                {
                    foreach (var deployment in openAIDeployment.ChatCompletionDeployments)
                    {
#pragma warning disable CA2000 // No need to dispose of HttpClient instances from IHttpClientFactory
                        builder.AddAzureOpenAIChatCompletion(
                            deployment.Name,
                            openAIDeployment.Endpoint?.ToString(),
                            secretNameKeyMap[openAIDeployment.SecretName],
                            httpClient: httpClientFactory.CreateClient(),
                            serviceId: $"{deployment.Name} ({openAIDeployment.Name})"
                        );
                    }
                    foreach (var deployment in openAIDeployment.ImageGenerationDeployments)
                    {
#pragma warning disable SKEXP0010 // Experimental method AddAzureOpenAITextToImage, suppressed instability warning
                        builder.AddAzureOpenAITextToImage(
                            deployment,
                            openAIDeployment.Endpoint?.ToString(),
                            secretNameKeyMap[openAIDeployment.SecretName],
                            httpClient: httpClientFactory.CreateClient(),
                            serviceId: deployment
                        );
                    }
                }
#pragma warning restore SKEXP0010
                break;

            case string x when x.Equals("OpenAI", StringComparison.OrdinalIgnoreCase):
                var openAIOptions = memoryOptions.GetServiceConfig<OpenAIConfig>(configuration, "OpenAI");
                builder.AddOpenAIChatCompletion(
                    openAIOptions.TextModel,
                    openAIOptions.APIKey,
                    httpClient: httpClientFactory.CreateClient()
                );
#pragma warning restore CA2000
                break;
            default:
                throw new ArgumentException(
                    $"Invalid {nameof(memoryOptions.TextGeneratorType)} value in 'KernelMemory' settings."
                );
        }

        return builder.Build();
    }
}
