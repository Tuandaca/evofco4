using FCUpgrade.Application.Services;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FCUpgrade.Contracts.Common;
using FCUpgrade.Contracts.DTOs;
using FCUpgrade.Contracts.Requests;
using FCUpgrade.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FCUpgrade.Infrastructure.Services;

public class SeasonService : ISeasonService
{
    private readonly ApplicationDbContext _dbContext;

    public SeasonService(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<PaginatedResponse<SeasonListItemDto>> GetSeasonsAsync(GetSeasonsRequest request, CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Seasons.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = $"%{request.Search}%";
            if (_dbContext.Database.IsNpgsql())
                query = query.Where(s => EF.Functions.ILike(s.Name, search) || EF.Functions.ILike(s.Code, search) || EF.Functions.ILike(s.SeasonId, search));
            else
                query = query.Where(s => EF.Functions.Like(s.Name, search) || EF.Functions.Like(s.Code, search) || EF.Functions.Like(s.SeasonId, search));
        }

        query = request.SortBy?.ToLower() switch
        {
            "name" => request.SortDirection?.ToLower() == "desc" ? query.OrderByDescending(s => s.Name) : query.OrderBy(s => s.Name),
            "code" => request.SortDirection?.ToLower() == "desc" ? query.OrderByDescending(s => s.Code) : query.OrderBy(s => s.Code),
            "active" => request.SortDirection?.ToLower() == "desc" ? query.OrderByDescending(s => s.IsActive) : query.OrderBy(s => s.IsActive),
            "updatedat" => request.SortDirection?.ToLower() == "asc" ? query.OrderBy(s => s.LastSeenAt) : query.OrderByDescending(s => s.LastSeenAt),
            // Count can't easily be sorted without subquery or caching, we'll sort by player count via subquery
            "count" => request.SortDirection?.ToLower() == "asc" ? query.OrderBy(s => s.PlayerSeasons.Count) : query.OrderByDescending(s => s.PlayerSeasons.Count),
            _ => query.OrderByDescending(s => s.IsActive).ThenBy(s => s.Name)
        };

        var totalItems = await query.CountAsync(cancellationToken);
        
        var pageSize = Math.Clamp(request.PageSize, 1, 100);
        var page = Math.Max(request.Page, 1);
        var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(s => new SeasonListItemDto
            {
                Id = s.Id,
                SeasonId = s.SeasonId,
                Code = s.Code,
                Name = s.Name,
                IsActive = s.IsActive,
                PlayerCount = s.PlayerSeasons.Count(),
                LastUpdatedAt = s.LastSeenAt
            })
            .ToListAsync(cancellationToken);

        return new PaginatedResponse<SeasonListItemDto>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalItems = totalItems,
            TotalPages = totalPages
        };
    }

    public async Task<SeasonDetailDto?> GetSeasonByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Seasons
            .AsNoTracking()
            .Where(s => s.Id == id)
            .Select(s => new SeasonDetailDto
            {
                Id = s.Id,
                SeasonId = s.SeasonId,
                Code = s.Code,
                Name = s.Name,
                IsActive = s.IsActive,
                FirstSeenAt = s.FirstSeenAt,
                LastSeenAt = s.LastSeenAt,
                TotalPlayers = s.PlayerSeasons.Count()
            })
            .FirstOrDefaultAsync(cancellationToken);
    }
    
    public async Task<SeasonDetailDto?> GetSeasonByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Seasons
            .AsNoTracking()
            .Where(s => s.SeasonId.ToLower() == code.ToLower() || s.Code.ToLower() == code.ToLower())
            .Select(s => new SeasonDetailDto
            {
                Id = s.Id,
                SeasonId = s.SeasonId,
                Code = s.Code,
                Name = s.Name,
                IsActive = s.IsActive,
                FirstSeenAt = s.FirstSeenAt,
                LastSeenAt = s.LastSeenAt,
                TotalPlayers = s.PlayerSeasons.Count()
            })
            .FirstOrDefaultAsync(cancellationToken);
    }
}
