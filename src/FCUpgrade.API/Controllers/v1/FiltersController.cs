using System.Threading;
using System.Threading.Tasks;
using FCUpgrade.Application.Services;
using FCUpgrade.Contracts.Common;
using Microsoft.AspNetCore.Mvc;

namespace FCUpgrade.API.Controllers.v1;

[ApiController]
[Route("api/v1/filters")]
[Tags("Filters")]
public class FiltersController : ControllerBase
{
    private readonly IFilterService _filterService;

    public FiltersController(IFilterService filterService)
    {
        _filterService = filterService;
    }

    [HttpGet("positions")]
    public async Task<IActionResult> GetPositions(CancellationToken cancellationToken)
    {
        var response = await _filterService.GetPositionsAsync(cancellationToken);
        return Ok(new ApiResponse<object>(response));
    }

    [HttpGet("teams")]
    public async Task<IActionResult> GetTeams([FromQuery] string? search, CancellationToken cancellationToken)
    {
        var response = await _filterService.GetTeamsAsync(search, cancellationToken);
        return Ok(new ApiResponse<object>(response));
    }

    [HttpGet("nations")]
    public async Task<IActionResult> GetNations([FromQuery] string? search, CancellationToken cancellationToken)
    {
        var response = await _filterService.GetNationsAsync(search, cancellationToken);
        return Ok(new ApiResponse<object>(response));
    }

    [HttpGet("leagues")]
    public async Task<IActionResult> GetLeagues([FromQuery] string? search, CancellationToken cancellationToken)
    {
        var response = await _filterService.GetLeaguesAsync(search, cancellationToken);
        return Ok(new ApiResponse<object>(response));
    }
}
