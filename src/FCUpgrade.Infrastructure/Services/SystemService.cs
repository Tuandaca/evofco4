using FCUpgrade.Application.Services;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FCUpgrade.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FCUpgrade.Infrastructure.Services;

public class SystemService : ISystemService
{
    private readonly ApplicationDbContext _dbContext;

    public SystemService(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<object> GetDataStatusAsync(CancellationToken cancellationToken = default)
    {
        var lastJob = await _dbContext.ImportJobs
            .AsNoTracking()
            .OrderByDescending(j => j.StartedAt)
            .FirstOrDefaultAsync(cancellationToken);

        var totalPlayers = await _dbContext.Players.CountAsync(cancellationToken);
        var totalSeasons = await _dbContext.Seasons.CountAsync(cancellationToken);
        var totalPlayerSeasons = await _dbContext.PlayerSeasons.CountAsync(cancellationToken);

        return new
        {
            Source = "FIFAaddict",
            LastSyncJob = lastJob != null ? new
            {
                lastJob.Id,
                lastJob.Type,
                lastJob.Status,
                lastJob.StartedAt,
                lastJob.CompletedAt,
                lastJob.Duration
            } : null,
            DatasetStats = new
            {
                TotalPlayers = totalPlayers,
                TotalSeasons = totalSeasons,
                TotalPlayerCards = totalPlayerSeasons
            }
        };
    }
}
