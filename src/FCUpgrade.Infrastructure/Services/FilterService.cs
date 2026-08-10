using FCUpgrade.Application.Services;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FCUpgrade.Contracts.DTOs;
using FCUpgrade.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FCUpgrade.Infrastructure.Services;

public class FilterService : IFilterService
{
    private readonly ApplicationDbContext _dbContext;

    public FilterService(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IEnumerable<FilterOptionDto>> GetPositionsAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.PlayerSeasons
            .AsNoTracking()
            .GroupBy(ps => ps.Pos1)
            .Select(g => new FilterOptionDto
            {
                Id = g.Key,
                Name = g.Key,
                Count = g.Count()
            })
            .OrderBy(f => f.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<FilterOptionDto>> GetTeamsAsync(string? search = null, CancellationToken cancellationToken = default)
    {
        var query = _dbContext.PlayerSeasons.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchTerm = $"%{search}%";
            query = query.Where(ps => EF.Functions.ILike(ps.TeamName, searchTerm));
        }

        return await query
            .GroupBy(ps => new { ps.TeamId, ps.TeamName })
            .Select(g => new FilterOptionDto
            {
                Id = g.Key.TeamId.ToString(),
                Name = g.Key.TeamName,
                Count = g.Count()
            })
            .OrderByDescending(f => f.Count)
            .ThenBy(f => f.Name)
            .Take(100) // Limit to top 100 teams for performance
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<FilterOptionDto>> GetNationsAsync(string? search = null, CancellationToken cancellationToken = default)
    {
        var query = _dbContext.PlayerSeasons.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchTerm = $"%{search}%";
            query = query.Where(ps => EF.Functions.ILike(ps.NationName, searchTerm));
        }

        return await query
            .GroupBy(ps => new { ps.NationId, ps.NationName })
            .Select(g => new FilterOptionDto
            {
                Id = g.Key.NationId.ToString(),
                Name = g.Key.NationName,
                Count = g.Count()
            })
            .OrderByDescending(f => f.Count)
            .ThenBy(f => f.Name)
            .Take(100)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<FilterOptionDto>> GetLeaguesAsync(string? search = null, CancellationToken cancellationToken = default)
    {
        var query = _dbContext.PlayerSeasons.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchTerm = $"%{search}%";
            query = query.Where(ps => EF.Functions.ILike(ps.LeagueName, searchTerm));
        }

        return await query
            .GroupBy(ps => new { ps.LeagueId, ps.LeagueName })
            .Select(g => new FilterOptionDto
            {
                Id = g.Key.LeagueId.ToString(),
                Name = g.Key.LeagueName,
                Count = g.Count()
            })
            .OrderByDescending(f => f.Count)
            .ThenBy(f => f.Name)
            .Take(100)
            .ToListAsync(cancellationToken);
    }
}
