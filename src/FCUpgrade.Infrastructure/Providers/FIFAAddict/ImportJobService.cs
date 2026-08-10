using System;
using System.Diagnostics;
using System.Threading;
using System.Threading.Tasks;
using FCUpgrade.Domain.Entities;
using FCUpgrade.Infrastructure.Persistence;
using Microsoft.Extensions.Logging;

namespace FCUpgrade.Infrastructure.Providers.FIFAAddict;

public class ImportJobService
{
    private readonly FifaAddictDataProvider _dataProvider;
    private readonly ApplicationDbContext _dbContext;
    private readonly ILogger<ImportJobService> _logger;

    public ImportJobService(
        FifaAddictDataProvider dataProvider, 
        ApplicationDbContext dbContext,
        ILogger<ImportJobService> logger)
    {
        _dataProvider = dataProvider;
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task RunSyncAsync(string type = "IMPORT_ALL", string? seasonCode = null, bool isDryRun = false, CancellationToken cancellationToken = default)
    {
        var job = new ImportJob
        {
            Type = type,
            Status = "RUNNING",
            StartedAt = DateTime.UtcNow
        };

        if (!isDryRun)
        {
            _dbContext.ImportJobs.Add(job);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }

        var sw = Stopwatch.StartNew();
        var page = 1;
        var totalProcessed = 0;
        var hasMore = true;

        try
        {
            while (hasMore && !cancellationToken.IsCancellationRequested)
            {
                _logger.LogInformation("Processing page {page} for {type} (Season: {seasonCode})...", page, type, seasonCode ?? "ALL");
                
                // For a real robust scraper, we might need a delay here between pages
                var count = await _dataProvider.DiscoverAndSyncPlayersAsync(page, seasonCode, isDryRun, cancellationToken);
                
                if (count == 0)
                {
                    hasMore = false;
                }
                else
                {
                    totalProcessed += count;
                    page++;
                }
            }

            job.Status = "SUCCESS";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Import Job failed at page {page}", page);
            job.Status = "FAILED";
            job.ErrorCount++;
        }
        finally
        {
            sw.Stop();
            job.CompletedAt = DateTime.UtcNow;
            job.Duration = sw.Elapsed;
            job.RecordsReceived = totalProcessed;
            
            // To be entirely accurate, the DataProvider should return updated/inserted counts.
            // For now, we simulate this logic or extend DataProvider to return stats.

            if (!isDryRun)
            {
                _dbContext.ImportJobs.Update(job);
                await _dbContext.SaveChangesAsync(CancellationToken.None); // Don't cancel saving final status
            }

            _logger.LogInformation("Job {id} completed. Status: {status}. Total Processed: {total}. Duration: {duration}", 
                job.Id, job.Status, totalProcessed, job.Duration);
        }
    }
}
