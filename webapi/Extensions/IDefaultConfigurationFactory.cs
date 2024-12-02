using CopilotChat.Shared;

namespace CopilotChat.WebApi.Extensions;
public interface IDefaultConfigurationFactory
{
    public DefaultConfiguration GetDefaultConfiguration();
}