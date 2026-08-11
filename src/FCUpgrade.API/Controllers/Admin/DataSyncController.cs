using System.Threading;
using System.Threading.Tasks;
using FCUpgrade.Infrastructure.Providers.FIFAAddict;
using Microsoft.AspNetCore.Mvc;

using Microsoft.Extensions.DependencyInjection;

namespace FCUpgrade.API.Controllers.Admin;

[ApiController]
[Route("api/v1/admin/data-sync/fifaaddict")]
public class DataSyncController : ControllerBase
{
    private readonly IServiceScopeFactory _scopeFactory;

    public DataSyncController(IServiceScopeFactory scopeFactory)
    {
        _scopeFactory = scopeFactory;
    }

    [HttpPost]
    public IActionResult StartDefaultSync()
    {
        _ = Task.Run(async () => 
        {
            using var scope = _scopeFactory.CreateScope();
            var importJobService = scope.ServiceProvider.GetRequiredService<ImportJobService>();
            await importJobService.RunSyncAsync("SYNC", null, false, CancellationToken.None);
        });
        return Accepted(new { message = "Data sync started in background." });
    }

    [HttpPost("full")]
    public IActionResult StartFullImport()
    {
        _ = Task.Run(async () => 
        {
            using var scope = _scopeFactory.CreateScope();
            var importJobService = scope.ServiceProvider.GetRequiredService<ImportJobService>();
            await importJobService.RunSyncAsync("IMPORT_ALL", null, false, CancellationToken.None);
        });
        return Accepted(new { message = "Full data import started in background." });
    }

    [HttpPost("sync")]
    public IActionResult StartIncrementalSync()
    {
        _ = Task.Run(async () => 
        {
            using var scope = _scopeFactory.CreateScope();
            var importJobService = scope.ServiceProvider.GetRequiredService<ImportJobService>();
            await importJobService.RunSyncAsync("SYNC", null, false, CancellationToken.None);
        });
        return Accepted(new { message = "Incremental sync started in background." });
    }
}
