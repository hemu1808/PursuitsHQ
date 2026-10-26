import https from 'node:https';
import type { TargetCompany } from './types.ts';

function fetchJson<T = any>(url: string): Promise<{ status: number; data?: T; text?: string }> {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode || 200, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode || 200, text: data });
        }
      });
    }).on('error', (err) => {
      resolve({ status: 500, text: err.message });
    });
  });
}

function stripHtml(html: string): string {
  return (html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function scanAshbyBoard(companyToken: string): Promise<TargetCompany[]> {
  const url = `https://api.ashbyhq.com/posting-api/job-board/${companyToken}`;
  const res = await fetchJson<{ jobs: any[] }>(url);
  if (res.status !== 200 || !res.data || !Array.isArray(res.data.jobs)) return [];

  return res.data.jobs.map((j) => ({
    company: companyToken,
    expectedRole: j.title,
    verifiedRoleTitle: j.title,
    location: j.location,
    ats: 'Ashby',
    requestedUrl: j.jobUrl || `https://jobs.ashbyhq.com/${companyToken}/${j.id}`,
    officialRoleUrl: j.jobUrl || `https://jobs.ashbyhq.com/${companyToken}/${j.id}`,
    status: 'Active exact role verified',
    completeJdText: stripHtml(j.descriptionHtml || '')
  }));
}

export async function scanGreenhouseBoard(boardToken: string): Promise<TargetCompany[]> {
  const url = `https://boards-api.greenhouse.io/v1/boards/${boardToken}/jobs`;
  const res = await fetchJson<{ jobs: any[] }>(url);
  if (res.status !== 200 || !res.data || !Array.isArray(res.data.jobs)) return [];

  return res.data.jobs.map((j) => ({
    company: boardToken,
    expectedRole: j.title,
    verifiedRoleTitle: j.title,
    location: j.location?.name,
    ats: 'Greenhouse',
    requestedUrl: j.absolute_url,
    officialRoleUrl: j.absolute_url,
    status: 'Active exact role verified',
    completeJdText: stripHtml(j.content || '')
  }));
}

export async function verifyRoleActive(url: string): Promise<{ active: boolean; title?: string; jdText?: string }> {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('ashbyhq.com')) {
      const parts = parsed.pathname.split('/').filter(Boolean);
      const company = parts[0];
      const jobId = parts[1];
      const apiRes = await fetchJson(`https://api.ashbyhq.com/posting-api/job-board/${company}`);
      if (apiRes.data?.jobs) {
        const found = apiRes.data.jobs.find((j: any) => j.id === jobId || parsed.href.includes(j.id));
        if (found) {
          return { active: true, title: found.title, jdText: stripHtml(found.descriptionHtml || '') };
        }
      }
    } else if (parsed.hostname.includes('greenhouse.io')) {
      const parts = parsed.pathname.split('/').filter(Boolean);
      const board = parts[0] === 'embed' ? parts[1] : parts[0];
      const jobId = parts.slice(-1)[0];
      const apiRes = await fetchJson(`https://boards-api.greenhouse.io/v1/boards/${board}/jobs/${jobId}`);
      if (apiRes.data && apiRes.data.title) {
        return { active: true, title: apiRes.data.title, jdText: stripHtml(apiRes.data.content || '') };
      }
    }
  } catch {}

  return { active: false };
}
