/**
 * baitEngine.ts — Client-Side Bait Analysis Engine
 *
 * Port 1:1 từ BaitAnalysisService.cs (.NET) sang TypeScript.
 * Chạy hoàn toàn trong trình duyệt, không cần gọi API.
 * Tốc độ phản hồi: ~0ms (synchronous computation).
 */

import type { BaitAnalysisRequest, BaitAnalysisResponse } from "@/lib/api/bait";
import { BaitRiskLevel } from "@/lib/api/bait";

// Tỉ lệ thành công chính thức của FCO4 (full vạch, từ fromLevel → fromLevel+1)
// Index tương ứng với fromLevel (index 0 không dùng)
const BASE_RATES: number[] = [
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
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function generateRhythmTip(
  targetFromLevel: number,
  consecutiveFails: number,
  targetBars: number
): string {
  if (targetBars < 5.0) return "Nhịp 3-2 (3 bỏ 2 đập)";

  if (targetFromLevel >= 5) {
    if (consecutiveFails >= 3) return "Nhịp 3-3 (3 bỏ 3 đập)";
    return "Nhịp 2-1-1 (2 bỏ 1 đập 1 bỏ rồi đập)";
  }

  return "Nhịp 3-1 (3 bỏ 1 đập)";
}

/**
 * Phân tích chuỗi mồi và trả về kết quả xác suất ngay lập tức (synchronous).
 * Logic được port 1:1 từ BaitAnalysisService.cs trong .NET Backend.
 */
export function analyzeSequence(request: BaitAnalysisRequest): BaitAnalysisResponse {
  const history = request.baitHistory;
  const targetFrom = clamp(request.targetFromLevel, 1, 12);

  // --- Thống kê cơ bản ---
  const totalCount = history.length;
  const successCount = history.filter((e) => e.isSuccess).length;
  const failCount = totalCount - successCount;
  const totalLevelsDropped = history.reduce((sum, e) => sum + (e.levelsDropped ?? 0), 0);

  // --- Số lần xịt liên tiếp ở cuối chuỗi ---
  let consecutiveFails = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    if (!history[i].isSuccess) consecutiveFails++;
    else break;
  }

  // --- Tính xác suất Heuristic nền tảng ---
  let baseRate = targetFrom < BASE_RATES.length ? BASE_RATES[targetFrom] : 0.10;

  // Điều chỉnh theo số vạch phôi (targetBars 1.0 → 5.0)
  baseRate = baseRate * (clamp(request.targetBars, 1.0, 5.0) / 5.0);

  // Bonus từ chuỗi xịt liên tiếp (mỗi lần xịt +12% của phần còn lại)
  let probability = baseRate;
  for (let i = 0; i < consecutiveFails; i++) {
    probability += (1.0 - probability) * 0.12;
  }

  // Bonus từ tổng số mức bị rớt (càng rớt nhiều, càng gần lên)
  const dropBonus = Math.min(0.15, totalLevelsDropped * 0.01);
  probability = Math.min(0.95, probability + dropBonus);

  // Penalty nếu vừa lên thành công (reset nhịp)
  if (history.length > 0 && history[history.length - 1].isSuccess) {
    probability *= 0.6;
  }

  // Làm tròn 4 chữ số thập phân
  probability = Math.round(probability * 10000) / 10000;
  probability = clamp(probability, 0.0, 1.0);

  // --- Xác định mức rủi ro và lời khuyên ---
  let riskLevel: BaitRiskLevel;
  let recommendation: string;
  let reasoning: string;

  if (totalCount === 0) {
    riskLevel = BaitRiskLevel.TooEarly;
    recommendation = "Chưa có dữ liệu mồi";
    reasoning = `Hãy đập thẻ mồi ở mức tương tự (+${targetFrom}→+${targetFrom + 1}) và nhập kết quả để hệ thống phân tích nhịp.`;
  } else if (probability >= 0.90) {
    riskLevel = BaitRiskLevel.VeryHigh;
    recommendation = "✅ Xác suất cực cao (≥90%) — Đập kèo chính ngay!";
    reasoning = `Sau ${consecutiveFails} lần xịt liên tiếp và tổng ${totalLevelsDropped} mức bị rớt, nhịp thẻ đang rất có lợi. Khả năng thành công đang ở mức đỉnh.`;
  } else if (probability >= 0.70) {
    riskLevel = BaitRiskLevel.High;
    recommendation = "⚡ Xác suất khá tốt — Có thể cân nhắc đập";
    reasoning = `Chuỗi mồi đang cho thấy nhịp tích cực (${consecutiveFails} lần xịt gần nhất). Tuy nhiên chưa đạt trên 90%, cân nhắc kỹ trước khi đập.`;
  } else if (probability >= 0.50) {
    riskLevel = BaitRiskLevel.Medium;
    recommendation = "⚠️ Xác suất trung bình — Nên đập thêm mồi";
    reasoning = `Nhịp thẻ chưa đủ an toàn. Khuyên bạn nên tiếp tục đập thêm ${Math.max(1, 3 - consecutiveFails)} lần mồi xịt nữa trước khi vào thẻ chính.`;
  } else if (totalCount > 0 && history[history.length - 1].isSuccess) {
    riskLevel = BaitRiskLevel.Low;
    recommendation = "🔴 Vừa lên — Không nên đập ngay";
    reasoning = "Thẻ mồi vừa lên thành công. Sau khi lên, nhịp thường reset về mức thấp. Khuyên tiếp tục đập thêm mồi để tích lũy nhịp mới.";
  } else {
    riskLevel = BaitRiskLevel.Low;
    recommendation = "🔴 Xác suất thấp — Chưa nên đập";
    reasoning = `Chuỗi mồi chưa đủ để nhịp tích lũy (chỉ ${consecutiveFails} lần xịt liên tiếp). Hãy đập thêm mồi ở mức +${targetFrom} hoặc cận mức.`;
  }

  const rhythmTip = generateRhythmTip(targetFrom, consecutiveFails, request.targetBars);

  return {
    probabilityScore: probability,
    riskLevel,
    recommendation,
    reasoning,
    rhythmTip,
    totalBaitCount: totalCount,
    successCount,
    failCount,
    consecutiveFails,
    totalLevelsDropped,
  };
}
