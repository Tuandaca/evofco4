using System;

namespace FCUpgrade.Contracts.DTOs;

public class PlayerSeasonDetailDto
{
    public int Id { get; set; }
    public string SourceId { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;

    public int PlayerId { get; set; }
    public string PlayerName { get; set; } = string.Empty;
    public string PlayerNameShort { get; set; } = string.Empty;

    public int SeasonId { get; set; }
    public string SeasonCode { get; set; } = string.Empty;
    public string SeasonName { get; set; } = string.Empty;

    public int Ovr { get; set; }
    public string Pos1 { get; set; } = string.Empty;
    public string Pos2 { get; set; } = string.Empty;

    public int FootPref { get; set; } // Left = 0, Right = 1
    public string FootPrefString { get; set; } = string.Empty;
    public int FootWeak { get; set; }
    public int SkillLevel { get; set; }
    
    public int Height { get; set; }
    public int Weight { get; set; }
    public int Age { get; set; }

    public int TeamId { get; set; }
    public string TeamName { get; set; } = string.Empty;
    public int NationId { get; set; }
    public string NationName { get; set; } = string.Empty;
    public int LeagueId { get; set; }
    public string LeagueName { get; set; } = string.Empty;

    public int Pac { get; set; }
    public int Sho { get; set; }
    public int Pas { get; set; }
    public int Dri { get; set; }
    public int Def { get; set; }
    public int Phy { get; set; }

    public long PriceKr { get; set; }

    public string Traits { get; set; } = string.Empty;
    public string BodyType { get; set; } = string.Empty;
    public string WorkRateAtt { get; set; } = string.Empty;
    public string WorkRateDef { get; set; } = string.Empty;

    public DateTime LastUpdatedAt { get; set; }
}
