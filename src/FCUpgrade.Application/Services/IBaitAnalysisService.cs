using FCUpgrade.Contracts.DTOs.Bait;
using System.Threading;
using System.Threading.Tasks;

namespace FCUpgrade.Application.Services;

public interface IBaitAnalysisService
{
    Task<BaitAnalysisResponse> AnalyzeSequenceAsync(BaitAnalysisRequest request, CancellationToken cancellationToken = default);

    /// <summary>
    /// Lưu kết quả thực tế của kèo chính vào DB để làm training data.
    /// </summary>
    Task<BaitFeedbackResponse> SaveFeedbackAsync(BaitFeedbackRequest request, CancellationToken cancellationToken = default);
}
