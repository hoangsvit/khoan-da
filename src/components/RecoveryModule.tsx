import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, Phone, Smartphone, Lock, RefreshCw, Radio, CheckSquare, Square, Shield, ExternalLink, Search, Copy, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface RecoveryStep {
  title: string;
  description: string;
  urgency: 'critical' | 'high' | 'medium';
  actionButtonText?: string;
  contactNumber?: string;
}

export const RecoveryModule: React.FC = () => {
  const [selectedActions, setSelectedActions] = useState<{ [key: string]: boolean }>({
    clickedLink: false,
    enteredOtp: false,
    installedApk: false,
    sharedScreen: false,
    scannedQr: false,
    transferredMoney: false
  });

  const [completedSteps, setCompletedSteps] = useState<{ [key: number]: boolean }>({});
  const [bankSearch, setBankSearch] = useState('');
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  const toggleAction = (key: string) => {
    setSelectedActions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleCompletedStep = (idx: number) => {
    setCompletedSteps(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const getEmergencySteps = (): RecoveryStep[] => {
    const steps: RecoveryStep[] = [];

    // Flight mode / Isolation rule
    if (selectedActions.installedApk || selectedActions.sharedScreen) {
      steps.push({
        title: 'BẬT CHẾ ĐỘ MÁY BAY NGAY LẬP TỨC (NGẮT INTERNET)',
        description: 'Nếu bạn đã lỡ cài file APK hoặc bật AnyDesk/TeamViewer, đối tượng có thể đang điều khiển máy từ xa. Bật Chế độ máy bay (Flight Mode) và tắt Wi-Fi, 4G/5G ngay lập tức để cắt đứt lệnh điều khiển!',
        urgency: 'critical'
      });
    }

    // Lock Bank accounts / Passwords
    if (selectedActions.enteredOtp || selectedActions.transferredMoney || selectedActions.installedApk) {
      steps.push({
        title: 'KHÓA TÀI KHOẢN NGÂN HÀNG & BÁO TỔNG ĐÀI KHẨN CẤP',
        description: 'Gọi ngay tới tổng đài hỗ trợ khẩn cấp của ngân hàng để yêu cầu KÍCH HOẠT TÍNH NĂNG KHÓA THẺ & TÀI KHOẢN TỰ ĐỘNG. Hoặc sử dụng tính năng "Khóa thẻ khẩn cấp" trên ứng dụng Mobile Banking nếu còn truy cập được.',
        urgency: 'critical'
      });
    }

    // Reset passwords from CLEAN device
    if (selectedActions.enteredOtp) {
      steps.push({
        title: 'ĐỔI MẬT KHẨU TÀI KHOẢN TỪ MỘT THIẾT BỊ AN TOÀN KHÁC',
        description: 'Sử dụng một chiếc điện thoại hoặc máy tính an toàn khác (không bị nhiễm mã độc) để đổi mật khẩu Ngân hàng, Email, Zalo, VNeID và đăng xuất tất cả các thiết bị cũ.',
        urgency: 'high'
      });
    }

    // Uninstall APK / Reset Phone
    if (selectedActions.installedApk) {
      steps.push({
        title: 'KHÔI PHỤC CÀI ĐẶT GỐC ĐIỆN THOẠI (FACTORY RESET)',
        description: 'Ứng dụng APK độc hại có thể đã cắm mã độc sâu vào hệ điều hành Android. Hãy sao lưu ảnh/dữ liệu cá nhân sang thiết bị khác và tiến hành Khôi phục cài đặt gốc (Factory Reset) để sạch triệt để.',
        urgency: 'high'
      });
    }

    // Lock SIM / Call Telecom
    if (selectedActions.enteredOtp || selectedActions.installedApk) {
      steps.push({
        title: 'TẠM KHÓA SIM ĐIỆN THOẠI (NẾU BỊ CẮT SÓNG HOẶC MẤT SIM)',
        description: 'Liên hệ nhà mạng (Viettel 18008098, Vinaphone 18001091, Mobifone 18001090) để tạm khóa SIM phòng trường hợp bị chiếm quyền SIM (SIM Swap attack) nhận OTP.',
        urgency: 'medium'
      });
    }

    // Report to Police / Authorities
    if (selectedActions.transferredMoney || selectedActions.enteredOtp || selectedActions.installedApk) {
      steps.push({
        title: 'TRÌNH BÁO CƠ QUAN CÔNG AN & CỤC AN TOÀN THÔNG TIN',
        description: 'Thu thập tất cả bằng chứng (ảnh chụp tin nhắn, số tài khoản nhận tiền, nhật ký cuộc gọi) và đến Cơ quan Công an phường/xã gần nhất hoặc gửi phản ánh tới Cục An toàn thông tin (Bộ Thông tin & Truyền thông).',
        urgency: 'high'
      });
    }

    // Fallback default step
    if (steps.length === 0) {
      steps.push({
        title: 'HƯỚNG DẪN XỬ LÝ AN TOÀN CHUNG',
        description: 'Tích chọn các ô hành động bạn đã lỡ thực hiện ở trên để hệ thống tạo danh sách các bước ứng phó khẩn cấp phù hợp nhất!',
        urgency: 'medium'
      });
    }

    return steps;
  };

  const steps = getEmergencySteps();
  const completedCount = steps.filter((_, idx) => completedSteps[idx]).length;

  const bankHotlines = [
    { name: 'Vietcombank', phone: '1900545413' },
    { name: 'Techcombank', phone: '1800588822' },
    { name: 'MBBank', phone: '1900545426' },
    { name: 'BIDV', phone: '19009247' },
    { name: 'Agribank', phone: '1900558818' },
    { name: 'VietinBank', phone: '1900558868' },
    { name: 'VPBank', phone: '1900545415' },
    { name: 'TPBank', phone: '1900585885' },
    { name: 'ACB', phone: '1900545486' },
    { name: 'Sacombank', phone: '1900545438' },
    { name: 'VIB', phone: '18008180' },
    { name: 'HDBank', phone: '19006060' },
    { name: 'MSB', phone: '19006083' },
    { name: 'SHB', phone: '1900588885' },
    { name: 'OCB', phone: '18006678' },
  ];

  const filteredHotlines = bankSearch.trim()
    ? bankHotlines.filter(b => b.name.toLowerCase().includes(bankSearch.toLowerCase()) || b.phone.includes(bankSearch))
    : bankHotlines;

  const handleCopyPhone = (phone: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 text-slate-800 space-y-6 shadow-sm"
    >
      {/* Header Banner */}
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 shrink-0 shadow-2xs">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-red-950 uppercase tracking-tight flex items-center gap-2">
            <span>QUY TRÌNH XỬ LÝ KHẨN CẤP: "TÔI ĐÃ LỠ LÀM THEO"</span>
            <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded font-black">KHẨN CẤP</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Xử lý 100% cục bộ trên thiết bị của bạn. Không lưu trữ hay chia sẻ thông tin cá nhân.
          </p>
        </div>
      </div>

      {/* Checkboxes for user actions */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
          Tích chọn các hành động bạn đã thực hiện theo yêu cầu đối phương:
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {[
            { id: 'clickedLink', label: '🔗 Tôi đã bấm vào đường dẫn (URL) lạ' },
            { id: 'enteredOtp', label: '🔑 Tôi đã nhập Mật khẩu / mã OTP' },
            { id: 'installedApk', label: '📲 Tôi đã tải & cài đặt file APK / App lạ' },
            { id: 'sharedScreen', label: '🖥️ Tôi đã bật AnyDesk / Chia sẻ màn hình' },
            { id: 'scannedQr', label: '📷 Tôi đã quét mã QR nghi ngờ' },
            { id: 'transferredMoney', label: '💸 Tôi đã chuyển tiền vào tài khoản được chỉ định' },
          ].map(item => {
            const isChecked = selectedActions[item.id];
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleAction(item.id)}
                className={`flex items-center gap-3 p-3.5 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                  isChecked
                    ? 'bg-amber-50/90 border-amber-300 text-amber-950 font-bold shadow-2xs'
                    : 'bg-slate-50/70 border-slate-200/80 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {isChecked ? (
                  <CheckSquare className="w-4 h-4 text-amber-600 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Generated Action Checklist */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" />
            Danh sách các bước ứng phó tức thì ({steps.length} bước)
          </h3>
          {steps.length > 0 && (
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
              Đã xong {completedCount}/{steps.length}
            </span>
          )}
        </div>

        <div className="space-y-3">
          {steps.map((step, idx) => {
            const isDone = !!completedSteps[idx];
            return (
              <div
                key={idx}
                onClick={() => toggleCompletedStep(idx)}
                className={`p-4 rounded-xl border space-y-1.5 cursor-pointer transition-all ${
                  isDone
                    ? 'bg-slate-100/80 border-slate-200 text-slate-500 opacity-70 line-through'
                    : step.urgency === 'critical'
                    ? 'bg-red-50/90 border-red-300 text-red-950'
                    : step.urgency === 'high'
                    ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <div className="font-bold text-sm tracking-tight flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-mono text-[10px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span>{step.title}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase shrink-0 ${
                    isDone
                      ? 'bg-slate-200 text-slate-600'
                      : step.urgency === 'critical'
                      ? 'bg-red-600 text-white'
                      : step.urgency === 'high'
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-blue-600 text-white'
                  }`}>
                    {isDone ? 'ĐÃ THỰC HIỆN' : step.urgency === 'critical' ? 'LÀM NGAY' : step.urgency === 'high' ? 'ƯU TIÊN HÀNG ĐẦU' : 'CẦN THIẾT'}
                  </span>
                </div>
                <p className="text-xs leading-relaxed opacity-90 pl-7">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Emergency Bank Hotlines Quick Access */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
            <Phone className="w-4 h-4 text-emerald-600" />
            Hotline Khóa Tài Khoản Khẩn Cấp Các Ngân Hàng:
          </h4>

          {/* Quick Bank Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={bankSearch}
              onChange={(e) => setBankSearch(e.target.value)}
              placeholder="Tìm ngân hàng (VD: Vietcombank, MB...)"
              className="pl-8 pr-3 py-1 bg-white border border-slate-200 focus:border-slate-400 rounded-lg text-xs text-slate-800 placeholder-slate-400 w-full sm:w-56"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {filteredHotlines.map((bank, i) => (
            <div
              key={i}
              className="p-2.5 bg-white hover:bg-slate-100/80 border border-slate-200 rounded-xl transition-all shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="text-[11px] text-slate-500 font-bold truncate">{bank.name}</div>
                <a
                  href={`tel:${bank.phone}`}
                  className="text-xs font-mono font-bold text-emerald-700 hover:underline block mt-0.5"
                >
                  {bank.phone}
                </a>
              </div>
              <button
                type="button"
                onClick={(e) => handleCopyPhone(bank.phone, e)}
                className="mt-2 text-[10px] text-slate-500 hover:text-slate-900 bg-slate-50 hover:bg-slate-200/80 p-1 rounded border border-slate-200 font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                {copiedPhone === bank.phone ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>Đã chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-slate-500" />
                    <span>Sao chép</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

