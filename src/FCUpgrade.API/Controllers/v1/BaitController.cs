using FCUpgrade.Contracts.DTOs.Bait;
using FCUpgrade.Application.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Threading;
using System.Threading.Tasks;

namespace FCUpgrade.API.Controllers.v1;

[ApiController]
[Route("api/v1/[controller]")]
public class BaitController : ControllerBase
{
    private readonly IBaitAnalysisService _baitAnalysisService;

    public BaitController(IBaitAnalysisService baitAnalysisService)
    {
        _baitAnalysisService = baitAnalysisService;
    }

    /// <summary>Phân tích chuỗi mồi và trả về xác suất thành công.</summary>
    [HttpPost("analyze")]
    [ProducesResponseType(typeof(BaitAnalysisResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> Analyze([FromBody] BaitAnalysisRequest request, CancellationToken cancellationToken)
    {
        var result = await _baitAnalysisService.AnalyzeSequenceAsync(request, cancellationToken);
        return Ok(result);
    }

    /// <summary>Lưu kết quả thực tế của kèo chính để làm training data AI.</summary>
    [HttpPost("feedback")]
    [ProducesResponseType(typeof(BaitFeedbackResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Feedback([FromBody] BaitFeedbackRequest request, CancellationToken cancellationToken)
    {
        if (request.BaitHistory == null || request.BaitHistory.Count == 0)
            return BadRequest(new { error = new { message = "Cần có ít nhất 1 lần mồi trong chuỗi." } });

        var result = await _baitAnalysisService.SaveFeedbackAsync(request, cancellationToken);
        return Ok(result);
    }
}
