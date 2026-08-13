export type RiskLevel = 'STOP' | 'CAUTION' | 'VERIFY' | 'NO_CLEAR_RISK';

export type ConsumerMode = 'link' | 'message' | 'screenshot_qr' | 'call' | 'account' | 'threat' | 'recovery';

export interface URLCheckSignal {
  url: string;
  domain: string;
  isIpHost: boolean;
  isPunycode: boolean;
  hasUserInfo: boolean;
  isUrlShortener: boolean;
  hasExcessiveSubdomains: boolean;
  isApkOrExecutable: boolean;
  suspiciousKeywords: string[];
  riskFlags: string[];
}

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

export interface SafeBrowsingResult {
  checked: boolean;
  hasMatch: boolean;
  matches: string[];
  disclaimer: string;
}

export interface GeminiStatusInfo {
  connected: boolean;
  status: 'ready' | 'rate_limited' | 'error' | 'not_configured';
  message: string;
  model: string;
  lastChecked?: string;
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
  geminiStatus?: GeminiStatusInfo;
}

export interface RegistryStats {
  officialDomainEntities: number;
  officialBankEntities: number;
  licensedForeignBranches: number;
  licensedForeignBranchesAsOf: string;
  registryEntries: number;
}
