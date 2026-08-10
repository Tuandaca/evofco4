namespace FCUpgrade.Contracts.Requests;

public class GetSeasonsRequest
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 24;
    public string? Search { get; set; }
    
    public string? SortBy { get; set; } // name, code, active, count, updatedAt
    public string? SortDirection { get; set; } // asc, desc
}
