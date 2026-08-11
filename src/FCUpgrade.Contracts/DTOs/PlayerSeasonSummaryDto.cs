namespace FCUpgrade.Contracts.DTOs;

public class PlayerSeasonSummaryDto
{
    public int Ovr { get; set; }
    public string SeasonCode { get; set; } = string.Empty;
    public string Pos1 { get; set; } = string.Empty;
    public string TeamName { get; set; } = string.Empty;
    public string NationName { get; set; } = string.Empty;
    public long PriceKr { get; set; }
}
