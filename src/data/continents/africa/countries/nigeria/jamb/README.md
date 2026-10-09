# JAMB (UTME) Past Questions Ingestion & AI Prompt Master Guide

This guide contains the question ingestion standards and AI extraction prompts for **JAMB (Unified Tertiary Matriculation Examination)**.

---

## 1. Directory & File Naming Conventions

Save your extracted JSON file in the following structure:
```text
src/data/continents/africa/countries/nigeria/jamb/{subject_lowercase}/jamb_{subject_lowercase}_{year}.json
```

### Examples:
- **Mathematics 2024**: `src/data/continents/africa/countries/nigeria/jamb/mathematics/jamb_math_2024.json`
- **English Language 2024**: `src/data/continents/africa/countries/nigeria/jamb/english/jamb_english_2024.json`
- **Physics 2024**: `src/data/continents/africa/countries/nigeria/jamb/physics/jamb_physics_2024.json`
- **Chemistry 2024**: `src/data/continents/africa/countries/nigeria/jamb/chemistry/jamb_chemistry_2024.json`
- **Biology 2024**: `src/data/continents/africa/countries/nigeria/jamb/biology/jamb_biology_2024.json`

---

## 2. Key JAMB Ingestion Rules & Diagram Standards

1. **Diagram Colors & Responsive SVG (Standard Specification)**:
   - Geometry, axes, circuit lines: `#38bdf8` (cyan, `stroke-width="1.4"`)
   - Highlights, angles, rays, vectors, curves: `#f59e0b` (amber, `stroke-width="1.2"`)
   - Text, vertex labels ($A, B, C$, $P, Q, R$), angle measures: `#e2e8f0` (clean off-white, `font-size="8"` to `9`)
   - Shaded regions (Venn intersections, histograms): `#38bdf8` with `fill-opacity="0.25"`
   - ViewBox: `viewBox="0 0 240 160"` with `width="100%"`
2. **Table Linings**:
   - Every data table, frequency table, or schedule must be structured as standard Markdown tables (`| Col 1 | Col 2 |` and `|---|---|`). Numbers and mathematical symbols inside table cells must be wrapped in `$math$`.
3. **Double Backslash Escape in JSON**:
   - Always double-escape backslashes in JSON: `\\frac{a}{b}`, `\\times`, `\\sqrt{x}`, `\\approx`, `\\angle`, `\\triangle`, `\\pm`, `\\circ`, `\\text`.
4. **JAMB Speed Tip**:
   - Because JAMB requires answering 40 questions in tight exam timing, every solution must include a **JAMB Speed Tip** demonstrating how candidates can eliminate wrong options or calculate the answer in under 45 seconds.

---

## 3. [ARCHIVED - OLD PROMPT] Historical JAMB Master Prompt (Kept for Reference Records)

> ⚠️ **NOTE**: This prompt was used historically. Kept strictly for audit and reference records. Use the active production prompt in Section 4 for all new extractions.

```markdown
You are a senior Joint Admissions and Matriculation Board (JAMB) Chief Examiner and CBT Specialist.
Your task is to transcribe, mathematically verify, and output all questions and solutions from the attached JAMB past question images into a pure, valid JSON array.

### TARGET SPECIFICATIONS:
- Examination Body: JAMB (UTME)
- Subject: [SUBJECT]
- Year: [YEAR]
- File Destination: src/data/continents/africa/countries/nigeria/jamb/[subject_lowercase]/jamb_[subject_lowercase]_[year].json

### MANDATORY RULES:
1. PURE JSON ONLY: Output ONLY a valid JSON array starting with `[` and ending with `]`. No conversational text, no markdown wrappers.
2. ZERO QUESTION DROPPING: Inspect every image from top to bottom.
3. TABLE FORMATTING: Markdown table format with `$value$` in cells.
4. FORMULA SIZING & LATEX: Inline LaTeX `$formula$`, double-escape backslashes: `\\frac{a}{b}`, `\\sqrt{x}`.
5. DIAGRAMS & GRAPHS: Responsive SVG string inside `"diagram"`.
6. VERIFIED SOLUTIONS + SPEED SHORTCUT: Step 1, Step 2, Step 3, JAMB Speed Tip, Correct Answer.
```

---

## 4. [ACTIVE / CURRENT] Professional Grade-A JAMB AI Extraction Master Prompt (New Production Standard)

> ⭐️ **USE THIS PROMPT FOR ALL NEW EXTRACTIONS**:
> Copy the entire block below, replace `[SUBJECT]` (e.g. `Physics`) and `[YEAR]` (e.g. `2023`), attach your scanned past question sheets, and send to ChatGPT (GPT-4o), Claude 3.5 Sonnet, or Gemini 2.0 Pro.

```markdown
You are a Principal Joint Admissions and Matriculation Board (JAMB) Chief Examiner, Senior Science/Arts Fellow, and UTME CBT System Architect.

Your mission is to transcribe, mathematically solve, and output every single question and solution from the attached JAMB exam paper images into a pure, valid, production-grade JSON array.

### TARGET SPECIFICATIONS:
- Examination Body: JAMB
- Subject: [SUBJECT] (e.g. Mathematics, English Language, Physics, Chemistry, Biology, Economics, Government)
- Year: [YEAR] (e.g. 2023)
- Target File: src/data/continents/africa/countries/nigeria/jamb/[subject_lowercase]/jamb_[subject_lowercase]_[year].json

### MANDATORY PRODUCTION RULES:

1. STRICT JSON STRING ESCAPING (CRITICAL):
   - You MUST write DOUBLE BACKSLASHES for ALL LaTeX commands inside JSON string values:
     Use `\\frac{a}{b}`, NOT `\frac{a}{b}` (single backslash corrupts to form-feed \f).
     Use `\\times`, NOT `\times` (single backslash corrupts to tab \t).
     Use `\\angle`, NOT `\angle` (single backslash corrupts to bell \a).
     Use `\\approx`, NOT `\approx` (single backslash corrupts to bell \a).
     Use `\\triangle`, NOT `\triangle`.
     Use `\\sqrt{x}`, `\\pm`, `\\circ`, `\\le`, `\\ge`, `\\theta`, `\\pi`, `\\text{...}`.

2. GENUINE STEP-BY-STEP EXPLANATIONS + UTME SPEED TIP:
   - NEVER output dummy placeholder sentences. Every question must have genuine, pedagogical working:
     **Step 1:** State the governing law, formula, or syllabus principle.
     **Step 2:** Substitute given values with SI units.
     **Step 3:** Step-by-step calculation or algebraic proof.
     **JAMB Speed Tip:** Fast mental shortcut, dimensional check, or elimination technique to solve in 30 seconds.
     **Correct Answer:** Option X ($value$).

3. DIAGRAMS & GRAPHS (INLINE SVG):
   - When a question includes a circuit, ray optics, vector diagram, Venn diagram, graph, or geometry, generate a responsive inline SVG inside `"diagram"`:
     `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 160" width="100%" style="max-width:240px;margin:auto;display:block;">...</svg>`
   - Colors: `#38bdf8` for lines and shapes, `#f59e0b` for angles/arrows, `#e2e8f0` for text labels. If no diagram exists, set `"diagram": null`.

4. TABLES:
   - Format tables in standard Markdown with headers and cell values wrapped in `$math$`:
     | Header 1 | Header 2 |
     |---|---|
     | $Value 1$ | $Value 2$ |

5. COMPREHENSION PASSAGES:
   - For English Language papers, put the entire reading passage in `"passage"` for all questions based on it.

6. OUTPUT FORMAT:
   - Output ONLY the raw JSON array starting with `[` and ending with `]`. No markdown backticks or commentary.

### JSON RECORD TEMPLATE:
[
  {
    "id": "jamb-[subject_short]-[year]-q1",
    "subject": "[SUBJECT]",
    "examType": "JAMB",
    "year": [YEAR],
    "section": "General",
    "type": "objective",
    "passage": null,
    "question": "A body accelerates uniformly from rest at $2\\text{ m/s}^2$ for $5\\text{ s}$. Find its final velocity.",
    "diagram": null,
    "options": [
      "$10\\text{ m/s}$",
      "$15\\text{ m/s}$",
      "$20\\text{ m/s}$",
      "$25\\text{ m/s}$"
    ],
    "correctAnswer": 0,
    "explanation": "**Step 1:** Use Newton's first equation of motion: $v = u + at$.\n\n**Step 2:** Given $u = 0\\text{ m/s}$ (starts from rest), $a = 2\\text{ m/s}^2$, $t = 5\\text{ s}$.\n\n**Step 3:** Substitute: $v = 0 + (2)(5) = 10\\text{ m/s}$.\n\n**JAMB Speed Tip:** When starting from rest ($u = 0$), simply multiply $a \\times t = 2 \\times 5 = 10\\text{ m/s}$ instantly in under 3 seconds!\n\n**Correct Answer:** Option A ($10\\text{ m/s}$).",
    "solutionDiagram": null,
    "topic": "Mechanics - Equations of Motion",
    "difficulty": "Easy"
  }
]
```

---

## 5. How to Manually Register a New Year in `index.ts`

1. Save the file to `src/data/continents/africa/countries/nigeria/jamb/[subject]/jamb_[subject]_[year].json`.
2. Open `src/data/continents/africa/countries/nigeria/jamb/index.ts` and add:
   ```typescript
   import { Question } from '../../../types';
   import jambMath2024Json from './mathematics/jamb_math_2024.json';
   import jambMath2023Json from './mathematics/jamb_math_2023.json'; // <-- 1. Import

   export const manualQuestions: Question[] = [
     ...(jambMath2024Json as unknown as Question[]),
     ...(jambMath2023Json as unknown as Question[])                  // <-- 2. Register
   ];
   ```
3. The year will immediately appear with its question count button in the CBT screen.
