using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Azure.Storage.Blobs;
using CopilotChat.WebApi.Models.Request;
using CopilotChat.WebApi.Models.Storage;
using CopilotChat.WebApi.Plugins.Chat.Ext;
using CopilotChat.WebApi.Storage;

namespace CopilotChat.WebApi.Services;

public class QSpecializationIndexService : IQSpecializationIndexService
{
    private SpecializationIndexRepository _indexRepository;

    private QBlobStorage _qBlobStorage;

    private QAzureOpenAIChatOptions _qAzureOpenAIChatOptions;

    public QSpecializationIndexService(
        SpecializationIndexRepository indexRepository,
        QAzureOpenAIChatOptions qAzureOpenAIChatOptions
    )
    {
        this._indexRepository = indexRepository;
        this._qAzureOpenAIChatOptions = qAzureOpenAIChatOptions;
        BlobServiceClient blobServiceClient = new(qAzureOpenAIChatOptions.BlobStorage.ConnectionString);
    }

    public Task<IEnumerable<SpecializationIndex>> GetAllIndexes()
    {
        throw new NotImplementedException();
    }

    public Task<SpecializationIndex> GetIndexAsync(string id)
    {
        throw new NotImplementedException();
    }

    public Task<SpecializationIndex> SaveIndex(QSpecializationIndexBase index)
    {
        throw new NotImplementedException();
    }

    public Task<SpecializationIndex> UpdateIndex(Guid indexId, QSpecializationIndexBase index)
    {
        throw new NotImplementedException();
    }
}
