namespace CopilotChat.WebApi.Context;

public interface IContextValueAccessor
{
    public object? GetRouteValue(string key);
}
