import React, { useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  Eye,
  Globe2,
  Info,
  LockKeyhole,
  OctagonAlert,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';
import { RiskAnalysisResult } from '../types';

interface RiskResultDisplayProps {
  result: RiskAnalysisResult;
}

const safetyTips = [
  'Không chia sẻ OTP, mật khẩu hoặc mã xác thực cho người khác.',
  'Tự mở app hoặc website chính thức thay vì bấm link được gửi đến.',
  'Khoan chuyển tiền khi người gửi thúc ép hoặc yêu cầu giữ bí mật.',
  'Không cài APK hay ứng dụng điều khiển từ xa theo hướng dẫn của người lạ.'
];

export const RiskResultDisplay: React.FC<RiskResultDisplayProps> = ({ result }) => {
  const [copiedReport, setCopiedReport] = useState(false);

  const theme = (() => {
    switch (result.riskLevel) {
      case 'STOP':
        return {
          label: 'Rủi ro cao',
          badge: 'bg-rose-100 text-rose-700',
          ring: 'bg-rose-50 text-rose-600 ring-rose-100',
          heading: 'text-rose-900',
          icon: <OctagonAlert className="h-7 w-7" />
        };
      case 'CAUTION':
        return {
          label: 'Cần thận trọng',
          badge: 'bg-amber-100 text-amber-700',
          ring: 'bg-amber-50 text-amber-600 ring-amber-100',
          heading: 'text-amber-900',
          icon: <AlertTriangle className="h-7 w-7" />
        };
      case 'VERIFY':
        return {
          label: 'Cần xác minh',
          badge: 'bg-indigo-100 text-indigo-700',
          ring: 'bg-indigo-50 text-indigo-600 ring-indigo-100',
          heading: 'text-indigo-900',
          icon: <ShieldCheck className="h-7 w-7" />
        };
      default:
        return {
          label: 'Chưa thấy dấu hiệu rõ ràng',
          badge: 'bg-emerald-100 text-emerald-700',
          ring: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
          heading: 'text-emerald-900',
          icon: <CheckCircle2 className="h-7 w-7" />
        };
    }
  })();

  const handleCopyReport = () => {
    const reportText = `Khoan Đã!\n${result.headlineTitle}\n${result.headlineSubtitle}\n\nVì sao cần chú ý:\n${result.reasons.map((reason, index) => `${index + 1}. ${reason}`).join('\n')}\n\nBạn nên làm gì:\n${result.actionSteps.map((action, index) => `${index + 1}. ${action}`).join('\n')}`;
    navigator.clipboard.writeText(reportText);
    setCopiedReport(true);
    window.setTimeout(() => setCopiedReport(false), 1800);
  };

  const firstUrlSignal = result.urlCheckSignals?.[0];
  const bank = result.extractedSignals?.bankAccountDetails;
  const imageSummary = result.extractedSignals?.imageAnalysisSummary;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-500" />
          <h2 className="text-sm font-extrabold text-slate-900">Kết quả phân tích</h2>
        </div>

        {result.geminiStatus && (
          <div
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
              result.geminiStatus.status === 'ready'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : result.geminiStatus.status === 'rate_limited'
                  ? 'border-amber-200 bg-amber-50 text-amber-800'
                  : 'border-slate-200 bg-slate-50 text-slate-700'
            }`}
            title={result.geminiStatus.message}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                result.geminiStatus.status === 'ready'
                  ? 'bg-emerald-500'
                  : result.geminiStatus.status === 'rate_limited'
                    ? 'bg-amber-500'
                    : 'bg-slate-400'
              }`}
            />
            <span>
              {result.geminiStatus.status === 'ready'
                ? 'Phân tích Gemini AI'
                : result.geminiStatus.status === 'rate_limited'
                  ? 'Chế độ dự phòng (Gemini 429)'
                  : 'Chế độ dự phòng'}
            </span>
          </div>
        )}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_310px]">
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_18px_55px_-40px_rgba(15,23,42,0.4)]">
          <div className="border-b border-slate-100 p-5 sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 gap-4">
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ring-8 ${theme.ring}`}>
                  {theme.icon}
                </div>
                <div className="min-w-0">
                  <span className={`inline-flex rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${theme.badge}`}>
                    {theme.label}
                  </span>
                  <h3 className={`mt-2 text-xl font-black leading-tight tracking-tight sm:text-2xl ${theme.heading}`}>
                    {result.headlineTitle}
                  </h3>
                  <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-500">{result.headlineSubtitle}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyReport}
                className="flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
              >
                {copiedReport ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedReport ? 'Đã sao chép' : 'Sao chép'}
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            <div className="grid gap-4 p-5 sm:grid-cols-[44px_1fr] sm:p-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">Điều đang xảy ra</h4>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {result.aiDetailedReasoning || result.extractedSignals?.rawSummary || result.headlineSubtitle}
                </p>
                {result.scamCategory && (
                  <span className="mt-3 inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                    {result.scamCategory}
                  </span>
                )}
                {imageSummary && (
                  <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs leading-relaxed text-slate-600">
                    <Eye className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
                    <span>{imageSummary}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-4 p-5 sm:grid-cols-[44px_1fr] sm:p-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">Vì sao cần chú ý</h4>
                <ul className="mt-3 space-y-3">
                  {result.reasons.map((reason, index) => (
                    <li key={`${reason}-${index}`} className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-600">
                      <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid gap-4 p-5 sm:grid-cols-[44px_1fr] sm:p-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">Bạn nên làm gì ngay</h4>
                <ol className="mt-3 space-y-3">
                  {result.actionSteps.map((action, index) => (
                    <li key={`${action}-${index}`} className="flex items-start gap-3 text-sm leading-relaxed text-slate-600">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-black text-emerald-700">
                        {index + 1}
                      </span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>

          <div className="m-5 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 sm:m-7">
            <div className="flex items-start gap-2.5">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
              <p className="text-xs leading-relaxed text-indigo-900/75">{result.disclaimer}</p>
            </div>
          </div>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_14px_40px_-34px_rgba(15,23,42,0.35)]">
            <h3 className="text-sm font-extrabold text-slate-900">Thông tin liên quan</h3>
            <div className="mt-4 space-y-3">
              {(result.detectedBrandMismatch && result.mismatchDetails) || firstUrlSignal ? (
                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    <Globe2 className="h-3.5 w-3.5" />Tên miền
                  </div>
                  <p className="mt-2 break-all text-xs font-bold text-slate-800">
                    {result.mismatchDetails?.providedDomain || firstUrlSignal?.domain}
                  </p>
                  {result.detectedBrandMismatch && (
                    <span className="mt-2 inline-flex rounded-md bg-rose-100 px-2 py-1 text-[10px] font-bold text-rose-700">Không khớp tên miền chính thức</span>
                  )}
                </div>
              ) : null}

              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  <ShieldCheck className="h-3.5 w-3.5" />Safe Browsing
                </div>
                <p className={`mt-2 text-xs font-bold ${result.safeBrowsingStatus.hasMatch ? 'text-rose-700' : 'text-slate-700'}`}>
                  {result.safeBrowsingStatus.checked
                    ? result.safeBrowsingStatus.hasMatch
                      ? 'Có tín hiệu cảnh báo trong danh sách'
                      : 'Chưa ghi nhận cảnh báo công khai'
                    : 'Chưa thực hiện đối chiếu'}
                </p>
                {!result.safeBrowsingStatus.hasMatch && (
                  <p className="mt-1 text-[10px] leading-relaxed text-slate-400">Không có cảnh báo không đồng nghĩa đường link chắc chắn an toàn.</p>
                )}
              </div>

              {result.matchedInstitution && (
                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    <LockKeyhole className="h-3.5 w-3.5" />Tổ chức được nhắc tới
                  </div>
                  <p className="mt-2 text-xs font-bold text-slate-800">{result.matchedInstitution.name}</p>
                </div>
              )}

              {bank && (bank.accountNumber || bank.bankName || bank.accountHolder) && (
                <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-3.5">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-amber-600/70">
                    <CreditCard className="h-3.5 w-3.5" />Tài khoản nhận tiền
                  </div>
                  <div className="mt-2 space-y-1 text-xs text-slate-700">
                    {bank.bankName && <p><span className="text-slate-400">Ngân hàng:</span> <strong>{bank.bankName}</strong></p>}
                    {bank.accountNumber && <p><span className="text-slate-400">Số tài khoản:</span> <strong className="font-mono">{bank.accountNumber}</strong></p>}
                    {bank.accountHolder && <p><span className="text-slate-400">Người nhận:</span> <strong>{bank.accountHolder}</strong></p>}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_14px_40px_-34px_rgba(15,23,42,0.35)]">
            <h3 className="text-sm font-extrabold text-slate-900">Mẹo an toàn</h3>
            <ul className="mt-4 space-y-3">
              {safetyTips.map((tip, index) => (
                <li key={tip} className="flex items-start gap-2.5 text-[11px] leading-relaxed text-slate-600">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-[10px] font-black text-indigo-600">{index + 1}</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </motion.section>
  );
};
