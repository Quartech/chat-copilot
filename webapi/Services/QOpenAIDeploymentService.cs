using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Azure.Identity;
using Azure.Security.KeyVault.Secrets;
using CopilotChat.WebApi.Models.Request;
using CopilotChat.WebApi.Models.Storage;
using CopilotChat.WebApi.Storage;
using Newtonsoft.Json;

namespace CopilotChat.WebApi.Services;

public class QOpenAIDeploymentService : IQOpenAIDeploymentService
{
    private OpenAIDeploymentRepository _openAIDeploymentRepository;
    private SecretClient _secretClient;

    public QOpenAIDeploymentService(OpenAIDeploymentRepository deploymentRepository)
    {
        this._openAIDeploymentRepository = deploymentRepository;
        //TODO: Don't leave the vault uri hardcoded.
        this._secretClient = new SecretClient(
            vaultUri: new Uri("https://kvt-copilot-cnc-app-dev.vault.azure.net/"),
            credential: new DefaultAzureCredential()
        );
    }

    public async Task<OpenAIDeployment?> DeleteDeployment(Guid indexId)
    {
        var deploymentToDelete = await this._openAIDeploymentRepository.FindByIdAsync(indexId.ToString());
        if (deploymentToDelete == null)
        {
            return null;
        }
        await this._openAIDeploymentRepository.DeleteAsync(deploymentToDelete);
        return deploymentToDelete;
    }

    public Task<IEnumerable<OpenAIDeployment>> GetAllDeployments()
    {
        return this._openAIDeploymentRepository.GetAllDeploymentsAsync();
    }

    public Task<OpenAIDeployment> GetDeployment(string id)
    {
        return this._openAIDeploymentRepository.FindByIdAsync(id);
    }

    public async Task<string> GetAPIKeyFromVaultForDeployment(OpenAIDeployment deployment)
    {
        var secretName = deployment.SecretName;
        var secretValue = await this._secretClient.GetSecretAsync(secretName);
        return secretValue.Value.Value ?? "";
    }

    public async Task<IEnumerable<ChatCompletionDeployment>> GetAllChatCompletionDeployments()
    {
        var deployments = await this._openAIDeploymentRepository.GetAllDeploymentsAsync();
        var chatCompletionDeployments = new List<ChatCompletionDeployment>();
        foreach (OpenAIDeployment connection in deployments)
        {
            foreach (var deployment in connection.ChatCompletionDeployments)
            {
                var deploymentWithConnection = new ChatCompletionDeployment
                {
                    Name = $"{deployment.Name} ({connection.Name})",
                    CompletionTokenLimit = deployment.CompletionTokenLimit,
                };
                chatCompletionDeployments.Add(deploymentWithConnection);
            }
        }
        return chatCompletionDeployments;
    }

    public async Task<OpenAIDeployment> SaveDeployment(QOpenAIDeploymentCreate deployment)
    {
        var deserializeCompletions = JsonConvert.DeserializeObject<List<ChatCompletionDeployment>>(
            deployment.ChatCompletionDeployments
        );
        var deserializeEmbeddings = JsonConvert.DeserializeObject<List<string>>(deployment.EmbeddingDeployments);
        var deserializeImageGeneration = JsonConvert.DeserializeObject<List<string>>(deployment.EmbeddingDeployments);

        var deploymentInsert = new OpenAIDeployment(
            deployment.Name,
            deployment.Endpoint,
            deployment.SecretName,
            deserializeCompletions ?? new List<ChatCompletionDeployment>(),
            deserializeImageGeneration ?? new List<string>(),
            deserializeEmbeddings ?? new List<string>()
        );

        await this._openAIDeploymentRepository.CreateAsync(deploymentInsert);
        return deploymentInsert;
    }

    public async Task<OpenAIDeployment?> UpdateDeployment(Guid indexId, QOpenAIDeploymentMutate qDeploymentMutate)
    {
        var deserializeCompletions = JsonConvert.DeserializeObject<List<ChatCompletionDeployment>>(
            qDeploymentMutate.ChatCompletionDeployments
        );
        var deserializeEmbeddings = JsonConvert.DeserializeObject<List<string>>(qDeploymentMutate.EmbeddingDeployments);
        var deserializeImageGeneration = JsonConvert.DeserializeObject<List<string>>(
            qDeploymentMutate.ImageGenerationDeployments
        );
        var deploymentToEdit = await this._openAIDeploymentRepository.FindByIdAsync(indexId.ToString());

        deploymentToEdit.Name = qDeploymentMutate.Name ?? deploymentToEdit.Name;
        deploymentToEdit.SecretName = qDeploymentMutate.SecretName ?? deploymentToEdit.SecretName;
        deploymentToEdit.Endpoint = qDeploymentMutate.Endpoint ?? deploymentToEdit.Endpoint;
        deploymentToEdit.ChatCompletionDeployments =
            deserializeCompletions ?? deploymentToEdit.ChatCompletionDeployments;
        deploymentToEdit.EmbeddingDeployments = deserializeEmbeddings ?? deploymentToEdit.EmbeddingDeployments;
        deploymentToEdit.ImageGenerationDeployments =
            deserializeImageGeneration ?? deploymentToEdit.ImageGenerationDeployments;

        await this._openAIDeploymentRepository.UpsertAsync(deploymentToEdit);
        return deploymentToEdit;
    }

    public async Task OrderDeployments(OrderMapGuidToInt deploymentOrder)
    {
        if (deploymentOrder == null)
        {
            throw new ArgumentNullException(nameof(deploymentOrder), "QSpecializationOrder must be provided.");
        }

        var indexes = (await this.GetAllDeployments()).ToList();

        var upsertTasks = new List<Task>();

        foreach (var order in deploymentOrder.Ordering)
        {
            string indexId = order.Key;
            int newOrder = order.Value;

            var deployment = indexes.FirstOrDefault(s => s.Id == indexId);
            if (deployment != null)
            {
                // Update the order
                deployment.Order = newOrder;
                upsertTasks.Add(this._openAIDeploymentRepository.UpsertAsync(deployment));
            }
        }
        await Task.WhenAll(upsertTasks);
    }
}
