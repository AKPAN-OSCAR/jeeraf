# JeeRaf CBT National Past Questions Ingestion Guide

This guide explains how past questions are organized, the exact JSON structure required, the prompt to give external AI tools when extracting questions from images, and how to register new subjects and years into the CBT system.

> 📖 **TypeScript Registry Deep-Dive:** For complete code recipes and syntax rules on wiring `index.ts` files, see the [TypeScript Registry Guide](./REGISTRY_GUIDE.md).
>
> 🎯 **Targeted Past Question Ingestion Guides:**
> - 📘 [WAEC Ingestion & Master Prompt Guide](./waec/README.md)
> - 📗 [JAMB Ingestion & Master Prompt Guide](./jamb/README.md)
> - 📙 [NECO Ingestion & Master Prompt Guide](./neco/README.md)
> - 📕 [WAEC GCE Ingestion Guide](./waec_gce/README.md)
> - 📓 [NECO GCE Ingestion Guide](./neco_gce/README.md)

---

## 1. Directory Structure

All question banks are located under `src/data/question_banks/` and organized by national exam body, subject, and year:

```text
src/data/question_banks/
├── index.ts                         # Master registry combining all exam bodies
├── waec/
│   ├── index.ts                     # WAEC master registry
│   └── mathematics/
│       ├── waec_math_2011.json      # WAEC Mathematics 2011
│       ├── waec_math_2012.json      # WAEC Mathematics 2012
│       ├── waec_math_2013.json      # WAEC Mathematics 2013
│       └── waec_math_2015.json      # WAEC Mathematics 2015
├── jamb/
│   ├── index.ts                     # JAMB master registry
│   ├── mathematics/
│   │   └── jamb_math_2024.json
│   ├── english/
│   │   └── jamb_english_2024.json
│   ├── physics/
│   │   └── jamb_physics_2024.json
│   ├── chemistry/
│   │   └── jamb_chemistry_2024.json
│   └── biology/
│       └── jamb_biology_2024.json
├── neco/
│   ├── index.ts
│   └── mathematics/
│       └── neco_math_2024.json
├── waec_gce/
│   ├── index.ts
│   └── mathematics/
│       └── waec_gce_math_2024.json
└── neco_gce/
    ├── index.ts
    └── mathematics/
        └── neco_gce_math_2024.json
```

### File Naming Convention
* Format: `<exam_body>_<subject_abbr>_<year>.json`
* Examples:
  * `waec_math_2011.json`
  * `waec_math_2012.json`
  * `waec_math_2013.json`
  * `jamb_physics_2024.json`
  * `neco_math_2024.json`

---

## 2. [ARCHIVED - OLD PROMPT] Historical Extraction Prompt (Kept for Reference Records)

> ⚠️ **NOTE**: This prompt was used historically. Kept strictly for audit and reference records. Use the active production prompt in Section 3 for all new extractions.

```text
You are an expert West African Examinations Council (WAEC) and JAMB CBT data digitizer.
I have uploaded images containing past examination questions, objectives, theory questions, and complete solutions.

Your task is to transcribe and format all questions into a valid, strict JSON array conforming to the specification below.

OUTPUT RULES:
1. Output ONLY the raw JSON array starting with [ and ending with ].
2. For multiple choice / objective questions: "type": "objective", "options": Array of 4 strings, "correctAnswer": 0-3.
3. For theory / essay questions: "type": "theory", "options": [], "correctAnswer": -1, "marks": 10.
4. Mathematical Formulas: Use standard LaTeX with $...$.
5. Diagrams / Figures: Inline SVG.
6. IDs: "<exam>-<subject>-<year>-q<number>".
```

---

## 3. [ACTIVE / CURRENT] Universal Production AI Extraction Master Prompt

> ⭐️ **USE THIS PROMPT FOR ALL NEW EXTRACTIONS ACROSS ALL EXAM BODIES & SUBJECTS**:
> Copy the prompt block below, replace `[EXAM_BODY]` (WAEC, JAMB, NECO, etc.), `[SUBJECT]`, and `[YEAR]`, attach your scanned exam question images, and send to ChatGPT (GPT-4o), Claude 3.5 Sonnet, or Gemini 2.0 Pro.

```markdown
You are a Principal National Examiner and Computer-Based Testing (CBT) Technical Architect for [EXAM_BODY] ([SUBJECT]).

Your mission is to transcribe, mathematically solve, and output every single question and solution from the attached exam paper images into a pure, valid, production-grade JSON array.

### TARGET SPECIFICATIONS:
- Examination Body: [EXAM_BODY] (WAEC / JAMB / NECO / WAEC GCE / NECO GCE)
- Subject: [SUBJECT] (e.g. Mathematics, English Language, Physics, Chemistry, Biology, Economics)
- Year: [YEAR] (e.g. 2011, 2014)
- Target File: src/data/question_banks/[exam_body_lowercase]/[subject_lowercase]/[exam_body_lowercase]_[subject_lowercase]_[year].json

### MANDATORY PRODUCTION RULES:

1. STRICT JSON STRING ESCAPING (CRITICAL):
   - You MUST write DOUBLE BACKSLASHES for ALL LaTeX commands inside JSON string values:
     Use `\\frac{a}{b}`, NOT `\frac{a}{b}` (single backslash corrupts to form-feed \f).
     Use `\\times`, NOT `\times` (single backslash corrupts to tab \t).
     Use `\\angle`, NOT `\angle` (single backslash corrupts to bell \a).
     Use `\\approx`, NOT `\approx` (single backslash corrupts to bell \a).
     Use `\\triangle`, NOT `\triangle`.
     Use `\\sqrt{x}`, `\\pm`, `\\circ`, `\\le`, `\\ge`, `\\theta`, `\\pi`, `\\text{...}`.

2. GENUINE STEP-BY-STEP EXPLANATIONS (NO PLACEHOLDER TEXT):
   - NEVER output dummy placeholder sentences like "Identify the governing rule" or "Work through the algebra carefully".
   - Every question must provide genuine, detailed working:
     **Step 1:** State the governing mathematical/scientific principle or formula.
     **Step 2:** Substitute given values with units.
     **Step 3:** Step-by-step algebraic/logical calculation.
     **Step 4:** Clear conclusion affirming the matching option letter: Option X ($value$).

3. ZERO QUESTION DROPPING:
   - Inspect every image page thoroughly from top to bottom. Include all objective questions and theory questions without omitting any question numbers.

4. DIAGRAMS & GRAPHS (INLINE SVG SPECIFICATION):
   - When a question includes a geometric shape, circle theorem, physics circuit, ray diagram, Venn diagram, or histogram, generate a clean inline SVG inside `"diagram"`:
     `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250" width="100%" style="max-width:100%;margin:auto;display:block;">...</svg>`
   - CRITICAL SIZING RULE: NEVER include `max-width:240px` in the style attribute. Diagrams must scale responsively across all screens.
   - Blueprint color standards matching WAEC 2011/2013:
     - Blueprint canvas background: `<rect width="100%" height="100%" fill="#0f172a" rx="16"/>`
     - Main geometry lines, shapes, and axes: `#38bdf8` (sky blue, `stroke-width="2"`)
     - Highlights, angles, arcs, rays, curves: `#f59e0b` (amber, `stroke-width="2"`)
     - Labels, vertex letters, angle measures: `#e2e8f0` (clean off-white, `font-size="14" font-weight="bold" font-family="sans-serif"`)
     - Shaded regions (polygons, Venn intersections, histograms): `#38bdf8` with `fill-opacity="0.25"`
   - If no diagram exists, set `"diagram": null`.

5. TABLES WITH GRID LININGS:
   - Always include blank newlines before and after tables.
   - Format tables in standard Markdown with headers and cell values wrapped in `$math$`:
     ```markdown
     | $x$ | $0$ | $1\\frac{1}{4}$ | $2$ | $4$ |
     |---|---|---|---|---|
     | $y$ | $3$ | $5$ | $7$ | $11$ |
     ```
   - NEVER put multiple rows on one line separated by `||`. Every row must be on its own line.

6. COMPREHENSION PASSAGES:
   - For English comprehension or passage-based items, include the full reading passage inside `"passage"`.

7. OUTPUT FORMAT:
   - Output ONLY the raw JSON array starting with `[` and ending with `]`. No markdown backticks or extra text.

### JSON RECORD TEMPLATE:
[
  {
    "id": "[exam_body_lowercase]-[subject_short]-[year]-q1",
    "subject": "[SUBJECT]",
    "examType": "[EXAM_BODY]",
    "year": [YEAR],
    "section": "General",
    "type": "objective",
    "passage": null,
    "question": "The question text with inline math $\\frac{a}{b}$ or table.",
    "diagram": null,
    "options": [
      "Option A",
      "Option B",
      "Option C",
      "Option D"
    ],
    "correctAnswer": 0,
    "explanation": "**Step 1:** State formula...\n\n**Step 2:** Substitute...\n\n**Step 3:** Calculate...\n\n**Step 4:** Affirm correct option: Option A ($value$).",
    "solutionDiagram": null,
    "topic": "Topic Name",
    "difficulty": "Medium"
  }
]
```

---

## 4. Question JSON Schema Reference

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique identifier (e.g. `waec-math-2011-q1`) |
| `subject` | `string` | e.g. `"Mathematics"`, `"English"`, `"Physics"`, `"Chemistry"` |
| `examType` | `string` | `"WAEC"`, `"JAMB"`, `"NECO"`, `"WAEC GCE"`, or `"NECO GCE"` |
| `year` | `number` | The exam year (e.g. `2011`, `2015`, `2024`) |
| `section` | `string` | Section name (e.g. `"General"`, `"Comprehension"`, `"Theory"`) |
| `type` | `string` | `"objective"` or `"theory"` |
| `question` | `string` | The question text (supports Markdown & KaTeX LaTeX `$...$`) |
| `options` | `string[]` | 4 options for objective, empty array `[]` for theory |
| `correctAnswer`| `number` | `0`=A, `1`=B, `2`=C, `3`=D (`-1` for theory) |
| `explanation` | `string` | Detailed step-by-step marking guide and solution |
| `diagram` | `string \| null` | Self-contained SVG diagram string or `null` |
| `solutionDiagram` | `string \| null` | Optional SVG working/solution diagram or `null` |
| `topic` | `string` | Topic classification |
| `difficulty` | `string` | `"Easy"`, `"Medium"`, or `"Hard"` |
| `marks` | `number` | *(Optional)* Total marks for theory questions |

---

## 5. How to Register a New Subject or Year in the App

1. **Save the JSON file:**
   Save your extracted JSON into the appropriate folder:
   ```text
   src/data/question_banks/waec/mathematics/waec_math_2011.json
   ```
2. **Register it in the exam body's `index.ts`:**
   Open `src/data/question_banks/waec/index.ts` and add:
   ```typescript
   import { Question } from '../../../types';
   import waecMath2011Json from './mathematics/waec_math_2011.json'; // <--- 1. Import
   import waecMath2012Json from './mathematics/waec_math_2012.json';
   import waecMath2013Json from './mathematics/waec_math_2013.json';
   import waecMath2015Json from './mathematics/waec_math_2015.json';

   export const manualQuestions: Question[] = [
     ...(waecMath2011Json as unknown as Question[]),                  // <--- 2. Register
     ...(waecMath2012Json as unknown as Question[]),
     ...(waecMath2013Json as unknown as Question[]),
     ...(waecMath2015Json as unknown as Question[])
   ];
   ```
3. **Done!**
   The questions and year buttons appear immediately across the entire app with exact question counts.
