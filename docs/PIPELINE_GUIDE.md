# PursuitsHQ Pipeline Guide

This guide provides the minute-by-minute operational runbook for executing an application preparation batch using the PursuitsHQ engine.

---

## Prerequisites

1. **Node.js**: v22.20.0 or higher.
2. **Tectonic**: A modern standalone LaTeX compiler (`tectonic.exe` on PATH or configured in pipeline).
3. **MuPDF**: `mutool.exe` for rendering high-speed visual proof PNGs.
4. **Master Templates**: Ensure `templates/resume.master.tex` and `templates/cv.groundtruth.md` are present.

---

## Step-by-Step Execution Workflow

### Step 1: Ingest the Target Company List
Place your target list of companies in a plain text file (e.g. `companieslist.txt` on Desktop or `data/companieslist.txt`):
```text
1. Achira
2. Abridge
3. Attio
4. Basis-ai
...
```

### Step 2: Live ATS Verification & Role Discovery
Run the scanner to crawl the ATS platforms (Ashby, Greenhouse, Lever, etc.) for each company:
```sh
npm run pipeline:scan -- --input=data/companieslist.txt
```
- The scanner queries public ATS endpoints directly.
- It identifies active roles matching target seniority (3+ years experience, Mid/Senior IC).
- For companies whose originally targeted role has closed, it scans the board for open software engineering positions (e.g. converting a closed backend listing to an active Forward Deployed or Full Stack role).
- It produces `data/preparation-YYYY-MM-DD/live-role-checks.json`.

### Step 3: Deep Resume Tailoring
Run the tailoring and compilation engine:
```sh
npm run pipeline:tailor -- --input=data/preparation-YYYY-MM-DD/live-role-checks.json
```
For each active company:
1. **HQ Location Lookup**: Fetches the verified headquarters city and state from `companyHqMap` (default: `New York, NY`), appending `• No sponsorship required`.
2. **Standard Generic Role Title**: Converts non-standard or internal labels (e.g. "Member of Technical Staff", "Product Engineer") into standardized industry roles (`Full Stack Developer`, `Software Engineer`, `AI Engineer`, `Distributed Systems Engineer`, etc.).
3. **Domain Classification**: Categorizes the role into one of 8 archetypes (`fullstack`, `ai`, `distributed`, `cloud`, `ml`, `healthcare`, `security`, `data`).
4. **Skills Generation**:
   - Generates concise headings (`Frontend`, `Backend`, `AI & Search`, `Languages`).
   - Completely removes `HTML5` and `CSS3`.
   - Explicitly includes `React.js` across all full-stack, SWE, and backend/distributed roles.
   - Enforces 0% `pgvector` in the technical skills block.
5. **Experience Tailoring**:
   - Injects **Seismic, a 360-degree healthcare application serving doctors and patients** into LeapGenAI.
   - Injects **processing 1M+ rows of transactions with ease with advanced SQL modeling on PostgreSQL and AWS DynamoDB** into SmartRevIQ.
   - Weaves the specific JD stack (`dbt`, `Kafka`, `gRPC`, `GraphQL`, `Kubernetes`, `React`, etc.) into the bullets.
6. **Project Prioritization**:
   - Sets project order based on domain relevance (e.g., placing `ShuttleNow` #1 for frontend roles; `Deploy.sh` #1 for backend/distributed; `HemGPT` #1 for AI; `Sunx` #1 for ML).

### Step 4: Strict 2-Page Fit & Quality Gate
1. **Tectonic Compilation**: Generates `resume.pdf` directly into `output/submission-preparation-YYYY-MM-DD/{001..150}-{company}-{role}/`.
2. **Quality Gate Verification**:
   - Verifies all bullets adhere to 18–32 words.
   - Confirms bullets begin with approved concrete action verbs.
   - Validates that technical mechanisms and business outcomes are present.
   - Enforces exact **2-page length** (rejects 1-page or 3-page outputs).

### Step 5: Render Visual Proof PNGs
```sh
npm run pipeline:proofs -- --manifest=data/preparation-YYYY-MM-DD/tailored-resumes-manifest.json
```
- MuPDF renders each PDF page to `data/preparation-YYYY-MM-DD/visual/{folderSlug}-1.png` and `{folderSlug}-2.png` at 96 DPI.
- Enables visual inspection in under 5 seconds across the entire batch.

### Step 6: Generate Manifest & Executive Report
The pipeline automatically compiles:
- `data/preparation-YYYY-MM-DD/tailored-resumes-manifest.json`: Full machine-readable record with SHA-256 PDF hashes, direct file paths, and review verdicts.
- `data/preparation-YYYY-MM-DD/REPORT.md`: Comprehensive human-readable executive report with profile distribution, ATS platform stats, and clickable PDF links.

### Step 7: Application & Ledger Tracking
When submitting applications:
1. Pre-flight check verifies no duplicate requisition ID exists.
2. Checks the **15-day company cooldown** policy.
3. Once submitted, appends a permanent record to `applications.ndjson` with the exact resume SHA-256 hash.
4. When interview or rejection emails arrive, appends to `outcomes.ndjson`.
