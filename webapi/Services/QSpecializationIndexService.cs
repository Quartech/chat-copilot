using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CopilotChat.WebApi.Models.Request;
using CopilotChat.WebApi.Models.Storage;
using CopilotChat.WebApi.Storage;

namespace CopilotChat.WebApi.Services;

public class QSpecializationIndexService : IQSpecializationIndexService
{
    private SpecializationIndexRepository _indexRepository;

    public QSpecializationIndexService(
        SpecializationIndexRepository indexRepository
    )
    {
        this._indexRepository = indexRepository;
    }

    public Task<IEnumerable<SpecializationIndex>> GetAllIndexes()
    {
        return this._indexRepository.GetAllIndexesAsync();
    }

    public Task<SpecializationIndex> GetIndexAsync(string id)
    {
        return this._indexRepository.FindByIdAsync(id);
    }

    public async Task<SpecializationIndex> SaveIndex(QSpecializationIndexBase index)
    {
        var indexInsert = new SpecializationIndex(
           index.Name,
           index.QueryType,
           index.AISearchDeploymentConnection,
           index.OpenAIDeploymentConnection,
           index.EmbeddingDeployment
       );
        await this._indexRepository.CreateAsync(indexInsert);

        return indexInsert;
    }

    public async Task<SpecializationIndex?> UpdateIndex(Guid indexId, QSpecializationIndexBase qIndexMutate)
    {
        var indexToEdit = await this._indexRepository.FindByIdAsync(indexId.ToString());
        if (indexToEdit == null)
        {
            return null;
        }

        indexToEdit.Name = qIndexMutate.Name ?? indexToEdit.Name;
        indexToEdit.QueryType = qIndexMutate.QueryType ?? indexToEdit.QueryType;
        indexToEdit.AISearchDeploymentConnection = qIndexMutate.AISearchDeploymentConnection ?? indexToEdit.AISearchDeploymentConnection;
        indexToEdit.OpenAIDeploymentConnection = qIndexMutate.OpenAIDeploymentConnection ?? indexToEdit.OpenAIDeploymentConnection;
        indexToEdit.EmbeddingDeployment = qIndexMutate.EmbeddingDeployment ?? indexToEdit.EmbeddingDeployment;

        await this._indexRepository.UpsertAsync(indexToEdit);
        return indexToEdit;
    }

    public async Task<SpecializationIndex?> DeleteIndex(Guid indexId)
    {
        var indexToDelete = await this._indexRepository.FindByIdAsync(indexId.ToString());
        if (indexToDelete == null)
        {
            return null;
        }
        await this._indexRepository.DeleteAsync(indexToDelete);
        return indexToDelete;
    }

    public async Task<SpecializationIndex?> GetSpecializationIndexByName(string name)
    {
        var indexes = await this._indexRepository.GetAllIndexesAsync();
        return indexes.FirstOrDefault(a => a.Name == name);
    }
}
