import React from 'react';
import {
  AlertTriangle,
  Database,
  FlaskConical,
  Home,
  Info,
  RotateCcw,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { RegistryStats } from '../types';

interface HeaderProps {
  isRecovery: boolean;
  registryStats?: RegistryStats;
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
  onOpenRegistryModal,
  onOpenTestScenarios,
  onOpenRecovery,
  onBackToCheck
}) => {
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
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <p className="text-sm font-extrabold text-slate-900">AI hỗ trợ, bạn quyết định</p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">
              Gemini đọc ngữ cảnh trước khi hệ thống đối chiếu đường link và nguồn chính thức.
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
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <button type="button" onClick={onBackToCheck} className="flex min-w-0 items-center gap-2.5 text-left">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-sm">
              <ShieldCheck className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-black text-slate-950">Khoan Đã!</p>
              <p className="text-[10px] text-slate-400">Trợ lý an toàn số</p>
            </div>
          </button>

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
      </header>
    </>
  );
};
