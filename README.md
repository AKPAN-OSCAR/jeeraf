# JeeRaf CBT System


<p align="center">
  <img src="./public/jeeraf-with-name.svg" alt="JeeRaf CBT System logo" width="280">
</p>

<p align="center">
  An AI-powered learning and computer-based testing platform being built for learners around the world.
</p>

JeeRaf aims to help learners prepare for country-specific national examinations and create personalized CBT practice from their own study materials or lecture audio. Learners can configure their practice, review results, and get detailed explanations—all in one place.

---

## What JeeRaf Is Building

JeeRaf is under active development, with a global vision. The goal is to bring national exam preparation and flexible, AI-assisted study tools together:

- **Country-specific national exam practice:** Build out exam question banks and formats for learners in different countries. JAMB, WAEC, and NECO are among the exam formats represented in the current project; country and exam coverage is still growing.
- **Personalized CBTs from study materials:** Let learners use their own notes and study resources to create practice exams, then set preferences such as the number of questions and test duration.
- **Audio-assisted learning:** Record a lecture or upload an audio recording to request a detailed explanation and generate CBT practice from its study content.
- **AI explanations and review:** Provide worked, step-by-step explanations to help learners understand answers, not just see a score. AI-generated content should be checked against trusted course materials.
- **Exam-style tools:** Support objective and theory formats, configurable timing, an in-exam calculator, and review of submitted answers.

JeeRaf is still being built. Feature availability and exam-bank coverage vary by country and exam, and will expand as development continues.

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




## Product Walkthrough

[![Watch the JeeRaf walkthrough](https://img.youtube.com/vi/43x37fiQEfM/hqdefault.jpg)](https://www.youtube.com/watch?v=43x37fiQEfM)

A short look at JeeRaf’s current build and features in development.




This video gives a quick look at JeeRaf's current build and some of the features in development.

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
