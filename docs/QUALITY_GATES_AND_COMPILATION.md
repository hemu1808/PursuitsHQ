# Quality Gates, Compilation & Visual Verification

This document specifies the automated compilation mechanics, LaTeX layout rules, and visual proofing procedures that guarantee 100% 2-page fit and ATS compliance across every generated resume.

---

## 1. Why Strict 2-Page Fit?

In tech recruiting:
- **1-Page Underflow** fails to provide sufficient depth for a candidate with 5+ years of production experience, multi-tenant cloud platforms, distributed systems, and modern AI/agent workflows.
- **3-Page Overflow** (e.g. 2 pages plus 3 lines on page 3) looks unformatted, unedited, and is penalized by recruiters and print viewports.
- **Exact 2-Page Fit** demonstrates senior-level brevity, rigorous editing, and complete alignment with senior hiring expectations.

---

## 2. Compilation Mechanics with Tectonic

PursuitsHQ uses **Tectonic**, an automated, self-contained modern LaTeX engine written in Rust:
- Eliminates manual TeX Live package installations.
- Executes hermetic single-pass compilation with built-in font bundling (`helvet`, `fontenc`, `geometry`).
- Command:
  ```sh
  tectonic resume.tex --outdir <output-folder>
  ```
- **Error Trapping**: Automatically handles Windows OS error 32 (transient file lock by cloud sync services) by ensuring previous handles are released prior to recompilation.

---

## 3. Style & Syntax Linting (`checkResumeStyle`)

Before compiling, the LaTeX source is validated against style invariants:
1. **Required Structural Commands**:
   - `\sectionhead{Summary}`
   - `\sectionhead{Technical Skills}`
   - `\sectionhead{Experience}`
   - `\sectionhead{Projects}`
   - `\sectionhead{Education}`
2. **Forbidden Substrings**:
   - `pgvector` inside `\sectionhead{Technical Skills}` is blocked.
   - `HTML5` or `CSS3` inside `\sectionhead{Technical Skills}` is blocked.
3. **Typography & ATS Safety**:
   - Clean sans-serif font (`\renewcommand{\familydefault}{\sfdefault}`).
   - Geometry margins set to `0.5in` to maximize usable layout area without clipping.
   - Date alignments using single-line `\entryheader{Title}{Dates}` with right-aligned `\hfill` rather than multi-column tables that confuse legacy ATS parsers.

---

## 4. Quality Gate Rules (`checkResumeQuality`)

Every bullet point is individually parsed and checked against deterministic rules:

### A. Word Count Window (18–32 Words)
- Words are counted via: `(text.match(/[A-Za-z0-9][A-Za-z0-9+./&'-]*/g) || []).length`.
- Under 18 words: Fails for insufficient mechanism/impact detail.
- Over 32 words: Fails for verbose prose that risks pushing the resume onto page 3.

### B. Action Verb Validation
The first word of every bullet must exist in the approved set:
`architected`, `automated`, `built`, `created`, `delivered`, `deployed`, `designed`, `developed`, `engineered`, `implemented`, `integrated`, `migrated`, `orchestrated`, `streamed`.

### C. Mechanism & Outcome Enforcement
- Mechanism regex: `/\b(using|with|through|by|via|applying|behind|across|while|then|on|into|from)\b/i`
- Outcome regex: `/\b(improv\w*|reduc\w*|cut\w*|rais\w*|achiev\w*|enabl\w*|secur\w*|process\w*|sustain\w*|ground\w*|keep\w*|guarantee\w*|eliminat\w*|deliver\w*|embed\w*|return\w*|expos\w*|restor\w*|validat\w*|confirm\w*|surface\w*|expand\w*|served)\b/i`

---

## 5. Visual Proofing with MuPDF (`renderPdfProofs`)

A resume that compiles cleanly can still have visual blemishes (e.g. orphan lines or awkward line breaks). PursuitsHQ integrates **MuPDF** (`mutool.exe`) to generate image proofs:
- Renders page 1 (`{folderSlug}-1.png`) and page 2 (`{folderSlug}-2.png`) at 96 DPI.
- Multi-worker architecture renders 100+ resumes in under 4 seconds.
- Visual inspection proofs are saved to `data/preparation-YYYY-MM-DD/visual/` for rapid human review prior to submission.
