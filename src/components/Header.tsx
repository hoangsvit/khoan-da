import React from 'react';
import {
  AlertTriangle,
  Activity,
  Database,
  FlaskConical,
  Home,
  Info,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { GeminiStatusInfo, RegistryStats } from '../types';

interface HeaderProps {
  isRecovery: boolean;
  registryStats?: RegistryStats;
  geminiStatus?: GeminiStatusInfo;
  isCheckingGemini?: boolean;
  onRefreshGeminiStatus?: () => void;
  onOpenRegistryModal: () => void;
  onOpenTestScenarios: () => void;
  onOpenRecovery: () => void;
  onBackToCheck: () => void;
}

const NavButton = ({
  active,
  icon,
  label,
  onClick,
  danger = false
}: {
  active?: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-left text-sm font-semibold transition ${
      active
        ? 'bg-indigo-50 text-indigo-700 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.12)]'
        : danger
          ? 'text-rose-600 hover:bg-rose-50'
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
    }`}
  >
    <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${active ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>
      {icon}
    </span>
    <span>{label}</span>
  </button>
);

export const Header: React.FC<HeaderProps> = ({
  isRecovery,
  registryStats,
  geminiStatus,
  isCheckingGemini = false,
  onRefreshGeminiStatus,
  onOpenRegistryModal,
  onOpenTestScenarios,
  onOpenRecovery,
  onBackToCheck
}) => {
  const getStatusBadge = () => {
    if (!geminiStatus) {
      return {
        bg: 'bg-slate-100 text-slate-600 border-slate-200',
        dot: 'bg-slate-400',
        text: 'Kiểm tra API...',
        sub: 'Đang tải trạng thái'
      };
    }
    if (geminiStatus.status === 'ready') {
      return {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        dot: 'bg-emerald-500 animate-pulse',
        text: 'API Hoạt động',
        sub: `Model: ${geminiStatus.model}`
      };
    }
    if (geminiStatus.status === 'rate_limited') {
      return {
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        dot: 'bg-amber-500 animate-ping',
        text: 'Bị giới hạn (429)',
        sub: 'Đang dùng bộ dự phòng'
      };
    }
    return {
      bg: 'bg-rose-50 text-rose-800 border-rose-200',
      dot: 'bg-rose-500',
      text: 'Chưa kết nối',
      sub: geminiStatus.message || 'Kiểm tra GEMINI_API_KEY'
    };
  };

  const statusBadge = getStatusBadge();

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200/80 bg-white px-4 py-5 lg:flex">
        <button type="button" onClick={onBackToCheck} className="flex items-center gap-3 px-2 text-left">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-200/60">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-black tracking-tight text-slate-950">Khoan Đã!</div>
            <div className="text-[11px] font-medium text-slate-400">Trợ lý an toàn số</div>
          </div>
        </button>

        <nav className="mt-8 space-y-1.5">
          <NavButton
            active={!isRecovery}
            icon={<Home className="h-4.5 w-4.5" />}
            label="Phân tích"
            onClick={onBackToCheck}
          />
          <NavButton
            active={isRecovery}
            danger={!isRecovery}
            icon={<AlertTriangle className="h-4.5 w-4.5" />}
            label="Tôi đã lỡ làm theo"
            onClick={onOpenRecovery}
          />
          <NavButton
            icon={<Database className="h-4.5 w-4.5" />}
            label="Nguồn đối soát"
            onClick={onOpenRegistryModal}
          />
        </nav>

        <div className="mt-auto space-y-4">
          <div className="rounded-3xl border border-indigo-100 bg-gradient-to-b from-indigo-50 to-white p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                <Sparkles className="h-4 w-4" />
              </div>
              {onRefreshGeminiStatus && (
                <button
                  type="button"
                  onClick={onRefreshGeminiStatus}
                  disabled={isCheckingGemini}
                  title="Thử lại kết nối Gemini API"
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold text-indigo-600 transition hover:bg-indigo-100/60 disabled:opacity-50"
                >
                  <RefreshCw className={`h-3 w-3 ${isCheckingGemini ? 'animate-spin' : ''}`} />
                  Check API
                </button>
              )}
            </div>
            <p className="text-sm font-extrabold text-slate-900">AI Gemini Status</p>
            
            <div className={`mt-2 flex items-center justify-between gap-2 rounded-xl border px-2.5 py-1.5 text-xs font-bold ${statusBadge.bg}`}>
              <div className="flex items-center gap-2 min-w-0">
                <span className={`h-2 w-2 shrink-0 rounded-full ${statusBadge.dot}`} />
                <span className="truncate">{statusBadge.text}</span>
              </div>
              <Activity className="h-3.5 w-3.5 shrink-0 opacity-70" />
            </div>
            <p className="mt-1.5 text-[10px] leading-tight text-slate-500 truncate" title={statusBadge.sub}>
              {statusBadge.sub}
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenTestScenarios}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
          >
            <FlaskConical className="h-3.5 w-3.5" />
            Kịch bản thử nghiệm
          </button>

          <div className="flex items-center justify-between border-t border-slate-100 px-2 pt-4 text-[10px] text-slate-400">
            <span>{registryStats?.registryEntries || 0} dữ liệu đối soát</span>
            <Info className="h-3.5 w-3.5" />
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2">
          <button type="button" onClick={onBackToCheck} className="flex min-w-0 items-center gap-2.5 text-left">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-sm">
              <ShieldCheck className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-black text-slate-950">Khoan Đã!</p>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                <span className={`h-1.5 w-1.5 rounded-full ${statusBadge.dot}`} />
                <span>{statusBadge.text}</span>
              </div>
            </div>
          </button>

          <div className="flex items-center gap-2">
            {onRefreshGeminiStatus && (
              <button
                type="button"
                onClick={onRefreshGeminiStatus}
                disabled={isCheckingGemini}
                className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isCheckingGemini ? 'animate-spin' : ''}`} />
              </button>
            )}

            {isRecovery ? (
              <button
                type="button"
                onClick={onBackToCheck}
                className="flex items-center gap-1.5 rounded-xl bg-slate-950 px-3 py-2 text-xs font-bold text-white"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Kiểm tra
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenRecovery}
                className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                Khẩn cấp
              </button>
            )}
          </div>
        </div>
      </header>
    </>
  );
};
