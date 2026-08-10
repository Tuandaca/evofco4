using System.Threading;
using System.Threading.Tasks;
using FCUpgrade.Application.Services;
using FCUpgrade.Contracts.Common;
using Microsoft.AspNetCore.Mvc;

namespace FCUpgrade.API.Controllers.v1;

[ApiController]
[Route("api/v1")]
[Tags("System")]
public class SystemController : ControllerBase
{
    private readonly ISystemService _systemService;

    public SystemController(ISystemService systemService)
    {
        _systemService = systemService;
    }

    [HttpGet("health")]
    public IActionResult Health()
    {
        return Ok(new ApiResponse<object>(new { status = "Healthy" }));
    }

    [HttpGet("data-status")]
    public async Task<IActionResult> GetDataStatus(CancellationToken cancellationToken)
    {
        var status = await _systemService.GetDataStatusAsync(cancellationToken);
        return Ok(new ApiResponse<object>(status));
    }
}
