import { LibraryBook } from '../types';

export const HALLIDAY_PHYSICS_BOOK: LibraryBook = {
  id: 'univ_halliday_physics',
  title: 'Fundamentals of Physics (Halliday & Resnick)',
  author: 'David Halliday, Robert Resnick, & Jearl Walker',
  section: 'universal',
  subject: 'Physics & Engineering',
  description: 'The worldwide gold standard calculus-based physics textbook. In-depth treatment of Classical Mechanics, Gravitation, Waves, Electromagnetism, Quantum Physics, and Relativity.',
  keywords: ['halliday physics', 'resnick', 'fundamentals of physics', 'calculus physics', 'mechanics', 'electromagnetism', 'quantum mechanics'],
  format: 'both',
  coverImage: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?q=80&w=800&auto=format&fit=crop',
  pageCount: 1240,
  amazonUrl: 'https://www.amazon.com/s?k=Fundamentals+of+Physics+Halliday+Resnick',
  fileName: 'Fundamentals_of_Physics_11th_Edition_Halliday_Resnick.pdf',
  fileType: 'pdf',
  fileSize: '45.2 MB',
  fileUrl: 'data:text/plain;charset=utf-8,Fundamentals%20of%20Physics%20Halliday%20Resnick...',
  pageImages: [
    'https://images.unsplash.com/photo-1507668077129-56e32842fceb?q=80&w=800&auto=format&fit=crop'
  ],
  chapters: [
    {
      id: 'hp_ch1',
      title: 'Chapter 1: Newton\'s Laws of Motion & Conservation Laws',
      content: `### 1.1 Newton\'s Laws of Motion
1. **First Law**: An object remains at rest or in uniform motion unless acted upon by a net external force $\\sum \\vec{F} = 0$.
2. **Second Law**: The acceleration of an object is directly proportional to net force:
   $$\\sum \\vec{F} = m \\vec{a} = \\frac{d\\vec{p}}{dt}$$
3. **Third Law**: For every action force, there is an equal and opposite reaction force $\\vec{F}_{AB} = -\\vec{F}_{BA}$.

### 1.2 Conservation of Linear Momentum & Energy
In an isolated system:
$$\\sum \\vec{p}_{\\text{initial}} = \\sum \\vec{p}_{\\text{final}}$$
Work-Energy Theorem:
$$W_{\\text{net}} = \\Delta K = \\frac{1}{2}m v_f^2 - \\frac{1}{2}m v_i^2$$`,
      figures: [
        {
          id: 'fig_hp1',
          title: 'Figure 1.1: Free Body Force Diagram on Incline Plane',
          url: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?q=80&w=800&auto=format&fit=crop',
          caption: 'Force vectors showing normal force N, gravitational force mg, and friction force f.'
        }
      ]
    },
    {
      id: 'hp_ch2',
      title: 'Chapter 2: Maxwell\'s Equations & Electromagnetism',
      content: `### 2.1 The Four Maxwell Equations
1. **Gauss\'s Law for Electricity**: $\\oint \\vec{E} \\cdot d\\vec{A} = \\frac{Q_{\\text{enc}}}{\\varepsilon_0}$
2. **Gauss\'s Law for Magnetism**: $\\oint \\vec{B} \\cdot d\\vec{A} = 0$
3. **Faraday\'s Law of Induction**: $\\oint \\vec{E} \\cdot d\\vec{s} = -\\frac{d\\Phi_B}{dt}$
4. **Ampère-Maxwell Law**: $\\oint \\vec{B} \\cdot d\\vec{s} = \\mu_0 I_{\\text{enc}} + \\mu_0 \\varepsilon_0 \\frac{d\\Phi_E}{dt}$`,
      figures: [
        {
          id: 'fig_hp2',
          title: 'Figure 2.1: Electromagnetic Wave Propagation',
          url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop',
          caption: 'Perpendicular oscillating electric (E) and magnetic (B) field vectors propagating at light speed c.'
        }
      ]
    }
  ]
};
