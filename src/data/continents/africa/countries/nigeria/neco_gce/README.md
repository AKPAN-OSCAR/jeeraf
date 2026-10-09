# NECO GCE Past Questions Ingestion & AI Prompt Master Guide

This guide contains the question ingestion standards and AI extraction prompts for **NECO GCE (National Examinations Council - Private Candidate Series)**.

---

## 1. Directory & File Naming Conventions

Save your extracted JSON file in the following structure:
```text
src/data/continents/africa/countries/nigeria/neco_gce/{subject_lowercase}/neco_gce_{subject_lowercase}_{year}.json
```

### Examples:
- **Mathematics 2024**: `src/data/continents/africa/countries/nigeria/neco_gce/mathematics/neco_gce_math_2024.json`
- **English Language 2024**: `src/data/continents/africa/countries/nigeria/neco_gce/english/neco_gce_english_2024.json`
- **Physics 2024**: `src/data/continents/africa/countries/nigeria/neco_gce/physics/neco_gce_physics_2024.json`

---

## 2. [ARCHIVED - OLD PROMPT] Historical NECO GCE Master Prompt (Kept for Reference Records)

> ⚠️ **NOTE**: Kept strictly for audit and reference records. Use the active production prompt in Section 3 for all new extractions.

```markdown
You are a senior NECO GCE Assessment Specialist.
Your task is to transcribe, mathematically verify, and output all questions and solutions from the attached NECO GCE exam paper images into a pure, valid JSON array.

### TARGET SPECIFICATIONS:
- Examination Body: NECO GCE
- Subject: [SUBJECT]
- Year: [YEAR]
- File Destination: src/data/continents/africa/countries/nigeria/neco_gce/[subject_lowercase]/neco_gce_[subject_lowercase]_[year].json
```

---

## 3. [ACTIVE / CURRENT] Professional Grade-A NECO GCE AI Extraction Master Prompt (New Production Standard)

> ⭐️ **USE THIS PROMPT FOR ALL NEW EXTRACTIONS**:
> Copy the entire block below, replace `[SUBJECT]` and `[YEAR]`, attach your scanned question images, and send to ChatGPT (GPT-4o), Claude 3.5 Sonnet, or Gemini 2.0 Pro.

```markdown
You are a Principal National Examinations Council (NECO/GCE) Chief Examiner, Senior Academic Specialist, and CBT Architect.

Your mission is to transcribe, mathematically solve, and output every single question and solution from the attached NECO GCE exam paper images into a pure, valid, production-grade JSON array.

### TARGET SPECIFICATIONS:
- Examination Body: NECO GCE
- Subject: [SUBJECT] (e.g. Mathematics, English Language, Physics, Chemistry, Biology, Economics)
- Year: [YEAR] (e.g. 2024)
- Target File: src/data/continents/africa/countries/nigeria/neco_gce/[subject_lowercase]/neco_gce_[subject_lowercase]_[year].json

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
   - Transcribe every question faithfully. Include all 60 objective questions and Paper 2 theory section questions.

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
    "id": "neco-gce-[subject_short]-[year]-q1",
    "subject": "[SUBJECT]",
    "examType": "NECO GCE",
    "year": [YEAR],
    "section": "General",
    "type": "objective",
    "passage": null,
    "question": "Factorise completely: $6x^2 - 11x - 10$.",
    "diagram": null,
    "options": [
      "$(2x - 5)(3x + 2)$",
      "$(2x + 5)(3x - 2)$",
      "$(6x - 5)(x + 2)$",
      "$(3x - 5)(2x + 2)$"
    ],
    "correctAnswer": 0,
    "explanation": "**Step 1:** Find two numbers whose product is $6 \\times (-10) = -60$ and whose sum is $-11$: the numbers are $-15$ and $+4$.\n\n**Step 2:** Rewrite the middle term: $6x^2 - 15x + 4x - 10$.\n\n**Step 3:** Factor by grouping: $3x(2x - 5) + 2(2x - 5) = (2x - 5)(3x + 2)$.\n\n**Step 4:** The complete factorisation is $(2x - 5)(3x + 2)$, which is Option A ($(2x - 5)(3x + 2)$).",
    "solutionDiagram": null,
    "topic": "Algebra - Quadratic Factorisation",
    "difficulty": "Medium"
  }
]
```

---

## 4. How to Manually Register a New Year in `index.ts`

1. Save the file to `src/data/continents/africa/countries/nigeria/neco_gce/[subject]/neco_gce_[subject]_[year].json`.
2. Open `src/data/continents/africa/countries/nigeria/neco_gce/index.ts` and add:
   ```typescript
   import { Question } from '../../../types';
   import necoGceMath2024Json from './mathematics/neco_gce_math_2024.json';
   import necoGceMath2023Json from './mathematics/neco_gce_math_2023.json'; // <-- 1. Import

   export const manualQuestions: Question[] = [
     ...(necoGceMath2024Json as unknown as Question[]),
     ...(necoGceMath2023Json as unknown as Question[])                  // <-- 2. Register
   ];
   ```
3. The year will immediately display with its question count button in the CBT screen.
