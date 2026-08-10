using System;
using System.Collections.Generic;

namespace FCUpgrade.Contracts.DTOs;

public class SeasonDetailDto
{
    public int Id { get; set; }
    public string SeasonId { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime FirstSeenAt { get; set; }
    public DateTime LastSeenAt { get; set; }

    public int TotalPlayers { get; set; }
}
