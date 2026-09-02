using System;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using FCUpgrade.Contracts.DTOs.Bait;
using FCUpgrade.Application.Services;
using FCUpgrade.Domain.Entities;
using FCUpgrade.Infrastructure.Persistence;
using Microsoft.Extensions.Logging;

namespace FCUpgrade.Infrastructure.Services;

public class BaitAnalysisService : IBaitAnalysisService
{
    private readonly ILogger<BaitAnalysisService> _logger;
    private readonly ApplicationDbContext _db;

    // Tỉ lệ thành công chính thức của FCO4 (full vạch, từ fromLevel → fromLevel+1)
    private static readonly double[] BaseRates = new[]
    {
        0.00, // 0  (không dùng)
        1.00, // 1  → 2  : 100%
        0.81, // 2  → 3  : 81%
        0.64, // 3  → 4  : 64%
        0.50, // 4  → 5  : 50%
        0.26, // 5  → 6  : 26%
        0.15, // 6  → 7  : 15%
        0.07, // 7  → 8  : 7%
        0.05, // 8  → 9  : 5%
        0.04, // 9  → 10 : 4%
        0.03, // 10 → 11 : 3%
        0.02, // 11 → 12 : 2%
        0.01, // 12 → 13 : 1%
    };

    public BaitAnalysisService(ILogger<BaitAnalysisService> logger, ApplicationDbContext db)
    {
        _logger = logger;
        _db = db;
    }

    public async Task<BaitAnalysisResponse> AnalyzeSequenceAsync(BaitAnalysisRequest request, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Analyzing bait sequence for target level +{From}→+{To}, entries: {Count}",
            request.TargetFromLevel, request.TargetFromLevel + 1, request.BaitHistory.Count);

        var history = request.BaitHistory;
        var targetFrom = Math.Clamp(request.TargetFromLevel, 1, 12);

        // --- Thống kê cơ bản ---
        int totalCount = history.Count;
        int successCount = history.Count(e => e.IsSuccess);
        int failCount = totalCount - successCount;
        int totalLevelsDropped = history.Sum(e => e.LevelsDropped);

        // --- Số lần xịt liên tiếp ở cuối chuỗi ---
        int consecutiveFails = 0;
        for (int i = history.Count - 1; i >= 0; i--)
        {
            if (!history[i].IsSuccess) consecutiveFails++;
            else break;
        }

        // --- Tính xác suất Heuristic nền tảng ---
        double baseRate = targetFrom < BaseRates.Length ? BaseRates[targetFrom] : 0.10;
        
        // Điều chỉnh theo số vạch phôi (TargetBars)
        baseRate = baseRate * (Math.Clamp(request.TargetBars, 1.0, 5.0) / 5.0);

        // Bonus từ chuỗi xịt liên tiếp (mỗi lần xịt +12% của phần còn lại)
        double probability = baseRate;
        for (int i = 0; i < consecutiveFails; i++)
        {
            probability += (1.0 - probability) * 0.12;
        }

        // Bonus từ tổng số mức bị rớt (càng rớt nhiều, càng gần lên)
        double dropBonus = Math.Min(0.15, totalLevelsDropped * 0.01);
        probability = Math.Min(0.95, probability + dropBonus);

        // Penalty nếu vừa lên thành công (reset nhịp)
        if (history.Count > 0 && history[^1].IsSuccess)
        {
            probability *= 0.6;
        }

        probability = Math.Round(probability, 4);

        // --- Data-driven Blending (Tự học từ dữ liệu thực tế) ---
        // Lấy lịch sử đập thẻ có cùng điều kiện từ DB
        var historicalRecords = _db.BaitSessions
            .Where(x => x.TargetFromLevel == targetFrom 
                     && x.ConsecutiveFails == consecutiveFails 
                     && x.ActualSuccess != null 
                     && x.TargetBars >= request.TargetBars - 0.1 
                     && x.TargetBars <= request.TargetBars + 0.1)
            .ToList();

        if (historicalRecords.Count >= 10)
        {
            double historicalRate = (double)historicalRecords.Count(x => x.ActualSuccess == true) / historicalRecords.Count;
            // Trộn tỉ lệ: 40% heuristic (thuật toán gốc) + 60% dữ liệu thực tế đã học
            probability = (probability * 0.4) + (historicalRate * 0.6);
            _logger.LogInformation("Blended probability with historical data. Samples: {Count}, Historical Rate: {Rate}, Final: {Final}", historicalRecords.Count, historicalRate, probability);
        }

        probability = Math.Clamp(Math.Round(probability, 4), 0.0, 1.0);

        // --- Xác định mức rủi ro và lời khuyên ---
        BaitRiskLevel riskLevel;
        string recommendation;
        string reasoning;

        if (totalCount == 0)
        {
            riskLevel = BaitRiskLevel.TooEarly;
            recommendation = "Chưa có dữ liệu mồi";
            reasoning = $"Hãy đập thẻ mồi ở mức tương tự (+{targetFrom}→+{targetFrom + 1}) và nhập kết quả để hệ thống phân tích nhịp.";
        }
        else if (probability >= 0.90)
        {
            riskLevel = BaitRiskLevel.VeryHigh;
            recommendation = "✅ Xác suất cực cao (≥90%) — Đập kèo chính ngay!";
            reasoning = $"Sau {consecutiveFails} lần xịt liên tiếp và tổng {totalLevelsDropped} mức bị rớt, nhịp thẻ đang rất có lợi. Khả năng thành công đang ở mức đỉnh.";
        }
        else if (probability >= 0.70)
        {
            riskLevel = BaitRiskLevel.High;
            recommendation = "⚡ Xác suất khá tốt — Có thể cân nhắc đập";
            reasoning = $"Chuỗi mồi đang cho thấy nhịp tích cực ({consecutiveFails} lần xịt gần nhất). Tuy nhiên chưa đạt trên 90%, cân nhắc kỹ trước khi đập.";
        }
        else if (probability >= 0.50)
        {
            riskLevel = BaitRiskLevel.Medium;
            recommendation = "⚠️ Xác suất trung bình — Nên đập thêm mồi";
            reasoning = $"Nhịp thẻ chưa đủ an toàn. Khuyên bạn nên tiếp tục đập thêm {Math.Max(1, 3 - consecutiveFails)} lần mồi xịt nữa trước khi vào thẻ chính.";
        }
        else if (totalCount > 0 && history[^1].IsSuccess)
        {
            riskLevel = BaitRiskLevel.Low;
            recommendation = "🔴 Vừa lên — Không nên đập ngay";
            reasoning = "Thẻ mồi vừa lên thành công. Sau khi lên, nhịp thường reset về mức thấp. Khuyên tiếp tục đập thêm mồi để tích lũy nhịp mới.";
        }
        else
        {
            riskLevel = BaitRiskLevel.Low;
            recommendation = "🔴 Xác suất thấp — Chưa nên đập";
            reasoning = $"Chuỗi mồi chưa đủ để nhịp tích lũy (chỉ {consecutiveFails} lần xịt liên tiếp). Hãy đập thêm mồi ở mức +{targetFrom} hoặc cận mức.";
        }

        string rhythmTip = GenerateRhythmTip(targetFrom, consecutiveFails, request.TargetBars);

        var response = new BaitAnalysisResponse
        {
            ProbabilityScore = probability,
            RiskLevel = riskLevel,
            Recommendation = recommendation,
            Reasoning = reasoning,
            RhythmTip = rhythmTip,
            TotalBaitCount = totalCount,
            SuccessCount = successCount,
            FailCount = failCount,
            ConsecutiveFails = consecutiveFails,
            TotalLevelsDropped = totalLevelsDropped,
        };

        return response;
    }

    public async Task<BaitFeedbackResponse> SaveFeedbackAsync(BaitFeedbackRequest request, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Saving bait feedback: target +{From}→+{To}, actual success={Success}",
            request.TargetFromLevel, request.TargetFromLevel + 1, request.ActualSuccess);

        var historyJson = JsonSerializer.Serialize(request.BaitHistory,
            new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

        var session = new BaitSession
        {
            TargetFromLevel    = request.TargetFromLevel,
            BaitHistoryJson    = historyJson,
            TotalBaitCount     = request.BaitHistory.Count,
            SuccessCount       = request.BaitHistory.Count(e => e.IsSuccess),
            FailCount          = request.BaitHistory.Count(e => !e.IsSuccess),
            ConsecutiveFails   = CountConsecutiveFails(request.BaitHistory),
            TotalLevelsDropped = request.BaitHistory.Sum(e => e.LevelsDropped),
            PredictedProbability = request.PredictedProbability,
            PredictedRiskLevel   = request.PredictedRiskLevel,
            ActualSuccess        = request.ActualSuccess,
            ActualDroppedToLevel = request.ActualDroppedToLevel,
            TargetBars           = request.TargetBars,
            Notes                = request.Notes,
            CreatedAt            = DateTime.UtcNow,
            FeedbackAt           = DateTime.UtcNow,
        };

        _db.BaitSessions.Add(session);
        await _db.SaveChangesAsync(cancellationToken);

        var message = request.ActualSuccess switch
        {
            true => $"✅ Ghi nhận thẻ chính lên +{request.TargetFromLevel + 1} thành công! Cảm ơn bạn đã đóng góp data.",
            false => $"📝 Ghi nhận thẻ chính rớt về +{request.ActualDroppedToLevel}. Dữ liệu đã được lưu để cải thiện AI.",
            null => "⚠️ Ghi nhận mồi nổ (hỏng dây mồi). Dữ liệu đã được lưu để AI phân tích quy luật."
        };

        return new BaitFeedbackResponse { SessionId = session.Id, Message = message };
    }

    private static int CountConsecutiveFails(List<BaitEntry> history)
    {
        int count = 0;
        for (int i = history.Count - 1; i >= 0; i--)
        {
            if (!history[i].IsSuccess) count++;
            else break;
        }
        return count;
    }

    private static string GenerateRhythmTip(int targetFromLevel, int consecutiveFails, double targetBars)
    {
        // Gợi ý nhịp ngẫu nhiên / heuristic đơn giản cho vui
        if (targetBars < 5.0)
            return "Nhịp 3-2 (3 bỏ 2 đập)";
            
        if (targetFromLevel >= 5)
        {
            if (consecutiveFails >= 3)
                return "Nhịp 3-3 (3 bỏ 3 đập)";
            else
                return "Nhịp 2-1-1 (2 bỏ 1 đập 1 bỏ rồi đập)";
        }
        else
        {
            return "Nhịp 3-1 (3 bỏ 1 đập)";
        }
    }
}
