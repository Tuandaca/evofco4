"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  baitApi,
  BaitAnalysisResponse,
  BaitFeedbackResponse,
  BaitEntry,
  BaitRiskLevel,
} from "@/lib/api/bait";
import { cn } from "@/lib/utils/cn";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function riskColor(level: BaitRiskLevel): string {
  switch (level) {
    case BaitRiskLevel.VeryHigh: return "text-green-400";
    case BaitRiskLevel.High:     return "text-lime-400";
    case BaitRiskLevel.Medium:   return "text-yellow-400";
    case BaitRiskLevel.Low:      return "text-red-400";
    default:                      return "text-zinc-400";
  }
}

function riskBarColor(level: BaitRiskLevel): string {
  switch (level) {
    case BaitRiskLevel.VeryHigh: return "from-green-500 to-emerald-400";
    case BaitRiskLevel.High:     return "from-lime-500 to-green-400";
    case BaitRiskLevel.Medium:   return "from-yellow-500 to-orange-400";
    case BaitRiskLevel.Low:      return "from-red-600 to-rose-500";
    default:                      return "from-zinc-600 to-zinc-500";
  }
}

function useAnimatedNumber(value: number, duration: number = 800) {
  const [displayValue, setDisplayValue] = useState(value);
  
  useEffect(() => {
    let startTimestamp: number | null = null;
    let startValue = displayValue;
    const endValue = value;
    
    if (startValue === endValue) return;

    let frame: number;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(startValue + (endValue - startValue) * ease);
      if (progress < 1) {
        frame = requestAnimationFrame(step);
      } else {
        setDisplayValue(endValue);
      }
    };
    
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]); // Intentionally omitting displayValue to avoid loop
  
  return displayValue;
}

// ─── Animated Progress Bar ────────────────────────────────────────────────────

function AnimatedProgressBar({
  value,
  riskLevel,
  isAnimating,
}: {
  value: number;
  riskLevel: BaitRiskLevel;
  isAnimating: boolean;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (isAnimating) {
      // Scanning animation
      let t = 0;
      const scan = () => {
        t += 2;
        setDisplayValue(t % 100);
        rafRef.current = requestAnimationFrame(scan);
      };
      rafRef.current = requestAnimationFrame(scan);
      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    } else {
      // Settle to actual value
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      const target = Math.round(value * 100);
      let current = 0;
      const step = () => {
        current = Math.min(current + 2, target);
        setDisplayValue(current);
        if (current < target) rafRef.current = requestAnimationFrame(step);
      };
      rafRef.current = requestAnimationFrame(step);
      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    }
  }, [value, isAnimating]);

  return (
    <div className="relative">
      {/* Track */}
      <div className="relative h-6 rounded-full bg-zinc-800 overflow-hidden border border-zinc-700/50">
        {/* Fill */}
        <div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full bg-gradient-to-r transition-all duration-300",
            isAnimating
              ? "animate-pulse from-zinc-500 to-zinc-400 w-1/3"
              : riskBarColor(riskLevel)
          )}
          style={isAnimating ? undefined : { width: `${displayValue}%` }}
        />
        {/* Shimmer */}
        {!isAnimating && displayValue > 0 && (
          <div className="absolute inset-0 overflow-hidden rounded-full">
            <div
              className="absolute inset-y-0 w-20 bg-white/10 blur-sm animate-[shimmer_2s_infinite]"
              style={{ left: `${displayValue - 10}%` }}
            />
          </div>
        )}
        {/* Tick marks */}
        {[25, 50, 75].map((tick) => (
          <div
            key={tick}
            className="absolute top-1 bottom-1 w-px bg-zinc-600/40"
            style={{ left: `${tick}%` }}
          />
        ))}
      </div>
      {/* Labels */}
      <div className="flex justify-between text-[10px] text-zinc-500 mt-1 px-0.5">
        <span>0%</span>
        <span>25%</span>
        <span>50%</span>
        <span>75%</span>
        <span>100%</span>
      </div>
    </div>
  );
}

// ─── Animations & Effects ───────────────────────────────────────────────────
// ─── Bait History Row ─────────────────────────────────────────────────────────

function BaitHistoryRow({
  entry,
  index,
  onRemove,
}: {
  entry: BaitEntry;
  index: number;
  onRemove: () => void;
}) {
  const isSuccess = entry.droppedToLevel >= entry.fromLevel + 1;
  const dropped = isSuccess ? 0 : entry.fromLevel - entry.droppedToLevel;

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border text-sm",
        isSuccess
          ? "bg-green-950/40 border-green-800/40"
          : "bg-red-950/30 border-red-900/40"
      )}
    >
      <span className="text-zinc-400 w-5 text-right shrink-0">{index + 1}.</span>
      <div className="flex items-center gap-1.5 font-mono font-semibold">
        <span className="text-zinc-300">+{entry.fromLevel}</span>
        <span className="text-zinc-500">→</span>
        <span className="text-zinc-300">+{entry.fromLevel + 1}</span>
      </div>
      <div className="flex items-center gap-1.5 ml-auto">
        {isSuccess ? (
          <span className="text-green-400 font-semibold">✅ Lên +{entry.fromLevel + 1}</span>
        ) : (
          <span className="text-red-400 font-semibold">
            ❌ Rớt về +{entry.droppedToLevel}
            {dropped > 0 && <span className="text-red-300/70 text-xs ml-1">(-{dropped} mức)</span>}
          </span>
        )}
      </div>
      <button
        onClick={onRemove}
        className="ml-2 text-zinc-600 hover:text-red-400 transition-colors shrink-0 text-xs"
      >
        ✕
      </button>
    </div>
  );
}

// ─── Add Bait Entry Form ──────────────────────────────────────────────────────

function AddBaitForm({ onAdd }: { onAdd: (entry: BaitEntry) => void }) {
  const [fromLevel, setFromLevel] = useState(5);
  const [didSucceed, setDidSucceed] = useState<boolean | null>(null);
  const [droppedTo, setDroppedTo] = useState(fromLevel - 1);

  useEffect(() => {
    setDroppedTo(fromLevel - 1);
    setDidSucceed(null);
  }, [fromLevel]);

  const handleSubmit = () => {
    if (didSucceed === null) return;
    const droppedToLevel = didSucceed ? fromLevel + 1 : droppedTo;
    onAdd({ fromLevel, droppedToLevel });
    setDidSucceed(null);
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-4">
      <p className="text-sm font-medium text-zinc-300">Thêm lần đập mồi</p>

      {/* From level */}
      <div className="flex items-center gap-3">
        <label className="text-xs text-zinc-400 w-28 shrink-0">Mức thẻ mồi:</label>
        <div className="flex items-center gap-2 flex-1">
          <button
            onClick={() => setFromLevel(Math.max(1, fromLevel - 1))}
            className="w-7 h-7 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center font-bold text-lg transition-colors"
          >−</button>
          <span className="text-white font-mono font-bold text-base w-20 text-center">
            +{fromLevel} → +{fromLevel + 1}
          </span>
          <button
            onClick={() => setFromLevel(Math.min(12, fromLevel + 1))}
            className="w-7 h-7 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center font-bold text-lg transition-colors"
          >+</button>
        </div>
      </div>

      {/* Result */}
      <div className="space-y-2">
        <label className="text-xs text-zinc-400">Kết quả:</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setDidSucceed(true)}
            className={cn(
              "py-2.5 rounded-lg border font-semibold text-sm transition-all duration-200",
              didSucceed === true
                ? "bg-green-600 border-green-500 text-white scale-[1.02]"
                : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-green-700"
            )}
          >
            ✅ Lên +{fromLevel + 1}
          </button>
          <button
            onClick={() => setDidSucceed(false)}
            className={cn(
              "py-2.5 rounded-lg border font-semibold text-sm transition-all duration-200",
              didSucceed === false
                ? "bg-red-700 border-red-600 text-white scale-[1.02]"
                : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-red-700"
            )}
          >
            ❌ Xịt / Rớt
          </button>
        </div>
      </div>

      {/* Dropped to (only if fail) */}
      {didSucceed === false && (
        <div className="flex items-center gap-3 animate-in slide-in-from-top-2 duration-200">
          <label className="text-xs text-zinc-400 w-28 shrink-0">Rớt về mức:</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDroppedTo(Math.max(0, droppedTo - 1))}
              className="w-7 h-7 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center font-bold text-lg transition-colors"
            >−</button>
            <span className="text-red-400 font-mono font-bold text-base w-10 text-center">+{droppedTo}</span>
            <button
              onClick={() => setDroppedTo(Math.min(fromLevel - 1, droppedTo + 1))}
              className="w-7 h-7 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center font-bold text-lg transition-colors"
            >+</button>
          </div>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={didSucceed === null}
        className={cn(
          "w-full py-2.5 rounded-lg font-semibold text-sm transition-all duration-200",
          didSucceed !== null
            ? "bg-blue-600 hover:bg-blue-500 text-white"
            : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
        )}
      >
        Thêm vào chuỗi mồi →
      </button>
    </div>
  );
}

type RecentSession = {
  id: number;
  date: string;
  targetFromLevel: number;
  targetBars: number;
  success: boolean | 'broken' | null;
  droppedToLevel?: number;
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BaitAnalysisPage() {
  const [targetFromLevel, setTargetFromLevel] = useState(5);
  const [targetBars, setTargetBars] = useState<number>(5.0);
  const [debouncedTargetBars, setDebouncedTargetBars] = useState<number>(5.0);
  const [history, setHistory] = useState<BaitEntry[]>([]);
  const [result, setResult] = useState<BaitAnalysisResponse | null>(null);
  // lastResult giữ kết quả cuối cùng hợp lệ — dùng cho feedback khi mồi nổ
  // vì addEntry reset result=null nhưng feedback cần dữ liệu cũ để gửi lên server
  const lastResultRef = useRef<BaitAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('recentBaitSessions');
    if (stored) {
      try {
        setRecentSessions(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Debounce targetBars
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTargetBars(targetBars);
    }, 1000);
    return () => clearTimeout(handler);
  }, [targetBars]);

  // Feedback state
  const [feedbackSuccess, setFeedbackSuccess] = useState<boolean | 'broken' | null>(null);
  const [feedbackDrop, setFeedbackDrop] = useState(targetFromLevel - 1);
  const [feedbackNotes, setFeedbackNotes] = useState("");
  const [feedbackSending, setFeedbackSending] = useState(false);
  const [feedbackResult, setFeedbackResult] = useState<BaitFeedbackResponse | null>(null);
  // pendingBrokenEntry giữ entry mồi nổ để auto-submit sau khi analyze xong
  const pendingBrokenRef = useRef<boolean>(false);

  const addEntry = (entry: BaitEntry) => {
    const isSuccess = entry.droppedToLevel >= entry.fromLevel + 1;
    const newHistory = [...history, entry];
    setHistory(newHistory);
    setFeedbackResult(null);
    setAnalyzeError(null);
    if (isSuccess) {
      // Mồi nổ: đánh dấu pending, KHÔNG reset result ngay
      // Auto-submit sẽ xảy ra sau khi analyze xong với history mới
      pendingBrokenRef.current = true;
      setFeedbackSuccess('broken');
    } else {
      setFeedbackSuccess(null);
      setResult(null);
    }
  };

  const removeEntry = (i: number) => {
    setHistory(history.filter((_, idx) => idx !== i));
    setFeedbackResult(null);
    setFeedbackSuccess(null);
    pendingBrokenRef.current = false;
  };

  // handleFeedbackWithResult: nhận result trực tiếp, không phụ thuộc vào state
  // Khai báo TRƯỚC useEffect để tránh "use before declaration" làm crash trang
  const handleFeedbackWithResult = useCallback(async (
    r: BaitAnalysisResponse,
    successVal: boolean | 'broken'
  ) => {
    setFeedbackSending(true);
    try {
      const res = await baitApi.saveFeedback({
        targetFromLevel,
        targetBars,
        baitHistory: history,
        predictedProbability: r.probabilityScore,
        predictedRiskLevel: r.riskLevel,
        actualSuccess: successVal === 'broken' ? null : successVal,
        actualDroppedToLevel: successVal === false ? feedbackDrop : undefined,
        notes: feedbackNotes
      });
      setFeedbackResult(res);
      const newSession: RecentSession = {
        id: res.sessionId,
        date: new Date().toISOString(),
        targetFromLevel,
        targetBars,
        success: successVal,
        droppedToLevel: successVal === false ? feedbackDrop : undefined,
      };
      setRecentSessions(prev => {
        const updated = [newSession, ...prev].slice(0, 5);
        localStorage.setItem('recentBaitSessions', JSON.stringify(updated));
        return updated;
      });
    } catch (e) {
      console.error('[BaitAnalysis] saveFeedback failed:', e);
    } finally {
      setFeedbackSending(false);
    }
  }, [targetFromLevel, targetBars, history, feedbackDrop, feedbackNotes]);

  // Real-time auto-analysis whenever history or target changes
  useEffect(() => {
    if (history.length === 0) {
      setResult(null);
      setAnalyzeError(null);
      return;
    }

    const abortController = new AbortController();
    
    const analyze = async () => {
      setLoading(true);
      setAnalyzeError(null);
      try {
        // Timeout 30s để tránh miss khi Render cold start
        const res = await baitApi.analyzeSequence(
          { targetFromLevel, targetBars: debouncedTargetBars, baitHistory: history },
          { timeoutMs: 30_000 }
        );
        if (abortController.signal.aborted) return;
        setResult(res);
        lastResultRef.current = res;
        setFeedbackDrop(prev => prev); // giữ nguyên feedbackDrop nếu đã có feedback
        // Nếu đang pending broken (mồi nổ), auto-submit feedback ngay sau khi có result
        if (pendingBrokenRef.current) {
          pendingBrokenRef.current = false;
          setTimeout(() => handleFeedbackWithResult(res, 'broken'), 0);
        }
      } catch (e) {
        if (abortController.signal.aborted) return;
        console.error('[BaitAnalysis] analyze failed:', e);
        setAnalyzeError('Không thể kết nối server. Vui lòng thử lại.');
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    analyze();
    return () => abortController.abort();
  }, [history, targetFromLevel, debouncedTargetBars, handleFeedbackWithResult]);

  const handleFeedback = async () => {
    const r = result ?? lastResultRef.current;
    if (!r || feedbackSuccess === null) return;
    await handleFeedbackWithResult(r, feedbackSuccess);
  };

  const handleRestart = () => {
    setHistory([]);
    setResult(null);
    lastResultRef.current = null;
    setFeedbackSuccess(null);
    setFeedbackDrop(targetFromLevel - 1);
    setFeedbackNotes("");
    setFeedbackResult(null);
    setAnalyzeError(null);
    pendingBrokenRef.current = false;
  };

  const pct = result ? Math.round(result.probabilityScore * 100) : 0;
  const animatedPct = useAnimatedNumber(pct, 800);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse inline-block" />
            Công cụ phân tích
          </div>
          <h1 className="text-3xl font-black tracking-tight">Phân Tích Dây Mồi Thẻ</h1>
          <p className="text-zinc-400 text-sm max-w-xl">
            Nhập chuỗi kết quả đập thẻ mồi để hệ thống dự đoán xác suất thành công cho thẻ chính.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-12 items-start">
          {/* LEFT: Input Column */}
          <div className="lg:col-span-4 space-y-5">
            {/* Target level */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
              <div>
                <p className="font-semibold text-zinc-200 mb-0.5">Thẻ chính muốn đập</p>
                <p className="text-xs text-zinc-500">Mức thẻ bắt đầu → mức muốn đạt</p>
              </div>
              <div className="flex items-center gap-4 justify-center py-2">
                <button
                  onClick={() => setTargetFromLevel(Math.max(1, targetFromLevel - 1))}
                  className="w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-2xl font-bold transition-colors"
                >−</button>
                <div className="text-center">
                  <div className="text-4xl font-black font-mono text-white">
                    +{targetFromLevel}
                    <span className="text-zinc-500 mx-2">→</span>
                    <span className="text-blue-400">+{targetFromLevel + 1}</span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">
                    Tỉ lệ gốc (full vạch) ≈ {[0,100,81,64,50,26,15,7,5,4,3,2,1][targetFromLevel] ?? 1}%
                  </p>
                </div>
                <button
                  onClick={() => setTargetFromLevel(Math.min(12, targetFromLevel + 1))}
                  className="w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-2xl font-bold transition-colors"
                >+</button>
              </div>

              {/* Target Bars Slider */}
              <div className="pt-2 border-t border-zinc-800/60 mt-2">
                <div className="flex justify-between items-center mb-4">
                  <label className="text-xs text-zinc-400">Số vạch phôi đập kèo chính:</label>
                  <span className="text-sm font-bold text-blue-400">{targetBars.toFixed(1)} vạch</span>
                </div>
                
                <div className="relative pb-10">
                  {/* Ticks */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 pointer-events-none px-[8px]">
                    <div className="relative w-full h-full">
                      {[0, 25, 50, 75, 100].map((pct) => (
                        <div key={pct} className="absolute w-0.5 h-3 bg-zinc-600 -translate-x-1/2 -top-1" style={{ left: `${pct}%` }} />
                      ))}
                    </div>
                  </div>

                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.1"
                    value={targetBars}
                    onChange={(e) => setTargetBars(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500 relative z-10"
                  />
                  
                  {/* Labels */}
                  <div className="absolute top-8 left-0 right-0 pointer-events-none px-[8px]">
                    <div className="relative w-full text-sm font-semibold text-zinc-300">
                      <span className="absolute left-[0%] -translate-x-1/2">1.0</span>
                      <span className="absolute left-[25%] -translate-x-1/2">2.0</span>
                      <span className="absolute left-[50%] -translate-x-1/2">3.0</span>
                      <span className="absolute left-[75%] -translate-x-1/2">4.0</span>
                      <span className="absolute left-[100%] -translate-x-1/2 whitespace-nowrap">Full (5.0)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Add bait entry */}
            <AddBaitForm onAdd={addEntry} />

            {/* Bait history list */}
            {history.length > 0 && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-zinc-200 text-sm">
                    Lịch sử mồi ({history.length} lần)
                  </p>
                  <button
                    onClick={() => { setHistory([]); setResult(null); }}
                    className="text-xs text-zinc-600 hover:text-red-400 transition-colors"
                  >
                    Xóa tất cả
                  </button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {history.map((e, i) => (
                    <BaitHistoryRow
                      key={i}
                      entry={e}
                      index={i}
                      onRemove={() => removeEntry(i)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* MIDDLE: Result Column */}
          <div className="lg:col-span-5 space-y-6">
            {/* Main Result Box */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-6 min-h-[400px] relative shadow-lg">
              {/* Loading state */}
              {loading && !result && (
                <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center gap-4">
                  <div className="w-12 h-12 rounded-full border-4 border-zinc-700 border-t-blue-500 animate-spin" />
                  <p className="text-sm text-zinc-400">Đang phân tích chuỗi mồi...</p>
                </div>
              )}
              {/* Error state */}
              {analyzeError && !loading && !result && (
                <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center gap-4">
                  <div className="text-4xl">⚠️</div>
                  <p className="text-sm text-red-400">{analyzeError}</p>
                  <p className="text-xs text-zinc-600">Nếu lỗi tiếp tục, hãy thử xóa và nhập lại lần đập mồi.</p>
                </div>
              )}
              {/* Empty state */}
              {!result && !loading && !analyzeError && (
              <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center gap-4 text-zinc-600">
                <div className="text-6xl opacity-20">⚡</div>
                <p className="text-sm">
                  Thêm lần đập mồi bên trái để xem AI phân tích xác suất thời gian thực.
                </p>
              </div>
            )}

            {/* Result */}
            {result && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Big probability */}
                <div className="text-center space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                    Xác suất thành công ước tính
                  </p>
                  <div
                    className={cn(
                      "text-7xl font-black font-mono",
                      riskColor(result.riskLevel)
                    )}
                  >
                    {Math.round(animatedPct)}%
                  </div>
                  <p className={cn("text-sm font-semibold", riskColor(result.riskLevel))}>
                    {result.recommendation}
                  </p>
                </div>

                {/* Progress bar */}
                <AnimatedProgressBar
                  value={animatedPct / 100}
                  riskLevel={result.riskLevel}
                  isAnimating={false}
                />

                {/* Reasoning box */}
                <div className="rounded-lg bg-zinc-800/60 border border-zinc-700/50 p-4 text-sm text-zinc-300 leading-relaxed">
                  {result.reasoning}
                </div>

                {/* Rhythm Tip */}
                {result.rhythmTip && (
                  <div className="flex gap-3 p-4 rounded-lg border border-indigo-900/40 bg-indigo-950/20 text-indigo-300">
                    <span className="text-xl">💡</span>
                    <div>
                      <p className="font-semibold text-sm text-indigo-400">Gợi ý nhịp đập</p>
                      <p className="text-xs mt-1">{result.rhythmTip}</p>
                    </div>
                  </div>
                )}

                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Tổng mồi", value: result.totalBaitCount, color: "text-zinc-300" },
                    { label: "Thành công", value: result.successCount, color: "text-green-400" },
                    { label: "Xịt", value: result.failCount, color: "text-red-400" },
                    { label: "Xịt liên tiếp", value: result.consecutiveFails, color: "text-orange-400" },
                    { label: "Mức đã rớt", value: result.totalLevelsDropped, color: "text-rose-400" },
                    { label: "Tỉ lệ xịt", value: `${result.totalBaitCount > 0 ? Math.round((result.failCount / result.totalBaitCount) * 100) : 0}%`, color: "text-zinc-300" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-lg bg-zinc-800/50 border border-zinc-700/40 p-3 text-center"
                    >
                      <div className={cn("text-2xl font-black font-mono", stat.color)}>
                        {stat.value}
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* ─── FEEDBACK SECTION ─────────────────────────────── */}
                <div className="rounded-xl border border-dashed border-blue-800/60 bg-blue-950/20 p-4 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🎯</span>
                    <div>
                      <p className="font-semibold text-sm text-blue-300">Ghi nhận kết quả kèo chính</p>
                      <p className="text-[11px] text-zinc-500">Dữ liệu thực tế giúp AI học và cải thiện độ chính xác.</p>
                    </div>
                  </div>

                  {feedbackResult ? (
                    <div className="text-center space-y-2 py-4">
                      <p className="text-zinc-400 text-sm">Đang mở popup kết quả...</p>
                    </div>
                  ) : (
                    // ── Form nhập kết quả ──
                    <>
                      <div className="grid grid-cols-3 gap-3">
                        <button
                          onClick={() => setFeedbackSuccess(true)}
                          className={cn(
                            "py-3 rounded-lg border font-semibold text-sm transition-all duration-200 flex flex-col items-center justify-center gap-1",
                            feedbackSuccess === true
                              ? "bg-green-600 border-green-500 text-white scale-[1.02] shadow-lg shadow-green-900/30"
                              : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-green-700"
                          )}
                        >
                          <span className="text-base">✅ LÊN</span>
                        </button>
                        <button
                          onClick={() => setFeedbackSuccess(false)}
                          className={cn(
                            "py-3 rounded-lg border font-semibold text-sm transition-all duration-200 flex flex-col items-center justify-center gap-1",
                            feedbackSuccess === false
                              ? "bg-red-700 border-red-600 text-white scale-[1.02] shadow-lg shadow-red-900/30"
                              : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-red-700"
                          )}
                        >
                          <span className="text-base">❌ XỊT</span>
                        </button>
                        <button
                          onClick={() => setFeedbackSuccess('broken')}
                          className={cn(
                            "py-3 rounded-lg border font-semibold text-sm transition-all duration-200 flex flex-col items-center justify-center gap-1",
                            feedbackSuccess === 'broken'
                              ? "bg-orange-600 border-orange-500 text-white scale-[1.02] shadow-lg shadow-orange-900/30"
                              : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-orange-700"
                          )}
                        >
                          <span className="text-base">⚠️ NỔ</span>
                        </button>
                      </div>

                      {feedbackSuccess === false && (
                        <div className="flex items-center gap-3 animate-in slide-in-from-top-1 duration-200">
                          <label className="text-xs text-zinc-400 shrink-0">Rớt về mức:</label>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setFeedbackDrop(Math.max(0, feedbackDrop - 1))} className="w-7 h-7 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center font-bold text-lg">−</button>
                            <span className="text-red-400 font-mono font-bold text-base w-10 text-center">+{feedbackDrop}</span>
                            <button onClick={() => setFeedbackDrop(Math.min(targetFromLevel - 1, feedbackDrop + 1))} className="w-7 h-7 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center font-bold text-lg">+</button>
                          </div>
                        </div>
                      )}

                      <input
                        type="text"
                        placeholder="Ghi chú thêm (tùy chọn)..."
                        value={feedbackNotes}
                        onChange={(e) => setFeedbackNotes(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-blue-600"
                      />

                      <button
                        onClick={handleFeedback}
                        disabled={feedbackSuccess === null || feedbackSending}
                        className={cn(
                          "w-full py-2.5 rounded-lg font-semibold text-sm transition-all duration-200",
                          feedbackSuccess !== null && !feedbackSending
                            ? "bg-blue-700 hover:bg-blue-600 text-white"
                            : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                        )}
                      >
                        {feedbackSending ? "⏳ Đang lưu..." : "📊 Gửi kết quả để train AI"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
            </div>
          </div>

          {/* RIGHT: Recent Sessions */}
          <div className="lg:col-span-3 space-y-6">

            {/* Recent Sessions (LocalStorage) - Moved to Right Side */}
            {recentSessions.length > 0 && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4 shadow-md sticky top-6">
                <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
                  <span className="text-2xl">🕰️</span>
                  <div>
                    <h3 className="font-bold text-zinc-200">Lịch Sử Các Dây Mồi</h3>
                    <p className="text-[10px] text-zinc-500">Các phiên phân tích gần nhất</p>
                  </div>
                </div>
                <div className="space-y-3 pt-2 max-h-[600px] overflow-y-auto pr-1">
                  {recentSessions.map((session, i) => (
                    <div key={i} className="flex flex-col gap-2 p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/80 text-sm transition-colors hover:bg-zinc-900">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-zinc-300 font-bold text-lg">+{session.targetFromLevel}</span>
                          <span className="text-zinc-700 text-lg">|</span>
                          <span className="text-blue-400 font-medium">{session.targetBars.toFixed(1)} vạch</span>
                        </div>
                        <div className="font-semibold text-xs">
                          {session.success === true ? (
                            <span className="text-green-400 px-2 py-1 rounded bg-green-400/10 border border-green-400/20 shadow-sm">✅ LÊN +{session.targetFromLevel + 1}</span>
                          ) : session.success === false ? (
                            <span className="text-red-400 px-2 py-1 rounded bg-red-400/10 border border-red-400/20 shadow-sm">❌ RỚT +{session.droppedToLevel}</span>
                          ) : (
                            <span className="text-orange-400 px-2 py-1 rounded bg-orange-400/10 border border-orange-400/20 shadow-sm">⚠️ MỒI NỔ</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Modal Overlay for Feedback Result ── */}
      {feedbackResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-300 space-y-6 text-center">
            <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center bg-blue-500/20 text-3xl">
              {feedbackSuccess === true ? '✅' : feedbackSuccess === false ? '❌' : '⚠️'}
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Kết Quả Đã Lưu</h3>
              <p className="text-sm text-zinc-400">
                {feedbackResult.message}
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={handleRestart}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors shadow-lg shadow-blue-900/20"
              >
                🔄 Bắt đầu chuỗi mồi mới
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
