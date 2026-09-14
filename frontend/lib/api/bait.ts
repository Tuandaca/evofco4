/**
 * bait.ts — Bait Analysis API Layer
 *
 * Sau khi migrate sang Client-Side Engine (Phương án 1):
 * - analyzeSequence: gọi baitEngine.analyzeSequence() trực tiếp (0ms, synchronous)
 * - saveFeedback: lưu vào LocalStorage thay vì gọi .NET Backend
 *
 * Không còn phụ thuộc vào backend server cho tính năng Dây Mồi.
 */

import * as baitEngine from "@/lib/services/baitEngine";

export interface BaitEntry {
  fromLevel: number;
  droppedToLevel: number;
  isSuccess?: boolean;
  levelsDropped?: number;
}

export interface BaitAnalysisRequest {
  targetFromLevel: number;
  targetBars: number;
  baitHistory: BaitEntry[];
}

export enum BaitRiskLevel {
  TooEarly = "TooEarly",
  Low = "Low",
  Medium = "Medium",
  High = "High",
  VeryHigh = "VeryHigh",
}

export interface BaitAnalysisResponse {
  probabilityScore: number;
  riskLevel: BaitRiskLevel;
  recommendation: string;
  reasoning: string;
  rhythmTip?: string;
  totalBaitCount: number;
  successCount: number;
  failCount: number;
  consecutiveFails: number;
  totalLevelsDropped: number;
}

export interface BaitFeedbackRequest {
  targetFromLevel: number;
  targetBars: number;
  baitHistory: BaitEntry[];
  predictedProbability: number;
  predictedRiskLevel: string;
  actualSuccess: boolean | null; // null = mồi nổ (sequence broken)
  actualDroppedToLevel?: number;
  notes?: string;
}

export interface BaitFeedbackResponse {
  sessionId: number;
  message: string;
}

// ─── LocalStorage Key & Helpers ──────────────────────────────────────────────

const FEEDBACK_STORAGE_KEY = "baitFeedbackHistory";

function loadFeedbackHistory(): BaitFeedbackRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveFeedbackToStorage(request: BaitFeedbackRequest): number {
  const history = loadFeedbackHistory();
  const sessionId = Date.now(); // dùng timestamp làm ID duy nhất
  const entry = { ...request, _sessionId: sessionId, _savedAt: new Date().toISOString() };
  const updated = [entry, ...history].slice(0, 100); // giữ tối đa 100 bản ghi
  localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(updated));
  return sessionId;
}

// ─── Normalized BaitEntry helper ─────────────────────────────────────────────

/**
 * Chuẩn hóa BaitEntry để engine tính toán đúng.
 * Tự điền isSuccess và levelsDropped nếu chưa có.
 */
function normalizeBaitEntry(entry: BaitEntry): Required<BaitEntry> {
  const isSuccess = entry.isSuccess ?? entry.droppedToLevel >= entry.fromLevel + 1;
  const levelsDropped = entry.levelsDropped ?? (isSuccess ? 0 : entry.fromLevel - entry.droppedToLevel);
  return { ...entry, isSuccess, levelsDropped };
}

// ─── Main API Object ─────────────────────────────────────────────────────────

export const baitApi = {
  /**
   * Phân tích chuỗi mồi — chạy hoàn toàn Client-Side (0ms, không cần server).
   * Tham số options bị loại bỏ (không còn cần timeoutMs vì không có HTTP request).
   */
  analyzeSequence: (
    request: BaitAnalysisRequest,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options?: { timeoutMs?: number }
  ): Promise<BaitAnalysisResponse> => {
    // Chuẩn hóa baitHistory trước khi đưa vào engine
    const normalizedRequest = {
      ...request,
      baitHistory: request.baitHistory.map(normalizeBaitEntry),
    };
    // Tính toán đồng bộ ngay lập tức, wrap trong Promise để giữ interface tương thích
    const result = baitEngine.analyzeSequence(normalizedRequest);
    return Promise.resolve(result);
  },

  /**
   * Lưu kết quả đập thẻ chính vào LocalStorage.
   * Không gọi server — phản hồi tức thì, không cần mạng.
   */
  saveFeedback: (request: BaitFeedbackRequest): Promise<BaitFeedbackResponse> => {
    const sessionId = saveFeedbackToStorage(request);
    const message =
      request.actualSuccess === true
        ? `✅ Ghi nhận thẻ chính lên +${request.targetFromLevel + 1} thành công! Dữ liệu đã lưu cục bộ.`
        : request.actualSuccess === false
        ? `📝 Ghi nhận thẻ chính rớt về +${request.actualDroppedToLevel}. Dữ liệu đã lưu để phân tích sau.`
        : "⚠️ Ghi nhận mồi nổ (hỏng dây mồi). Dữ liệu đã lưu cục bộ.";
    return Promise.resolve({ sessionId, message });
  },
};
