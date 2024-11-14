using System;
using System.Threading.Tasks;
using CopilotChat.WebApi.Models.Request;
using CopilotChat.WebApi.Models.Response;
using CopilotChat.WebApi.Services;
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
    private readonly QSpecializationIndexService _qSpecializationIndexService;

    public SpecializationIndexController(
        ILogger<SpecializationIndexController> logger,
        SpecializationIndexRepository indexRepository
    )
    {
        this._logger = logger;
        this._indexRepository = indexRepository;
        this._qSpecializationIndexService = new QSpecializationIndexService(indexRepository);
    }

    [HttpGet]
    [Route("indexes")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetIndexesAsync()
    {
        var indexes = await this._qSpecializationIndexService.GetAllIndexes();
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
        var index = await this._qSpecializationIndexService.SaveIndex(indexMutate);
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
        var indexToEdit = await this._qSpecializationIndexService.UpdateIndex(indexId, qIndexMutate);

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
        var indexToDelete = await this._qSpecializationIndexService.DeleteIndex(indexId);
        return this.Ok(true);
    }
}