using System.Collections.Generic;

namespace FCUpgrade.Contracts.DTOs;

public class PlayerDetailDto
{
    public int Id { get; set; }
    public string SourceId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string NameShort { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;

    public IEnumerable<PlayerSeasonListItemDto> Seasons { get; set; } = new List<PlayerSeasonListItemDto>();
}
