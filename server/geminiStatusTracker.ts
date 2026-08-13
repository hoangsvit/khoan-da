import { GoogleGenAI } from '@google/genai';

export interface GeminiStatusState {
  connected: boolean;
  status: 'ready' | 'rate_limited' | 'error' | 'not_configured';
  message: string;
  model: string;
  lastChecked: string;
}

let cachedStatus: GeminiStatusState = {
  connected: false,
  status: 'not_configured',
  message: 'Đang kiểm tra kết nối...',
  model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  lastChecked: new Date().toISOString()
};

let lastCheckTime = 0;

export function updateGeminiStatus(
  status: 'ready' | 'rate_limited' | 'error' | 'not_configured',
  customMessage?: string
): GeminiStatusState {
  const apiKey = String(process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    cachedStatus = {
      connected: false,
      status: 'not_configured',
      message: 'Chưa cấu hình API Key (GEMINI_API_KEY)',
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      lastChecked: new Date().toISOString()
    };
    return cachedStatus;
  }

  let defaultMsg = '';
  switch (status) {
    case 'ready':
      defaultMsg = 'Kết nối Gemini API sẵn sàng (Hoạt động bình thường)';
      break;
    case 'rate_limited':
      defaultMsg = 'Đang chạm giới hạn lượt gọi (429 Rate Limited) - Sử dụng bộ phân tích dự phòng';
      break;
    case 'error':
      defaultMsg = 'Gặp lỗi khi kết nối tới dịch vụ Gemini API';
      break;
    case 'not_configured':
      defaultMsg = 'Chưa cấu hình khóa API (GEMINI_API_KEY)';
      break;
  }

  cachedStatus = {
    connected: status === 'ready',
    status,
    message: customMessage || defaultMsg,
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash / 2.5-flash-lite',
    lastChecked: new Date().toISOString()
  };
  return cachedStatus;
}

export async function checkGeminiConnection(force = false): Promise<GeminiStatusState> {
  const apiKey = String(process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    return updateGeminiStatus('not_configured');
  }

  const now = Date.now();
  // Throttle automatic check unless forced or first time
  if (!force && now - lastCheckTime < 25000 && cachedStatus.status !== 'not_configured') {
    return cachedStatus;
  }
  lastCheckTime = now;

  try {
    const ai = new GoogleGenAI({ apiKey });
    await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: [{ role: 'user', parts: [{ text: 'ping' }] }],
      config: { maxOutputTokens: 2 }
    });
    return updateGeminiStatus('ready');
  } catch (err: any) {
    const msg = String(err?.message || err);
    if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('Quota exceeded')) {
      return updateGeminiStatus('rate_limited');
    }
    return updateGeminiStatus('error', `Lỗi kết nối: ${msg.slice(0, 100)}`);
  }
}

export function getCachedGeminiStatus(): GeminiStatusState {
  const apiKey = String(process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    return updateGeminiStatus('not_configured');
  }
  return cachedStatus;
}
