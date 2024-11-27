using System.Threading.Tasks;

namespace CopilotChat.WebApi.Context;

public interface IContextBodyAccessor
{
    public Task<T?> ReadBody<T>() where T : class;
}
