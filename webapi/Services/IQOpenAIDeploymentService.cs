using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CopilotChat.WebApi.Models.Request;
using CopilotChat.WebApi.Models.Storage;

namespace CopilotChat.WebApi.Services;

public interface IQOpenAIDeploymentService
{
    Task<IEnumerable<OpenAIDeployment>> GetAllDeployments();

    Task<OpenAIDeployment> GetDeployment(string id);

    Task<OpenAIDeployment> SaveDeployment(QOpenAIDeploymentCreate deployment);

    Task<OpenAIDeployment?> UpdateDeployment(Guid indexId, QOpenAIDeploymentMutate qDeploymentMutate);

    Task<OpenAIDeployment?> DeleteDeployment(Guid indexId);
}
