using System;

namespace FCUpgrade.Domain.Entities;

/// <summary>
/// Lưu trữ một phiên phân tích dây mồi hoàn chỉnh — bao gồm cả kết quả thực tế của kèo chính.
/// Đây là training data để huấn luyện AI về sau.
/// </summary>
public class BaitSession
{
    public int Id { get; set; }

    /// <summary>Mức thẻ chính muốn đập (fromLevel → fromLevel+1)</summary>
    public int TargetFromLevel { get; set; }

    /// <summary>Số vạch phôi của kèo chính (từ 1.0 đến 5.0)</summary>
    public double TargetBars { get; set; } = 5.0;

    /// <summary>Chuỗi lịch sử mồi dạng JSON (BaitEntry[])</summary>
    public string BaitHistoryJson { get; set; } = "[]";

    /// <summary>Tổng số lần mồi</summary>
    public int TotalBaitCount { get; set; }

    /// <summary>Số lần mồi thành công</summary>
    public int SuccessCount { get; set; }

    /// <summary>Số lần mồi xịt</summary>
    public int FailCount { get; set; }

    /// <summary>Số lần xịt liên tiếp cuối chuỗi</summary>
    public int ConsecutiveFails { get; set; }

    /// <summary>Tổng số mức đã rớt</summary>
    public int TotalLevelsDropped { get; set; }

    /// <summary>Xác suất hệ thống dự đoán (0.0 → 1.0)</summary>
    public double PredictedProbability { get; set; }

    /// <summary>Mức rủi ro hệ thống đánh giá</summary>
    public string PredictedRiskLevel { get; set; } = string.Empty;

    // ─── Kết quả thực tế (do user nhập sau khi đập kèo chính) ────────────────

    /// <summary>Kèo chính có thành công không?</summary>
    public bool? ActualSuccess { get; set; }

    /// <summary>Nếu thất bại: rớt về mức nào</summary>
    public int? ActualDroppedToLevel { get; set; }

    /// <summary>Ghi chú thêm của user (tùy chọn)</summary>
    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? FeedbackAt { get; set; }
}
