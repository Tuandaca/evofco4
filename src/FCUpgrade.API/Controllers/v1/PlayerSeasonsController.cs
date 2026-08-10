using System.Threading;
using System.Threading.Tasks;
using FCUpgrade.Application.Services;
using FCUpgrade.Contracts.Common;
using FCUpgrade.Contracts.Requests;
using Microsoft.AspNetCore.Mvc;

namespace FCUpgrade.API.Controllers.v1;

[ApiController]
[Route("api/v1/player-seasons")]
[Tags("Player Seasons")]
public class PlayerSeasonsController : ControllerBase
{
    private readonly IPlayerService _playerService;

    public PlayerSeasonsController(IPlayerService playerService)
    {
        _playerService = playerService;
    }

    [HttpGet]
    public async Task<IActionResult> GetPlayerSeasons([FromQuery] GetPlayersRequest request, CancellationToken cancellationToken)
    {
        var response = await _playerService.GetPlayerSeasonsAsync(request, cancellationToken);
        return Ok(new ApiResponse<object>(response));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetPlayerSeason(int id, CancellationToken cancellationToken)
    {
        var playerSeason = await _playerService.GetPlayerSeasonByIdAsync(id, cancellationToken);
        if (playerSeason == null)
            return NotFound(new ApiErrorResponse { Error = new ApiErrorResponse.ErrorDetail { Code = "NOT_FOUND", Message = "Player season not found." } });

        return Ok(new ApiResponse<object>(playerSeason));
    }
}
