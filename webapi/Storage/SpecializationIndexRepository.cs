using System.Collections.Generic;
using System.Threading.Tasks;
using CopilotChat.WebApi.Models.Storage;

namespace CopilotChat.WebApi.Storage;

public class SpecializationIndexRepository : Repository<SpecializationIndex>
{
    public SpecializationIndexRepository(IStorageContext<SpecializationIndex> storageContext)
        : base(storageContext) { }

    /// <summary>
    /// Retrieves all specializations.
    /// </summary>
    /// <returns>A list of specializations.</returns>
    public Task<IEnumerable<SpecializationIndex>> GetAllIndexesAsync()
    {
        return base.StorageContext.QueryEntitiesAsync(e => true);
    }
}
