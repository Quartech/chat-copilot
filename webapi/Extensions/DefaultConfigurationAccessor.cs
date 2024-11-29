using System;
using System.Linq;
using System.Threading.Tasks;
using Azure.Security.KeyVault.Secrets;
using CopilotChat.Shared;
using CopilotChat.WebApi.Plugins.Chat.Ext;
using CopilotChat.WebApi.Storage;
using Microsoft.Extensions.Configuration;

namespace CopilotChat.WebApi.Extensions;

public class DefaultConfigurationAccessor
{
    private readonly IConfiguration _configuration;
    private readonly SecretClientAccessor _secretClient;
    private readonly OpenAIDeploymentRepository _deploymentRepository;

    public DefaultConfigurationAccessor(
        IConfiguration configuration,
        SecretClientAccessor secretClient,
        OpenAIDeploymentRepository deploymentRepository
    )
    {
        this._configuration = configuration;
        this._secretClient = secretClient;
        this._deploymentRepository = deploymentRepository;
    }

    public async Task<DefaultConfiguration> CreateDefaultConfigurationAsync()
    {
        var options =
            this._configuration.GetSection(QAzureOpenAIChatOptions.PropertyName).Get<QAzureOpenAIChatOptions>()
            ?? new QAzureOpenAIChatOptions { Enabled = false };
        if (!options.Enabled)
        {
            throw new InvalidOperationException("Azure OpenAI Chat is not enabled.");
        }
        var deployments = await this._deploymentRepository.GetAllDeploymentsAsync();
        var defaultConnection = deployments
            .ToList()
            .FirstOrDefault(conn => conn.Name.Equals(options.DefaultConnection, StringComparison.OrdinalIgnoreCase));

        if (defaultConnection == null)
        {
            throw new InvalidOperationException("Default connection not found. Please check the configuration.");
        }

        var apiKey = await this._secretClient.GetSecretClient().GetSecretAsync(defaultConnection.SecretName);
        return new DefaultConfiguration(
            options.DefaultModel,
            options.DefaultEmbeddingModel,
            apiKey.Value.Value,
            new Uri(defaultConnection.Endpoint)
        );
    }
}
