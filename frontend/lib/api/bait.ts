import { apiClient } from "./client";

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
  actualSuccess: boolean | null; // null means sequence broken (mồi nổ)
  actualDroppedToLevel?: number;
  notes?: string;
}

export interface BaitFeedbackResponse {
  sessionId: number;
  message: string;
}

export const baitApi = {
  analyzeSequence: (request: BaitAnalysisRequest): Promise<BaitAnalysisResponse> =>
    apiClient.post<BaitAnalysisResponse>("/api/v1/bait/analyze", request),

  saveFeedback: (request: BaitFeedbackRequest): Promise<BaitFeedbackResponse> =>
    apiClient.post<BaitFeedbackResponse>("/api/v1/bait/feedback", request),
};
