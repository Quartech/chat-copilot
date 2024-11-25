using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CopilotChat.WebApi.Models.Request;
using CopilotChat.WebApi.Models.Storage;

namespace CopilotChat.WebApi.Services;

public interface IQSpecializationIndexService
{
    Task<IEnumerable<SpecializationIndex>> GetAllIndexes();

    Task<SpecializationIndex> GetIndexAsync(string id);

    Task<SpecializationIndex> SaveIndex(QSpecializationIndexCreate index);

    Task<SpecializationIndex?> UpdateIndex(Guid indexId, QSpecializationIndexBase qIndexMutate);
}
