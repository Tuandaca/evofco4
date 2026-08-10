using System;
using System.Collections.Generic;

namespace FCUpgrade.Domain.Entities;

public class Player
{
    public int Id { get; set; }
    public string SourceId { get; set; } = string.Empty; // e.g. "awoqywkd" (without season prefix, or just the base id)
    public string Name { get; set; } = string.Empty;
    public string NameShort { get; set; } = string.Empty;
    public string SourceUrl { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public ICollection<PlayerSeason> PlayerSeasons { get; set; } = new List<PlayerSeason>();
}
