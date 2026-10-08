# JeeRaf CBT System

A high-performance Computer Based Testing (CBT) platform engineered for Nigerian and West African national examinations, including **WAEC (WASSCE)**, **JAMB (UTME)**, **NECO (SSCE)**, **WAEC GCE**, and **NECO GCE**.

---

## Key Features

1. **National CBT Exam Bodies & Custom Formats**
   - **WAEC / WASSCE & WAEC GCE**: Supports Paper 1 (Objectives) and Paper 2 (Theory/Essay).
   - **JAMB UTME**: Multi-subject configuration (English, Mathematics, Physics, Chemistry, Biology, etc.).
   - **NECO & NECO GCE**: Standard national examination questions and timing.
   - **Composite Exam Mode (Both Objectives & Theory)**:
     - Automatically sequences Paper 1 (Objectives) followed by an official Intermission Break (minimum 5 minutes) before Paper 2 (Theory).
     - Full synchronization across both papers in the final result dashboard.

2. **Core Syllabus Question Banks (100% JSON Based)**
   - All questions and marking guides are organized into pure `.json` files in `src/data/question_banks/`.
   - Zero cloud database delay (instant loading, works 100% offline).
   - Mathematical equations rendered via KaTeX LaTeX (`$...$` inline, `$$...$$` block).
   - Geometric figures and circuit diagrams rendered via inline SVG or high-resolution images.

3. **Draggable CBT Calculator**
   - Universal floating scientific/basic CBT calculator.
   - Draggable across the entire screen with 4-corner snap triggers (Top-Left, Top-Right, Bottom-Left, Bottom-Right).
   - Minimizable, expandable, and glitch-free touch/click keypad.

4. **Theory Answer Workings & LaTeX Toolbar**
   - Dedicated mathematical symbols toolbar (fractions, square roots, powers, Greek letters, integrals).
   - Handwritten workings photo upload with instant image preview.

5. **Lightning-Fast Submission & Solution Review**
   - Instant transition to the comprehensive result dashboard upon submit.
   - Non-blocking background persistence to Cloud Firestore.
   - In-depth question-by-question solution review with step-by-step explanations.

---

## Directory Structure

```text
├── public/
│   ├── jeeraf-with-name.svg          # Brand vector logo (fullscreen edge-to-edge)
│   └── ...
├── src/
│   ├── components/
│   │   ├── CBTInterface.tsx          # Main exam runner (split-screen, controls, timer)
│   │   ├── Calculator.tsx            # Draggable 4-corner snap CBT calculator
│   │   ├── ExamIntermissionBreak.tsx # 5-minute break timer between Paper 1 & Paper 2
│   │   ├── CBTExamConfigPage.tsx     # Exam setup (subjects, paper format, timer)
│   │   ├── ResultDashboard.tsx       # Comprehensive score breakdown & solutions
│   │   ├── MathRenderer.tsx          # KaTeX LaTeX math engine
│   │   ├── Welcome.tsx               # Welcome landing page
│   │   ├── Auth.tsx                  # Sign in / Sign up
│   │   └── ...
│   ├── data/
│   │   ├── question_banks/           # Core question banks
│   │   │   ├── waec/                 # WAEC questions (.json)
│   │   │   ├── jamb/                 # JAMB questions (.json)
│   │   │   ├── neco/                 # NECO questions (.json)
│   │   │   ├── waec_gce/             # WAEC GCE questions (.json)
│   │   │   ├── neco_gce/             # NECO GCE questions (.json)
│   │   │   ├── index.ts              # Master question registry
│   │   │   └── README.md             # Question Ingestion & AI Prompt Guide
│   │   └── questions.ts              # Global question export
│   ├── App.tsx                       # Root application & state machine
│   ├── firebase.ts                   # Firebase Authentication & Firestore setup
│   └── types.ts                      # Core TypeScript definitions
├── metadata.json                     # Applet metadata
└── README.md                         # Project documentation
```

---

## Adding Past Questions & AI JSON Extraction Prompt

To add or update past questions with 100% precision:
1. Refer to the master guide in [`src/data/question_banks/README.md`](./src/data/question_banks/README.md).
2. Copy the **Universal Production AI Master Prompt** from Section 3, attach your scanned exam question images or PDF pages, and run it in ChatGPT (GPT-4o), Claude 3.5/3.7 Sonnet, Gemini 2.5 Pro, or DeepSeek.
3. Save the returned JSON into the relevant subject file (e.g. `src/data/question_banks/waec/mathematics/waec_math_2015.json`).
4. Register the file in the exam body's `index.ts`. All questions, subjects, and year selection buttons immediately become active in the app.

---

## Check out the video clip below 

<video controls src="src/library/general/Screen Recording 2026-10-08 192939.mp4" title="inside jeeraf cbt software"></video>


**About this video:** A short walkthrough of JeeRaf CBT System, showing some of its current features and how they work.

This is a quick insight of jeeraf cbt software displaying what features it has and how these features are being used in the software.

> **Development status:** JeeRaf is still under development. This video shows the software as it currently stands; features and screens may change.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run TypeScript linter
npm run lint

# Build for production
npm run build
```
