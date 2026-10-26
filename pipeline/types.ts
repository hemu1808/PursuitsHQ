export type RoleDomain = 
  | 'fullstack' 
  | 'ai' 
  | 'distributed' 
  | 'cloud' 
  | 'ml' 
  | 'healthcare' 
  | 'security' 
  | 'data';

export interface TargetCompany {
  id?: string;
  num?: number;
  company: string;
  expectedRole: string;
  verifiedRoleTitle?: string;
  level?: string;
  location?: string;
  ats?: string;
  requestedUrl?: string;
  officialRoleUrl?: string;
  status?: string;
  completeJdText?: string;
  notes?: string;
}

export interface TailoredBullets {
  leap: string[];
  smart: string[];
  speeler: string[];
  projOrder: string[];
}

export interface QualityReport {
  verdict: 'pass' | 'block' | 'fail';
  source?: string;
  sections?: {
    type: string;
    header: string;
    bullets: number;
  }[];
  totals?: {
    experienceEntries: number;
    projectEntries: number;
    bullets: number;
  };
  pdf?: {
    path: string;
    bytes: number;
    pages: number;
    extractedCharacters: number;
  };
  errors: string[];
  warnings: string[];
}

export interface StyleReport {
  verdict: 'pass' | 'fail';
  errors: string[];
}

export interface RoleReview {
  id: string;
  num: number;
  company: string;
  role: string;
  rawExpectedRole: string;
  domain: RoleDomain;
  folderSlug: string;
  exactUrl: string;
  roleLocation: string;
  folder: string;
  tex: string;
  pdf: string;
  pdfHash: string;
  summary: string;
  style: StyleReport;
  quality: QualityReport;
  pages?: number;
  readyToSubmit: boolean;
}

export interface ManifestData {
  createdAt: string;
  totalScanned: number;
  successfulCount: number;
  skippedCount: number;
  rows: RoleReview[];
  skipped: {
    num: number;
    company: string;
    role: string;
    ats: string;
    url: string;
    reason: string;
  }[];
}
