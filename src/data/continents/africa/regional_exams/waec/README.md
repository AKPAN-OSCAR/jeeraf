# WAEC (WASSCE) Past Questions Ingestion & AI Prompt Master Guide

This guide contains the question ingestion standards and AI extraction prompts for **WAEC (West African Senior School Certificate Examination)**.

---

## 1. Directory & File Naming Conventions

Always save your extracted JSON file in the following structure:
```text
src/data/continents/africa/regional_exams/waec/{subject_lowercase}/waec_{subject_lowercase}_{year}.json
```

### Examples:
- **Mathematics 2012**: `src/data/continents/africa/regional_exams/waec/mathematics/waec_math_2012.json`
- **Mathematics 2013**: `src/data/continents/africa/regional_exams/waec/mathematics/waec_math_2013.json`
- **Mathematics 2015**: `src/data/continents/africa/regional_exams/waec/mathematics/waec_math_2015.json`
- **Mathematics 2016**: `src/data/continents/africa/regional_exams/waec/mathematics/waec_math_2016.json`
- **English Language 2018**: `src/data/continents/africa/regional_exams/waec/english/waec_english_2018.json`
- **Physics 2020**: `src/data/continents/africa/regional_exams/waec/physics/waec_physics_2020.json`
- **Chemistry 2021**: `src/data/continents/africa/regional_exams/waec/chemistry/waec_chemistry_2021.json`
- **Biology 2022**: `src/data/continents/africa/regional_exams/waec/biology/waec_biology_2022.json`

---

## 2. Key Corrections & Common AI Errors Addressed in the New Prompt

1. **CRITICAL: Double Backslash Escape in JSON (No Control Characters)**:
   - *Root Cause of Incomprehensible Math*: When an AI outputs single backslashes in JSON (like `\frac` or `\times`), JSON interprets:
     - `\f` as Form-Feed control character (`\x0c`), completely breaking fractions.
     - `\t` as Tab control character, mangling `\times` and `\text`.
     - `\a` as Bell control character (`\x07`), mangling `\angle` into ` ngle` and `\approx` into ` pprox`.
     - `\r` as Carriage-Return control character, mangling `\right)` into ` ight)`.
   - *The Fix*: The AI prompt strictly mandates **double-escaped backslashes**: `\\frac`, `\\times`, `\\sqrt`, `\\angle`, `\\triangle`, `\\approx`, `\\right)`, `\\left(`, `\\pm`, `\\circ`, `\\text`.

2. **Real Pedagogical Explanations (No Generic Dummy Placeholders)**:
   - *Previous Issue*: AI repeatedly printed dummy boilerplate like:
     `Step 1: Identify the governing rule or formula.`
     `Step 2: Substitute the given values.`
     `Step 3: Work through the algebra or geometry carefully.`
   - *The Fix*: The prompt strictly forbids generic filler. Every step must contain the genuine mathematical and conceptual working, substitutions, and calculation so students can learn and understand.

3. **Tables (Statistics, Frequency, Truth Tables)**:
   - Must be structured as standard Markdown tables (`| Col 1 | Col 2 |` and `|---|---|`). Numbers and mathematical expressions inside table cells must be wrapped in `$math$`.

4. **Formula Sizing with Text**:
   - All inline symbols, equations, and option choices use inline `$equation$` so font size matches body text. Use `$$equation$$` only for major standalone derivations.

5. **Automatic Inline SVG Diagrams**:
   - The AI must synthesize clean, responsive inline `<svg ...>` strings inside `"diagram"` and `"solutionDiagram"`.

---

## 3. [ARCHIVED - OLD PROMPT] Historical Master Prompt (Kept for Reference Records)

> ⚠️ **NOTE**: This prompt was used historically. It has been superseded by the **New Professional Standard Prompt (Section 4)** below because some AI tools produced unescaped backslashes and generic placeholder steps with this older version. Kept strictly for historical audit and records.

```markdown
You are a senior West African Examinations Council (WAEC) Chief Examiner and Computer-Based Testing (CBT) Architect.
Your task is to transcribe, thoroughly verify, and output every single question and solution from the attached WAEC exam paper images into a pure, valid JSON array.

### TARGET SPECIFICATIONS:
- Examination Body: WAEC (WASSCE)
- Subject: [SUBJECT] (e.g., Mathematics, English, Physics, Chemistry, Biology)
- Year: [YEAR] (e.g., 2016)
- File Destination: src/data/continents/africa/regional_exams/waec/[subject_lowercase]/waec_[subject_lowercase]_[year].json

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

## 4. [ACTIVE / CURRENT] Professional Grade-A WAEC AI Extraction Master Prompt (New Production Standard)

> ⭐️ **USE THIS PROMPT FOR ALL NEW EXTRACTIONS**:
> Copy the entire prompt below, replace `[SUBJECT]` (e.g. `Mathematics`) and `[YEAR]` (e.g. `2014`), attach your question images, and send to ChatGPT (GPT-4o), Claude 3.5 Sonnet, or Gemini 2.0 Pro.

```markdown
You are a Principal West African Examinations Council (WAEC/WASSCE) Chief Examiner, Senior Mathematics & Science Fellow, and CBT Technical Architect.

Your mission is to transcribe, mathematically solve, and output every single question and solution from the attached WAEC exam paper images into a pure, valid, production-grade JSON array.

### TARGET SPECIFICATIONS:
- Examination Body: WAEC
- Subject: [SUBJECT] (e.g. Mathematics, English Language, Physics, Chemistry, Biology)
- Year: [YEAR] (e.g. 2014)
- Target File: src/data/continents/africa/regional_exams/waec/[subject_lowercase]/waec_[subject_lowercase]_[year].json

### MANDATORY PRODUCTION RULES (STRICT COMPLIANCE):

1. STRICT JSON STRING ESCAPING (CRITICAL):
   - You MUST write DOUBLE BACKSLASHES for ALL LaTeX commands inside JSON string values:
     Use `\\frac{a}{b}`, NOT `\frac{a}{b}` (single backslash produces broken form-feed \f).
     Use `\\times`, NOT `\times` (single backslash produces broken tab \t).
     Use `\\angle`, NOT `\angle` (single backslash produces broken bell \a).
     Use `\\approx`, NOT `\approx` (single backslash produces broken bell \a).
     Use `\\triangle`, NOT `\triangle`.
     Use `\\sqrt{x}`, NOT `\sqrt{x}`.
     Use `\\left( ... \\right)`, NOT `\left( ... \right)`.
     Use `\\pm`, `\\circ`, `\\le`, `\\ge`, `\\theta`, `\\pi`, `\\text{...}`.
   - Any single backslash in JSON creates invalid escape characters that break student screens. Always double-escape every backslash.

2. GENUINE STEP-BY-STEP EXPLANATIONS (NO PLACEHOLDER TEXT):
   - NEVER output dummy placeholder sentences like:
     "Identify the governing rule or formula."
     "Substitute the given values."
     "Work through the algebra or geometry carefully."
   - Every question's "explanation" MUST provide genuine, step-by-step working that teaches a secondary school student:
     **Step 1:** Clearly state the actual mathematical rule, identity, theorem, or formula being applied to this specific problem.
     **Step 2:** Show the exact numbers and parameters substituted into the formula.
     **Step 3:** Show line-by-line algebraic simplification or logical derivation.
     **Step 4:** Clearly conclude with the final value and affirm the matching letter option: "Option X ($value$)".

3. ZERO QUESTION DROPPING:
   - Scrutinize every image thoroughly. Include all Paper 1 objective questions (1 to 50) and Paper 2 theory questions. Do not omit any question numbers.

4. OBJECTIVES & THEORY SCHEMA:
   - Objective Questions:
     "type": "objective",
     "options": ["Option A", "Option B", "Option C", "Option D"],
     "correctAnswer": 0 (0 for A, 1 for B, 2 for C, 3 for D).
   - Theory Questions:
     "type": "theory",
     "options": [],
     "correctAnswer": -1,
     "marks": 10,
     "explanation": "Full marking guide with step-by-step derivation..."

5. DIAGRAMS, GRAPHS & GEOMETRY (INLINE HIGH-RES BLUEPRINT SVG):
   - CRITICAL SIZING RULE: NEVER use `max-width:240px` in the style! That causes diagrams to render tiny and unreadable.
   - Use responsive dimensions: `<svg viewBox="0 0 400 250" width="100%" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;margin:auto;display:block;">`
   - BLUEPRINT COLOR PALETTE (Based on WAEC 2011/2013 high-clarity standard):
     - Background: `<rect width="100%" height="100%" fill="#0f172a" rx="16"/>` (Dark engineering blueprint canvas)
     - Primary Geometry & Shapes: `stroke="#38bdf8"` with `stroke-width="2"` (Sky Blue)
     - Angle Arcs, Radii & Special Highlights: `stroke="#f59e0b"` with `stroke-width="2"` (Golden Amber)
     - Text, Vertex & Dimension Labels: `fill="#e2e8f0" font-size="14" font-weight="bold" font-family="sans-serif"` (Crisp Off-White)
     - Venn Diagrams: Clean intersecting circles with semi-transparent fills:
       `fill="#38bdf8" fill-opacity="0.25" stroke="#38bdf8" stroke-width="2"` for Set A
       `fill="#f59e0b" fill-opacity="0.25" stroke="#f59e0b" stroke-width="2"` for Set B
       `fill="#10b981" fill-opacity="0.25" stroke="#10b981" stroke-width="2"` for Set C
   - If no diagram is present in the exam paper, set `"diagram": null`.

6. DATA TABLES (STATISTICS, FREQUENCIES & TRUTH TABLES):
   - You MUST include a blank newline before and after every table.
   - You MUST format tables using standard Markdown table syntax with vertical bar delimiters:
     ```markdown
     | $x$ | $0$ | $1\\frac{1}{4}$ | $2$ | $4$ |
     |---|---|---|---|---|
     | $y$ | $3$ | $5$ | $7$ | $11$ |
     ```
   - NEVER concatenate rows onto a single line using `||`. Every table row MUST be on its own line.
   - Wrap numbers and mathematical expressions inside cells in `$math$` delimiters.

7. OUTPUT FORMAT:
   - Output ONLY the raw JSON array starting with `[` and ending with `]`.
   - Do NOT include markdown code fences (```json), conversational greeting, or closing commentary.

### JSON RECORD TEMPLATE:
[
  {
    "id": "waec-math-[year]-q1",
    "subject": "Mathematics",
    "examType": "WAEC",
    "year": [YEAR],
    "section": "General",
    "type": "objective",
    "passage": null,
    "question": "Simplify $\\frac{3\\sqrt{5} \\times 4\\sqrt{6}}{2\\sqrt{2} \\times 3\\sqrt{3}}$.",
    "diagram": null,
    "options": [
      "$\\sqrt{2}$",
      "$\\sqrt{5}$",
      "$2\\sqrt{2}$",
      "$2\\sqrt{5}$"
    ],
    "correctAnswer": 3,
    "explanation": "**Step 1:** Multiply numerical coefficients and radicals in numerator and denominator: $\\frac{(3 \\times 4)\\sqrt{5 \\times 6}}{(2 \\times 3)\\sqrt{2 \\times 3}} = \\frac{12\\sqrt{30}}{6\\sqrt{6}}$.\n\n**Step 2:** Divide the outer coefficients: $\\frac{12}{6} = 2$.\n\n**Step 3:** Divide the radicals: $\\frac{\\sqrt{30}}{\\sqrt{6}} = \\sqrt{\\frac{30}{6}} = \\sqrt{5}$.\n\n**Step 4:** Combine factors to obtain $2\\sqrt{5}$. Affirm correct choice: Option D ($2\\sqrt{5}$).",
    "solutionDiagram": null,
    "topic": "Surds and Radicals",
    "difficulty": "Medium"
  }
]
```

---

## 5. How to Manually Register a New Year in `index.ts`

To ensure 100% stability without any glob or caching issues, past questions are registered via direct TypeScript imports:

1. Place your extracted JSON in `src/data/continents/africa/regional_exams/waec/[subject]/waec_[subject]_[year].json`.
2. Open `src/data/continents/africa/regional_exams/waec/index.ts` and add:
   ```typescript
   import { Question } from '../../../types';
   import waecMath2012Json from './mathematics/waec_math_2012.json';
   import waecMath2013Json from './mathematics/waec_math_2013.json';
   import waecMath2015Json from './mathematics/waec_math_2015.json';
   import waecMath2016Json from './mathematics/waec_math_2016.json'; // <-- 1. Import file

   export const manualQuestions: Question[] = [
     ...(waecMath2012Json as unknown as Question[]),
     ...(waecMath2013Json as unknown as Question[]),
     ...(waecMath2015Json as unknown as Question[]),
     ...(waecMath2016Json as unknown as Question[])                  // <-- 2. Add to list
   ];
   ```
3. Save the file. The new year will immediately display with its exact question count button in the CBT screen.
