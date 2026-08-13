import React, { useRef, useState } from 'react';
import jsQR from 'jsqr';
import {
  Check,
  ImagePlus,
  Link2,
  Loader2,
  MessageSquareText,
  QrCode,
  RefreshCw,
  Search,
  ShieldCheck,
  Upload,
  X
} from 'lucide-react';
import { motion } from 'motion/react';

interface AnalysisFormProps {
  onAnalyze: (text: string, imageBase64?: string, mimeType?: string) => Promise<void>;
  isLoading: boolean;
  onClear: () => void;
}

const MAX_SOURCE_BYTES = 15 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 2200;
const MAX_DATA_URL_LENGTH = 7_000_000;

type InputTab = 'text' | 'link' | 'image';

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Không thể đọc tệp ảnh.'));
    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Không thể mở ảnh đã chọn.'));
    image.src = dataUrl;
  });
}

export const AnalysisForm: React.FC<AnalysisFormProps> = ({ onAnalyze, isLoading, onClear }) => {
  const [activeTab, setActiveTab] = useState<InputTab>('text');
  const [inputText, setInputText] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  const [qrDecodedText, setQrDecodedText] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [imagePreparing, setImagePreparing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 3200);
  };

  const processImageFile = async (file: File) => {
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      showNotice('Vui lòng chọn ảnh PNG, JPEG hoặc WebP.');
      return;
    }

    if (file.size > MAX_SOURCE_BYTES) {
      showNotice('Ảnh quá lớn. Vui lòng chọn ảnh dưới 15 MB.');
      return;
    }

    setImagePreparing(true);

    try {
      const originalDataUrl = await readFileAsDataUrl(file);
      const image = await loadImage(originalDataUrl);
      const longestSide = Math.max(image.naturalWidth, image.naturalHeight);
      const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(longestSide, 1));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) throw new Error('Trình duyệt không thể xử lý ảnh này.');

      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      let preparedDataUrl = canvas.toDataURL('image/png');
      if (preparedDataUrl.length > MAX_DATA_URL_LENGTH) preparedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      if (preparedDataUrl.length > MAX_DATA_URL_LENGTH) preparedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      if (preparedDataUrl.length > MAX_DATA_URL_LENGTH) {
        throw new Error('Ảnh vẫn quá lớn sau khi tối ưu. Hãy thử ảnh có độ phân giải thấp hơn.');
      }

      const preparedMime = preparedDataUrl.match(/^data:([^;]+);base64,/)?.[1] || 'image/jpeg';
      setImagePreview(preparedDataUrl);
      setImageBase64(preparedDataUrl);
      setImageMimeType(preparedMime);
      setActiveTab('image');

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const qr = jsQR(imageData.data, imageData.width, imageData.height);

      if (qr?.data) {
        setQrDecodedText(qr.data);
        setInputText(previous => {
          if (previous.includes(qr.data)) return previous;
          const qrContext = `[Nội dung QR đọc được: ${qr.data}]`;
          return previous.trim() ? `${previous.trim()}\n${qrContext}` : qrContext;
        });
        showNotice('Đã nhận ảnh và đọc được nội dung QR.');
      } else {
        setQrDecodedText(null);
        showNotice('Ảnh đã sẵn sàng để Gemini phân tích.');
      }
    } catch (error: any) {
      showNotice(error?.message || 'Không thể chuẩn bị ảnh. Vui lòng thử ảnh khác.');
    } finally {
      setImagePreparing(false);
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = event.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            event.preventDefault();
            void processImageFile(file);
            break;
          }
        }
      }
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) void processImageFile(file);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void processImageFile(file);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageBase64(null);
    setImageMimeType(null);
    setQrDecodedText(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!inputText.trim() && !imageBase64) return;
    void onAnalyze(inputText.trim(), imageBase64 || undefined, imageMimeType || undefined);
  };

  const handleClearAll = () => {
    setInputText('');
    setActiveTab('text');
    handleRemoveImage();
    onClear();
  };

  const tabs: Array<{ id: InputTab; label: string; icon: React.ReactNode }> = [
    { id: 'text', label: 'Nhập nội dung', icon: <MessageSquareText className="h-4 w-4" /> },
    { id: 'link', label: 'Dán URL / Link', icon: <Link2 className="h-4 w-4" /> },
    { id: 'image', label: 'Tải ảnh / Screenshot', icon: <ImagePlus className="h-4 w-4" /> }
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_18px_55px_-38px_rgba(15,23,42,0.38)]"
    >
      <div className="flex overflow-x-auto border-b border-slate-100 px-4 sm:px-6 scrollbar-none">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex shrink-0 items-center gap-2 px-4 py-4 text-xs font-bold transition sm:text-sm ${
              activeTab === tab.id ? 'text-indigo-700' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            {tab.icon}
            {tab.label}
            {activeTab === tab.id && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-indigo-600" />}
          </button>
        ))}
      </div>

      <div className="p-5 sm:p-6">
        <div className="relative">
          {activeTab === 'text' && (
            <textarea
              value={inputText}
              onChange={event => setInputText(event.target.value)}
              onPaste={handlePaste}
              placeholder="Dán tin nhắn, email, nội dung chat hoặc mô tả tình huống bạn đang nghi ngờ..."
              rows={7}
              className="min-h-[190px] w-full resize-y rounded-2xl border border-slate-200 bg-slate-50/40 p-4 text-sm leading-relaxed text-slate-800 outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-50 placeholder:text-slate-400"
            />
          )}

          {activeTab === 'link' && (
            <div className="space-y-4">
              <div className="flex min-h-[96px] items-center rounded-2xl border border-slate-200 bg-slate-50/40 px-4 transition focus-within:border-indigo-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-50">
                <Link2 className="mr-3 h-5 w-5 shrink-0 text-slate-400" />
                <input
                  value={inputText}
                  onChange={event => setInputText(event.target.value)}
                  placeholder="https://example.com/..."
                  className="w-full bg-transparent py-4 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Hệ thống không tự mở đường link trên trình duyệt của bạn. URL được phân tích và đối chiếu ở phía máy chủ.
              </p>
            </div>
          )}

          {activeTab === 'image' && (
            <div className="space-y-4">
              {!imagePreview ? (
                <div
                  onDragOver={event => {
                    event.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  onClick={() => !imagePreparing && fileInputRef.current?.click()}
                  className={`flex min-h-[190px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed p-6 text-center transition ${
                    dragActive ? 'border-indigo-400 bg-indigo-50' : 'border-slate-300 bg-slate-50/50 hover:border-indigo-300 hover:bg-indigo-50/40'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-indigo-600 shadow-sm">
                    {imagePreparing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                  </div>
                  <p className="mt-3 text-sm font-extrabold text-slate-800">{imagePreparing ? 'Đang chuẩn bị ảnh…' : 'Kéo thả hoặc chọn ảnh'}</p>
                  <p className="mt-1 text-xs text-slate-400">PNG, JPEG, WebP · tối đa 15 MB</p>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                  <div className="flex gap-4">
                    <img src={imagePreview} alt="Ảnh đã chọn" className="h-24 w-24 shrink-0 rounded-xl border border-white object-cover shadow-sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800"><ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />Ảnh đã sẵn sàng</p>
                          <p className="mt-1 text-[11px] leading-relaxed text-slate-500">Gemini sẽ đọc nội dung trực tiếp từ ảnh trước khi kết luận.</p>
                        </div>
                        <button type="button" onClick={handleRemoveImage} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white hover:text-rose-600">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      {qrDecodedText && (
                        <div className="mt-3 flex items-center gap-1.5 truncate rounded-lg bg-white px-2.5 py-2 text-[10px] font-semibold text-slate-600">
                          <QrCode className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
                          <span className="truncate font-mono">{qrDecodedText}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <textarea
                    value={inputText}
                    onChange={event => setInputText(event.target.value)}
                    placeholder="Mô tả thêm nếu cần (không bắt buộc)..."
                    rows={3}
                    className="mt-4 w-full resize-y rounded-xl border border-slate-200 bg-white p-3 text-xs leading-relaxed text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 placeholder:text-slate-400"
                  />
                </div>
              )}
            </div>
          )}

          {notice && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-3 top-3 flex max-w-[85%] items-center gap-1.5 rounded-xl bg-slate-950 px-3 py-2 text-[11px] font-medium text-white shadow-lg"
            >
              <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
              {notice}
            </motion.div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/45 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] font-semibold text-slate-400 sm:text-[11px]">
          <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />Không cần đăng nhập</span>
          <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-indigo-500" />Gemini đọc ngữ cảnh</span>
          <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-slate-500" />Không hiển thị debug kỹ thuật</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleClearAll}
            disabled={isLoading}
            className="flex h-10 items-center gap-1.5 rounded-xl px-3 text-xs font-bold text-slate-400 transition hover:bg-white hover:text-slate-700 disabled:opacity-40"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Xóa
          </button>
          <button
            type="submit"
            disabled={isLoading || imagePreparing || (!inputText.trim() && !imageBase64)}
            className="flex h-11 min-w-[150px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-5 text-sm font-extrabold text-white shadow-lg shadow-indigo-200/60 transition hover:brightness-105 disabled:pointer-events-none disabled:opacity-45"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            {isLoading ? 'Đang phân tích…' : 'Phân tích ngay'}
          </button>
        </div>
      </div>
    </form>
  );
};
