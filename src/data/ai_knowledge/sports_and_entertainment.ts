/**
 * @file sports_and_entertainment.ts
 * @description Sports, Entertainment, and Culture Knowledge Base for SilverIBOM AI.
 *
 * DEVELOPER NOTE:
 * Enables SilverIBOM AI to engage in lively conversations regarding sports, athletics,
 * football, music, creative writing, cinema, and cultural hobbies.
 */

export interface CulturalTopic {
  title: string;
  category: 'football' | 'athletics' | 'entertainment' | 'music_and_art' | 'creative_ideas';
  highlights: string;
  popularFacts: string[];
}

export const SPORTS_ENTERTAINMENT_KNOWLEDGE: CulturalTopic[] = [
  {
    title: 'Global Football (Soccer) & African Sports',
    category: 'football',
    highlights: 'Football is the world’s most popular sport, celebrated across Africa and globally.',
    popularFacts: [
      'The Africa Cup of Nations (AFCON) features top national teams competing for continental glory.',
      'UEFA Champions League and Premier League represent top-tier club competitions.',
      'Super Eagles of Nigeria have won AFCON 3 times and produced legendary international talents.'
    ]
  },
  {
    title: 'Track & Field, Athletics, and World Records',
    category: 'athletics',
    highlights: 'Athletics tests human speed, endurance, power, and agility.',
    popularFacts: [
      'The 100m sprint is the flagship event determining the fastest person on earth.',
      'African sprinters and long-distance runners dominate world marathon and track championships.',
      'Proper athletic training incorporates biomechanics, nutrition, and cardiovascular conditioning.'
    ]
  },
  {
    title: 'Afrobeats, Global Music Trends, and Cinema',
    category: 'music_and_art',
    highlights: 'Afrobeats and African creative arts have achieved global mainstream acclaim.',
    popularFacts: [
      'Afrobeats blends traditional African rhythms, highlife, hip-hop, and modern electronic production.',
      'Nollywood is one of the world’s largest film industries by volume of production.',
      'Digital streaming platforms enable artists to reach global audiences seamlessly.'
    ]
  },
  {
    title: 'Creative Ideas, Brainstorming & Fun Activities',
    category: 'creative_ideas',
    highlights: 'Engaging creative outlets build mental resilience and problem-solving skills.',
    popularFacts: [
      'Trivia Quizzes & Speed Challenges: Test general knowledge across history, science, and pop culture.',
      'Debating & Creative Writing: Formulate structured arguments and narrative stories.',
      'Puzzles & Logic Games: Chess, Sudoku, and riddle-solving enhance critical analytical thinking.'
    ]
  }
];
