using System.Threading;
using System.Threading.Tasks;
using FCUpgrade.Infrastructure.Providers.FIFAAddict;
using Microsoft.AspNetCore.Mvc;

namespace FCUpgrade.API.Controllers.Admin;

[ApiController]
[Route("api/v1/admin/data-sync/fifaaddict")]
public class DataSyncController : ControllerBase
{
    private readonly ImportJobService _importJobService;

    public DataSyncController(ImportJobService importJobService)
    {
        _importJobService = importJobService;
    }

    [HttpPost]
    public IActionResult StartDefaultSync()
    {
        // Fire and forget so we don't block the API
        _ = Task.Run(() => _importJobService.RunSyncAsync("SYNC", null, false, CancellationToken.None));
        return Accepted(new { message = "Data sync started in background." });
    }

    [HttpPost("full")]
    public IActionResult StartFullImport()
    {
        _ = Task.Run(() => _importJobService.RunSyncAsync("IMPORT_ALL", null, false, CancellationToken.None));
        return Accepted(new { message = "Full data import started in background." });
    }

    [HttpPost("sync")]
    public IActionResult StartIncrementalSync()
    {
        _ = Task.Run(() => _importJobService.RunSyncAsync("SYNC", null, false, CancellationToken.None));
        return Accepted(new { message = "Incremental sync started in background." });
    }
}
