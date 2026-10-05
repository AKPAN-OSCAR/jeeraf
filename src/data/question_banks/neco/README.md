# NECO (SSCE) Past Questions Ingestion & AI Prompt Master Guide

This guide contains the upgraded, production-grade vision AI extraction prompt designed specifically for **NECO (National Examinations Council - Senior School Certificate Examination)**.

---

## 1. Directory & File Naming Conventions

Save your extracted JSON file in the following structure:
```text
src/data/question_banks/neco/{subject_lowercase}/neco_{subject_lowercase}_{year}.json
```

### Examples:
- **Mathematics 2024**: `src/data/question_banks/neco/mathematics/neco_math_2024.json`
- **English Language 2024**: `src/data/question_banks/neco/english/neco_english_2024.json`
- **Physics 2024**: `src/data/question_banks/neco/physics/neco_physics_2024.json`

---

## 2. Key NECO Exam Format Specifications

1. **Composite Exam Structure**:
   - NECO features **Paper 1 (Objectives)** and **Paper 2 (Essay & Practical/Theory)**.
   - For Objectives: `"type": "objective"`, `"options": ["...", "...", "...", "..."]`, `"correctAnswer": 0`.
   - For Essay/Theory: `"type": "theory"`, `"options": []`, `"correctAnswer": -1`, `"marks": 10`.
2. **Tables and Graphs**:
   - Statistical and experimental readings must be formatted in Markdown tables (`| ... | ... |`).
3. **Verified Step-by-Step Solutions**:
   - Step 1 (Principle/Formula), Step 2 (Substitution & Working), Step 3 (Calculation), Step 4 (Option/Answer).
4. **Comprehension & Summary Passages**:
   - For English Paper 1 and 2, comprehension texts must be embedded in the `"passage"` property.

---

## 3. Master Vision AI Extraction Prompt for NECO

> **Instructions**: Copy the entire prompt block below, replace `[SUBJECT]` and `[YEAR]`, attach your scanned exam question images, and send to ChatGPT (GPT-4o), Claude 3.5 Sonnet, or Gemini 2.0 Pro.

```markdown
You are a senior National Examinations Council (NECO) Chief Examiner and Educational Assessment Engineer.
Your task is to transcribe, mathematically verify, and output all questions and step-by-step solutions from the attached NECO exam paper images into a pure, valid JSON array.

### TARGET SPECIFICATIONS:
- Examination Body: NECO (SSCE)
- Subject: [SUBJECT]
- Year: [YEAR]
- File Destination: src/data/question_banks/neco/[subject_lowercase]/neco_[subject_lowercase]_[year].json

### MANDATORY RULES:
1. PURE JSON ONLY: Output ONLY a valid JSON array starting with `[` and ending with `]`. No markdown backticks, no conversational preamble.
2. ZERO QUESTION DROPPING: Inspect every image from top to bottom. Do NOT omit any questions, sections, or sub-parts.
3. TABLE FORMATTING: If any question contains a data table, frequency table, or schedule:
   - Structure it as a standard Markdown table:
     | Header 1 | Header 2 |
     |---|---|
     | Data 1 | Data 2 |
   - Wrap numbers and math symbols in `$math$`. Never use plain slashes `/`.
4. FORMULA SIZING & LATEX:
   - Use inline LaTeX `$formula$` for all math expressions so equations blend at the exact same size as body text.
   - Double-escape backslashes: `\\frac{a}{b}`, `\\sqrt{x}`, `\\times`, `\\theta`, `^\\circ`.
5. DIAGRAMS & GRAPHS (AUTOMATIC SVG GENERATION):
   - DO NOT ASK IF DIAGRAMS SHOULD BE DRAWN. If a question contains a geometric figure, apparatus, angle, or graph, generate a responsive, self-contained SVG string inside `"diagram"`.
   - If solving the question benefits from an explanatory diagram, generate an SVG inside `"solutionDiagram"`.
   - SVG properties: viewBox="0 0 240 160", width="100%", style="max-width:240px;margin:auto;display:block;".
6. VERIFIED STEP-BY-STEP SOLUTIONS:
   - Every solution must be verified and structured into:
     **Step 1:** State governing formula or principle.
     **Step 2:** List given data and substitutions.
     **Step 3:** Step-by-step algebraic/logical calculation.
     **Step 4:** Clear conclusion affirming correct option or theory mark allocation.
7. COMPREHENSION PASSAGES (Section A):
   - Place any reading comprehension or passage text inside the `"passage"` property.

### EXACT JSON OBJECT SCHEMA:
[
  {
    "id": "neco-[subject_short]-[year]-q1",
    "subject": "[SUBJECT]",
    "examType": "NECO",
    "year": [YEAR],
    "section": "General",
    "type": "objective",
    "passage": null,
    "question": "Question text with inline math $2x + y = 7$ or table.",
    "diagram": null,
    "options": [
      "$x = 2, y = 3$",
      "$x = 3, y = 1$",
      "$x = 1, y = 5$",
      "$x = 4, y = -1$"
    ],
    "correctAnswer": 0,
    "explanation": "**Step 1:** State the simultaneous equations:\n(1) $2x + y = 7$\n(2) $3x - y = 3$\n\n**Step 2:** Add equations (1) and (2) to eliminate $y$:\n$5x = 10 \\implies x = 2$.\n\n**Step 3:** Substitute $x = 2$ into equation (1):\n$2(2) + y = 7 \\implies 4 + y = 7 \\implies y = 3$.\n\n**Step 4:** Affirm correct option: Option A ($x = 2, y = 3$).",
    "solutionDiagram": null,
    "topic": "Algebra - Simultaneous Equations",
    "difficulty": "Medium"
  }
]
```

---

## 4. How to Register the Extracted File in the App

1. Save the file to `src/data/question_banks/neco/[subject]/neco_[subject]_[year].json`.
2. In `src/data/question_banks/neco/index.ts`, add the import:
   ```typescript
   import { Question } from '../../../types';
   import necoMath2024 from './mathematics/neco_math_2024.json';
   import necoMath2023 from './mathematics/neco_math_2023.json';

   export const necoQuestions: Question[] = [
     ...(necoMath2024 as unknown as Question[]),
     ...(necoMath2023 as unknown as Question[])
   ];
   ```
3. The year will automatically appear in the NECO exam selector.
