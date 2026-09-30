/**
 * @file safety_and_boundaries.ts
 * @description Safety Rules, NSFW Filtering, Admin Isolation & Security Guardrails.
 *
 * CRITICAL DEVELOPER INSTRUCTIONS & SAFETY BOUNDARIES:
 * 1. NSFW / Sexual Content Policy:
 *    - The JeeRaf AI MUST NEVER render, output, generate, or encourage sexually explicit,
 *      pornographic, or NSFW content.
 *    - If a user asks sexual/explicit questions, JeeRaf AI must politely refuse and
 *      redirect the conversation to wholesome educational, science, or general topics.
 *
 * 2. Admin Console & Admin Operations Isolation:
 *    - JeeRaf AI is strictly a user-level CBT study assistant.
 *    - JeeRaf AI HAS NO ACCESS to the Admin Console, admin management tools, or admin activities.
 *    - JeeRaf AI MUST NOT perform any admin tasks or reveal any information about admin users.
 *    - Admin console has its own dedicated Admin AI and MUST NOT be touched or merged.
 *
 * 3. System Architecture & Backend Confidentiality:
 *    - JeeRaf AI MUST NEVER reveal system API keys, database credentials, server endpoints,
 *      environment variables, internal file structures, or raw backend source code to end users.
 */

export interface SystemBoundaryRule {
  id: string;
  ruleName: string;
  triggerKeywords: string[];
  denialMessage: string;
}

export const SAFETY_BOUNDARIES: SystemBoundaryRule[] = [
  {
    id: 'rule-nsfw-prohibition',
    ruleName: 'Prohibit Sexual / Explicit / NSFW Content',
    triggerKeywords: [
      'sex', 'sexual', 'porn', 'porno', 'nsfw', 'erotic', 'naked', 'nude', 'hentai', 'intercourse'
    ],
    denialMessage: 'I am JeeRaf AI, a wholesome educational and study assistant. I do not generate or discuss sexually explicit or adult content. Let’s focus on your studies, exams, technology, sports, or general knowledge topics!'
  },
  {
    id: 'rule-admin-isolation',
    ruleName: 'Strict Admin Console & Activity Isolation',
    triggerKeywords: [
      'admin console', 'admin activity', 'admin password', 'admin access', 'system root', 'admin email', 'admin login', 'admin key'
    ],
    denialMessage: 'I do not have access to administrative controls, admin activities, or system security credentials. I am strictly your student study assistant and CBT practice companion.'
  },
  {
    id: 'rule-backend-secrecy',
    ruleName: 'Protect Internal Codebase & Infrastructure Secrets',
    triggerKeywords: [
      'firebase secret', 'api key', 'env variables', 'backend code', 'database connection string', 'server source code', 'system credentials'
    ],
    denialMessage: 'Internal system infrastructure details, API keys, and backend source code are protected and confidential. I can help you with study topics, CBT practice, themes, or exam preparation instead!'
  }
];

/**
 * Checks if user input violates safety rules or boundary constraints.
 * Returns a denial message if violated, or null if safe.
 */
export function checkSafetyViolation(input: string): string | null {
  const lower = input.toLowerCase().trim();

  for (const rule of SAFETY_BOUNDARIES) {
    for (const kw of rule.triggerKeywords) {
      // Use word boundary check or inclusion check
      if (lower.includes(kw)) {
        return rule.denialMessage;
      }
    }
  }

  return null;
}
