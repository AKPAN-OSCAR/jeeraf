# WAEC (WASSCE) Past Questions Ingestion & AI Prompt Master Guide

This guide contains the upgraded, production-grade vision AI extraction prompt designed specifically for **WAEC (West African Senior School Certificate Examination)**. It eliminates previous extraction errors (such as broken tables, mismatched formula sizing, rushed solutions, and missing diagrams).

---

## 1. Directory & File Naming Conventions

Always save your extracted JSON file in the following structure:
```text
src/data/question_banks/waec/{subject_lowercase}/waec_{subject_lowercase}_{year}.json
```

### Examples:
- **Mathematics 2015**: `src/data/question_banks/waec/mathematics/waec_math_2015.json`
- **Mathematics 2016**: `src/data/question_banks/waec/mathematics/waec_math_2016.json`
- **English Language 2018**: `src/data/question_banks/waec/english/waec_english_2018.json`
- **Physics 2020**: `src/data/question_banks/waec/physics/waec_physics_2020.json`
- **Chemistry 2021**: `src/data/question_banks/waec/chemistry/waec_chemistry_2021.json`
- **Biology 2022**: `src/data/question_banks/waec/biology/waec_biology_2022.json`

---

## 2. Key Corrections Addressed in this Prompt

1. **Tables (Statistics, Frequency, Truth Tables)**:
   - *Previous Issue*: Tables rendered with slashes `/` or raw strings.
   - *Correction*: Must be structured as standard Markdown tables (`| Col 1 | Col 2 |` and `|---|---|`). Numbers and mathematical expressions inside table cells must be wrapped in `$math$`.
2. **Formula Sizing with Text**:
   - *Previous Issue*: Math equations looked disproportionate compared to surrounding text.
   - *Correction*: All inline symbols, equations, and option choices use inline `$equation$` so font size is synchronized with body text. Use `$$equation$$` only for major standalone derivations.
3. **Automatic Inline SVG Diagrams**:
   - *Previous Issue*: AI paused to ask if diagrams should be drawn, or skipped diagrams in solutions.
   - *Correction*: Strict instruction that AI must NEVER ask questions or omit diagrams. It must automatically synthesize clean, responsive inline `<svg ...>` strings inside `"diagram"` and `"solutionDiagram"`.
4. **Step-by-Step Verified Solutions**:
   - *Previous Issue*: Short, rushed solutions without detailed working.
   - *Correction*: Every solution must have numbered steps: **Step 1 (Concept/Formula)**, **Step 2 (Substitution & Units)**, **Step 3 (Algebraic Working)**, and **Step 4 (Conclusion & Option confirmation)**.
5. **Comprehension Passages (Section A)**:
   - For English or literature papers, the reading passage is extracted cleanly into the `"passage"` property.

---

## 3. Master Vision AI Extraction Prompt for WAEC

> **Instructions**: Copy the entire prompt block below, replace `[SUBJECT]` (e.g. `Mathematics`) and `[YEAR]` (e.g. `2016`), attach your scanned exam question images and solution sheets, and send to ChatGPT (GPT-4o), Claude 3.5 Sonnet, or Gemini 2.0 Pro.

```markdown
You are a senior West African Examinations Council (WAEC) Chief Examiner and Computer-Based Testing (CBT) Architect.
Your task is to transcribe, thoroughly verify, and output every single question and solution from the attached WAEC exam paper images into a pure, valid JSON array.

### TARGET SPECIFICATIONS:
- Examination Body: WAEC (WASSCE)
- Subject: [SUBJECT] (e.g., Mathematics, English, Physics, Chemistry, Biology)
- Year: [YEAR] (e.g., 2016)
- File Destination: src/data/question_banks/waec/[subject_lowercase]/waec_[subject_lowercase]_[year].json

### MANDATORY INGESTION RULES (CRITICAL):
1. PURE JSON ONLY: Output ONLY a valid JSON array starting with `[` and ending with `]`. No conversational preamble, no markdown backticks ```json, no postscript comments.
2. ZERO QUESTION DROPPING: Inspect every image carefully from top to bottom. Do NOT skip any questions, Roman numerals, or sub-questions. Transcribe every single question present in the images.
3. TABLE FORMATTING: If any question contains a data table, frequency table, schedule, or truth table:
   - Format it as a standard Markdown table:
     | Header 1 | Header 2 |
     |---|---|
     | Data 1 | Data 2 |
   - Wrap any numbers or mathematical symbols inside cells with single dollar signs: `$10$`, `$\\frac{1}{2}$`.
   - NEVER use slashes `/` or plain tab spaces as table substitutes.
4. FORMULA SIZING & LATEX:
   - Use inline LaTeX `$formula$` for all math expressions so formulas blend at the exact same size as the surrounding text.
   - Double-escape backslashes for valid JSON: `\\frac{a}{b}`, `\\sqrt{x}`, `\\theta`, `\\times`, `\\pm`, `^\\circ`.
5. DIAGRAMS & GRAPHS (AUTOMATIC SVG GENERATION):
   - DO NOT ASK IF DIAGRAMS SHOULD BE DRAWN. If a question contains a diagram, circle theorem, graph, geometric shape, or circuit, generate a responsive, self-contained SVG string inside the `"diagram"` field.
   - If solving the problem benefits from an annotated working diagram (such as triangle of elevation, vector force polygon, or Venn diagram), generate an SVG string inside the `"solutionDiagram"` field.
   - SVGs must have viewBox="0 0 240 160", width="100%", style="max-width:240px;margin:auto;display:block;", and use clean stroke and fill colors (#f59e0b for highlights, #38bdf8 for lines, #e2e8f0 for text). If no diagram exists, set `"diagram": null`.
6. VERIFIED STEP-BY-STEP SOLUTIONS:
   - Do NOT just copy brief answers from answer keys. Every solution must be mathematically verified and structured into clear, readable steps:
     **Step 1:** State the governing principle, definition, or mathematical formula.
     **Step 2:** List given values with correct units and substitutions.
     **Step 3:** Step-by-step algebraic or logical derivation leading to the answer.
     **Step 4:** Clear conclusion affirming why the correct option is Option X ($value$).
7. OBJECTIVES vs THEORY:
   - Paper 1 (Objectives): `"type": "objective"`, `"options": ["$A$", "$B$", "$C$", "$D$"]`, `"correctAnswer": 0` (0 for A, 1 for B, 2 for C, 3 for D).
   - Paper 2 (Theory/Essay): `"type": "theory"`, `"options": []`, `"correctAnswer": -1`, `"marks": 10`, `"modelAnswer": "Full working..."`.
8. COMPREHENSION PASSAGES (Section A):
   - If the exam contains a reading comprehension passage, put the entire passage text in the `"passage"` property of every question associated with it.

### EXACT JSON OBJECT SCHEMA:
[
  {
    "id": "waec-[subject_short]-[year]-q1",
    "subject": "[SUBJECT]",
    "examType": "WAEC",
    "year": [YEAR],
    "section": "General",
    "type": "objective",
    "passage": null,
    "question": "Question text with inline math $x^2 + 5x + 6 = 0$ or markdown table.",
    "diagram": null,
    "options": [
      "$x = -2$ or $x = -3$",
      "$x = 2$ or $x = 3$",
      "$x = -1$ or $x = -6$",
      "$x = 1$ or $x = 6$"
    ],
    "correctAnswer": 0,
    "explanation": "**Step 1:** Identify the quadratic equation: $x^2 + 5x + 6 = 0$.\n\n**Step 2:** Find two factors of $6$ that sum to $5$: factors are $2$ and $3$.\n\n**Step 3:** Factorize: $(x + 2)(x + 3) = 0 \\implies x = -2$ or $x = -3$.\n\n**Step 4:** Affirm correct option: Option A ($x = -2$ or $x = -3$).",
    "solutionDiagram": null,
    "topic": "Algebra - Quadratic Equations",
    "difficulty": "Medium"
  }
]
```

---

## 4. How to Register the Extracted File in the App

1. Create the `.json` file at `src/data/question_banks/waec/[subject]/waec_[subject]_[year].json` and paste your extracted JSON array.
2. In `src/data/question_banks/waec/index.ts`, add the one-line import:
   ```typescript
   import { Question } from '../../../types';
   import waecMath2015 from './mathematics/waec_math_2015.json';
   import waecMath2016 from './mathematics/waec_math_2016.json'; // <-- Newly added year

   export const waecQuestions: Question[] = [
     ...(waecMath2015 as unknown as Question[]),
     ...(waecMath2016 as unknown as Question[])                  // <-- Included in bank
   ];
   ```
3. The year (e.g. `2016`) will **automatically and instantly appear** in the CBT year selection screen with its total question count.
