import { LibraryBook } from '../types';

export const ATOMIC_HABITS_BOOK: LibraryBook = {
  id: 'gen_atomic_habits',
  title: 'Atomic Habits: Tiny Changes, Remarkable Results',
  author: 'James Clear',
  section: 'general',
  subject: 'Personal Growth & Psychology',
  description: 'An easy & proven way to build good study habits & break bad ones. Explains how tiny 1% daily improvements compound into life-changing academic and professional success.',
  keywords: ['atomic habits', 'james clear', 'habits', 'productivity', 'discipline', 'self improvement', 'growth', 'focus', 'time management'],
  format: 'both',
  coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800&auto=format&fit=crop',
  pageCount: 320,
  amazonUrl: 'https://www.amazon.com/s?k=Atomic+Habits+James+Clear',
  fileName: 'Atomic_Habits_Complete_Mastery_Edition.pdf',
  fileType: 'pdf',
  fileSize: '8.4 MB',
  fileUrl: 'data:text/plain;charset=utf-8,Atomic%20Habits%20by%20James%20Clear...',
  pageImages: [
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800&auto=format&fit=crop'
  ],
  chapters: [
    {
      id: 'ah_ch1',
      title: 'Chapter 1: The Fundamentals - Why Tiny Changes Make a Big Difference',
      content: `### 1.1 The Power of 1% Daily Improvements
Compounding operates in personal growth just as it does in financial interest:
* If you get 1% better each day for one year, you'll end up 37 times better ($1.01^{365} = 37.78$).
* If you get 1% worse each day for one year, you'll decline down to nearly zero ($0.99^{365} = 0.03$).

### 1.2 Systems over Goals
Goals are about the results you want to achieve. Systems are about the processes that lead to those results. You do not rise to the level of your goals; you fall to the level of your systems.`,
      figures: [
        {
          id: 'fig_ah1',
          title: 'Figure 1.1: The Compounding Curve of 1% Daily Improvement',
          url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=800&auto=format&fit=crop',
          caption: 'Exponential curve showing 1% daily compounding vs. 1% daily decline over 365 days.'
        }
      ]
    },
    {
      id: 'ah_ch2',
      title: 'Chapter 2: The 4 Laws of Behavior Change',
      content: `To build a lasting habit:
1. **Make it Obvious** (Cue - Habit Stacking: "After [Current Habit], I will [New Habit]")
2. **Make it Attractive** (Craving - Temptation Bundling)
3. **Make it Easy** (Response - The 2-Minute Rule)
4. **Make it Satisfying** (Reward - Immediate Reinforcement)`,
      figures: [
        {
          id: 'fig_ah2',
          title: 'Figure 2.1: The Habit Loop Cycle (Cue, Craving, Response, Reward)',
          url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800&auto=format&fit=crop',
          caption: '4-Stage neurological habit loop guiding human behavior and ritual creation.'
        }
      ]
    }
  ]
};
