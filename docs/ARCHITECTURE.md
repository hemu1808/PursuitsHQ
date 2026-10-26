# PursuitsHQ System Architecture

PursuitsHQ is an autonomous career operations platform and dynamic workspace. It pairs a high-performance Next.js dashboard with an automated job discovery, role verification, dynamic resume tailoring, and application tracking pipeline.

```
                    +------------------------------------+
                    |        Target Companies List       |
                    |        (companieslist.txt)         |
                    +-----------------+------------------+
                                      |
                                      v
                    +------------------------------------+
                    |        1. Scanner & ATS Crawler    |
                    |   (Ashby, Greenhouse, Lever, etc.) |
                    +-----------------+------------------+
                                      |
                                      v
                    +------------------------------------+
                    |       2. Verification & Filter     |
                    |   (Active status, Mid/Sr IC, HQ)   |
                    +-----------------+------------------+
                                      |
                                      v
                    +------------------------------------+
                    |     3. Deep Tailoring Engine       |
                    |  (8 Domain Archetypes + JD Stacks) |
                    +-----------------+------------------+
                                      |
                                      v
                    +------------------------------------+
                    |     4. Strict Quality Gates        |
                    |  (Action Verbs, Mechanism, Outcome)|
                    +-----------------+------------------+
                                      |
                                      v
                    +------------------------------------+
                    |   5. Tectonic Compiler (2-Page)    |
                    |   (Zero overflow, strict layout)   |
                    +-----------------+------------------+
                                      |
                                      v
                    +------------------------------------+
                    |     6. MuPDF Visual Proofing       |
                    |    (Parallel 96 DPI PNG audits)    |
                    +-----------------+------------------+
                                      |
                                      v
                    +------------------------------------+
                    |    7. Application & Ledger Sync    |
                    | (applications.ndjson, outcomes)    |
                    +-----------------+------------------+
                                      |
                                      v
                    +------------------------------------+
                    |     8. PursuitsHQ Web Dashboard    |
                    |  (Application drawer, analytics)   |
                    +------------------------------------+
```

---

## Core Subsystems

### 1. ATS Discovery & Role Verification (`pipeline/scanner.ts`)
- **Direct Public API Ingestion**: Integrates directly with Ashby and Greenhouse public board APIs (`/posting-api/job-board/{company}` and `/v1/boards/{board}/jobs`).
- **Target Seniority Filter**: Automatically identifies and prioritizes Mid-Level to Senior IC roles (3+ years experience), automatically excluding executive, director, and management listings.
- **Staff-to-SWE Mapping**: Converts internal "Member of Technical Staff" designations into standard, recruiter-friendly titles like `Software Engineer`, `AI Engineer`, or `Full Stack Developer`.
- **Deduplication Engine**: Converts arbitrary URLs to canonical requisition identifiers, stripping UTM parameters, referral tags, and trailing `/apply` routes.

### 2. Deep Tailoring Engine (`pipeline/tailor.ts`)
- **Domain Taxonomy**: Classifies target positions into 8 distinct engineering archetypes:
  1. `fullstack`: Frontend & Web Applications (React, Next.js, TypeScript, Tailwind, WebSockets)
  2. `ai`: AI Systems & Agent Architectures (LangGraph, MCP, RAG, Azure OpenAI, DSPy)
  3. `distributed`: Distributed Systems & Backend Platforms (Python, Go, gRPC, Redis, Kafka)
  4. `cloud`: Cloud Infrastructure & Platforms (Kubernetes, Terraform, Docker, AWS/Azure, CI/CD)
  5. `ml`: ML Systems & High-Performance Computing (PyTorch, Triton, Model Serving, GPU Optimization)
  6. `healthcare`: Healthcare & Clinical Systems (FHIR, HL7, DICOM, EHR Workflows, HIPAA)
  7. `security`: Enterprise Security & Governance (OAuth2, SSO, RBAC, Multi-Tenant Isolation, SOC2)
  8. `data`: Data & Analytics Engineering (dbt, SQL, Airflow, Dimensional Modeling)
- **Ground Truth Invariants**:
  - **LeapGenAI**: Explicitly highlights **Seismic, a 360-degree healthcare application serving doctors and patients**.
  - **SmartRevIQ**: Explicitly highlights **handling 1M+ rows of transactions with ease with advanced SQL modeling on PostgreSQL and AWS DynamoDB**.
- **Dynamic Project Re-Ordering**: Prioritizes personal projects (`ShuttleNow`, `HemGPT`, `Deploy.sh`, `Sunx`) based on domain relevance.

### 3. Quality & Style Gates (`pipeline/quality-gate.ts`)
- **Bullet Word Count Target**: Strictly between **18 and 32 words** per bullet.
- **Action Verb Enforcement**: Must begin with an approved action verb (`architected`, `automated`, `built`, `created`, `delivered`, `deployed`, `designed`, `developed`, `engineered`, `implemented`, `integrated`, `migrated`, `orchestrated`, `streamed`).
- **Mechanism Check**: Requires an explicit technical mechanism (`using`, `with`, `across`, `via`, etc.).
- **Outcome Check**: Requires a concrete engineering outcome (`reducing`, `enabling`, `sustaining`, `delivering`, `surfacing`, etc.).
- **No Fluff in Skills**: `HTML5` and `CSS3` are completely removed. `pgvector` is excluded from the skills section. `React.js` is included across all SWE and Full Stack profiles.

### 4. Compilation & Proof Engine (`pipeline/compiler.ts` & `pipeline/proofs.ts`)
- **Tectonic LaTeX Engine**: Standalone, hermetic compilation from `.tex` directly to PDF without complex TeXLive dependencies.
- **Strict 2-Page Fit**: Compiles to exactly 2 pages; rejects any 1-page underflow or 3-page overflow.
- **Parallel Visual Proofs**: MuPDF (`mutool`) renders page 1 and page 2 at 96 DPI across 8 parallel workers for rapid visual auditing.

### 5. Application Ledger & Cooldown Manager (`pipeline/apply.ts`)
- **15-Day Reapplication Cooldown**: Enforces a minimum 15-day waiting period between applications to the same employer.
- **Append-Only Auditing**: Logs every submission and outcome to `applications.ndjson` and `outcomes.ndjson`.
- **Zero Hallucination Protocol**: Form responses must originate strictly from verified profile fields or canonical resume facts.

### 6. PursuitsHQ Next.js Dashboard (`src/app/`)
- Reads the generated batches, manifests, and application ledgers.
- Provides interactive cohort analytics, interview conversion rates, and instant PDF inspection drawers.
