namespace FCUpgrade.Contracts.DTOs.Bait;

/// <summary>
/// Gửi lên sau khi user đã đập kèo chính và biết kết quả.
/// Dùng để lưu training data cho AI.
/// </summary>
public class BaitFeedbackRequest
{
    /// <summary>Mức thẻ chính đã đập (fromLevel)</summary>
    public int TargetFromLevel { get; set; }

    /// <summary>Số vạch phôi</summary>
    public double TargetBars { get; set; } = 5.0;

    /// <summary>Chuỗi mồi đã nhập trước khi phân tích</summary>
    public List<BaitEntry> BaitHistory { get; set; } = new();

    /// <summary>Xác suất mà hệ thống đã dự đoán</summary>
    public double PredictedProbability { get; set; }

    /// <summary>Mức rủi ro hệ thống đánh giá</summary>
    public string PredictedRiskLevel { get; set; } = string.Empty;

    /// <summary>Kèo chính lên hay không? (null = mồi nổ hỏng dây)</summary>
    public bool? ActualSuccess { get; set; }

    /// <summary>Nếu thất bại: rớt về mức nào (nullable nếu thành công)</summary>
    public int? ActualDroppedToLevel { get; set; }

    /// <summary>Ghi chú của user (tùy chọn)</summary>
    public string? Notes { get; set; }
}

public class BaitFeedbackResponse
{
    public int SessionId { get; set; }
    public string Message { get; set; } = string.Empty;
}
