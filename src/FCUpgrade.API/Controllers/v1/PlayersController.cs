using System.Threading;
using System.Threading.Tasks;
using FCUpgrade.Application.Services;
using FCUpgrade.Contracts.Common;
using FCUpgrade.Contracts.Requests;
using Microsoft.AspNetCore.Mvc;

namespace FCUpgrade.API.Controllers.v1;

[ApiController]
[Route("api/v1/players")]
[Tags("Players")]
public class PlayersController : ControllerBase
{
    private readonly IPlayerService _playerService;

    public PlayersController(IPlayerService playerService)
    {
        _playerService = playerService;
    }

    [HttpGet]
    public async Task<IActionResult> GetPlayers([FromQuery] GetPlayersRequest request, CancellationToken cancellationToken)
    {
        var response = await _playerService.GetPlayersAsync(request, cancellationToken);
        return Ok(new ApiResponse<object>(response));
    }

    [HttpGet("search")]
    public async Task<IActionResult> SearchPlayers([FromQuery] GetPlayersRequest request, CancellationToken cancellationToken)
    {
        // For search, we might just use the player seasons endpoint since people usually search for specific cards
        // But if they want base players, this is fine
        var response = await _playerService.GetPlayersAsync(request, cancellationToken);
        return Ok(new ApiResponse<object>(response));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetPlayer(int id, CancellationToken cancellationToken)
    {
        var player = await _playerService.GetPlayerByIdAsync(id, cancellationToken);
        if (player == null)
            return NotFound(new ApiErrorResponse { Error = new ApiErrorResponse.ErrorDetail { Code = "NOT_FOUND", Message = "Player not found." } });

        return Ok(new ApiResponse<object>(player));
    }

    [HttpGet("{id}/seasons")]
    public async Task<IActionResult> GetPlayerSeasons(int id, [FromQuery] GetPlayersRequest request, CancellationToken cancellationToken)
    {
        var response = await _playerService.GetPlayerSeasonsByPlayerIdAsync(id, request, cancellationToken);
        return Ok(new ApiResponse<object>(response));
    }
}
