# Application Submission & Ledger Tracking Protocol

This document outlines the operational rules, safety boundaries, and append-only ledger management derived from the `job-application-agent` model.

---

## 1. Safety & Verification Rules

1. **Candidate Verification Only**:
   - Apply only with the candidate's verified profile data and canonical tailored resume.
   - Never invent or infer answers to application questions.
   - For judgment-only or narrative questions, adhere to grounded facts from `cv.groundtruth.md`.
2. **Never Store or Handle Sensitive Secrets**:
   - Never store passwords, MFA codes, government IDs (SSN, national ID), or payment credentials.
   - Pause for candidate input if CAPTCHA or multi-factor authentication appears.

---

## 2. Duplicate Prevention & Cooldown Rules

Before submitting any application, the engine executes two deterministic checks:

### A. Requisition Duplicate Check
- Resolves the target URL to its canonical form via `canonicalJobUrl()`.
- If an entry in `applications.ndjson` matches the canonical URL or employer Job ID, the application is **halted immediately** as a duplicate.

### B. 15-Day Company Reapplication Cooldown
- If an application was already submitted to the same company within the last **15 calendar days** without an outcome, the engine blocks automatic submission (`cooldown-active`).
- This prevents candidate fatigue and avoids tripping ATS spam/rate-limit filters.

---

## 3. Append-Only Ledger Specifications

All activity is tracked using line-delimited JSON (`.ndjson`). Historical records are strictly append-only; entries are never deleted or modified in place.

### A. `applications.ndjson`
Appended immediately upon visible confirmation of a successful submission:
```json
{
  "id": "app_9f81a7b2c01d",
  "company": "Niural",
  "role": "Frontend Developer",
  "url": "https://jobs.ashbyhq.com/niural/f0f269d3-4d4e-4401-8942-a36b4f2e8a9a",
  "canonicalUrl": "https://jobs.ashbyhq.com/niural/f0f269d3-4d4e-4401-8942-a36b4f2e8a9a",
  "ats": "Ashby",
  "resumePath": "D:/repos/PursuitsHQ/output/submission-preparation-2026-10-24/021-niural-frontend-developer/resume.pdf",
  "resumeHash": "8a99b415b6893fd50d31d22079063e8e8802cf0b63361ddb188d7637c90bfe1e",
  "submittedAt": "2026-10-24T20:23:00.000Z",
  "status": "submitted",
  "source": "companieslist.txt",
  "answers": {
    "Full Name": "Hemanth Kumar Mangalapurapu",
    "Email": "hemum1808@gmail.com",
    "Phone": "(484) 320-7214",
    "LinkedIn": "https://linkedin.com/in/hemu1808",
    "GitHub": "https://github.com/hemu1808",
    "Portfolio": "https://hemu1808.github.io/swe/",
    "Work Authorization": "Authorized to work in the US with no sponsorship required"
  }
}
```

### B. `outcomes.ndjson`
Appended upon receipt of recruiter outreach, screening invitation, interview scheduling, or requisition closure:
```json
{
  "id": "app_9f81a7b2c01d",
  "company": "Niural",
  "occurredAt": "2026-10-28T14:30:00.000Z",
  "status": "interview",
  "note": "Technical screening scheduled with VP of Engineering."
}
```

---

## 4. Lifecycle Stages in PursuitsHQ

```
[Target List] -> [Live Verified] -> [Prepared Resume] -> [Submitted] -> [Screening / Interview] -> [Offer]
                                                                     \-> [Rejected / Closed]
```

- **Prepared**: Tailored 2-page PDF compiled, quality gate passed, visual proof rendered.
- **Submitted**: Application confirmed sent with logged SHA-256 PDF hash.
- **Screening / Interview**: Recruiter outreach or technical round scheduled.
- **Archived / Closed**: Role expired or rejected.
