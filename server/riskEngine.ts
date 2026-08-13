import { Institution, isDomainVerifiedForEntity, matchInstitutionInText } from './registry';
import { analyzeUrl, URLCheckSignal } from './urlChecker';
import { SafeBrowsingResult } from './safeBrowsing';

export type RiskLevel = 'STOP' | 'CAUTION' | 'VERIFY' | 'NO_CLEAR_RISK';

export interface ExtractedSignals {
  claimedInstitution?: string;
  extractedUrls: string[];
  hasImageAttached?: boolean;
  ocrTextExtracted?: string;
  imageAnalysisSummary?: string;
  bankAccountDetails?: {
    accountNumber?: string;
    bankName?: string;
    accountHolder?: string;
  };
  actionsRequested: {
    clickLink: boolean;
    installApk: boolean;
    provideOtp: boolean;
    transferMoney: boolean;
    shareScreen: boolean;
    providePersonalId: boolean;
  };
  socialEngineeringSignals: {
    urgency: boolean;
    rewardOrThreat: boolean;
    impersonation: boolean;
    secrecy: boolean;
    unnaturalPhrasing: boolean;
    threatOrExtortion?: boolean;
  };
  rawSummary: string;
  scamCategory?: string;
  aiDetailedReasoning?: string;
  aiRiskLevel?: RiskLevel;
  aiHeadlineTitle?: string;
  aiHeadlineSubtitle?: string;
  aiRiskScoreDescription?: string;
  aiReasons?: string[];
  aiActionSteps?: string[];
  analysisEngine?: 'GEMINI_AI_100';
}

export interface RiskAnalysisResult {
  riskLevel: RiskLevel;
  headlineTitle: string;
  headlineSubtitle: string;
  riskScoreDescription: string;
  detectedBrandMismatch: boolean;
  mismatchDetails?: {
    claimedEntity: string;
    officialDomains: string[];
    providedDomain: string;
  };
  matchedInstitution?: {
    id: string;
    name: string;
    verification: string;
    officialDomains: string[];
    officialHotline?: string;
  };
  reasons: string[];
  actionSteps: string[];
  safeBrowsingStatus: SafeBrowsingResult;
  urlCheckSignals: URLCheckSignal[];
  extractedSignals: ExtractedSignals;
  disclaimer: string;
  scamCategory?: string;
  aiDetailedReasoning?: string;
  analysisEngine: 'GEMINI_AI_100';
}

const RISK_RANK: Record<RiskLevel, number> = {
  NO_CLEAR_RISK: 0,
  VERIFY: 1,
  CAUTION: 2,
  STOP: 3
};

function maxRiskLevel(a: RiskLevel, b: RiskLevel): RiskLevel {
  return RISK_RANK[a] >= RISK_RANK[b] ? a : b;
}

export function computeRiskAnalysis(
  extracted: ExtractedSignals,
  urls: string[],
  safeBrowsing: SafeBrowsingResult,
  userText: string
): RiskAnalysisResult {
  const urlCheckSignals = urls.map(url => analyzeUrl(url));

  // Local code is deliberately limited to technical verification.
  // It must not generate consumer-facing explanations or recommendations.
  const matchResult = matchInstitutionInText(extracted.claimedInstitution || userText);
  const matchedInst: Institution | undefined = matchResult?.entity;

  let detectedBrandMismatch = false;
  let mismatchDetails: RiskAnalysisResult['mismatchDetails'];

  if (matchedInst && matchedInst.verification === 'first_party_verified' && urlCheckSignals.length > 0) {
    for (const urlSig of urlCheckSignals) {
      if (!urlSig.domain) continue;

      const isVerified = isDomainVerifiedForEntity(urlSig.domain, matchedInst);
      if (!isVerified) {
        detectedBrandMismatch = true;
        mismatchDetails = {
          claimedEntity: matchedInst.name,
          officialDomains: matchedInst.domains,
          providedDomain: urlSig.domain
        };
        break;
      }
    }
  }

  let riskLevel: RiskLevel = extracted.aiRiskLevel || 'VERIFY';

  if (detectedBrandMismatch || safeBrowsing.hasMatch) {
    riskLevel = maxRiskLevel(riskLevel, 'STOP');
  }

  return {
    riskLevel,
    headlineTitle: extracted.aiHeadlineTitle || '',
    headlineSubtitle: extracted.aiHeadlineSubtitle || '',
    riskScoreDescription: extracted.aiRiskScoreDescription || '',
    scamCategory: extracted.scamCategory,
    aiDetailedReasoning: extracted.aiDetailedReasoning,
    analysisEngine: 'GEMINI_AI_100',
    detectedBrandMismatch,
    mismatchDetails,
    matchedInstitution: matchedInst ? {
      id: matchedInst.id,
      name: matchedInst.name,
      verification: matchedInst.verification,
      officialDomains: matchedInst.domains
    } : undefined,
    reasons: [...(extracted.aiReasons || [])],
    actionSteps: [...(extracted.aiActionSteps || [])],
    safeBrowsingStatus: safeBrowsing,
    urlCheckSignals,
    extractedSignals: extracted,
    disclaimer: 'Kết quả hỗ trợ nhận diện rủi ro và không phải là bảo đảm tuyệt đối về độ an toàn của nội dung.'
  };
}
