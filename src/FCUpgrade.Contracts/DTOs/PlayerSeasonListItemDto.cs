namespace FCUpgrade.Contracts.DTOs;

public class PlayerSeasonListItemDto
{
    public int Id { get; set; }
    public string SourceId { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    
    // Flattened info for lists
    public int PlayerId { get; set; }
    public string PlayerName { get; set; } = string.Empty;
    
    public int SeasonId { get; set; }
    public string SeasonCode { get; set; } = string.Empty;
    public string SeasonName { get; set; } = string.Empty;

    public int Ovr { get; set; }
    public string Pos1 { get; set; } = string.Empty;
    
    public string TeamName { get; set; } = string.Empty;
    public string NationName { get; set; } = string.Empty;
    public string LeagueName { get; set; } = string.Empty;

    public long PriceKr { get; set; }
}
