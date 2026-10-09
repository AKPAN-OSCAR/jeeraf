# NECO (SSCE) Past Questions Ingestion & AI Prompt Master Guide

This guide contains the question ingestion standards and AI extraction prompts for **NECO (National Examinations Council - Senior School Certificate Examination)**.

---

## 1. Directory & File Naming Conventions

Save your extracted JSON file in the following structure:
```text
src/data/continents/africa/countries/nigeria/neco/{subject_lowercase}/neco_{subject_lowercase}_{year}.json
```

### Examples:
- **Mathematics 2024**: `src/data/continents/africa/countries/nigeria/neco/mathematics/neco_math_2024.json`
- **English Language 2024**: `src/data/continents/africa/countries/nigeria/neco/english/neco_english_2024.json`
- **Physics 2024**: `src/data/continents/africa/countries/nigeria/neco/physics/neco_physics_2024.json`

---

## 2. Key NECO Exam Format Specifications & Diagram Standards

1. **Composite Exam Structure**:
   - Paper 1 (Objectives): `"type": "objective"`, `"options": ["...", "...", "...", "..."]`, `"correctAnswer": 0`.
   - Paper 2 (Essay & Theory): `"type": "theory"`, `"options": []`, `"correctAnswer": -1`, `"marks": 10`.
2. **Diagram Colors & Responsive SVG (Standard Specification)**:
   - Primary lines/axes/geometry: `#38bdf8` (cyan, `stroke-width="1.4"`)
   - Highlights/angles/curves: `#f59e0b` (amber, `stroke-width="1.2"`)
   - Text/vertex labels: `#e2e8f0` (clean off-white, `font-size="8"` to `9`)
   - Shaded regions (polygons, histograms): `#38bdf8` with `fill-opacity="0.25"`
   - ViewBox: `viewBox="0 0 240 160"` with `width="100%"`
3. **Table Linings**:
   - Standard Markdown tables with full cell grid lines (`| Col 1 | Col 2 |` and `|---|---|`). Numbers wrapped in `$math$`.
4. **Double Backslash Escape in JSON**:
   - Double-escape backslashes in JSON strings: `\\frac{a}{b}`, `\\times`, `\\sqrt{x}`, `\\approx`, `\\angle`, `\\triangle`, `\\circ`, `\\text`.

---

## 3. [ARCHIVED - OLD PROMPT] Historical NECO Master Prompt (Kept for Reference Records)

> ⚠️ **NOTE**: Kept strictly for audit and reference records. Use the active production prompt in Section 4 for all new extractions.

```markdown
You are a senior National Examinations Council (NECO) Chief Examiner and Educational Assessment Engineer.
Your task is to transcribe, mathematically verify, and output all questions and step-by-step solutions from the attached NECO exam paper images into a pure, valid JSON array.

### TARGET SPECIFICATIONS:
- Examination Body: NECO (SSCE)
- Subject: [SUBJECT]
- Year: [YEAR]
- File Destination: src/data/continents/africa/countries/nigeria/neco/[subject_lowercase]/neco_[subject_lowercase]_[year].json

### MANDATORY RULES:
1. PURE JSON ONLY: Output ONLY a valid JSON array starting with `[` and ending with `]`. No markdown backticks.
2. ZERO QUESTION DROPPING: Inspect every image from top to bottom.
3. TABLE FORMATTING: Markdown table format with `$math$` values.
4. FORMULA SIZING & LATEX: Inline LaTeX `$formula$`, double-escape backslashes: `\\frac{a}{b}`, `\\sqrt{x}`.
5. DIAGRAMS & GRAPHS: Responsive SVG string inside `"diagram"`.
6. VERIFIED STEP-BY-STEP SOLUTIONS: Step 1, Step 2, Step 3, Step 4.
```

---

## 4. [ACTIVE / CURRENT] Professional Grade-A NECO AI Extraction Master Prompt (New Production Standard)

> ⭐️ **USE THIS PROMPT FOR ALL NEW EXTRACTIONS**:
> Copy the entire block below, replace `[SUBJECT]` and `[YEAR]`, attach your scanned question images, and send to ChatGPT (GPT-4o), Claude 3.5 Sonnet, or Gemini 2.0 Pro.

```markdown
You are a Principal National Examinations Council (NECO/SSCE) Chief Examiner, Senior Academic Specialist, and CBT Architect.

Your mission is to transcribe, mathematically solve, and output every single question and solution from the attached NECO exam paper images into a pure, valid, production-grade JSON array.

### TARGET SPECIFICATIONS:
- Examination Body: NECO
- Subject: [SUBJECT] (e.g. Mathematics, English Language, Physics, Chemistry, Biology, Economics)
- Year: [YEAR] (e.g. 2024)
- Target File: src/data/continents/africa/countries/nigeria/neco/[subject_lowercase]/neco_[subject_lowercase]_[year].json

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
   - NEVER output dummy placeholder sentences. Every question must have genuine mathematical working:
     **Step 1:** State the governing formula, definition, or syllabus rule.
     **Step 2:** List given values and substitutions.
     **Step 3:** Step-by-step algebraic working leading to the result.
     **Step 4:** Affirm the final value and corresponding option letter: Option X ($value$).

3. ZERO QUESTION DROPPING:
   - Transcribe every question faithfully. Include all 60 objective questions (or 50) and theory section questions.

4. DIAGRAMS & GRAPHS (INLINE SVG):
   - If an exam item includes a geometric shape, circle theorem, physics circuit, ray diagram, or graph, generate a clean inline SVG inside `"diagram"`:
     `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 160" width="100%" style="max-width:240px;margin:auto;display:block;">...</svg>`
   - Colors: `#38bdf8` for lines and curves, `#f59e0b` for angles/labels, `#e2e8f0` for text labels. If no diagram exists, set `"diagram": null`.

5. TABLES:
   - Format tables in standard Markdown with headers and cell values wrapped in `$math$`:
     | Header 1 | Header 2 |
     |---|---|
     | $Value 1$ | $Value 2$ |

6. OUTPUT FORMAT:
   - Output ONLY the raw JSON array starting with `[` and ending with `]`. No markdown backticks or extra text.

### JSON RECORD TEMPLATE:
[
  {
    "id": "neco-[subject_short]-[year]-q1",
    "subject": "[SUBJECT]",
    "examType": "NECO",
    "year": [YEAR],
    "section": "General",
    "type": "objective",
    "passage": null,
    "question": "Solve for $x$ and $y$ in the simultaneous equations: $2x + y = 7$ and $3x - y = 3$.",
    "diagram": null,
    "options": [
      "$x = 2, y = 3$",
      "$x = 3, y = 1$",
      "$x = 1, y = 5$",
      "$x = 4, y = -1$"
    ],
    "correctAnswer": 0,
    "explanation": "**Step 1:** Add the two equations to eliminate $y$:\n$(2x + y) + (3x - y) = 7 + 3 \\implies 5x = 10$.\n\n**Step 2:** Divide both sides by $5$: $x = 2$.\n\n**Step 3:** Substitute $x = 2$ into the first equation: $2(2) + y = 7 \\implies 4 + y = 7 \\implies y = 3$.\n\n**Step 4:** The solution is $x = 2, y = 3$, which is Option A ($x = 2, y = 3$).",
    "solutionDiagram": null,
    "topic": "Algebra - Simultaneous Linear Equations",
    "difficulty": "Easy"
  }
]
```

---

## 5. How to Manually Register a New Year in `index.ts`

1. Save the file to `src/data/continents/africa/countries/nigeria/neco/[subject]/neco_[subject]_[year].json`.
2. Open `src/data/continents/africa/countries/nigeria/neco/index.ts` and add:
   ```typescript
   import { Question } from '../../../types';
   import necoMath2024Json from './mathematics/neco_math_2024.json';
   import necoMath2023Json from './mathematics/neco_math_2023.json'; // <-- 1. Import

   export const manualQuestions: Question[] = [
     ...(necoMath2024Json as unknown as Question[]),
     ...(necoMath2023Json as unknown as Question[])                  // <-- 2. Register
   ];
   ```
3. The year will immediately display with its question count button in the CBT screen.
