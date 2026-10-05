# JAMB (UTME) Past Questions Ingestion & AI Prompt Master Guide

This guide contains the upgraded, production-grade vision AI extraction prompt designed specifically for **JAMB (Unified Tertiary Matriculation Examination)**.

---

## 1. Directory & File Naming Conventions

Save your extracted JSON file in the following structure:
```text
src/data/question_banks/jamb/{subject_lowercase}/jamb_{subject_lowercase}_{year}.json
```

### Examples:
- **Mathematics 2024**: `src/data/question_banks/jamb/mathematics/jamb_math_2024.json`
- **English Language 2024**: `src/data/question_banks/jamb/english/jamb_english_2024.json`
- **Physics 2024**: `src/data/question_banks/jamb/physics/jamb_physics_2024.json`
- **Chemistry 2024**: `src/data/question_banks/jamb/chemistry/jamb_chemistry_2024.json`
- **Biology 2024**: `src/data/question_banks/jamb/biology/jamb_biology_2024.json`

---

## 2. Key JAMB-Specific Rules

1. **Standard 4-Option Multiple Choice**:
   - Every question has exactly 4 options: A, B, C, D (indices 0, 1, 2, 3).
2. **Speed Tip & Fast Shortcut**:
   - Because JAMB requires answering questions under tight time constraints (e.g. 40 questions in 40 minutes), every explanation must include a **JAMB Speed Tip** demonstrating how candidates can solve or eliminate answers in under 45 seconds.
3. **Comprehension & Lexis/Structure (English)**:
   - For English papers, passages for Reading Comprehension or Novel summaries must be placed in the `"passage"` property.
4. **Tables and Matrices**:
   - Format any frequency tables, coordinate tables, or schedules in Markdown tables (`| ... | ... |`).

---

## 3. Master Vision AI Extraction Prompt for JAMB

> **Instructions**: Copy the entire prompt block below, replace `[SUBJECT]` and `[YEAR]`, attach your scanned past question images, and send to ChatGPT (GPT-4o), Claude 3.5 Sonnet, or Gemini 2.0 Pro.

```markdown
You are a senior Joint Admissions and Matriculation Board (JAMB) Chief Examiner and CBT Specialist.
Your task is to transcribe, mathematically verify, and output all questions and solutions from the attached JAMB past question images into a pure, valid JSON array.

### TARGET SPECIFICATIONS:
- Examination Body: JAMB (UTME)
- Subject: [SUBJECT]
- Year: [YEAR]
- File Destination: src/data/question_banks/jamb/[subject_lowercase]/jamb_[subject_lowercase]_[year].json

### MANDATORY RULES:
1. PURE JSON ONLY: Output ONLY a valid JSON array starting with `[` and ending with `]`. No conversational text, no markdown wrappers, no trailing notes.
2. ZERO QUESTION DROPPING: Inspect every image from top to bottom. Do NOT omit any questions or options.
3. TABLE FORMATTING: If any question contains a data table, frequency table, or matrix:
   - Structure it as a standard Markdown table:
     | Header 1 | Header 2 |
     |---|---|
     | Data 1 | Data 2 |
   - Wrap all numbers/symbols inside cells with `$value$`. Never use plain slashes `/`.
4. FORMULA SIZING & LATEX:
   - Use inline LaTeX `$formula$` for all equations and expressions so font size matches body text.
   - Double-escape backslashes: `\\frac{a}{b}`, `\\sqrt{x}`, `\\times`, `\\sin\\theta`, `^\\circ`.
5. DIAGRAMS & GRAPHS (AUTOMATIC SVG GENERATION):
   - DO NOT ASK IF DIAGRAMS SHOULD BE DRAWN. If an image contains a diagram, circuit, ray optics diagram, or graph, generate a responsive, self-contained SVG string inside `"diagram"`.
   - If solving the question benefits from an illustrative diagram, generate an SVG inside `"solutionDiagram"`.
   - SVG properties: viewBox="0 0 240 160", width="100%", style="max-width:240px;margin:auto;display:block;".
6. VERIFIED STEP-BY-STEP SOLUTIONS + SPEED SHORTCUT:
   - Do NOT give one-sentence answers. Every solution must be verified and structured into:
     **Step 1:** Underlying syllabus principle or formula.
     **Step 2:** Substitution with SI units.
     **Step 3:** Step-by-step derivation leading to the answer.
     **JAMB Speed Tip:** Quick mental shortcut or elimination trick for the exam hall.
     **Correct Answer:** Option X ($value$).
7. COMPREHENSION PASSAGES:
   - For English comprehension or passage-based items, include the full passage text inside `"passage"`.

### EXACT JSON OBJECT SCHEMA:
[
  {
    "id": "jamb-[subject_short]-[year]-q1",
    "subject": "[SUBJECT]",
    "examType": "JAMB",
    "year": [YEAR],
    "section": "General",
    "type": "objective",
    "passage": null,
    "question": "Question text with inline math $v = u + at$ or table.",
    "diagram": null,
    "options": [
      "Option A",
      "Option B",
      "Option C",
      "Option D"
    ],
    "correctAnswer": 0,
    "explanation": "**Step 1:** State formula: $v = u + at$.\n\n**Step 2:** Substitute given values: $u = 0$, $a = 2\\text{ m/s}^2$, $t = 5\\text{ s}$.\n\n**Step 3:** Calculate: $v = 0 + (2)(5) = 10\\text{ m/s}$.\n\n**JAMB Speed Tip:** Since initial velocity is zero, multiply acceleration directly by time: $2 \\times 5 = 10\\text{ m/s}$ in under 5 seconds!\n\n**Correct Answer:** Option A ($10\\text{ m/s}$).",
    "solutionDiagram": null,
    "topic": "Mechanics - Linear Motion",
    "difficulty": "Medium"
  }
]
```

---

## 4. How to Register the Extracted File in the App

1. Save the file to `src/data/question_banks/jamb/[subject]/jamb_[subject]_[year].json`.
2. In `src/data/question_banks/jamb/index.ts`, add the import:
   ```typescript
   import { Question } from '../../../types';
   import jambMath2024 from './mathematics/jamb_math_2024.json';
   import jambMath2023 from './mathematics/jamb_math_2023.json'; // Newly added year

   export const jambQuestions: Question[] = [
     ...(jambMath2024 as unknown as Question[]),
     ...(jambMath2023 as unknown as Question[])
   ];
   ```
3. The year will automatically be available in the exam configuration screen.
