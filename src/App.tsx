import React, { useEffect, useState } from 'react';
import { AlertCircle, RefreshCw, Sparkles, X } from 'lucide-react';
import { AnalysisForm } from './components/AnalysisForm';
import { DemoPresetButtons } from './components/DemoPresetButtons';
import { Header } from './components/Header';
import { RecoveryModule } from './components/RecoveryModule';
import { RegistryInfoModal } from './components/RegistryInfoModal';
import { RiskResultDisplay } from './components/RiskResultDisplay';
import { ConsumerMode, GeminiStatusInfo, RegistryStats, RiskAnalysisResult } from './types';

export default function App() {
  const [view, setView] = useState<'check' | 'recovery'>('check');
  const [analysisResult, setAnalysisResult] = useState<RiskAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [registryStats, setRegistryStats] = useState<RegistryStats | undefined>(undefined);
  const [geminiStatus, setGeminiStatus] = useState<GeminiStatusInfo | undefined>(undefined);
  const [isCheckingGemini, setIsCheckingGemini] = useState(false);
  const [isRegistryModalOpen, setIsRegistryModalOpen] = useState(false);
  const [isTestPanelOpen, setIsTestPanelOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchGeminiStatus = async (force = false) => {
    setIsCheckingGemini(true);
    try {
      const res = await fetch(`/api/gemini-status${force ? '?force=true' : ''}`);
      if (res.ok) {
        const data = await res.json();
        setGeminiStatus(data);
      }
    } catch {
      // keep existing status on network error
    } finally {
      setIsCheckingGemini(false);
    }
  };

  useEffect(() => {
    fetch('/api/health')
      .then(response => response.json())
      .then(data => {
        if (data.status === 'ok') {
          setRegistryStats({
            officialDomainEntities: data.officialDomainEntities,
            officialBankEntities: data.officialBankEntities,
            licensedForeignBranches: data.licensedForeignBranches,
            licensedForeignBranchesAsOf: data.licensedForeignBranchesAsOf,
            registryEntries: data.registryEntries
          });
          if (data.geminiStatus) {
            setGeminiStatus(data.geminiStatus);
          }
        }
      })
      .catch(() => undefined);

    void fetchGeminiStatus();
  }, []);

  const handleAnalyze = async (text: string, imageBase64?: string, mimeType?: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    setAnalysisResult(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, imageBase64, mimeType })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Không thể hoàn tất kiểm tra lúc này.');
      }

      const data: RiskAnalysisResult = await response.json();
      setAnalysisResult(data);
      if (data.geminiStatus) {
        setGeminiStatus(data.geminiStatus);
      }
    } catch (error: any) {
      setErrorMsg(error?.message || 'Không thể thực hiện phân tích lúc này. Vui lòng thử lại.');
      void fetchGeminiStatus(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPreset = (_mode: ConsumerMode, text: string) => {
    setIsTestPanelOpen(false);
    setView('check');
    setErrorMsg(null);
    setAnalysisResult(null);
    void handleAnalyze(text);
  };

  const handleBackToCheck = () => {
    setView('check');
    setErrorMsg(null);
  };

  const handleOpenRecovery = () => {
    setView('recovery');
    setAnalysisResult(null);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-[#f6f8fc] font-sans text-slate-900 antialiased selection:bg-indigo-600 selection:text-white">
      <Header
        isRecovery={view === 'recovery'}
        registryStats={registryStats}
        geminiStatus={geminiStatus}
        isCheckingGemini={isCheckingGemini}
        onRefreshGeminiStatus={() => fetchGeminiStatus(true)}
        onOpenRegistryModal={() => setIsRegistryModalOpen(true)}
        onOpenTestScenarios={() => setIsTestPanelOpen(true)}
        onOpenRecovery={handleOpenRecovery}
        onBackToCheck={handleBackToCheck}
      />

      <div className="lg:pl-64">
        <main className="mx-auto w-full max-w-[1320px] px-4 py-6 sm:px-6 sm:py-8 xl:px-10 xl:py-10">
          {view === 'recovery' ? (
            <div className="mx-auto max-w-5xl">
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-rose-500">Xử lý khẩn cấp</p>
                <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Bạn đã lỡ làm theo?</h1>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
                  Chọn những việc đã xảy ra để ưu tiên các bước giảm thiệt hại ngay bây giờ.
                </p>
              </div>
              <RecoveryModule />
            </div>
          ) : (
            <div className="space-y-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Phân tích nội dung đáng ngờ</h1>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
                    Dán nội dung, đường link hoặc ảnh. Gemini sẽ đọc ngữ cảnh trước, sau đó hệ thống mới đối chiếu các tín hiệu kỹ thuật liên quan.
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={() => fetchGeminiStatus(true)}
                  disabled={isCheckingGemini}
                  className={`inline-flex w-fit items-center gap-2 rounded-2xl border px-3.5 py-2 text-xs font-bold transition shadow-sm ${
                    geminiStatus?.status === 'ready'
                      ? 'border-emerald-200 bg-emerald-50/80 text-emerald-800 hover:bg-emerald-100/80'
                      : geminiStatus?.status === 'rate_limited'
                        ? 'border-amber-200 bg-amber-50/80 text-amber-800 hover:bg-amber-100/80'
                        : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  title="Nhấp để kiểm tra lại kết nối Gemini API"
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      geminiStatus?.status === 'ready'
                        ? 'bg-emerald-500 animate-pulse'
                        : geminiStatus?.status === 'rate_limited'
                          ? 'bg-amber-500 animate-ping'
                          : 'bg-slate-400'
                    }`}
                  />
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>
                    {geminiStatus?.status === 'ready'
                      ? 'Gemini API: Sẵn sàng'
                      : geminiStatus?.status === 'rate_limited'
                        ? 'Gemini API: Giới hạn (Dùng dự phòng)'
                        : 'Gemini API: Kiểm tra kết nối'}
                  </span>
                  <RefreshCw className={`ml-1 h-3 w-3 ${isCheckingGemini ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <AnalysisForm
                onAnalyze={handleAnalyze}
                isLoading={isLoading}
                onClear={() => {
                  setAnalysisResult(null);
                  setErrorMsg(null);
                }}
              />

              {errorMsg && (
                <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900 shadow-sm shadow-rose-100/40">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                  <div>
                    <p className="font-extrabold">Chưa thể hoàn tất kiểm tra</p>
                    <p className="mt-1 text-xs leading-relaxed text-rose-800">{errorMsg}</p>
                  </div>
                </div>
              )}

              {analysisResult && <RiskResultDisplay result={analysisResult} />}
            </div>
          )}

          <footer className="mt-10 border-t border-slate-200/80 py-6 text-[11px] text-slate-400">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span>Khoan Đã! — Kiểm tra trước khi bạn hành động.</span>
              <span>Kết quả hỗ trợ nhận diện rủi ro, không phải bảo đảm an toàn tuyệt đối.</span>
            </div>
          </footer>
        </main>
      </div>

      {isTestPanelOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-sm sm:items-center sm:p-6">
          <div className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-t-3xl bg-slate-50 shadow-2xl sm:rounded-3xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur-md sm:px-6">
              <div>
                <h3 className="text-sm font-extrabold text-slate-950">Kịch bản thử nghiệm</h3>
                <p className="mt-0.5 text-[11px] text-slate-500">Chỉ dùng để kiểm tra prompt và hành vi của Gemini.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsTestPanelOpen(false)}
                className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Đóng kịch bản thử nghiệm"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 sm:p-6">
              <DemoPresetButtons onSelectPreset={handleSelectPreset} />
            </div>
          </div>
        </div>
      )}

      <RegistryInfoModal
        isOpen={isRegistryModalOpen}
        onClose={() => setIsRegistryModalOpen(false)}
        stats={registryStats}
      />
    </div>
  );
}
