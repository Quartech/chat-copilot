using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CopilotChat.WebApi.Models.Request;
using CopilotChat.WebApi.Models.Storage;
using CopilotChat.WebApi.Storage;
using Newtonsoft.Json;

namespace CopilotChat.WebApi.Services;

public class QOpenAIDeploymentService : IQOpenAIDeploymentService
{
    private OpenAIDeploymentRepository _openAIDeploymentRepository;
    public QOpenAIDeploymentService(OpenAIDeploymentRepository deploymentRepository)
    {
        this._openAIDeploymentRepository = deploymentRepository;
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

    public async Task<OpenAIDeployment> SaveDeployment(QOpenAIDeploymentCreate deployment)
    {
        var deserializeCompletions = JsonConvert.DeserializeObject<List<ChatCompletionDeployment>>(deployment.ChatCompletionDeployments);
        var deserializeEmbeddings = JsonConvert.DeserializeObject<List<string>>(deployment.EmbeddingDeployments);

        var deploymentInsert = new OpenAIDeployment(
            deployment.Name,
            deployment.Endpoint,
            deployment.SecretName,
            deserializeCompletions ?? new List<ChatCompletionDeployment>(),
            deserializeEmbeddings ?? new List<string>()
        );

        await this._openAIDeploymentRepository.CreateAsync(deploymentInsert);
        return deploymentInsert;
    }

    public async Task<OpenAIDeployment?> UpdateDeployment(Guid indexId, QOpenAIDeploymentMutate qDeploymentMutate)
    {
        var deserializeCompletions = JsonConvert.DeserializeObject<List<ChatCompletionDeployment>>(qDeploymentMutate.ChatCompletionDeployments);
        var deserializeEmbeddings = JsonConvert.DeserializeObject<List<string>>(qDeploymentMutate.EmbeddingDeployments);
        var deploymentToEdit = await this._openAIDeploymentRepository.FindByIdAsync(indexId.ToString());

        deploymentToEdit.Name = qDeploymentMutate.Name ?? deploymentToEdit.Name;
        deploymentToEdit.SecretName = qDeploymentMutate.SecretName ?? deploymentToEdit.SecretName;
        deploymentToEdit.Endpoint = qDeploymentMutate.Endpoint ?? deploymentToEdit.Endpoint;
        deploymentToEdit.ChatCompletionDeployments = deserializeCompletions ?? deploymentToEdit.ChatCompletionDeployments;
        deploymentToEdit.EmbeddingDeployments = deserializeEmbeddings ?? deploymentToEdit.EmbeddingDeployments;

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