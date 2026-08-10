using System;

namespace FCUpgrade.Domain.Entities;

public class ImportJob
{
    public int Id { get; set; }
    public string Type { get; set; } = string.Empty; // IMPORT_ALL, SYNC, SEASON_SYNC, PLAYER_SYNC
    public string Source { get; set; } = "FIFAADDICT";
    
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
    
    public string Status { get; set; } = "RUNNING"; // RUNNING, SUCCESS, PARTIAL, FAILED
    
    public int RecordsReceived { get; set; }
    public int RecordsInserted { get; set; }
    public int RecordsUpdated { get; set; }
    public int RecordsUnchanged { get; set; }
    public int RecordsRejected { get; set; }
    public int ErrorCount { get; set; }
    
    public TimeSpan Duration { get; set; }
}
