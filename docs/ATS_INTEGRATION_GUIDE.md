# ATS Platform Integration & Crawling Guide

This document details the public API endpoints, scraping mechanics, and status detection rules used by PursuitsHQ to automatically discover and verify active job postings across major Applicant Tracking Systems (ATS).

---

## 1. Ashby (`jobs.ashbyhq.com`)

Ashby powers job applications for fast-growing tech companies (e.g. Niural, RunPod, Svix, Checkly, Fullstory).

### Public API Endpoint
```http
GET https://api.ashbyhq.com/posting-api/job-board/{companyToken}
```
- **Authentication**: None required.
- **Payload Response**:
  ```json
  {
    "apiVersion": "0.1",
    "jobs": [
      {
        "id": "b64a3935-931a-4b7f-9899-7ebe152164c5",
        "title": "Software Engineer (Full-Stack)",
        "location": "Remote - USA",
        "department": "Engineering",
        "employmentType": "FullTime",
        "jobUrl": "https://jobs.ashbyhq.com/{companyToken}/{id}",
        "descriptionHtml": "<p>...</p>"
      }
    ]
  }
  ```
- **Verification Rule**:
  - If the job ID exists in `jobs[]`, the posting is **Active**.
  - If the board exists but the job ID is missing, the role is **Closed**.
  - Alternative role discovery: Filter `jobs[]` by title matching `/software|engineer|developer/i` and non-staff levels.

---

## 2. Greenhouse (`boards.greenhouse.io` & `job-boards.greenhouse.io`)

Greenhouse is the enterprise standard for scaled startups and tech giants (e.g. PagerDuty, PlanetScale, Pulumi, Geotab, Diligent).

### Public API Endpoints
1. **List all open jobs**:
   ```http
   GET https://boards-api.greenhouse.io/v1/boards/{boardToken}/jobs
   ```
2. **Retrieve single job details**:
   ```http
   GET https://boards-api.greenhouse.io/v1/boards/{boardToken}/jobs/{jobId}?content=true
   ```
- **Payload Response**:
  ```json
  {
    "id": 6216870004,
    "title": "Forward Deployed Engineer (SDEV)",
    "location": { "name": "Remote (USA - New York City, NY)" },
    "departments": [{ "name": "Engineering" }],
    "absolute_url": "https://job-boards.greenhouse.io/{boardToken}/jobs/6216870004",
    "content": "&lt;p&gt;...&lt;/p&gt;"
  }
  ```
- **Verification Rule**:
  - `status: 200` with non-empty content indicates **Active**.
  - `status: 404` or redirect to general board indicates **Closed**.

---

## 3. Lever (`jobs.lever.co`)

### Public API Endpoint
```http
GET https://api.lever.co/v0/postings/{companyToken}?mode=json
```
- **Payload Response**:
  ```json
  [
    {
      "id": "e9b58d24-3456-...",
      "text": "Backend Software Engineer",
      "categories": {
        "location": "San Francisco, CA",
        "team": "Platform"
      },
      "hostedUrl": "https://jobs.lever.co/{companyToken}/{id}",
      "descriptionPlain": "..."
    }
  ]
  ```

---

## 4. Workable (`apply.workable.com`)

### Public Endpoint
```http
GET https://apply.workable.com/api/v3/accounts/{accountSubdomain}/jobs
```
- Provides JSON listing of active vacancies, employment types, and departmental filters.

---

## 5. Rippling (`ats.rippling.com`)

- Public job boards render clean JSON state in `window.__INITIAL_STATE__` or direct GraphQL endpoints.
- Requisitions specify remote status, compensation ranges, and experience requirements.

---

## 6. URL Canonicalization & Deduplication

To prevent duplicate submissions across differing URL structures (e.g. `job-boards.greenhouse.io` vs `boards.greenhouse.io` vs `utm_*` tracking query strings), the pipeline runs `canonicalJobUrl()`:

1. Strip trailing slashes, `/apply`, `/confirmation`, and hash anchors (`#*`).
2. Normalize hostname (e.g. `boards.greenhouse.io` -> `job-boards.greenhouse.io`).
3. Strip all tracking and referral parameters:
   `utm_*`, `ref`, `source`, `gh_src`, `tracking`, `trk`, `gclid`, `fbclid`, `lever-*`.
4. Sort remaining query parameters alphabetically.
5. Store lowercase canonical string as the unique key in `applications.ndjson`.
