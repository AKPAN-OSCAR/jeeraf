# WAEC GCE Past Questions Ingestion & AI Prompt Master Guide

This guide contains the upgraded vision AI extraction prompt designed for **WAEC GCE (General Certificate of Education - Private Candidate Series)**.

---

## 1. Directory & File Naming Conventions

Save your extracted JSON file in the following structure:
```text
src/data/question_banks/waec_gce/{subject_lowercase}/waec_gce_{subject_lowercase}_{year}.json
```

### Examples:
- **Mathematics 2024**: `src/data/question_banks/waec_gce/mathematics/waec_gce_math_2024.json`
- **English Language 2024**: `src/data/question_banks/waec_gce/english/waec_gce_english_2024.json`
- **Physics 2024**: `src/data/question_banks/waec_gce/physics/waec_gce_physics_2024.json`

---

## 2. Master Vision AI Extraction Prompt for WAEC GCE

```markdown
You are a senior West African Examinations Council (WAEC) GCE Chief Examiner.
Your task is to transcribe, mathematically verify, and output all questions and solutions from the attached WAEC GCE exam paper images into a pure, valid JSON array.

### TARGET SPECIFICATIONS:
- Examination Body: WAEC GCE
- Subject: [SUBJECT]
- Year: [YEAR]
- File Destination: src/data/question_banks/waec_gce/[subject_lowercase]/waec_gce_[subject_lowercase]_[year].json

### MANDATORY RULES:
1. PURE JSON ONLY: Output ONLY a valid JSON array starting with `[` and ending with `]`. No markdown backticks, no conversational text.
2. ZERO QUESTION DROPPING: Transcribe every question and option in the exam paper images completely.
3. TABLE FORMATTING: Standard Markdown tables (`| ... | ... |`). Wrap numbers in `$math$`. Never use slashes `/`.
4. FORMULA SIZING & LATEX: Use inline LaTeX `$formula$` for all math. Double-escape backslashes: `\\frac{a}{b}`, `\\sqrt{x}`, `^\\circ`.
5. DIAGRAMS & GRAPHS: Never ask if diagrams should be drawn. Synthesize clean, responsive inline `<svg ...>` inside `"diagram"` and `"solutionDiagram"`.
6. VERIFIED STEP-BY-STEP SOLUTIONS: Step 1 (Principle/Formula), Step 2 (Substitution), Step 3 (Algebraic Working), Step 4 (Affirm correct option).
7. COMPREHENSION: Place reading passages inside `"passage"`.

### EXACT JSON OBJECT SCHEMA:
[
  {
    "id": "waec-gce-[subject_short]-[year]-q1",
    "subject": "[SUBJECT]",
    "examType": "WAEC GCE",
    "year": [YEAR],
    "section": "General",
    "type": "objective",
    "passage": null,
    "question": "Question text with inline math or markdown table.",
    "diagram": null,
    "options": [
      "Option A",
      "Option B",
      "Option C",
      "Option D"
    ],
    "correctAnswer": 0,
    "explanation": "**Step 1:** Formula: $T_n = a + (n-1)d$.\n\n**Step 2:** Given $a = 3, d = 4, n = 8$.\n\n**Step 3:** Calculate: $T_8 = 3 + (7)(4) = 3 + 28 = 31$.\n\n**Step 4:** Affirm correct option: Option A ($31$).",
    "solutionDiagram": null,
    "topic": "Sequences and Series",
    "difficulty": "Medium"
  }
]
```

---

## 3. How to Register in App

Save to `src/data/question_banks/waec_gce/[subject]/waec_gce_[subject]_[year].json` and register in `src/data/question_banks/waec_gce/index.ts`.
