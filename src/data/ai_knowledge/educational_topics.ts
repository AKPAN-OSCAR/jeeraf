/**
 * @file educational_topics.ts
 * @description Educational Knowledge Base for JeeRaf AI.
 *
 * DEVELOPER NOTE:
 * Contains high-yield study advice, exam tactics (JAMB/WAEC/NECO), subject strategies,
 * active recall methods, calculation shortcuts, and core academic concepts.
 */

export interface StudyStrategy {
  title: string;
  category: 'jamb' | 'waec' | 'speed' | 'active_learning' | 'math_physics' | 'memory';
  summary: string;
  actionableSteps: string[];
}

export const EDUCATIONAL_KNOWLEDGE: StudyStrategy[] = [
  {
    title: 'JAMB UTME Time Management & Elimination Method',
    category: 'jamb',
    summary: 'JAMB gives you 180 questions across 4 subjects to answer in 120 minutes (~40 seconds per question).',
    actionableSteps: [
      'Pass 1 (Speed Pass): Answer all direct questions first in Use of English and reading subjects.',
      'Pass 2 (Calculation Pass): Solve questions requiring 1-2 steps of formula calculations.',
      'Pass 3 (Review Pass): Use process of elimination to narrow options on tough questions.',
      'Never leave any question blank in JAMB since there is no negative marking.'
    ]
  },
  {
    title: 'Active Recall & Spaced Repetition (The Gold Standard)',
    category: 'active_learning',
    summary: 'Passive reading gives a false sense of mastery. Testing yourself actively builds neural connections.',
    actionableSteps: [
      'After reading a chapter, close your notes and write down everything you remember (Feynman technique).',
      'Use JeeRaf Universal Personal CBT to upload notes and generate practice quizzes.',
      'Review missed questions 24 hours later, then 3 days later, then 1 week later.'
    ]
  },
  {
    title: 'WAEC & NECO Essay & Theory Preparation',
    category: 'waec',
    summary: 'WAEC examiners award marks based on standard terminology, key definitions, and clear working steps.',
    actionableSteps: [
      'In Science subjects (Physics/Chemistry/Biology), state the exact units in final answers.',
      'In Mathematics, show every step of algebraic simplification for full partial marks.',
      'In English Language, practice summary writing by extracting main topic sentences without copying word-for-word.'
    ]
  },
  {
    title: 'Mathematics & Calculation Shortcuts',
    category: 'math_physics',
    summary: 'Mastering key formula relationships allows you to solve physics and math problems in under 30 seconds.',
    actionableSteps: [
      'Quadratic Formula: x = (-b ± √(b² - 4ac)) / (2a). Check discriminant b² - 4ac first.',
      'Trigonometry: SOH CAH TOA for right-angled triangles; Sine rule (a/sinA = b/sinB) for oblique triangles.',
      'Calculus: Power rule d/dx(x^n) = n*x^(n-1); Integration ∫x^n dx = (x^(n+1))/(n+1) + C.'
    ]
  },
  {
    title: 'Physics & Engineering Fundamentals',
    category: 'math_physics',
    summary: 'Core equations across mechanics, electricity, and waves.',
    actionableSteps: [
      'Newton’s 2nd Law: Force = mass × acceleration (F = ma).',
      'Ohm’s Law: Voltage = Current × Resistance (V = IR); Power P = IV = I²R = V²/R.',
      'Wave Equation: Speed = frequency × wavelength (v = fλ).'
    ]
  }
];
