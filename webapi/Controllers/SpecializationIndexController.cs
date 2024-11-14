using System;
using System.Threading.Tasks;
using CopilotChat.WebApi.Models.Request;
using CopilotChat.WebApi.Models.Response;
using CopilotChat.WebApi.Models.Storage;
using CopilotChat.WebApi.Storage;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos.Linq;
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
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetIndexesAsync()
    {
        var indexes = await _indexRepository.GetAllIndexesAsync();
        return this.Ok(indexes);
    }

    [HttpPost]
    [Route("indexes")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status504GatewayTimeout)]
    public async Task<IActionResult> SaveIndex([FromForm] QSpecializationIndexBase indexMutate)
    {
        var index = new SpecializationIndex(
            indexMutate.Name,
            indexMutate.QueryType,
            indexMutate.AISearchDeploymentConnection,
            indexMutate.OpenAIDeploymentConnection,
            indexMutate.EmbeddingDeployment
        );
        await this._indexRepository.CreateAsync(index);

        var specializationResponse = new QSpecializationIndexResponse(index);

        return this.Ok(specializationResponse);
    }

    [HttpPatch]
    [Route("indexes/{indexId:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> EditIndex(
        [FromForm] QSpecializationIndexMutate qIndexMutate,
        [FromRoute] Guid indexId
    )
    {
        var indexToEdit = await this._indexRepository.FindByIdAsync(indexId.ToString());
        if (indexToEdit == null)
        {
            return this.NotFound();
        }

        indexToEdit.Name = qIndexMutate.Name ?? indexToEdit.Name;
        indexToEdit.QueryType = qIndexMutate.QueryType ?? indexToEdit.QueryType;
        indexToEdit.AISearchDeploymentConnection = qIndexMutate.AISearchDeploymentConnection ?? indexToEdit.AISearchDeploymentConnection;
        indexToEdit.OpenAIDeploymentConnection = qIndexMutate.OpenAIDeploymentConnection ?? indexToEdit.OpenAIDeploymentConnection;
        indexToEdit.EmbeddingDeployment = qIndexMutate.EmbeddingDeployment ?? indexToEdit.EmbeddingDeployment;

        await this._indexRepository.UpsertAsync(indexToEdit);

        return this.Ok(indexToEdit);
    }

    [HttpDelete]
    [Route("indexes/{indexId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> DeleteIndex(Guid indexId)
    {
        var indexToDelete = await this._indexRepository.FindByIdAsync(indexId.ToString());
        if (indexToDelete == null)
        {
            return this.NotFound();
        }

        await this._indexRepository.DeleteAsync(indexToDelete);
        return this.Ok(true);
    }
}