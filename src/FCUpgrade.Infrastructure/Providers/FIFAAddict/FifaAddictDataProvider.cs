using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FCUpgrade.Domain.Entities;
using FCUpgrade.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace FCUpgrade.Infrastructure.Providers.FIFAAddict;

public class FifaAddictDataProvider
{
    private readonly FifaAddictClient _client;
    private readonly FifaAddictParser _parser;
    private readonly ApplicationDbContext _dbContext;
    private readonly ILogger<FifaAddictDataProvider> _logger;

    public FifaAddictDataProvider(
        FifaAddictClient client, 
        FifaAddictParser parser, 
        ApplicationDbContext dbContext,
        ILogger<FifaAddictDataProvider> logger)
    {
        _client = client;
        _parser = parser;
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<int> DiscoverAndSyncPlayersAsync(int page = 1, string? seasonCode = null, bool isDryRun = false, CancellationToken cancellationToken = default)
    {
        var url = $"fo4db?page={page}";
        if (!string.IsNullOrEmpty(seasonCode))
        {
            url += $"&season={seasonCode.ToLower()}";
        }

        var html = await _client.GetPageHtmlAsync(url, cancellationToken);
        var dtos = _parser.ParsePlayerList(html);

        if (!dtos.Any())
        {
            _logger.LogInformation("No players found on page {page}.", page);
            return 0; // Empty page, end of pagination
        }

        foreach (var dto in dtos)
        {
            if (cancellationToken.IsCancellationRequested) break;
            await ProcessPlayerAsync(dto, isDryRun, cancellationToken);
        }

        return dtos.Count;
    }

    private async Task ProcessPlayerAsync(FifaAddictPlayerDto listDto, bool isDryRun, CancellationToken cancellationToken)
    {
        // Discover Season
        var season = await GetOrCreateSeasonAsync(listDto, isDryRun, cancellationToken);

        // We fetch the detail page to get detailed attributes if we don't have it, or to update.
        // For efficiency, we can do it unconditionally in a full sync, or check hash first if list info changes.
        // The instructions say: "For each player where detailed information is publicly available, retrieve the player detail page."
        
        string detailUrl = $"fo4db/pid{listDto.Uid}";
        var detailHtml = await _client.GetPageHtmlAsync(detailUrl, cancellationToken);
        var detailDto = _parser.ParsePlayerDetail(detailHtml) ?? listDto; // Fallback to listDto if detail parsing fails

        var sourceId = detailDto.Uid;
        var basePlayerId = sourceId; // Assuming uid is unique per season. If it's a version string, we might need a better base.
        
        // Actually, FIFAaddict Uid (e.g. 'awoqywkd') is unique per PlayerSeason. 
        // We will store the base player name as the Player.
        
        var player = await _dbContext.Players.FirstOrDefaultAsync(p => p.SourceId == basePlayerId, cancellationToken);
        if (player == null)
        {
            player = new Player
            {
                SourceId = basePlayerId,
                Name = detailDto.Name,
                NameShort = detailDto.NameShort,
                SourceUrl = detailUrl,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            if (!isDryRun)
            {
                _dbContext.Players.Add(player);
                await _dbContext.SaveChangesAsync(cancellationToken);
            }
        }

        var playerSeason = await _dbContext.PlayerSeasons
            .FirstOrDefaultAsync(ps => ps.SourceId == sourceId, cancellationToken);

        var isNew = playerSeason == null;
        if (isNew)
        {
            playerSeason = new PlayerSeason
            {
                PlayerId = player.Id,
                SeasonId = season.Id,
                SourceId = sourceId,
                SourceUrl = detailUrl
            };
        }

        MapDtoToPlayerSeason(detailDto, playerSeason!);
        
        var newHash = FifaAddictDataHash.GenerateHash(playerSeason!);
        if (!isNew && playerSeason!.DataHash == newHash)
        {
            // Unchanged
            return;
        }

        playerSeason!.DataHash = newHash;
        playerSeason.LastUpdatedAt = DateTime.UtcNow;

        if (isNew && !isDryRun)
        {
            _dbContext.PlayerSeasons.Add(playerSeason);
        }
        else if (!isDryRun)
        {
            _dbContext.PlayerSeasons.Update(playerSeason);
        }

        if (!isDryRun)
        {
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    private async Task<Season> GetOrCreateSeasonAsync(FifaAddictPlayerDto dto, bool isDryRun, CancellationToken cancellationToken)
    {
        var seasonId = dto.SeasonName.ToLower();
        var season = await _dbContext.Seasons.FirstOrDefaultAsync(s => s.SeasonId == seasonId, cancellationToken);
        if (season == null)
        {
            season = new Season
            {
                SeasonId = seasonId,
                Code = dto.Year, // or a derived code
                Name = dto.SeasonFull,
                FirstSeenAt = DateTime.UtcNow,
                LastSeenAt = DateTime.UtcNow
            };
            
            if (!isDryRun)
            {
                _dbContext.Seasons.Add(season);
                await _dbContext.SaveChangesAsync(cancellationToken);
            }
            _logger.LogInformation("Discovered new season: {name} ({id})", dto.SeasonFull, seasonId);
        }
        else
        {
            season.LastSeenAt = DateTime.UtcNow;
            if (!isDryRun)
            {
                await _dbContext.SaveChangesAsync(cancellationToken);
            }
        }

        return season;
    }

    private void MapDtoToPlayerSeason(FifaAddictPlayerDto dto, PlayerSeason entity)
    {
        entity.Ovr = int.TryParse(dto.CurrentOvr, out var ovr) ? ovr : 0;
        entity.Pos1 = dto.Pos1;
        entity.Pos2 = dto.Pos2;
        entity.FootPrefString = dto.FootPref;
        entity.FootPref = dto.FootPref.ToLower() == "left" ? 0 : 1;
        entity.FootWeak = dto.FootWeak;
        entity.SkillLevel = dto.SkillLevel;
        entity.Height = int.TryParse(dto.Height, out var h) ? h : 0;
        entity.Weight = int.TryParse(dto.Weight, out var w) ? w : 0;
        entity.Age = int.TryParse(dto.Age, out var age) ? age : 0;
        
        entity.TeamId = int.TryParse(dto.TeamId, out var tid) ? tid : 0;
        entity.TeamName = dto.TeamName;
        entity.NationId = int.TryParse(dto.NationId, out var nid) ? nid : 0;
        entity.NationName = dto.NationName;
        entity.LeagueId = int.TryParse(dto.LeagueId, out var lid) ? lid : 0;
        entity.LeagueName = dto.LeagueName;
        
        entity.PriceKr = long.TryParse(dto.PriceKr, out var p) ? p : 0;
        entity.Traits = dto.Traits;
        entity.BodyType = dto.BodyTypeName;
        entity.WorkRateAtt = dto.WorkRateAtt;
        entity.WorkRateDef = dto.WorkRateDef;

        if (dto.AttrGroup != null && dto.AttrGroup.Data.Length >= 6)
        {
            entity.Pac = dto.AttrGroup.Data[0];
            entity.Sho = dto.AttrGroup.Data[1];
            entity.Pas = dto.AttrGroup.Data[2];
            entity.Dri = dto.AttrGroup.Data[3];
            entity.Def = dto.AttrGroup.Data[4];
            entity.Phy = dto.AttrGroup.Data[5];
        }
    }
}
