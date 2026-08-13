export interface SafeBrowsingResult {
  checked: boolean;
  hasMatch: boolean;
  matches: string[];
  disclaimer: string;
}

export async function checkSafeBrowsing(urls: string[]): Promise<SafeBrowsingResult> {
  const apiKey = process.env.SAFE_BROWSING_API_KEY;

  const disclaimer = 'Lưu ý: Kết quả không tìm thấy mối đe dọa từ danh sách đen Safe Browsing CHỈ có nghĩa là trang web chưa bị ghi nhận công khai. Kết quả này KHÔNG đồng nghĩa trang web là "An toàn tuyệt đối".';

  if (!apiKey || apiKey.trim().length === 0 || urls.length === 0) {
    return {
      checked: false,
      hasMatch: false,
      matches: [],
      disclaimer
    };
  }

  try {
    const endpoint = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey.trim()}`;
    const threatEntries = urls.map(url => ({ url: url.startsWith('http') ? url : `http://${url}` }));

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client: {
          clientId: 'khoan-da-scam-precheck',
          clientVersion: '1.0.0'
        },
        threatInfo: {
          threatTypes: [
            'MALWARE',
            'SOCIAL_ENGINEERING',
            'UNWANTED_SOFTWARE',
            'POTENTIALLY_HARMFUL_APPLICATION'
          ],
          platformTypes: ['ANY_PLATFORM'],
          threatEntryTypes: ['URL'],
          threatEntries
        }
      })
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Suppress repeated warning for missing/invalid Safe Browsing API key
        return { checked: false, hasMatch: false, matches: [], disclaimer };
      }
      return { checked: false, hasMatch: false, matches: [], disclaimer };
    }

    const data = await response.json();
    if (data && data.matches && data.matches.length > 0) {
      const threatTypes = Array.from(new Set(data.matches.map((m: { threatType: string }) => m.threatType))) as string[];
      return {
        checked: true,
        hasMatch: true,
        matches: threatTypes,
        disclaimer
      };
    }

    return {
      checked: true,
      hasMatch: false,
      matches: [],
      disclaimer
    };
  } catch {
    return {
      checked: false,
      hasMatch: false,
      matches: [],
      disclaimer
    };
  }
}
