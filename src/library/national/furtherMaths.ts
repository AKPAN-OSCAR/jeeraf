import { LibraryBook } from '../types';

export const FURTHER_MATHS_BOOK: LibraryBook = {
  id: 'nat_macmillan_math',
  title: 'Comprehensive Further Mathematics',
  author: 'T.M. Egbe & J.O. Ojo',
  section: 'national',
  subject: 'Mathematics / Further Math',
  description: 'In-depth senior secondary mathematics and further mathematics textbook covering Trigonometry, Differentiation, Integration, Vectors, Matrices, Probability, Statistics, and Mechanics.',
  keywords: ['further mathematics', 'jamb math', 'waec math', 'calculus', 'matrices', 'trigonometry', 'quadratic equations', 'vectors', 'differentiation', 'integration'],
  format: 'both',
  examTarget: 'WAEC / UTME Mathematics',
  coverImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=800&auto=format&fit=crop',
  pageCount: 480,
  amazonUrl: 'https://www.amazon.com/s?k=Comprehensive+Further+Mathematics+West+Africa',
  fileName: 'Comprehensive_Further_Mathematics_Egbe_Ojo.pdf',
  fileType: 'pdf',
  fileSize: '15.8 MB',
  fileUrl: 'data:text/plain;charset=utf-8,Comprehensive%20Further%20Mathematics...',
  pageImages: [
    'https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=800&auto=format&fit=crop'
  ],
  chapters: [
    {
      id: 'fm_ch1',
      title: 'Chapter 1: Quadratic Equations, Polynomials & Matrices',
      content: `### 1.1 Quadratic Equations
General form: $ax^2 + bx + c = 0$ ($a \\neq 0$).

* **Quadratic Formula**:
  $$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$
* **Discriminant ($\\Delta = b^2 - 4ac$)**:
  * $\\Delta > 0$: Two distinct real roots.
  * $\\Delta = 0$: Two equal real roots.
  * $\\Delta < 0$: Complex (imaginary) roots.

### 1.2 Matrix Determinants ($2 \\times 2$ and $3 \\times 3$)
For matrix $A = \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$, the determinant $\\det(A) = ad - bc$.`,
      figures: [
        {
          id: 'fig_m1',
          title: 'Figure 1.1: Geometric Roots of Quadratic Parabola y = ax² + bx + c',
          url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=800&auto=format&fit=crop',
          caption: 'Parabolic curve intersecting X-axis at real root locations x₁ and x₂.'
        }
      ]
    },
    {
      id: 'fm_ch2',
      title: 'Chapter 2: Differential & Integral Calculus',
      content: `### 2.1 Differentiation Rules
* **Power Rule**: $\\frac{d}{dx}(x^n) = n x^{n-1}$
* **Product Rule**: $\\frac{d}{dx}(uv) = u \\frac{dv}{dx} + v \\frac{du}{dx}$
* **Quotient Rule**: $\\frac{d}{dx}\\left(\\frac{u}{v}\\right) = \\frac{v \\frac{du}{dx} - u \\frac{dv}{dx}}{v^2}$
* **Chain Rule**: $\\frac{dy}{dx} = \\frac{dy}{du} \\cdot \\frac{du}{dx}$

### 2.2 Integration
Indefinite integral power rule:
$$\\int x^n dx = \\frac{x^{n+1}}{n+1} + C \\quad (n \\neq -1)$$`,
      figures: [
        {
          id: 'fig_m2',
          title: 'Figure 2.1: Tangent Line Derivative & Area Under Curve Integration',
          url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800&auto=format&fit=crop',
          caption: 'Geometrical interpretation of dy/dx as instantaneous slope and integral as area.'
        }
      ]
    }
  ]
};
