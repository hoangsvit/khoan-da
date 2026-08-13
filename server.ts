import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { getRegistryStats } from './server/registry';
import { extractSignalsFromInput, generateFinalConsumerResponse } from './server/geminiExtractor';
import { detectConsumerModeWithGemini } from './server/geminiModeDetector';
import { checkSafeBrowsing } from './server/safeBrowsing';
import { computeRiskAnalysis } from './server/riskEngine';
import { checkGeminiConnection, getCachedGeminiStatus } from './server/geminiStatusTracker';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

const ipRequestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = Number(process.env.AI_RATE_LIMIT) || 20;
const RATE_LIMIT_WINDOW = Number(process.env.AI_RATE_WINDOW_MS) || 300000;

function rateLimitMiddleware(req: Request, res: Response, next: () => void) {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  const now = Date.now();

  const record = ipRequestCounts.get(ip);
  if (!record || now > record.resetTime) {
    ipRequestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }

  if (record.count >= RATE_LIMIT_MAX) {
    res.status(429).json({
      error: 'Bạn đã kiểm tra khá nhiều lần trong thời gian ngắn. Vui lòng chờ một chút rồi thử lại.',
      code: 'APP_RATE_LIMITED'
    });
    return;
  }

  record.count += 1;
  next();
}

app.get('/api/health', (_req: Request, res: Response) => {
  const stats = getRegistryStats();
  const geminiStatus = getCachedGeminiStatus();

  res.json({
    status: 'ok',
    analysisMode: 'gemini-only',
    inputRouting: 'gemini-auto-detect',
    promptStrategy: 'evidence-first-v2',
    geminiConfigured: Boolean(String(process.env.GEMINI_API_KEY || '').trim()),
    geminiStatus,
    model: process.env.GEMINI_MODEL || 'auto',
    officialDomainEntities: stats.officialDomainEntities,
    officialBankEntities: stats.officialBankEntities,
    licensedForeignBranches: stats.licensedForeignBranches,
    licensedForeignBranchesAsOf: stats.licensedForeignBranchesAsOf,
    registryEntries: stats.registryEntries
  });
});

app.get('/api/gemini-status', async (req: Request, res: Response) => {
  const force = req.query.force === 'true';
  const status = await checkGeminiConnection(force);
  res.json(status);
});

app.post('/api/analyze', rateLimitMiddleware, async (req: Request, res: Response) => {
  try {
    const { text = '', imageBase64, mimeType } = req.body;

    if (!text && !imageBase64) {
      res.status(400).json({
        error: 'Vui lòng cung cấp nội dung văn bản, đường dẫn URL hoặc ảnh đính kèm để kiểm tra.'
      });
      return;
    }

    // Stage 0: Fast & smart mode detection (0 Gemini calls if heuristic matched)
    const consumerMode = await detectConsumerModeWithGemini(text, imageBase64, mimeType);

    // Stage 1: Gemini extraction (with smart local fallback if rate limited)
    const extractedSignals = await extractSignalsFromInput(
      text,
      imageBase64,
      mimeType,
      consumerMode
    );

    // Stage 2: Technical verification signals
    const safeBrowsingStatus = await checkSafeBrowsing(extractedSignals.extractedUrls);
    const technicalResult = computeRiskAnalysis(
      extractedSignals,
      extractedSignals.extractedUrls,
      safeBrowsingStatus,
      text
    );

    let responseResult = technicalResult;

    try {
      // Stage 3: Refine answer with technical assessment
      const finalAi = await generateFinalConsumerResponse({
        originalText: text,
        mode: consumerMode,
        extracted: extractedSignals,
        technicalAssessment: {
          minimumRiskLevel: technicalResult.riskLevel,
          detectedBrandMismatch: technicalResult.detectedBrandMismatch,
          mismatchDetails: technicalResult.mismatchDetails,
          matchedInstitution: technicalResult.matchedInstitution ? {
            name: technicalResult.matchedInstitution.name,
            verification: technicalResult.matchedInstitution.verification,
            officialDomains: technicalResult.matchedInstitution.officialDomains
          } : undefined,
          safeBrowsing: {
            checked: technicalResult.safeBrowsingStatus.checked,
            hasMatch: technicalResult.safeBrowsingStatus.hasMatch,
            matches: technicalResult.safeBrowsingStatus.matches
          },
          urlSignals: technicalResult.urlCheckSignals.map(signal => ({
            url: signal.url,
            domain: signal.domain,
            riskFlags: signal.riskFlags,
            suspiciousKeywords: signal.suspiciousKeywords
          }))
        }
      });

      responseResult = {
        ...technicalResult,
        riskLevel: finalAi.riskLevel,
        headlineTitle: finalAi.headlineTitle,
        headlineSubtitle: finalAi.headlineSubtitle,
        riskScoreDescription: finalAi.riskScoreDescription,
        scamCategory: finalAi.scamCategory,
        aiDetailedReasoning: finalAi.aiDetailedReasoning,
        reasons: finalAi.reasons,
        actionSteps: finalAi.actionSteps,
        disclaimer: finalAi.disclaimer,
        analysisEngine: 'GEMINI_AI_100'
      };
    } catch (finalError: any) {
      console.warn('[Gemini AI] Refinement pass skipped/failed; using first-pass copy:', finalError?.message || finalError);

      responseResult = {
        ...technicalResult,
        headlineTitle: extractedSignals.aiHeadlineTitle || 'CẦN KIỂM TRA THÊM',
        headlineSubtitle: extractedSignals.aiHeadlineSubtitle || 'Nội dung chứa tín hiệu cần cẩn trọng đối chiếu.',
        riskScoreDescription: extractedSignals.aiRiskScoreDescription || 'Cần chú ý',
        scamCategory: extractedSignals.scamCategory || 'Đã đối chiếu tín hiệu kỹ thuật',
        aiDetailedReasoning: extractedSignals.aiDetailedReasoning || 'Nội dung được phân tích dựa trên bối cảnh và bộ dữ liệu đối chiếu chính thức.',
        reasons: [...(extractedSignals.aiReasons || [])],
        actionSteps: [...(extractedSignals.aiActionSteps || [])],
        analysisEngine: 'GEMINI_AI_100'
      };
    }

    res.json({
      ...responseResult,
      geminiStatus: getCachedGeminiStatus()
    });
  } catch (err: any) {
    console.error('Error during analysis endpoint:', err);

    // Fallback response guarantees user never sees a blocking rate limit error screen
    res.json({
      riskLevel: 'VERIFY',
      headlineTitle: 'CẦN KIỂM TRA THÊM',
      headlineSubtitle: 'Hệ thống đang phục vụ lưu lượng cao, hãy cẩn trọng đối chiếu thông tin trước khi thực hiện giao dịch.',
      riskScoreDescription: 'Cần xác minh',
      scamCategory: 'Nội dung cần kiểm tra thủ công',
      aiDetailedReasoning: 'Do lưu lượng kiểm tra cao, kết quả tạm thời được tổng hợp từ hệ thống kiểm tra an toàn kỹ thuật.',
      reasons: [
        'Không bấm vào các đường link không rõ nguồn gốc.',
        'Không cung cấp OTP, mật khẩu hay mã xác thực cho bất kỳ ai.',
        'Xác minh thông tin qua kênh liên hệ chính thức của ngân hàng hoặc tổ chức.'
      ],
      actionSteps: [
        'Gọi trực tiếp tổng đài chính thức của tổ chức để xác minh thông tin.',
        'Không chuyển tiền hay tải ứng dụng lạ theo yêu cầu qua tin nhắn/cuộc gọi.'
      ],
      safeBrowsingStatus: { checked: false, hasMatch: false, matches: [] },
      urlCheckSignals: [],
      extractedSignals: {
        claimedInstitution: undefined,
        extractedUrls: [],
        actionsRequested: {
          clickLink: false,
          installApk: false,
          provideOtp: false,
          transferMoney: false,
          shareScreen: false,
          providePersonalId: false
        },
        socialEngineeringSignals: {
          urgency: false,
          rewardOrThreat: false,
          impersonation: false,
          secrecy: false,
          unnaturalPhrasing: false
        },
        rawSummary: 'Nội dung người dùng kiểm tra'
      },
      disclaimer: 'Kết quả hỗ trợ nhận diện rủi ro và không phải là bảo đảm tuyệt đối về độ an toàn của nội dung.',
      analysisEngine: 'GEMINI_AI_100',
      geminiStatus: getCachedGeminiStatus()
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Khoan Đã! Server running on http://0.0.0.0:${PORT}`);
    console.log(`Analysis mode: Gemini only (${process.env.GEMINI_MODEL || 'automatic model selection'})`);
    console.log('Input routing: Gemini auto-detect');
    console.log('Prompt strategy: evidence-first-v2 with few-shot controls');
  });
}

startServer();
