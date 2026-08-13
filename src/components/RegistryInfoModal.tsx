import React from 'react';
import { RegistryStats } from '../types';
import { X, Database, ShieldCheck, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';

interface RegistryInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats?: RegistryStats;
}

export const RegistryInfoModal: React.FC<RegistryInfoModalProps> = ({
  isOpen,
  onClose,
  stats
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 text-slate-800 space-y-5 shadow-2xl relative">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 tracking-tight">Cơ sở dữ liệu Tin cậy 2 Tầng Lớp</h3>
              <p className="text-xs text-slate-500 font-medium">Banking & Institution Registry System</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Summary Card */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
            <div className="text-2xl font-black text-blue-700">
              {stats?.officialBankEntities || 49}
            </div>
            <div className="text-[11px] text-slate-500 font-medium">Ngân hàng xác thực Domain</div>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
            <div className="text-2xl font-black text-emerald-700">
              {stats?.licensedForeignBranches || 50}
            </div>
            <div className="text-[11px] text-slate-500 font-medium">Chi nhánh NHNN cấp phép</div>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
            <div className="text-2xl font-black text-amber-700">
              {stats?.registryEntries || 100}
            </div>
            <div className="text-[11px] text-slate-500 font-medium">Tổng thực thể giám sát</div>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
            <div className="text-xs font-mono font-bold text-slate-800 mt-2">
              {stats?.licensedForeignBranchesAsOf || '2023-12-31'}
            </div>
            <div className="text-[11px] text-slate-500 font-medium">Thời điểm dữ liệu SBV</div>
          </div>
        </div>

        {/* Layer 1 Explanation */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-blue-700 uppercase tracking-widest flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            Tầng 1: Tên miền chính thức First-Party đã Xác thực (data/official-domains.json)
          </h4>
          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            Bao gồm 49 Ngân hàng thương mại Việt Nam, Ngân hàng liên doanh, Ngân hàng chính sách (Vietcombank, Techcombank, MBBank, BIDV, Agribank, VietinBank...) và Cổng Dịch vụ công Quốc gia (dichvucong.gov.vn).
            <br />
            <strong className="text-slate-900 font-bold">Quy tắc:</strong> Nếu tin nhắn tự xưng là thực thể thuộc Tầng 1 nhưng đường dẫn URL có tên miền KHÔNG khớp với danh sách domain chính thức, hệ thống sẽ BÁO BỘT GIẢ MẠO THƯƠNG HIỆU ngay lập tức!
          </p>
        </div>

        {/* Layer 2 Explanation */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-widest flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Tầng 2: Chi nhánh Ngân hàng Nước ngoài Cấp phép bởi NHNN (data/licensed-banks-sbv.json)
          </h4>
          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            Bao gồm 50 chi nhánh ngân hàng nước ngoài công bố chính thức theo dữ liệu Ngân hàng Nhà nước Việt Nam (SBV).
            <br />
            <strong className="text-slate-900 font-bold">Quy tắc an toàn:</strong> Nhóm này được đánh dấu <code className="bg-amber-100 border border-amber-200 text-amber-900 px-1 py-0.5 rounded">sbv_licensed_only</code> với <code className="bg-amber-100 border border-amber-200 text-amber-900 px-1 py-0.5 rounded">domains: []</code>. Chúng KHÔNG BAO GIỜ tự tạo ra tín hiệu giả mạo tên miền nhằm tránh cảnh báo sai do thiếu dữ liệu tên miền chính thức.
          </p>
        </div>

        {/* Alias Safety Rule */}
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-xs text-amber-950">
          <div className="font-bold flex items-center gap-1.5 text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Quy tắc khớp từ viết tắt (Alias Safety Matching):
          </div>
          <p className="text-[11px] leading-relaxed text-amber-900">
            Các tên viết tắt ngắn như <strong>MB, VIB, UOB, DBS, OCB</strong> bắt buộc sử dụng đối soát ranh giới từ độc lập (standalone-token boundary match) thay vì so khớp chuỗi thô. Điều này đảm bảo không báo nhầm khi các chữ cái đó xuất hiện ngẫu nhiên trong từ tiếng Anh/Việt bình thường (như "MEMBER", "SERVICE").
          </p>
        </div>

        <div className="pt-2 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
};
