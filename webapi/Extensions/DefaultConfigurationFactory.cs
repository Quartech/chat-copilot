using System.Threading.Tasks;
using CopilotChat.Shared;

namespace CopilotChat.WebApi.Extensions;

public class DefaultConfigurationFactory
{
    private readonly Task<DefaultConfiguration> _defaultConfigurationTask;

    public DefaultConfigurationFactory(DefaultConfigurationAccessor accessor)
    {
        this._defaultConfigurationTask = accessor.CreateDefaultConfigurationAsync();
    }

    public DefaultConfiguration GetDefaultConfiguration()
    {
        return this._defaultConfigurationTask.GetAwaiter().GetResult();
    }
}
