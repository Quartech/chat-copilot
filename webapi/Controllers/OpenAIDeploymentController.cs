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
public class OpenAIDeploymentController : ControllerBase
{
    private readonly ILogger<OpenAIDeploymentController> _logger;
    private readonly OpenAIDeploymentRepository _openAIDeploymentRepository;
    private readonly QOpenAIDeploymentService _qOpenAIDeploymentService;

    public OpenAIDeploymentController(
       ILogger<OpenAIDeploymentController> logger,
       OpenAIDeploymentRepository openAIDeploymentRepository
   )
    {
        this._logger = logger;
        this._openAIDeploymentRepository = openAIDeploymentRepository;
        this._qOpenAIDeploymentService = new QOpenAIDeploymentService(openAIDeploymentRepository);
    }

    [HttpGet]
    [Route("openAIDeployments")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetDeploymentsAsync()
    {
        var deployments = await this._openAIDeploymentRepository.GetAllDeploymentsAsync();
        return this.Ok(deployments);
    }

    [HttpPost]
    [Route("openAIDeployments")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status504GatewayTimeout)]
    public async Task<IActionResult> SaveDeployment([FromForm] QOpenAIDeploymentCreate deploymentCreate)
    {
        try
        {
            var deployment = await this._qOpenAIDeploymentService.SaveDeployment(deploymentCreate);
            var deploymentResponse = new QOpenAIDeploymentResponse(deployment);

            return this.Ok(deploymentResponse);
        }
        catch (Azure.RequestFailedException ex)
        {
            this._logger.LogError(ex, "Deployment creation threw an exception");

            return this.StatusCode(500, "Failed to create deployment.");
        }
    }

    [HttpPatch]
    [Route("openAIDeployments/{deploymentId:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> EditDeployment(
        [FromForm] QOpenAIDeploymentMutate qDeploymentMutate,
        [FromRoute] Guid deploymentId
    )
    {
        try
        {
            var deploymentToEdit = await this._qOpenAIDeploymentService.UpdateDeployment(deploymentId, qDeploymentMutate);
            if (deploymentToEdit != null)
            {
                return this.Ok(deploymentToEdit);
            }
            return this.StatusCode(500, $"Failed to update deployment for id '{deploymentId}'.");
        }
        catch (Azure.RequestFailedException ex)
        {
            this._logger.LogError(ex, "Deployment update threw an exception");

            return this.StatusCode(500, $"Failed to update deployment for id '{deploymentId}'.");
        }
    }

    [HttpDelete]
    [Route("openAIDeployments/{deploymentId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> DeleteIndex(Guid deploymentId)
    {
        try
        {
            var deploymentToDelete = await this._qOpenAIDeploymentService.DeleteDeployment(deploymentId);
            if (deploymentToDelete != null)
            {
                return this.Ok(true);
            }
            return this.StatusCode(500, $"Failed to delete deployment for id '{deploymentId}'.");
        }
        catch (Azure.RequestFailedException ex)
        {
            this._logger.LogError(ex, "Deployment delete threw an exception");

            return this.StatusCode(500, $"Failed to delete deployment for id '{deploymentId}'.");
        }
    }

    [HttpPost]
    [Route("openAIDeployments/order")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> OrderDeploymentsAsync([FromBody] OrderMapGuidToInt deploymentOrder)
    {
        try
        {
            await this._qOpenAIDeploymentService.OrderDeployments(deploymentOrder);
            return this.NoContent();
        }
        catch (Azure.RequestFailedException ex)
        {
            this._logger.LogError(ex, "Deployment swap order threw an exception");

            return this.StatusCode(500, $"Failed to order deployments: {ex.Message}.");
        }
    }
}
