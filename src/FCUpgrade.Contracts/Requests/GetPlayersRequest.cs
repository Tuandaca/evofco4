namespace FCUpgrade.Contracts.Requests;

public class GetPlayersRequest
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 24;
    public string? Search { get; set; }
    
    // Filters
    public int? SeasonId { get; set; }
    public string? SeasonCode { get; set; }
    public string? Position { get; set; }
    public int? TeamId { get; set; }
    public int? NationId { get; set; }
    public int? LeagueId { get; set; }
    public int? MinOvr { get; set; }
    public int? MaxOvr { get; set; }
    
    // Sorting
    public string? SortBy { get; set; } // ovr, name, price, height, age, updatedAt
    public string? SortDirection { get; set; } // asc, desc
}
