/**
 * @file library_and_features.ts
 * @description Library Books, Fun Games, System Navigation & User Account Integration Knowledge Base for JeeRaf AI.
 *
 * DEVELOPER NOTE:
 * Connects JeeRaf AI to:
 * 1. Textbook Library Catalog (Physics, Chemistry, Math, Biology, English, Literature, Government, Economics, Commerce, Computer Studies)
 * 2. Fun Games & CBT Duels Arena
 * 3. System Action Shortcuts & Navigation Registry
 * 4. User Account & Progress Diagnostics Engine
 */

export interface LibraryBook {
  id: string;
  subject: string;
  title: string;
  author: string;
  examTarget: string;
  summary: string;
  keyTopics: string[];
}

export const LIBRARY_BOOKS: LibraryBook[] = [
  {
    id: 'book-phys-1',
    subject: 'Physics',
    title: 'Senior Secondary Physics (Explicit Mechanics & Electricity)',
    author: 'P. N. Okeke & M. W. Anyakoha',
    examTarget: 'JAMB UTME, WAEC SSCE, NECO, Post-UTME',
    summary: 'The comprehensive gold standard for West African physics students, covering vectors, motion, thermodynamics, waves, optics, and electromagnetism.',
    keyTopics: ['Vectors & Kinematics', 'Newtonian Mechanics', 'Wave Motion & Sound', 'Electric Fields & Ohm Law', 'Atomic & Nuclear Physics']
  },
  {
    id: 'book-chem-1',
    subject: 'Chemistry',
    title: 'New School Chemistry for Senior Secondary Schools',
    author: 'Osei Yaw Ababio',
    examTarget: 'JAMB UTME, WAEC SSCE, NECO',
    summary: 'Essential chemistry concepts including stoichiometry, periodic table trends, chemical kinetics, organic chemistry, and qualitative analysis.',
    keyTopics: ['Atomic Structure & Bonding', 'Mole Concept & Stoichiometry', 'Electrochemistry & Electrolysis', 'Organic Chemistry & Hydrocarbons', 'Industrial Chemistry']
  },
  {
    id: 'book-math-1',
    subject: 'Mathematics',
    title: 'New General Mathematics for SS1-SS3',
    author: 'M. F. Macrae et al.',
    examTarget: 'JAMB UTME, WAEC, NECO, General Math',
    summary: 'Complete high school mathematics guide covering algebra, trigonometry, coordinate geometry, calculus, probability, and statistics.',
    keyTopics: ['Quadratic & Simultaneous Equations', 'Trigonometry & Bearings', 'Matrices & Determinants', 'Differential & Integral Calculus', 'Statistics & Probability']
  },
  {
    id: 'book-eng-1',
    subject: 'English Language',
    title: 'Mastering Use of English & Oral Forms',
    author: 'J. O. J. Nwachukwu-Agbada',
    examTarget: 'JAMB Use of English, WAEC, NECO',
    summary: 'Comprehensive guide for sentence structure, comprehension passages, registers, idioms, antonyms/synonyms, and oral vowel/consonant sounds.',
    keyTopics: ['Comprehension & Summary Skills', 'Grammar & Concord Rules', 'Synonyms & Antonyms', 'Oral English (Phonetics & Intonation)', 'Idioms & Figures of Speech']
  },
  {
    id: 'book-bio-1',
    subject: 'Biology',
    title: 'Modern Biology for Senior Secondary Schools',
    author: 'S. T. Ramalingam',
    examTarget: 'JAMB UTME, WAEC SSCE, NECO',
    summary: 'Cell biology, plant and animal physiology, genetics, ecology, and evolutionary biology tailored for African secondary curricula.',
    keyTopics: ['Cell Structure & Organization', 'Plant & Animal Nutrition', 'Transport & Circulatory Systems', 'Genetics & Heredity', 'Ecology & Ecosystems']
  },
  {
    id: 'book-gov-1',
    subject: 'Government',
    title: 'Essential Government for Senior Secondary Schools',
    author: 'C. C. Dibie',
    examTarget: 'JAMB UTME, WAEC SSCE, NECO',
    summary: 'Political concepts, constitutions of Nigeria, arms of government, international organizations (UN, AU, ECOWAS), and political history.',
    keyTopics: ['Basic Political Concepts & Ideologies', 'Constitutional Development in Nigeria', 'Federalism & Local Government', 'International Relations', 'Public Administration']
  }
];

export interface FunGameItem {
  id: string;
  name: string;
  description: string;
  category: string;
  targetState: string;
}

export const FUN_GAMES_LIST: FunGameItem[] = [
  {
    id: 'game-trivia',
    name: 'CBT Speed Trivia Arena',
    description: 'Fast-paced 60-second general knowledge and subject quick-fire challenge.',
    category: 'Speed & Logic',
    targetState: 'fun'
  },
  {
    id: 'game-duel',
    name: '1v1 Online CBT Duel Match',
    description: 'Compete in real-time against other students on the national leaderboard.',
    category: 'Multiplayer CBT',
    targetState: 'fun'
  },
  {
    id: 'game-brain',
    name: 'Logic & Formula Brain Teasers',
    description: 'Solve mathematical puzzles, memory games, and logic riddles.',
    category: 'Brain Training',
    targetState: 'fun'
  }
];

export interface SystemFeatureLink {
  id: string;
  name: string;
  keywords: string[];
  targetState: string;
  description: string;
}

export const SYSTEM_FEATURE_LINKS: SystemFeatureLink[] = [
  {
    id: 'feat-cbt',
    name: 'Universal Personal CBT & Exam Practice',
    keywords: ['exam', 'practice', 'cbt', 'personal cbt', 'upload pdf', 'notes', 'jamb', 'waec', 'neco'],
    targetState: 'exam_select',
    description: 'Practice national past questions or upload your lecture notes to generate custom exams.'
  },
  {
    id: 'feat-library',
    name: 'Textbook Library & Subject Study Guides',
    keywords: ['library', 'textbook', 'book', 'read', 'study guide', 'subject guide', 'literature'],
    targetState: 'textbook',
    description: 'Browse recommended textbooks, revision notes, and subject guides.'
  },
  {
    id: 'feat-progress',
    name: 'Progress Tracker & Performance Analytics',
    keywords: ['progress', 'score', 'analytics', 'history', 'performance', 'stats', 'how am i doing'],
    targetState: 'progress',
    description: 'Track your test scores, subject accuracy, time management, and historical trends.'
  },
  {
    id: 'feat-awards',
    name: 'Trophies, Badges & Leaderboard Awards',
    keywords: ['awards', 'trophies', 'badge', 'leaderboard', 'rank', 'achievement'],
    targetState: 'awards',
    description: 'View unlocked study achievements, national rank badges, and trophy milestone progress.'
  },
  {
    id: 'feat-fun',
    name: 'Fun Page, Games & Brain Challenges',
    keywords: ['fun', 'game', 'play', 'trivia', 'duel', 'brain teaser', 'entertainment'],
    targetState: 'fun',
    description: 'Play study games, take speed trivia quizzes, and challenge fellow students.'
  },
  {
    id: 'feat-subscription',
    name: 'Subscription Portal & Plan Upgrades',
    keywords: ['subscription', 'plan', 'claxy', 'claxy pro', 'upgrade', 'payment', 'pricing'],
    targetState: 'subscription_portal',
    description: 'Manage your 6-month study access plan or upgrade for priority AI features.'
  },
  {
    id: 'feat-blog',
    name: 'JeeRaf Blog & Exam News Updates',
    keywords: ['blog', 'news', 'update', 'jamb news', 'waec timetable', 'announcement'],
    targetState: 'blog',
    description: 'Stay updated with official exam timetables, registration dates, and study tips.'
  }
];
