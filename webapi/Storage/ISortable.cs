using System.Linq;
using CopilotChat.WebApi.Models.Request;
using CopilotChat.WebApi.Models.Storage;

namespace CopilotChat.WebApi.Storage;

public interface ISortable<T, TSortOption>
{
    IQueryable<T> Sort(IQueryable<T> queryable, TSortOption? sortOption);
}

public interface ICopilotChatMessageSortable : ISortable<CopilotChatMessage, CopilotChatMessageSortOption?>
{
    IQueryable<CopilotChatMessage> Sort(
        IQueryable<CopilotChatMessage> queryable,
        CopilotChatMessageSortOption? sortOption
    );
}
