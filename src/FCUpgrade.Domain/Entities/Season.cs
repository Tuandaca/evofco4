using System;
using System.Collections.Generic;

namespace FCUpgrade.Domain.Entities;

public class Season
{
    public int Id { get; set; }
    public string SeasonId { get; set; } = string.Empty; // e.g. "icontm", "24ty"
    public string Code { get; set; } = string.Empty; // e.g. "24TY"
    public string Name { get; set; } = string.Empty;
    public string SourceUrl { get; set; } = string.Empty;
    
    public DateTime FirstSeenAt { get; set; } = DateTime.UtcNow;
    public DateTime LastSeenAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;

    // Navigation property
    public ICollection<PlayerSeason> PlayerSeasons { get; set; } = new List<PlayerSeason>();
}
