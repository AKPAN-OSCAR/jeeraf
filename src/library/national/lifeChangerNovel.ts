import { LibraryBook } from '../types';

export const LIFE_CHANGER_BOOK: LibraryBook = {
  id: 'nat_life_changer',
  title: 'The Life Changer (Compulsory UTME Literature)',
  author: 'Khadija Abubakar Jalli',
  section: 'national',
  subject: 'Use of English / JAMB Literature',
  description: 'The compulsory JAMB UTME literature text. Follows the inspiring story of Ummi and her children as she shares lessons on university life, honesty, trust, and decision-making.',
  keywords: ['life changer', 'jamb novel', 'khadija abubakar', 'use of english', 'utme 2026', 'compulsory text', 'literature', 'jamb prose'],
  format: 'both',
  examTarget: 'JAMB UTME 2026',
  coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop',
  pageCount: 145,
  amazonUrl: 'https://www.amazon.com/s?k=The+Life+Changer+Khadija+Abubakar+Jalli',
  fileName: 'The_Life_Changer_JAMB_Comprehensive_Text.pdf',
  fileType: 'pdf',
  fileSize: '4.8 MB',
  fileUrl: 'data:text/plain;charset=utf-8,The%20Life%20Changer%20by%20Khadija%20Abubakar%20Jalli...',
  pageImages: [
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=800&auto=format&fit=crop'
  ],
  chapters: [
    {
      id: 'lc_ch1',
      title: 'Chapter 1: The Family Circle & Omar\'s Success',
      content: `Ummi sits in her living room with her children: Omar, Teemah, Jamila, and Bint. Omar has just passed his JAMB examinations with high scores and received an offer of admission to study Law at Ahmadu Bello University (ABU), Zaria.

As the family celebrates, Omar expresses his eagerness to taste university freedom. Ummi uses this moment to caution him, explaining that university life is a "life changer"—it can build or ruin a student depending on their choices.`,
      figures: [
        {
          id: 'fig_lc1',
          title: 'Figure 1.1: Ummi\'s Family Tree & Key Characters',
          url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop',
          caption: 'Family diagram illustrating Ummi, Omar, Teemah, Jamila, and Bint.'
        }
      ]
    },
    {
      id: 'lc_ch2',
      title: 'Chapter 2: Registration & Meeting Salma',
      content: `Salma, a proud young undergraduate, arrives on campus with an air of superiority. She finds registration queues long and tedious. Attempting to bypass protocols, she encounters Dr. Dibo, an approachable lecturer who emphasizes university ethics.

Salma later realizes that first impressions can be deceiving and that university rules apply to everyone equally.`,
      figures: [
        {
          id: 'fig_lc2',
          title: 'Figure 2.1: Campus Registration & University Environment',
          url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop',
          caption: 'Illustration of university campus grounds and administration complex.'
        }
      ]
    },
    {
      id: 'lc_ch3',
      title: 'Chapter 3: The Pitfalls of Examination Malpractice',
      content: `Salma gets involved in examination malpractice during her final year. Desperate to pass a difficult paper, she accepts illegal assistance from a fellow student.

When caught by an invigilator, Salma attempts bribery to cover up her offense. The university Disciplinary Committee investigates, leading to severe sanctions and her ultimate expulsion from the institution.`
    },
    {
      id: 'lc_ch4',
      title: 'Chapter 4: The Moral Lessons & Reflections',
      content: `Ummi concludes her narrative by stressing that true education goes beyond academic certificates—it builds character, integrity, and self-discipline. Omar and his siblings reflect deeply on her words as he prepares for his freshman year.`
    }
  ]
};
