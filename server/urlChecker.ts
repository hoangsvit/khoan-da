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

const SHORTENER_DOMAINS = new Set([
  'bit.ly',
  'tinyurl.com',
  't.co',
  'is.gd',
  'shorturl.at',
  'v.gd',
  'cutt.ly',
  'goo.gl',
  'buff.ly',
  'ow.ly',
  'rb.gy',
  's.id',
  'tiny.cc',
  'linktr.ee'
]);

const SUSPICIOUS_PATH_KEYWORDS = [
  'login', 'xac-thuc', 'xacthuc', 'dinh-danh', 'dinhdanh', 'nhap-otp', 'nhapotp',
  'chuyen-tien', 'nhan-qua', 'truy-cap', 'vneid', 'bo-cong-an', 'tang-qua',
  'trung-thuong', 'khuyen-mai', 'nap-the', 'verify', 'update', 'security', 'account'
];

const EXEC_EXTENSIONS = ['.apk', '.exe', '.dmg', '.ipa', '.bat', '.msi', '.cmd', '.scr', '.vbs'];

export function analyzeUrl(urlString: string): URLCheckSignal {
  let urlToParse = urlString.trim();
  if (!/^https?:\/\//i.test(urlToParse)) {
    urlToParse = 'http://' + urlToParse;
  }

  let domain = '';
  let isIpHost = false;
  let isPunycode = false;
  let hasUserInfo = false;
  let isUrlShortener = false;
  let hasExcessiveSubdomains = false;
  let isApkOrExecutable = false;
  const suspiciousKeywords: string[] = [];
  const riskFlags: string[] = [];

  try {
    const parsed = new URL(urlToParse);
    domain = parsed.hostname.toLowerCase();

    // 1. IP Host check
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (ipRegex.test(domain)) {
      isIpHost = true;
      riskFlags.push('URL sử dụng địa chỉ IP làm tên miền (rất đáng ngờ, không phải tên miền chính thức)');
    }

    // 2. Punycode check
    if (domain.includes('xn--')) {
      isPunycode = true;
      riskFlags.push('Tên miền chứa ký tự Punycode (nguy cơ mạo danh bằng chữ cái đồng dạng/Homograph Attack)');
    }

    // 3. UserInfo check (e.g. http://vietcombank.com.vn@scam-site.com)
    if (parsed.username || parsed.password) {
      hasUserInfo = true;
      riskFlags.push('URL chứa UserInfo (kỹ thuật chèn tên thương hiệu trước ký tự @ để đánh lừa người dùng)');
    }

    // 4. URL Shortener check
    if (SHORTENER_DOMAINS.has(domain)) {
      isUrlShortener = true;
      riskFlags.push('Đường dẫn rút gọn (che giấu địa chỉ đích thực sự)');
    }

    // 5. Excessive subdomains check (>= 3 dots in hostname excluding tld like .com.vn)
    const domainParts = domain.split('.');
    if (domainParts.length >= 4 && !isIpHost) {
      hasExcessiveSubdomains = true;
      riskFlags.push('Tên miền có quá nhiều tên miền phụ (chèn từ khóa thương hiệu vào subdomain)');
    }

    // 6. APK or Executable link check
    const pathLower = parsed.pathname.toLowerCase();
    if (EXEC_EXTENSIONS.some(ext => pathLower.endsWith(ext)) || pathLower.includes('download-apk') || pathLower.includes('cai-dat')) {
      isApkOrExecutable = true;
      riskFlags.push('Đường dẫn tải tập tin thực thi/ứng dụng ngoài CH Play hay App Store (nguy cơ độc hại/APK lừa đảo)');
    }

    // 7. Suspicious path keywords
    const fullPathAndQuery = (parsed.pathname + parsed.search).toLowerCase();
    for (const kw of SUSPICIOUS_PATH_KEYWORDS) {
      if (fullPathAndQuery.includes(kw)) {
        suspiciousKeywords.push(kw);
      }
    }
  } catch {
    // Parsing error
    domain = urlString;
  }

  return {
    url: urlString,
    domain,
    isIpHost,
    isPunycode,
    hasUserInfo,
    isUrlShortener,
    hasExcessiveSubdomains,
    isApkOrExecutable,
    suspiciousKeywords,
    riskFlags
  };
}

/**
 * Extract URLs from raw text content
 */
export function extractUrlsFromText(text: string): string[] {
  const urlRegex = /(?:https?:\/\/|www\.)[^\s<>"'{}|\\^`\[\]]+/gi;
  const matches = text.match(urlRegex) || [];

  // Also match domain-like patterns if no protocol (e.g. vietcombank-dinhdanh.com/login)
  const plainDomainRegex = /\b(?:[a-zA-Z0-9-]+\.)+(?:com|vn|net|org|info|xyz|top|online|site|app|cc|club|vip|icu|tech)\b[^\s<>"'{}|\\^`\[\]]*/gi;
  const plainMatches = text.match(plainDomainRegex) || [];

  const combined = Array.from(new Set([...matches, ...plainMatches]));
  return combined;
}
