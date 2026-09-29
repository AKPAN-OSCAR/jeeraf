import { RawQuestion } from '../../../questions';

export const jambMathQuestions: RawQuestion[] = [
  {
    id: 'jamb-math-1',
    subject: 'Mathematics',
    set: 1,
    year: 2024,
    difficulty: 'Medium',
    question: 'Solve for $x$ in the equation: $2^{2x + 1} - 5(2^x) + 2 = 0$',
    options: ['$x = -1$ or $x = 1$', '$x = 1$ or $x = 2$', '$x = -2$ or $x = 1$', '$x = 0$ or $x = 2$'],
    correctAnswer: 0,
    explanation: `Step 1: Let $y = 2^x$. Then $2^{2x + 1} = 2 \\cdot (2^x)^2 = 2y^2$.
Step 2: Rewrite the equation in terms of $y$:
   $2y^2 - 5y + 2 = 0$
Step 3: Factorize the quadratic equation:
   $(2y - 1)(y - 2) = 0 \\implies y = \\frac{1}{2} \\text{ or } y = 2$
Step 4: Substitute back $y = 2^x$:
   $2^x = 2^{-1} \\implies x = -1$
   $2^x = 2^1 \\implies x = 1$
Result: $x = -1$ or $x = 1$.`,
    topic: 'Indices and Logarithms',
    allowedExamTypes: ['JAMB', 'Personal CBT']
  },
  {
    id: 'jamb-math-2',
    subject: 'Mathematics',
    set: 1,
    year: 2024,
    difficulty: 'Hard',
    question: 'Evaluate $\\int_0^{\\frac{\\pi}{2}} \\sin(2x) \\, dx$',
    options: ['$1$', '$0$', '$\\frac{1}{2}$', '$2$'],
    correctAnswer: 0,
    explanation: `Step 1: Find the antiderivative of $\\sin(2x)$:
   $\\int \\sin(2x) \\, dx = -\\frac{1}{2}\\cos(2x)$
Step 2: Apply the limits from $0$ to $\\frac{\\pi}{2}$:
   $\\left[ -\\frac{1}{2}\\cos(2x) \\right]_0^{\\frac{\\pi}{2}} = -\\frac{1}{2}\\cos(\\pi) - \\left( -\\frac{1}{2}\\cos(0) \\right)$
Step 3: Calculate the trigonometric values:
   $\\cos(\\pi) = -1 \\implies -\\frac{1}{2}(-1) = \\frac{1}{2}$
   $\\cos(0) = 1 \\implies -\\left(-\\frac{1}{2}(1)\\right) = \\frac{1}{2}$
   $\\frac{1}{2} + \\frac{1}{2} = 1$
Result: The definite integral equals $1$.`,
    topic: 'Calculus',
    allowedExamTypes: ['JAMB', 'Personal CBT']
  },
  {
    id: 'jamb-math-3',
    subject: 'Mathematics',
    set: 1,
    year: 2024,
    difficulty: 'Medium',
    question: 'If $\\log_{10} 2 = 0.3010$ and $\\log_{10} 3 = 0.4771$, evaluate $\\log_{10} 18$.',
    options: ['$1.2552$', '$1.0791$', '$0.9542$', '$1.5563$'],
    correctAnswer: 0,
    explanation: `Step 1: Express $18$ in terms of prime factors:
   $18 = 2 \\times 3^2$
Step 2: Apply logarithmic rules:
   $\\log_{10}(18) = \\log_{10}(2 \\times 3^2) = \\log_{10} 2 + 2\\log_{10} 3$
Step 3: Substitute the given values:
   $\\log_{10}(18) = 0.3010 + 2(0.4771) = 0.3010 + 0.9542 = 1.2552$
Result: $\\log_{10} 18 = 1.2552$.`,
    topic: 'Logarithms',
    allowedExamTypes: ['JAMB', 'Personal CBT']
  },
  {
    id: 'jamb-math-4',
    subject: 'Mathematics',
    set: 1,
    year: 2024,
    difficulty: 'Medium',
    question: 'Find the derivative of $y = (3x^2 - 5)^4$ with respect to $x$.',
    options: ['$24x(3x^2 - 5)^3$', '$12(3x^2 - 5)^3$', '$4(3x^2 - 5)^3$', '$24x^2(3x^2 - 5)^3$'],
    correctAnswer: 0,
    explanation: `Step 1: Use the chain rule: $\\frac{dy}{dx} = \\frac{dy}{du} \\cdot \\frac{du}{dx}$.
Step 2: Let $u = 3x^2 - 5 \\implies y = u^4$.
Step 3: Calculate the derivatives:
   $\\frac{dy}{du} = 4u^3 = 4(3x^2 - 5)^3$
   $\\frac{du}{dx} = 6x$
Step 4: Multiply together:
   $\\frac{dy}{dx} = 4(3x^2 - 5)^3 \\cdot (6x) = 24x(3x^2 - 5)^3$
Result: $\\frac{dy}{dx} = 24x(3x^2 - 5)^3$.`,
    topic: 'Differentiation',
    allowedExamTypes: ['JAMB', 'Personal CBT']
  },
  {
    id: 'jamb-math-5',
    subject: 'Mathematics',
    set: 1,
    year: 2024,
    difficulty: 'Easy',
    question: 'Find the sum of the first 20 terms of the arithmetic progression: $3, 7, 11, 15, \\dots$',
    options: ['$820$', '$780$', '$800$', '$840$'],
    correctAnswer: 0,
    explanation: `Step 1: Identify parameters: First term $a = 3$, Common difference $d = 7 - 3 = 4$, Number of terms $n = 20$.
Step 2: Use the AP sum formula:
   $S_n = \\frac{n}{2}[2a + (n - 1)d]$
Step 3: Substitute the parameters:
   $S_{20} = \\frac{20}{2}[2(3) + (19)(4)] = 10[6 + 76] = 10(82) = 820$
Result: The sum is $820$.`,
    topic: 'Sequences and Series',
    allowedExamTypes: ['JAMB', 'Personal CBT']
  },
  {
    id: 'jamb-math-6',
    subject: 'Mathematics',
    set: 1,
    year: 2024,
    difficulty: 'Medium',
    question: 'If $\\sin \\theta = \\frac{3}{5}$ where $\\theta$ is an acute angle, find the value of $\\tan \\theta + \\cos \\theta$.',
    options: ['$\\frac{31}{20}$', '$\\frac{7}{5}$', '$\\frac{19}{20}$', '$\\frac{4}{5}$'],
    correctAnswer: 0,
    explanation: `Step 1: In a right-angled triangle with $\\sin \\theta = \\frac{\\text{Opposite}}{\\text{Hypotenuse}} = \\frac{3}{5}$:
   Adjacent side $= \\sqrt{5^2 - 3^2} = \\sqrt{25 - 9} = \\sqrt{16} = 4$.
Step 2: Find trigonometric ratios:
   $\\cos \\theta = \\frac{4}{5}$, $\\tan \\theta = \\frac{3}{4}$.
Step 3: Add them together:
   $\\tan \\theta + \\cos \\theta = \\frac{3}{4} + \\frac{4}{5} = \\frac{15 + 16}{20} = \\frac{31}{20}$.
Result: The value is $\\frac{31}{20}$.`,
    topic: 'Trigonometry',
    allowedExamTypes: ['JAMB', 'Personal CBT']
  },
  {
    id: 'jamb-math-7',
    subject: 'Mathematics',
    set: 1,
    year: 2024,
    difficulty: 'Medium',
    question: 'The determinant of the matrix $\\begin{pmatrix} 2 & x \\\\ 3 & 5 \\end{pmatrix}$ is $4$. Find the value of $x$.',
    options: ['$2$', '$-2$', '$3$', '$\\frac{4}{3}$'],
    correctAnswer: 0,
    explanation: `Step 1: Calculate the determinant:
   $\\det = (2 \\times 5) - (3 \\times x) = 10 - 3x$
Step 2: Set equal to given determinant:
   $10 - 3x = 4 \\implies 3x = 6 \\implies x = 2$
Result: $x = 2$.`,
    topic: 'Matrices and Determinants',
    allowedExamTypes: ['JAMB', 'Personal CBT']
  },
  {
    id: 'jamb-math-8',
    subject: 'Mathematics',
    set: 1,
    year: 2024,
    difficulty: 'Easy',
    question: 'Find the standard deviation of the numbers: $2, 4, 6, 8, 10$.',
    options: ['$\\sqrt{8} \\approx 2.83$', '$2.00$', '$4.00$', '$\\sqrt{5} \\approx 2.24$'],
    correctAnswer: 0,
    explanation: `Step 1: Calculate Mean $\\bar{x} = \\frac{2+4+6+8+10}{5} = \\frac{30}{5} = 6$.
Step 2: Calculate deviations squared $(x - \\bar{x})^2$:
   $(2-6)^2 = 16$, $(4-6)^2 = 4$, $(6-6)^2 = 0$, $(8-6)^2 = 4$, $(10-6)^2 = 16$.
Step 3: Variance $\\sigma^2 = \\frac{16 + 4 + 0 + 4 + 16}{5} = \\frac{40}{5} = 8$.
Step 4: Standard Deviation $\\sigma = \\sqrt{8} \\approx 2.83$.
Result: $\\sqrt{8}$.`,
    topic: 'Statistics',
    allowedExamTypes: ['JAMB', 'Personal CBT']
  }
];
