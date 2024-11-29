using System;
using Azure.Identity;
using Azure.Security.KeyVault.Secrets;
using CopilotChat.WebApi.Options;
using Microsoft.Extensions.Configuration;

namespace CopilotChat.WebApi.Extensions;

public class SecretClientAccessor
{
    private readonly IConfiguration _configuration;
    private SecretClient? _secretClient;

    public SecretClientAccessor(IConfiguration configuration)
    {
        this._configuration = configuration;
    }

    public SecretClient GetSecretClient()
    {
        if (this._secretClient == null)
        {
            var vaultUri = this
                ._configuration.GetSection($"{ChatAuthenticationOptions.PropertyName}:VaultUri")
                .Get<string>();
            if (string.IsNullOrEmpty(vaultUri))
            {
                throw new InvalidOperationException("Keyvault URI is missing.");
            }
            this._secretClient = new SecretClient(new Uri(vaultUri), new DefaultAzureCredential());
        }
        return this._secretClient;
    }
}
