namespace FCUpgrade.Contracts.DTOs.Bait;

public enum BaitRiskLevel
{
    TooEarly,   // Chưa đủ mồi
    Low,        // Xác suất thấp, chưa nên đập
    Medium,     // Trung bình, cân nhắc
    High,       // Cao, thích hợp đập
    VeryHigh    // Rất cao, nên đập ngay
}

public class BaitAnalysisResponse
{
    /// <summary>Xác suất thành công ước tính (0.0 → 1.0)</summary>
    public double ProbabilityScore { get; set; }

    /// <summary>Phân loại mức rủi ro</summary>
    public BaitRiskLevel RiskLevel { get; set; }

    /// <summary>Lời khuyên ngắn gọn</summary>
    public string Recommendation { get; set; } = string.Empty;

    /// <summary>Lý do chi tiết</summary>
    public string Reasoning { get; set; } = string.Empty;

    /// <summary>Mẹo nhịp đập thẻ</summary>
    public string? RhythmTip { get; set; }

    /// <summary>Tổng số lần mồi trong chuỗi</summary>
    public int TotalBaitCount { get; set; }

    /// <summary>Tổng số lần mồi thành công</summary>
    public int SuccessCount { get; set; }

    /// <summary>Tổng số lần mồi xịt</summary>
    public int FailCount { get; set; }

    /// <summary>Số lần xịt liên tiếp ở cuối chuỗi</summary>
    public int ConsecutiveFails { get; set; }

    /// <summary>Tổng số mức đã bị rớt trong toàn bộ chuỗi</summary>
    public int TotalLevelsDropped { get; set; }
}
