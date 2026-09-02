namespace FCUpgrade.Contracts.DTOs.Bait;

/// <summary>
/// Một lần đập thẻ mồi.
/// </summary>
public class BaitEntry
{
    /// <summary>Mức thẻ bắt đầu (ví dụ: 5 = +5)</summary>
    public int FromLevel { get; set; }

    /// <summary>Mức thẻ đích muốn lên (ví dụ: 6 = +6)</summary>
    public int ToLevel => FromLevel + 1;

    /// <summary>
    /// Kết quả thực tế sau khi đập:
    /// - Nếu lên thành công: DroppedToLevel = ToLevel
    /// - Nếu rớt: DroppedToLevel < FromLevel
    /// </summary>
    public int DroppedToLevel { get; set; }

    /// <summary>Kết quả thành công không (DroppedToLevel >= ToLevel)</summary>
    public bool IsSuccess => DroppedToLevel >= ToLevel;

    /// <summary>Số mức bị rớt (0 nếu thành công)</summary>
    public int LevelsDropped => IsSuccess ? 0 : FromLevel - DroppedToLevel;
}

public class BaitAnalysisRequest
{
    /// <summary>Mức thẻ CHÍNH muốn đập: FromLevel (sẽ cố lên FromLevel + 1)</summary>
    public int TargetFromLevel { get; set; } = 5;

    /// <summary>Số vạch phôi đập kèo chính</summary>
    public double TargetBars { get; set; } = 5.0;

    /// <summary>Danh sách các lần đập thẻ mồi</summary>
    public List<BaitEntry> BaitHistory { get; set; } = new();
}
