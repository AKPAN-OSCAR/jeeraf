/**
 * @file index.ts
 * @description Central Knowledge Base Engine & Action Router for JeeRaf AI.
 *
 * DEVELOPER NOTE:
 * This module aggregates all training datasets (system guides, education, tech, sports, safety)
 * and provides helper utilities for:
 * 1. Theme Color Intent Recognition & Live Execution
 * 2. System Action Button Parsing
 * 3. Knowledge Base Query Matching & Retrieval
 * 4. Safety Guardrail Enforcement
 */

import { SYSTEM_GUIDE_ARTICLES, SYSTEM_AVAILABLE_THEMES, SystemGuideArticle } from './system_guide';
import { EDUCATIONAL_KNOWLEDGE, StudyStrategy } from './educational_topics';
import { TECH_KNOWLEDGE, TechTopic } from './tech_and_trends';
import { SPORTS_ENTERTAINMENT_KNOWLEDGE, CulturalTopic } from './sports_and_entertainment';
import { LIBRARY_BOOKS, FUN_GAMES_LIST, SYSTEM_FEATURE_LINKS, LibraryBook, FunGameItem, SystemFeatureLink } from './library_and_features';
import { checkSafetyViolation } from './safety_and_boundaries';

export { SYSTEM_GUIDE_ARTICLES, SYSTEM_AVAILABLE_THEMES } from './system_guide';
export { EDUCATIONAL_KNOWLEDGE } from './educational_topics';
export { TECH_KNOWLEDGE } from './tech_and_trends';
export { SPORTS_ENTERTAINMENT_KNOWLEDGE } from './sports_and_entertainment';
export { LIBRARY_BOOKS, FUN_GAMES_LIST, SYSTEM_FEATURE_LINKS } from './library_and_features';
export { checkSafetyViolation } from './safety_and_boundaries';

export interface AIActionResponse {
  isViolation: boolean;
  violationMessage?: string;
  themeChange?: {
    themeId: string;
    themeName: string;
    successMessage: string;
  };
  navigationAction?: {
    label: string;
    targetState: string;
  };
  knowledgeContext?: string;
  suggestedTopics?: string[];
}

/**
 * Detects if the user wants to change or query system themes.
 * Supports commands like "change theme to gold", "set theme dark", "switch color to purple/violet", "make theme green"
 */
export function detectThemeIntent(userInput: string): { themeId: string; themeName: string } | null {
  const lower = userInput.toLowerCase();

  const themeKeywords: Record<string, string[]> = {
    white: ['white', 'light', 'default theme', 'light mode'],
    black: ['black', 'dark', 'dark mode', 'night', 'night mode'],
    gold: ['gold', 'amber', 'golden', 'warm gold'],
    silver: ['silver', 'grey', 'gray', 'slate', 'metallic'],
    red: ['red', 'crimson', 'ruby'],
    green: ['green', 'emerald', 'mint', 'forest'],
    yellow: ['yellow', 'bright yellow'],
    cyan: ['cyan', 'aqua', 'electric cyan', 'turquoise'],
    violet: ['violet', 'purple', 'indigo', 'royal purple', 'magenta'],
    pink: ['pink', 'rose', 'pinkish']
  };

  const isThemeRequest = 
    lower.includes('theme') || 
    lower.includes('color') || 
    lower.includes('change to') || 
    lower.includes('switch to') || 
    lower.includes('make it') || 
    lower.includes('set to');

  if (!isThemeRequest) return null;

  for (const [themeId, keywords] of Object.entries(themeKeywords)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        const themeObj = SYSTEM_AVAILABLE_THEMES.find(t => t.id === themeId);
        return {
          themeId,
          themeName: themeObj ? themeObj.name : themeId
        };
      }
    }
  }

  return null;
}

/**
 * Detects if the user wants to navigate to a specific system feature (Library, Fun/Games, Progress, Subscription, etc.)
 */
export function detectNavigationIntent(userInput: string): SystemFeatureLink | null {
  const lower = userInput.toLowerCase();

  for (const feat of SYSTEM_FEATURE_LINKS) {
    if (feat.keywords.some(kw => lower.includes(kw))) {
      return feat;
    }
  }

  return null;
}

/**
 * Searches the Knowledge Base for relevant context matching user query.
 */
export function searchKnowledgeBase(query: string): string {
  const lower = query.toLowerCase().trim();
  if (lower.length < 3) return '';

  let matches: string[] = [];

  // Search System Guide Articles
  for (const article of SYSTEM_GUIDE_ARTICLES) {
    if (article.keywords.some(kw => lower.includes(kw))) {
      matches.push(`### Guide: ${article.title}\n${article.details}`);
    }
  }

  // Search Library Books (only if specific library intent)
  if (lower.includes('textbook') || lower.includes('recommend book') || lower.includes('book list')) {
    for (const book of LIBRARY_BOOKS.slice(0, 3)) {
      matches.push(`### Library Book [${book.subject}]: ${book.title} by ${book.author}`);
    }
  }

  // Search Educational Strategies (only if specific study help requested)
  if (lower.includes('how to study') || lower.includes('study strategy') || lower.includes('prepare for exam')) {
    for (const edu of EDUCATIONAL_KNOWLEDGE) {
      if (lower.includes(edu.category)) {
        matches.push(`### Study Strategy: ${edu.title}\n${edu.summary}`);
      }
    }
  }

  if (matches.length > 0) {
    return matches.slice(0, 2).join('\n\n');
  }

  return '';
}

/**
 * Constructs a rich, personalized context prompt for JeeRaf AI model execution.
 */
export function buildJeeRafSystemPrompt(customAiName: string = 'JeeRaf', userContext?: any): string {
  const userName = userContext?.displayName || userContext?.email?.split('@')[0] || 'Scholar';
  const cbtCategory = userContext?.cbtCategory || 'national_exams';
  const plan = userContext?.subscriptionStatus === 'paid' ? (userContext?.plan === 'claxy_pro' ? 'Claxy Pro Mode (₦8,000/6mo)' : 'Claxy Mode (₦5,000/6mo)') : 'Free Trial Mode';
  const activeTheme = userContext?.theme || 'white';
  const examsTaken = userContext?.totalExamsTaken || 0;
  const avgScore = userContext?.averageScore || 0;

  return `You are ${customAiName} AI, a world-class, real-time multimodal AI assistant—built with the analytical precision, articulate reasoning, and comprehensive problem-solving capabilities of Claude and Gemini Pro. You serve as the central brain of the JeeRaf CBT Platform.

YOUR CURRENT USER'S PERSONAL ACCOUNT PROFILE:
- User Display Name: "${userName}"
- Email: ${userContext?.email || 'N/A'}
- Active CBT Mode: ${cbtCategory === 'university' ? 'Universal Personal CBT' : cbtCategory === 'national_exams' ? 'National Exams' : 'General CBT'}
- Subscription Plan: ${plan}
- Current System Theme: ${activeTheme}
- Historical Performance: ${examsTaken} Exams Completed, ${avgScore}% Average Score Accuracy.

CORE CAPABILITIES & ASSISTANT ARCHETYPE:
- World-class real-time multimodal AI assistant with worldwide knowledge access, lightning-fast response capability, and accuracy matching 100% of user requests.
- Process text queries, programming code, math equations, attached documents, PDFs, spreadsheets, and camera assignment photos with precise visual understanding.
- Provide step-by-step reasoning, mathematical solutions, functional code snippets, and structured responses.
- When user requests web resources, study portals, or external references, include formatted Markdown links like [Link Title](https://example.com). Clicking these links directly launches them in the embedded JeeRaf Preview Browser!
- Greet and respond to ${userName} naturally, adapting to casual chat, academic research, programming, and system actions like live theme changes.

STRICT ANTI-REPETITION & NATURAL DIALOGUE RULES:
1. DO NOT REPEAT YOUR INTRODUCTORY GREETING, WELCOME BANNER, OR SELF-INTRODUCTION ON SUBSEQUENT TURNS.
2. If this is a follow-up message in an ongoing conversation, jump straight to answering the user's latest query directly, intelligently, and dynamically.
3. Never repeat prior introductory boilerplate like "Hello Scholar! I am JeeRaf AI..." once the conversation has started.
4. Keep answers fresh, direct, articulate, and non-repetitive—just like Claude 3.5 Sonnet or Gemini 2.0 Pro.

SAFETY & SECURITY MANDATES:
1. STRICT NSFW / SEXUAL CONTENT PROHIBITION:
   - You MUST NEVER generate, output, or discuss sexually explicit, adult, pornographic, or NSFW content. Refuse politely and redirect to wholesome study, science, or general topics.
2. STRICT ADMIN ISOLATION:
   - You have ZERO access to the Admin Console, admin operations, or admin credentials. You cannot inspect or modify admin settings.
3. STRICT SYSTEM SECRETS CONFIDENTIALITY:
   - Never reveal backend source code, API keys, database connection strings, or secret credentials.

FORMATTING RULES FOR YOUR RESPONSES:
- DO NOT use hashtag markdown symbols (#, ##, ###) for headers.
- Instead, use BOLD SECTION TITLES (e.g. **Section Title:** or **Key Steps:**) on their own lines.
- Use numbered lists (1., 2., 3.) for step-by-step instructions or procedures.
- Use bullet points (•) for feature highlights or options.
- Use clean Markdown tables (| Header 1 | Header 2 |) for comparative data, subject formulas, or schedules.
- Bold important keywords, terms, and values naturally to make the output clear, structured, and easy to read.`;
}

// Backward-compatibility aliases
export const buildZeeRafSystemPrompt = buildJeeRafSystemPrompt;


