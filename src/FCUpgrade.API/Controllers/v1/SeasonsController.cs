using System.Threading;
using System.Threading.Tasks;
using FCUpgrade.Application.Services;
using FCUpgrade.Contracts.Common;
using FCUpgrade.Contracts.Requests;
using Microsoft.AspNetCore.Mvc;

namespace FCUpgrade.API.Controllers.v1;

[ApiController]
[Route("api/v1/seasons")]
[Tags("Seasons")]
public class SeasonsController : ControllerBase
{
    private readonly ISeasonService _seasonService;
    private readonly IPlayerService _playerService;

    public SeasonsController(ISeasonService seasonService, IPlayerService playerService)
    {
        _seasonService = seasonService;
        _playerService = playerService;
    }

    [HttpGet]
    public async Task<IActionResult> GetSeasons([FromQuery] GetSeasonsRequest request, CancellationToken cancellationToken)
    {
        var response = await _seasonService.GetSeasonsAsync(request, cancellationToken);
        return Ok(new ApiResponse<object>(response));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetSeason(string id, CancellationToken cancellationToken)
    {
        object? season = null;
        if (int.TryParse(id, out int numericId))
        {
            season = await _seasonService.GetSeasonByIdAsync(numericId, cancellationToken);
        }
        else
        {
            season = await _seasonService.GetSeasonByCodeAsync(id, cancellationToken);
        }

        if (season == null)
            return NotFound(new ApiErrorResponse { Error = new ApiErrorResponse.ErrorDetail { Code = "NOT_FOUND", Message = "Season not found." } });

        return Ok(new ApiResponse<object>(season));
    }

    [HttpGet("{id}/players")]
    public async Task<IActionResult> GetSeasonPlayers(string id, [FromQuery] GetPlayersRequest request, CancellationToken cancellationToken)
    {
        var season = await _seasonService.GetSeasonByCodeAsync(id, cancellationToken);
        if (season == null && int.TryParse(id, out int numericId))
        {
            season = await _seasonService.GetSeasonByIdAsync(numericId, cancellationToken);
        }

        if (season == null)
            return NotFound(new ApiErrorResponse { Error = new ApiErrorResponse.ErrorDetail { Code = "NOT_FOUND", Message = "Season not found." } });

        request.SeasonId = season.Id;
        var response = await _playerService.GetPlayerSeasonsAsync(request, cancellationToken);
        return Ok(new ApiResponse<object>(response));
    }
}
