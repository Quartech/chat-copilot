using System.Collections.Generic;
using System.Linq;
using CopilotChat.WebApi.Models.Request;
using CopilotChat.WebApi.Models.Storage;

namespace CopilotChat.WebApi.Storage;

public interface ISortable<T, TSortOption>
{
    IQueryable<T> Sort(IQueryable<T> queryable, IEnumerable<TSortOption> sortOptions);
}

public interface ICopilotChatMessageSortable : ISortable<CopilotChatMessage, CopilotChatMessageSortOption>
{
    new IQueryable<CopilotChatMessage> Sort(
        IQueryable<CopilotChatMessage> queryable,
        IEnumerable<CopilotChatMessageSortOption>? sortOptions
    );
}
