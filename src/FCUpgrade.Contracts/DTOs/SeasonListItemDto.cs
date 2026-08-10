using System;

namespace FCUpgrade.Contracts.DTOs;

public class SeasonListItemDto
{
    public int Id { get; set; }
    public string SeasonId { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public int PlayerCount { get; set; }
    public DateTime LastUpdatedAt { get; set; }
}
