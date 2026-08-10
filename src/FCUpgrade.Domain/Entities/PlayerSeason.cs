using System;

namespace FCUpgrade.Domain.Entities;

public class PlayerSeason
{
    public int Id { get; set; }
    
    public int PlayerId { get; set; }
    public Player Player { get; set; } = null!;
    
    public int SeasonId { get; set; }
    public Season Season { get; set; } = null!;

    public string SourceId { get; set; } = string.Empty; // The specific uid for this player+season
    public string SourceUrl { get; set; } = string.Empty;
    public string DataHash { get; set; } = string.Empty;
    
    // Identity/General
    public int Ovr { get; set; }
    public string Pos1 { get; set; } = string.Empty;
    public string Pos2 { get; set; } = string.Empty;
    public int FootPref { get; set; } // Left = 0, Right = 1 ? Or string
    public string FootPrefString { get; set; } = string.Empty;
    public int FootWeak { get; set; }
    public int SkillLevel { get; set; }
    public int Height { get; set; }
    public int Weight { get; set; }
    public int Age { get; set; }
    
    // Team / Nation / League
    public int TeamId { get; set; }
    public string TeamName { get; set; } = string.Empty;
    public int NationId { get; set; }
    public string NationName { get; set; } = string.Empty;
    public int LeagueId { get; set; }
    public string LeagueName { get; set; } = string.Empty;
    
    // Attributes
    public int Pac { get; set; }
    public int Sho { get; set; }
    public int Pas { get; set; }
    public int Dri { get; set; }
    public int Def { get; set; }
    public int Phy { get; set; }
    
    // Price
    public long PriceKr { get; set; }
    
    // Extra
    public string Traits { get; set; } = string.Empty;
    public string BodyType { get; set; } = string.Empty;
    public string WorkRateAtt { get; set; } = string.Empty;
    public string WorkRateDef { get; set; } = string.Empty;

    public DateTime RetrievedAt { get; set; } = DateTime.UtcNow;
    public DateTime LastUpdatedAt { get; set; } = DateTime.UtcNow;
    public string Source { get; set; } = "FIFAADDICT";
}
