# JeeRaf CBT National Past Questions Ingestion Guide

This guide explains how past questions are organized, the exact JSON structure required, the prompt to give external AI tools when extracting questions from images, and how to register new subjects and years into the CBT system.

> 📖 **TypeScript Registry Deep-Dive:** For complete code recipes and syntax rules on wiring `index.ts` files, see the [TypeScript Registry Guide](./REGISTRY_GUIDE.md).

---

## 1. Directory Structure

All question banks are located under `src/data/question_banks/` and organized by national exam body, subject, and year:

```text
src/data/question_banks/
├── index.ts                         # Master registry combining all exam bodies
├── waec/
│   ├── index.ts                     # WAEC master registry
│   └── mathematics/
│       └── waec_math_2015.json      # WAEC Mathematics 2015 Questions & Solutions
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
  * `waec_math_2015.json`
  * `waec_english_2015.json`
  * `jamb_phy_2023.json`
  * `neco_chem_2022.json`

---

## 2. Complete AI Prompt for Image Extraction

When you upload your 19 exam images (or scanned past question papers) to ChatGPT, Claude, or Gemini, **copy and paste this exact prompt**:

```text
You are an expert West African Examinations Council (WAEC) and JAMB CBT data digitizer.
I have uploaded images containing past examination questions, objectives, theory questions, and complete solutions.

Your task is to transcribe and format all questions into a valid, strict JSON array conforming to the specification below.

OUTPUT RULES:
1. Output ONLY the raw JSON array starting with [ and ending with ]. Do not wrap in markdown quotes if possible, or use standard ```json ``` codeblock.
2. For multiple choice / objective questions:
   - "type": "objective"
   - "options": Array of 4 strings (Options A, B, C, D)
   - "correctAnswer": integer index of the correct option (0 for A, 1 for B, 2 for C, 3 for D)
   - "explanation": Complete step-by-step working and reasoning
3. For theory / essay questions:
   - "type": "theory"
   - "options": []
   - "correctAnswer": -1
   - "marks": Allocated marks (e.g. 10 or 12)
   - "explanation": Complete marking guide and step-by-step solution
4. Mathematical Formulas:
   - Use standard LaTeX with $...$ for inline equations and $$...$$ for block equations (e.g. $\\frac{a}{b}$, $\\sqrt{x}$, $\\log_{10} 2$, $\\int_0^1 x dx$).
5. Diagrams / Figures:
   - If a question has a geometric or circuit diagram, provide clean inline SVG in the question text or a placeholder description.
6. IDs must follow the pattern: "<exam>-<subject>-<year>-q<number>" (e.g. "waec-math-2015-q1").

JSON SCHEMA PER ITEM:
{
  "id": "waec-math-2015-q1",
  "subject": "Mathematics",
  "examType": "WAEC",
  "year": 2015,
  "section": "General",
  "type": "objective", // or "theory"
  "question": "The question text with LaTeX formulas...",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0,
  "explanation": "**Step 1:** Detailed solution...",
  "topic": "Topic Name",
  "difficulty": "Easy" // "Easy", "Medium", or "Hard"
}

Now extract every question from the uploaded images faithfully without omitting any question numbers.
```

---

## 3. Question JSON Schema Reference

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique identifier (e.g. `waec-math-2015-q1`) |
| `subject` | `string` | e.g. `"Mathematics"`, `"English"`, `"Physics"`, `"Chemistry"` |
| `examType` | `string` | `"WAEC"`, `"JAMB"`, `"NECO"`, `"WAEC GCE"`, or `"NECO GCE"` |
| `year` | `number` | The exam year (e.g. `2015`, `2024`) |
| `section` | `string` | Section name (e.g. `"General"`, `"Comprehension"`, `"Theory"`) |
| `type` | `string` | `"objective"` or `"theory"` |
| `question` | `string` | The question text (supports Markdown & KaTeX LaTeX `$...$`) |
| `options` | `string[]` | 4 options for objective, empty array `[]` for theory |
| `correctAnswer`| `number` | `0`=A, `1`=B, `2`=C, `3`=D (`-1` for theory) |
| `explanation` | `string` | Detailed step-by-step marking guide and solution |
| `topic` | `string` | Topic classification |
| `difficulty` | `string` | `"Easy"`, `"Medium"`, or `"Hard"` |
| `marks` | `number` | *(Optional)* Total marks for theory questions |
| `imageUrl` | `string` | *(Optional)* URL for external diagram/chart |
| `images` | `string[]` | *(Optional)* Array of image URLs |

---

## 4. How to Register a New Subject or Year in the App

1. **Create the JSON file:**
   Save your extracted JSON into the appropriate folder:
   ```text
   src/data/question_banks/waec/english/waec_english_2015.json
   ```
2. **Register it in the exam body's `index.ts`:**
   Open `src/data/question_banks/waec/index.ts` and add:
   ```typescript
   import waecMath2015 from './mathematics/waec_math_2015.json';
   import waecEnglish2015 from './english/waec_english_2015.json'; // <--- NEW

   export const waecQuestions: Question[] = [
     ...(waecMath2015 as unknown as Question[]),
     ...(waecEnglish2015 as unknown as Question[]) // <--- NEW
   ];
   ```
3. **Done!**
   The questions are immediately available across the entire app, in practice mode, composite exams, and result reviews.
