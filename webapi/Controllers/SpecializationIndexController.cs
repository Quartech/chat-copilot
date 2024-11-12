using System.Threading.Tasks;
using CopilotChat.WebApi.Models.Request;
using CopilotChat.WebApi.Models.Storage;
using CopilotChat.WebApi.Storage;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace CopilotChat.WebApi.Controllers;

[ApiController]
public class SpecializationIndexController : ControllerBase
{
    private readonly ILogger<SpecializationIndexController> _logger;

    private readonly SpecializationIndexRepository _indexRepository;

    public SpecializationIndexController(
        ILogger<SpecializationIndexController> logger,
        SpecializationIndexRepository indexRepository
    )
    {
        this._logger = logger;
        this._indexRepository = indexRepository;
    }

    [HttpGet]
    [Route("indexes")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetIndexesAsync()
    {
        var indexes = await _indexRepository.GetAllIndexesAsync();
        return this.Ok(indexes);
    }

    [HttpPost]
    [Route("indexes")]
    public async Task<IActionResult> SaveIndex([FromForm] QSpecializationIndexBase indexMutate)
    {
        var index = new SpecializationIndex(
            indexMutate.Name,
            indexMutate.QueryType,
            indexMutate.AISearchDeploymentConnection,
            indexMutate.OpenAIDeploymentConnection,
            indexMutate.EmbeddingDeployment
        );
        await _indexRepository.CreateAsync(index);
        return this.Ok();
    }
}
