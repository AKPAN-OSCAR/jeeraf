import { LibraryBook } from '../types';

export const THOMAS_CALCULUS_BOOK: LibraryBook = {
  id: 'univ_thomas_calculus',
  title: 'Thomas\' Calculus (Early Transcendentals)',
  author: 'Joel Hass, Christopher Heil, & Maurice Weir',
  section: 'universal',
  subject: 'Mathematics & Calculus',
  description: 'The definitive university calculus textbook covering Single Variable Calculus, Multivariable Functions, Partial Derivatives, Multiple Integrals, Vector Fields, and Differential Equations.',
  keywords: ['thomas calculus', 'calculus', 'derivatives', 'integrals', 'multivariable calculus', 'partial derivatives', 'vector fields'],
  format: 'both',
  coverImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=800&auto=format&fit=crop',
  pageCount: 1180,
  amazonUrl: 'https://www.amazon.com/s?k=Thomas+Calculus+Early+Transcendentals',
  fileName: 'Thomas_Calculus_14th_Edition.pdf',
  fileType: 'pdf',
  fileSize: '38.6 MB',
  fileUrl: 'data:text/plain;charset=utf-8,Thomas%20Calculus...',
  pageImages: [
    'https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=800&auto=format&fit=crop'
  ],
  chapters: [
    {
      id: 'tc_ch1',
      title: 'Chapter 1: Limits, Continuity & Derivatives',
      content: `### 1.1 Formal Definition of Limit
Let $f(x)$ be defined on an open interval around $c$. $\\lim_{x \\to c} f(x) = L$ if for every $\\varepsilon > 0$, there exists $\\delta > 0$ such that:
$$0 < |x - c| < \\delta \\implies |f(x) - L| < \\varepsilon$$

### 1.2 Derivative as Limit of Difference Quotient
$$f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$$`,
      figures: [
        {
          id: 'fig_tc1',
          title: 'Figure 1.1: Epsilon-Delta Limit Geometry',
          url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=800&auto=format&fit=crop',
          caption: 'Geometrical interpretation of epsilon-delta bounds around x = c and y = L.'
        }
      ]
    },
    {
      id: 'tc_ch2',
      title: 'Chapter 2: Multivariable Calculus & Line Integrals',
      content: `### 2.1 Gradient & Directional Derivative
For scalar field $f(x, y, z)$, the gradient vector is:
$$\\nabla f = \\left( \\frac{\\partial f}{\\partial x}, \\frac{\\partial f}{\\partial y}, \\frac{\\partial f}{\\partial z} \\right)$$

### 2.2 Green\'s Theorem in the Plane
Let $C$ be a positively oriented, piecewise-smooth, simple closed curve in a plane:
$$\\oint_C (P dx + Q dy) = \\iint_D \\left( \\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y} \\right) dA$$`,
      figures: [
        {
          id: 'fig_tc2',
          title: 'Figure 2.1: 3D Surface Gradient Vector Field',
          url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800&auto=format&fit=crop',
          caption: 'Visualization of 3D surface mesh and gradient vectors pointing in direction of maximum ascent.'
        }
      ]
    }
  ]
};
