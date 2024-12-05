using System.Collections.Generic;
using System.Threading.Tasks;
using CopilotChat.WebApi.Models.Storage;

namespace CopilotChat.WebApi.Storage;

public class OpenAIDeploymentRepository : Repository<OpenAIDeployment>
{
    public OpenAIDeploymentRepository(IStorageContext<OpenAIDeployment> storageContext)
        : base(storageContext) { }

    public Task<IEnumerable<OpenAIDeployment>> GetAllDeploymentsAsync()
    {
        return base.StorageContext.QueryEntitiesAsync(e => true);
    }
}
