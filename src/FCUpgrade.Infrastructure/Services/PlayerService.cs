using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FCUpgrade.Application.Services;
using FCUpgrade.Contracts.Common;
using FCUpgrade.Contracts.DTOs;
using FCUpgrade.Contracts.Requests;
using FCUpgrade.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FCUpgrade.Infrastructure.Services;

public class PlayerService : IPlayerService
{
    private readonly ApplicationDbContext _dbContext;

    public PlayerService(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<PaginatedResponse<PlayerListItemDto>> GetPlayersAsync(GetPlayersRequest request, CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Players.AsNoTracking().AsQueryable();

        bool isPostgres = _dbContext.Database.IsNpgsql();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = $"%{request.Search}%";
            if (isPostgres)
                query = query.Where(p => EF.Functions.ILike(p.Name, search) || EF.Functions.ILike(p.NameShort, search));
            else
                query = query.Where(p => EF.Functions.Like(p.Name, search) || EF.Functions.Like(p.NameShort, search));
        }

        // Apply PlayerSeason filters if any
        if (request.SeasonId.HasValue || !string.IsNullOrWhiteSpace(request.SeasonCode) || !string.IsNullOrWhiteSpace(request.Position) || request.MinOvr.HasValue || request.MaxOvr.HasValue)
        {
            query = query.Where(p => p.PlayerSeasons.Any(ps => 
                (!request.SeasonId.HasValue || ps.SeasonId == request.SeasonId.Value) &&
                (string.IsNullOrWhiteSpace(request.SeasonCode) || ps.Season.Code.ToLower() == request.SeasonCode.ToLower()) &&
                (string.IsNullOrWhiteSpace(request.Position) || ps.Pos1.ToLower() == request.Position.ToLower()) &&
                (!request.MinOvr.HasValue || ps.Ovr >= request.MinOvr.Value) &&
                (!request.MaxOvr.HasValue || ps.Ovr <= request.MaxOvr.Value)
            ));
        }

        // Apply sorting
        query = request.SortBy?.ToLower() switch
        {
            "name" => request.SortDirection?.ToLower() == "desc" ? query.OrderByDescending(p => p.Name) : query.OrderBy(p => p.Name),
            "updatedat" => request.SortDirection?.ToLower() == "desc" ? query.OrderByDescending(p => p.UpdatedAt) : query.OrderBy(p => p.UpdatedAt),
            "ovr" => request.SortDirection?.ToLower() == "asc" ? query.OrderBy(p => p.PlayerSeasons.Max(ps => ps.Ovr)) : query.OrderByDescending(p => p.PlayerSeasons.Max(ps => ps.Ovr)),
            _ => query.OrderByDescending(p => p.PlayerSeasons.Max(ps => ps.Ovr)) // Default
        };

        var totalItems = await query.CountAsync(cancellationToken);
        
        var pageSize = Math.Clamp(request.PageSize, 1, 100);
        var page = Math.Max(request.Page, 1);
        var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new PlayerListItemDto
            {
                Id = p.Id,
                SourceId = p.SourceId,
                Name = p.Name,
                NameShort = p.NameShort,
                ImageUrl = $"https://s1.fifaaddict.com/fo4/players/{p.SourceId}.png",
                DefaultSeason = p.PlayerSeasons
                    .Where(ps => 
                        (!request.SeasonId.HasValue || ps.SeasonId == request.SeasonId.Value) &&
                        (string.IsNullOrWhiteSpace(request.SeasonCode) || ps.Season.Code.ToLower() == request.SeasonCode.ToLower()) &&
                        (string.IsNullOrWhiteSpace(request.Position) || ps.Pos1.ToLower() == request.Position.ToLower()) &&
                        (!request.MinOvr.HasValue || ps.Ovr >= request.MinOvr.Value) &&
                        (!request.MaxOvr.HasValue || ps.Ovr <= request.MaxOvr.Value)
                    )
                    .OrderByDescending(ps => ps.Ovr)
                    .Select(ps => new PlayerSeasonSummaryDto
                    {
                        Ovr = ps.Ovr,
                        SeasonCode = ps.Season.Code,
                        Pos1 = ps.Pos1,
                        TeamName = ps.TeamName,
                        NationName = ps.NationName,
                        PriceKr = ps.PriceKr
                    })
                    .FirstOrDefault()
            })
            .ToListAsync(cancellationToken);

        return new PaginatedResponse<PlayerListItemDto>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalItems = totalItems,
            TotalPages = totalPages
        };
    }

    public async Task<PlayerDetailDto?> GetPlayerByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        // NOTE: This query uses a correlated sub-collection projection which EF Core 9+ translates to
        // LATERAL JOIN on PostgreSQL. This is the production-optimized path — only required DTO columns
        // are selected server-side. SQLite does not support LATERAL JOIN (throws APPLY error), but
        // SQLite is not the production database for this application.
        return await _dbContext.Players
            .AsNoTracking()
            .Where(p => p.Id == id)
            .Select(p => new PlayerDetailDto
            {
                Id = p.Id,
                SourceId = p.SourceId,
                Name = p.Name,
                NameShort = p.NameShort,
                ImageUrl = $"https://s1.fifaaddict.com/fo4/players/{p.SourceId}.png",
                Seasons = p.PlayerSeasons
                    .OrderByDescending(ps => ps.Ovr)
                    .Select(ps => new PlayerSeasonListItemDto
                    {
                        Id = ps.Id,
                        SourceId = ps.SourceId,
                        ImageUrl = $"https://s1.fifaaddict.com/fo4/players/{ps.SourceId}.png",
                        PlayerId = p.Id,
                        PlayerName = p.Name,
                        SeasonId = ps.Season.Id,
                        SeasonCode = ps.Season.Code,
                        SeasonName = ps.Season.Name,
                        Ovr = ps.Ovr,
                        Pos1 = ps.Pos1,
                        TeamName = ps.TeamName,
                        NationName = ps.NationName,
                        LeagueName = ps.LeagueName,
                        PriceKr = ps.PriceKr
                    }).ToList()
            })
            .FirstOrDefaultAsync(cancellationToken);
    }


    public async Task<PaginatedResponse<PlayerSeasonListItemDto>> GetPlayerSeasonsAsync(GetPlayersRequest request, CancellationToken cancellationToken = default)
    {
        return await BuildPlayerSeasonQueryAsync(null, request, cancellationToken);
    }

    public async Task<PaginatedResponse<PlayerSeasonListItemDto>> GetPlayerSeasonsByPlayerIdAsync(int playerId, GetPlayersRequest request, CancellationToken cancellationToken = default)
    {
        return await BuildPlayerSeasonQueryAsync(playerId, request, cancellationToken);
    }

    public async Task<PlayerSeasonDetailDto?> GetPlayerSeasonByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _dbContext.PlayerSeasons
            .AsNoTracking()
            .Where(ps => ps.Id == id)
            .Select(ps => new PlayerSeasonDetailDto
            {
                Id = ps.Id,
                SourceId = ps.SourceId,
                ImageUrl = $"https://s1.fifaaddict.com/fo4/players/{ps.SourceId}.png",
                PlayerId = ps.PlayerId,
                PlayerName = ps.Player.Name,
                PlayerNameShort = ps.Player.NameShort,
                SeasonId = ps.SeasonId,
                SeasonCode = ps.Season.Code,
                SeasonName = ps.Season.Name,
                Ovr = ps.Ovr,
                Pos1 = ps.Pos1,
                Pos2 = ps.Pos2,
                FootPref = ps.FootPref,
                FootPrefString = ps.FootPrefString,
                FootWeak = ps.FootWeak,
                SkillLevel = ps.SkillLevel,
                Height = ps.Height,
                Weight = ps.Weight,
                Age = ps.Age,
                TeamId = ps.TeamId,
                TeamName = ps.TeamName,
                NationId = ps.NationId,
                NationName = ps.NationName,
                LeagueId = ps.LeagueId,
                LeagueName = ps.LeagueName,
                Pac = ps.Pac,
                Sho = ps.Sho,
                Pas = ps.Pas,
                Dri = ps.Dri,
                Def = ps.Def,
                Phy = ps.Phy,
                PriceKr = ps.PriceKr,
                Traits = ps.Traits,
                BodyType = ps.BodyType,
                WorkRateAtt = ps.WorkRateAtt,
                WorkRateDef = ps.WorkRateDef,
                LastUpdatedAt = ps.LastUpdatedAt
            })
            .FirstOrDefaultAsync(cancellationToken);
    }

    private async Task<PaginatedResponse<PlayerSeasonListItemDto>> BuildPlayerSeasonQueryAsync(int? playerId, GetPlayersRequest request, CancellationToken cancellationToken)
    {
        var query = _dbContext.PlayerSeasons.AsNoTracking().AsQueryable();

        if (playerId.HasValue)
        {
            query = query.Where(ps => ps.PlayerId == playerId.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = $"%{request.Search}%";
            if (_dbContext.Database.IsNpgsql())
                query = query.Where(ps => EF.Functions.ILike(ps.Player.Name, search) || EF.Functions.ILike(ps.Player.NameShort, search));
            else
                query = query.Where(ps => EF.Functions.Like(ps.Player.Name, search) || EF.Functions.Like(ps.Player.NameShort, search));
        }

        if (request.SeasonId.HasValue)
            query = query.Where(ps => ps.SeasonId == request.SeasonId.Value);

        if (!string.IsNullOrWhiteSpace(request.SeasonCode))
            query = query.Where(ps => ps.Season.Code.ToLower() == request.SeasonCode.ToLower() || ps.Season.SeasonId.ToLower() == request.SeasonCode.ToLower());

        if (!string.IsNullOrWhiteSpace(request.Position))
            query = query.Where(ps => ps.Pos1.ToLower() == request.Position.ToLower());

        if (request.TeamId.HasValue)
            query = query.Where(ps => ps.TeamId == request.TeamId.Value);

        if (request.NationId.HasValue)
            query = query.Where(ps => ps.NationId == request.NationId.Value);

        if (request.LeagueId.HasValue)
            query = query.Where(ps => ps.LeagueId == request.LeagueId.Value);

        if (request.MinOvr.HasValue)
            query = query.Where(ps => ps.Ovr >= request.MinOvr.Value);

        if (request.MaxOvr.HasValue)
            query = query.Where(ps => ps.Ovr <= request.MaxOvr.Value);

        // Sorting
        query = request.SortBy?.ToLower() switch
        {
            "ovr" => request.SortDirection?.ToLower() == "asc" ? query.OrderBy(ps => ps.Ovr) : query.OrderByDescending(ps => ps.Ovr),
            "name" => request.SortDirection?.ToLower() == "desc" ? query.OrderByDescending(ps => ps.Player.Name) : query.OrderBy(ps => ps.Player.Name),
            "price" => request.SortDirection?.ToLower() == "asc" ? query.OrderBy(ps => ps.PriceKr) : query.OrderByDescending(ps => ps.PriceKr),
            "height" => request.SortDirection?.ToLower() == "asc" ? query.OrderBy(ps => ps.Height) : query.OrderByDescending(ps => ps.Height),
            "age" => request.SortDirection?.ToLower() == "asc" ? query.OrderBy(ps => ps.Age) : query.OrderByDescending(ps => ps.Age),
            "updatedat" => request.SortDirection?.ToLower() == "asc" ? query.OrderBy(ps => ps.LastUpdatedAt) : query.OrderByDescending(ps => ps.LastUpdatedAt),
            _ => query.OrderByDescending(ps => ps.Ovr) // Default sort by highest OVR
        };

        var totalItems = await query.CountAsync(cancellationToken);
        
        var pageSize = Math.Clamp(request.PageSize, 1, 100);
        var page = Math.Max(request.Page, 1);
        var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(ps => new PlayerSeasonListItemDto
            {
                Id = ps.Id,
                SourceId = ps.SourceId,
                ImageUrl = $"https://s1.fifaaddict.com/fo4/players/{ps.SourceId}.png",
                PlayerId = ps.PlayerId,
                PlayerName = ps.Player.Name,
                SeasonId = ps.SeasonId,
                SeasonCode = ps.Season.Code,
                SeasonName = ps.Season.Name,
                Ovr = ps.Ovr,
                Pos1 = ps.Pos1,
                TeamName = ps.TeamName,
                NationName = ps.NationName,
                LeagueName = ps.LeagueName,
                PriceKr = ps.PriceKr
            })
            .ToListAsync(cancellationToken);

        return new PaginatedResponse<PlayerSeasonListItemDto>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalItems = totalItems,
            TotalPages = totalPages
        };
    }
}
