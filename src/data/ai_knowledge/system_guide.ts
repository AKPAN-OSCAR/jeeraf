/**
 * @file system_guide.ts
 * @description Comprehensive Knowledge Base & User Guide for JeeRaf CBT Platform.
 *
 * DEVELOPER NOTE:
 * This file contains structured system documentation fed directly into the JeeRaf AI
 * LLM context and search engine. Developers can update or add new feature guides here.
 *
 * Topic Scope:
 * - Platform Navigation & Main Directory Hub
 * - Universal Personal CBT (PDF, DOCX, Textbook & Note Uploads)
 * - Audio AI Lecture Studio (Live Voice & Recording Transcription)
 * - National Exams (JAMB UTME, WAEC SSCE, NECO, Post-UTME)
 * - General CBT & Speed Drills
 * - System Themes (White, Black, Gold, Silver, Red, Green, Yellow, Cyan, Violet, Pink)
 * - Subscription Plans (Free Trial, Claxy Mode - ₦5,000/6mo, Claxy Pro Mode - ₦8,000/6mo)
 * - Award Trophies, Analytics & Progress Tracking
 */

export interface SystemGuideArticle {
  id: string;
  title: string;
  category: 'cbt_guide' | 'themes' | 'audio' | 'personal_cbt' | 'subscription' | 'navigation';
  keywords: string[];
  summary: string;
  details: string;
  actionTrigger?: {
    type: 'theme' | 'navigate' | 'modal';
    target: string;
  };
}

export const SYSTEM_GUIDE_ARTICLES: SystemGuideArticle[] = [
  {
    id: 'guide-getting-started',
    title: 'How to Navigate JeeRaf CBT Platform',
    category: 'navigation',
    keywords: ['guide', 'navigate', 'how to use', 'start', 'directory', 'main hub', 'features'],
    summary: 'JeeRaf CBT provides four core modes: Universal Personal CBT, National Exams, General CBT, and JeeRaf AI Assistant.',
    details: `
### JeeRaf CBT Platform User Guide

1. **Main Directory Hub**: Central navigation panel where you can switch between CBT Modes, access Trophies, check Subscription status, or open the Sidebar Menu.
2. **Universal Personal CBT**: Upload your personal course notes, lecture PDFs, DOCX files, or textbooks. The AI automatically parses your materials and constructs custom practice tests.
3. **Audio AI Lecture Studio**: Record live classroom lectures or upload recorded voice notes. AI transcribes speech into comprehensive study summaries and interactive CBT quizzes.
4. **National Exams**: Choose standard examination bodies including **JAMB UTME**, **WAEC SSCE**, **NECO**, and **Post-UTME** past question banks with instant explanations.
5. **General CBT & Skill Center**: Explore all exam categories, speed drills, and mixed subject practices in one unified dashboard.
6. **JeeRaf Real-time AI**: Your 24/7 personal study companion that explains formulas, suggests study tactics, answers general questions, and can even change system themes directly inside chat!
    `
  },
  {
    id: 'guide-themes',
    title: 'Customizing System Theme Colors',
    category: 'themes',
    keywords: ['theme', 'color', 'dark mode', 'gold', 'violet', 'emerald', 'black', 'pink', 'cyan', 'red', 'change theme'],
    summary: 'JeeRaf CBT supports 10 distinct high-contrast aesthetic themes.',
    details: `
### Available System Themes in JeeRaf CBT

You can switch system themes at any time by asking JeeRaf AI in chat (e.g. "Change theme to Gold") or visiting the Sidebar Menu > Theme Color.

**Supported Theme Palette:**
- **White (Default)**: Clean, high-contrast light layout with slate text and blue accents.
- **Black (Dark Mode)**: Ultra-sleek deep dark canvas for nighttime studying.
- **Gold**: Warm amber glowing background with rich brown typography.
- **Silver**: Professional metallic slate palette with subtle border contrast.
- **Red**: Energetic crimson theme for active study sessions.
- **Green**: Refreshing emerald theme representing growth and focus.
- **Yellow**: Radiant amber-yellow palette with warm contrast.
- **Cyan**: Crisp electric cyan theme with aquatic highlights.
- **Violet**: Vibrant royal purple theme with indigo accents.
- **Pink**: Warm magenta-pink palette with soft rose highlights.

*Tip: Simply tell Ibom AI "Set theme to violet" or "Switch to dark theme" and the AI will apply it instantly for you!*
    `,
    actionTrigger: {
      type: 'navigate',
      target: 'theme'
    }
  },
  {
    id: 'guide-personal-cbt',
    title: 'Universal Personal CBT & Document Parsing',
    category: 'personal_cbt',
    keywords: ['personal cbt', 'upload pdf', 'lecture notes', 'textbook', 'convert notes to quiz', 'custom exam'],
    summary: 'Convert any study material into an interactive CBT exam in seconds.',
    details: `
### Universal Personal CBT Guide

**How to create custom exams from your notes:**
1. Click **Universal Personal CBT** from the Main Directory Hub.
2. Select **Upload Lecture Materials**.
3. Choose a file from your device (PDF, DOCX, or TXT).
4. Our AI parses the document content, identifies key concepts, and generates structured multiple-choice questions with detailed explanations.
5. Set your preferred timer (e.g., 15, 30, or 60 minutes) and start practicing!
    `,
    actionTrigger: {
      type: 'navigate',
      target: 'exam_select'
    }
  },
  {
    id: 'guide-audio-studio',
    title: 'Audio AI Lecture Studio & Recording',
    category: 'audio',
    keywords: ['audio', 'record lecture', 'speech to quiz', 'voice notes', 'audio studio', 'transcribe lecture'],
    summary: 'Record classroom lectures live or upload audio recordings to generate study tests.',
    details: `
### Audio AI Studio Guide

**How to use Audio AI Studio:**
1. Navigate to **Universal Personal CBT** or click **Audio AI Study** in General CBT.
2. Grant microphone permissions to record live audio, or select an existing audio file.
3. Tap **Start Recording** during a lecture.
4. When finished, tap **Process Recording**.
5. AI transcribes the audio speech, generates bulleted revision summaries, and builds practice questions.
    `,
    actionTrigger: {
      type: 'navigate',
      target: 'exam_select'
    }
  },
  {
    id: 'guide-subscriptions',
    title: 'Subscription Plans & Tier Benefits',
    category: 'subscription',
    keywords: ['subscription', 'plan', 'claxy', 'claxy pro', 'price', 'cost', 'upgrade', 'payment'],
    summary: 'JeeRaf CBT offers 6-month access plans tailored for high school and tertiary students.',
    details: `
### JeeRaf CBT Subscription Plans

1. **Free Trial Mode**:
   - Access to standard subject past questions and basic AI queries.
   - 14 days full preview access.

2. **Claxy Mode (₦5,000 / 6 Months)**:
   - Full access to all National Exams (JAMB, WAEC, NECO, Post-UTME).
   - 2 Ibom AI custom assistant name changes.
   - 1v1 online CBT duel matches and leaderboard rankings.

3. **Claxy Pro Mode (₦8,000 / 6 Months)**:
   - Everything in Claxy Mode.
   - Priority Audio AI lecture transcription and document parsing.
   - 8 Ibom AI custom assistant name changes.
   - Unlimited AI formula derivations & personal CBT generation.
    `,
    actionTrigger: {
      type: 'navigate',
      target: 'subscription_portal'
    }
  }
];

export const SYSTEM_AVAILABLE_THEMES = [
  { id: 'white', name: 'White', hex: '#2563eb', bg: '#f8fafc', text: '#0f172a', desc: 'Standard crisp light mode' },
  { id: 'black', name: 'Black (Dark Mode)', hex: '#3b82f6', bg: '#020617', text: '#f8fafc', desc: 'Sleek dark canvas for night study' },
  { id: 'gold', name: 'Gold', hex: '#d97706', bg: '#fdfaf3', text: '#451a03', desc: 'Warm amber glowing theme' },
  { id: 'silver', name: 'Silver', hex: '#64748b', bg: '#f1f5f9', text: '#334155', desc: 'Professional metallic slate' },
  { id: 'red', name: 'Red', hex: '#dc2626', bg: '#fef2f2', text: '#7f1d1d', desc: 'Energetic crimson accents' },
  { id: 'green', name: 'Green (Emerald)', hex: '#16a34a', bg: '#f0fdf4', text: '#14532d', desc: 'Refreshing focus emerald theme' },
  { id: 'yellow', name: 'Yellow', hex: '#ca8a04', bg: '#fefce8', text: '#713f12', desc: 'Radiant warm amber yellow' },
  { id: 'cyan', name: 'Cyan', hex: '#0891b2', bg: '#ecfeff', text: '#164e63', desc: 'Electric aquatic cyan theme' },
  { id: 'violet', name: 'Violet (Purple)', hex: '#7c3aed', bg: '#f5f3ff', text: '#4c1d95', desc: 'Royal violet indigo theme' },
  { id: 'pink', name: 'Pink', hex: '#db2777', bg: '#fdf2f8', text: '#831843', desc: 'Soft magenta rose theme' }
];
