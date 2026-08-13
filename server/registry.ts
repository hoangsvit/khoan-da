import fs from 'fs';
import path from 'path';

export interface Institution {
  id: string;
  name: string;
  aliases: string[];
  domains: string[];
  institution_type?: string;
  verification: 'first_party_verified' | 'sbv_licensed_only';
  first_party_source?: string;
  sbv_licensing_source?: string;
  as_of?: string;
}

export interface RegistryStats {
  officialDomainEntities: number;
  officialBankEntities: number;
  licensedForeignBranches: number;
  licensedForeignBranchesAsOf: string;
  registryEntries: number;
}

let officialDomains: Institution[] = [];
let licensedForeignBranches: Institution[] = [];
let isLoaded = false;

function loadRegistry() {
  if (isLoaded) return;
  try {
    const officialPath = path.join(process.cwd(), 'data', 'official-domains.json');
    const licensedPath = path.join(process.cwd(), 'data', 'licensed-banks-sbv.json');

    if (fs.existsSync(officialPath)) {
      officialDomains = JSON.parse(fs.readFileSync(officialPath, 'utf-8'));
    }
    if (fs.existsSync(licensedPath)) {
      licensedForeignBranches = JSON.parse(fs.readFileSync(licensedPath, 'utf-8'));
    }
    isLoaded = true;
  } catch (err) {
    console.error('Failed to load institution registry:', err);
  }
}

export function getRegistryStats(): RegistryStats {
  loadRegistry();
  const officialBankEntities = officialDomains.filter(e => e.id !== 'dvc_gov').length;
  const officialDomainEntities = officialDomains.length;
  const licensedCount = licensedForeignBranches.length;
  const asOf = licensedForeignBranches[0]?.as_of || '2023-12-31';

  return {
    officialDomainEntities,
    officialBankEntities,
    licensedForeignBranches: licensedCount,
    licensedForeignBranchesAsOf: asOf,
    registryEntries: officialDomainEntities + licensedCount,
  };
}

export function getOfficialDomains(): Institution[] {
  loadRegistry();
  return officialDomains;
}

export function getLicensedForeignBranches(): Institution[] {
  loadRegistry();
  return licensedForeignBranches;
}

/**
 * Safely match an organization alias inside text.
 * Short aliases (<=4 chars, e.g., MB, VIB, UOB, DBS, OCB) MUST use standalone-token regex matching
 * to prevent false matching inside unrelated words like "MEMBER", "SERVICE", "COMBINE", etc.
 */
export function matchInstitutionInText(text: string): { entity: Institution; matchedAlias: string } | null {
  loadRegistry();
  const allEntities = [...officialDomains, ...licensedForeignBranches];
  const normalizedText = text.toLowerCase();

  for (const entity of allEntities) {
    // Check full name first
    if (normalizedText.includes(entity.name.toLowerCase())) {
      return { entity, matchedAlias: entity.name };
    }

    // Check aliases
    for (const alias of entity.aliases) {
      if (!alias) continue;
      const aliasClean = alias.trim();
      if (aliasClean.length <= 4) {
        // Standalone token boundary match for short aliases (case-insensitive)
        const regex = new RegExp(`(?:^|[^a-zA-Z0-9àáảãạăắằẳẵặânấầnẩẫậèéẻẽẹêếềểễệđìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ])${escapeRegex(aliasClean)}(?:$|[^a-zA-Z0-9àáảãạăắằẳẵặânấầnẩẫậèéẻẽẹêếềểễệđìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ])`, 'i');
        if (regex.test(text)) {
          return { entity, matchedAlias: aliasClean };
        }
      } else {
        if (normalizedText.includes(aliasClean.toLowerCase())) {
          return { entity, matchedAlias: aliasClean };
        }
      }
    }
  }

  return null;
}

function escapeRegex(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Checks if a given domain matches any of the entity's verified first-party domains.
 */
export function isDomainVerifiedForEntity(domain: string, entity: Institution): boolean {
  if (!entity.domains || entity.domains.length === 0) {
    return false; // sbv_licensed_only or no domain entries
  }

  const cleanDomain = domain.toLowerCase().replace(/^www\./, '');

  return entity.domains.some(offDomain => {
    const cleanOff = offDomain.toLowerCase().replace(/^www\./, '');
    // Exact match or subdomain of verified domain (e.g. ebaking.vietcombank.com.vn matches vietcombank.com.vn)
    return cleanDomain === cleanOff || cleanDomain.endsWith('.' + cleanOff);
  });
}
