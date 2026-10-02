import { RawQuestion } from '../../../questions';

export const waecMathematicsQuestions: RawQuestion[] = [
  {
    id: 'waec-math-1',
    subject: 'Mathematics',
    set: 1,
    year: 2024,
    difficulty: 'Medium',
    question: 'Solve for $x$ in the inequality: $3(x - 2) < 2(x + 5)$',
    options: ['$x < 16$', '$x < -16$', '$x > 16$', '$x < 4$'],
    correctAnswer: 0,
    explanation: `Step 1: Expand both brackets:
   $3x - 6 < 2x + 10$
Step 2: Group like terms by subtracting $2x$ and adding $6$:
   $3x - 2x < 10 + 6$
Step 3: Simplify:
   $x < 16$
Result: $x < 16$.`,
    topic: 'Linear Inequalities',
    allowedExamTypes: ['WAEC', 'WAEC GCE', 'Personal CBT']
  },
  {
    id: 'waec-math-2',
    subject: 'Mathematics',
    set: 1,
    year: 2024,
    difficulty: 'Medium',
    question: 'A bag contains $5$ red balls, $4$ blue balls, and $3$ green balls. If a ball is picked at random, what is the probability that it is NOT red?',
    options: ['$\\frac{7}{12}$', '$\\frac{5}{12}$', '$\\frac{1}{3}$', '$\\frac{3}{4}$'],
    correctAnswer: 0,
    explanation: `Step 1: Total balls in the bag $= 5 + 4 + 3 = 12$.
Step 2: Number of balls that are NOT red (Blue + Green) $= 4 + 3 = 7$.
Step 3: Probability $P(\\text{Not Red}) = \\frac{7}{12}$.
Result: $\\frac{7}{12}$.`,
    topic: 'Probability',
    allowedExamTypes: ['WAEC', 'WAEC GCE', 'Personal CBT']
  },
  {
    id: 'waec-math-3',
    subject: 'Mathematics',
    set: 1,
    year: 2024,
    difficulty: 'Hard',
    question: 'Calculate the total surface area of a solid cylinder of radius $7\\text{ cm}$ and height $10\\text{ cm}$. [Take $\\pi = \\frac{22}{7}$]',
    options: ['$748\\text{ cm}^2$', '$440\\text{ cm}^2$', '$308\\text{ cm}^2$', '$1540\\text{ cm}^2$'],
    correctAnswer: 0,
    explanation: `Step 1: Formula for total surface area of a cylinder:
   $A = 2\\pi r(r + h)$
Step 2: Substitute $r = 7\\text{ cm}$, $h = 10\\text{ cm}$, and $\\pi = \\frac{22}{7}$:
   $A = 2 \\times \\frac{22}{7} \\times 7 \\times (7 + 10) = 44 \\times 17 = 748\\text{ cm}^2$.
Result: Total surface area is $748\\text{ cm}^2$.`,
    topic: 'Mensuration',
    allowedExamTypes: ['WAEC', 'WAEC GCE', 'Personal CBT']
  },
  {
    id: 'waec-math-theory-1',
    subject: 'Mathematics',
    set: 1,
    year: 2024,
    difficulty: 'Hard',
    section: 'Theory',
    type: 'theory',
    marks: 12,
    question: `**(a)** Solve the quadratic equation by completing the square:
$$2x^2 - 7x + 3 = 0$$

**(b)** The third term of an arithmetic progression (A.P.) is $10$ and the eighth term is $25$. Find:
(i) the first term $a$ and common difference $d$.
(ii) the sum of the first $20$ terms.`,
    options: [],
    correctAnswer: -1,
    explanation: `**Solution (a):**
Given $2x^2 - 7x + 3 = 0$:
1. Divide through by $2$:
   $$x^2 - \\frac{7}{2}x + \\frac{3}{2} = 0 \\implies x^2 - \\frac{7}{2}x = -\\frac{3}{2}$$
2. Complete square by adding $\\left(-\\frac{7}{4}\\right)^2 = \\frac{49}{16}$ to both sides:
   $$\\left(x - \\frac{7}{4}\\right)^2 = -\\frac{3}{2} + \\frac{49}{16} = \\frac{-24 + 49}{16} = \\frac{25}{16}$$
3. Take square roots:
   $$x - \\frac{7}{4} = \\pm \\frac{5}{4} \\implies x = \\frac{7 \\pm 5}{4}$$
   Therefore, $x = \\frac{12}{4} = 3$ or $x = \\frac{2}{4} = \\frac{1}{2}$.

**Solution (b):**
1. $T_n = a + (n - 1)d$
   - $T_3 = a + 2d = 10$  --- (Eq 1)
   - $T_8 = a + 7d = 25$  --- (Eq 2)
2. Subtract (Eq 1) from (Eq 2):
   $$5d = 15 \\implies d = 3$$
   Substitute into (Eq 1): $a + 2(3) = 10 \\implies a = 4$.
3. Sum of first $20$ terms:
   $$S_{20} = \\frac{20}{2}[2(4) + (20 - 1)(3)] = 10[8 + 57] = 10(65) = 650$$.`,
    modelAnswer: `(a) x = 3 or x = 1/2. (b)(i) a = 4, d = 3. (ii) S_20 = 650.`,
    topic: 'Quadratic Equations & Arithmetic Progression',
    allowedExamTypes: ['WAEC', 'WAEC GCE', 'Personal CBT']
  },
  {
    id: 'waec-math-theory-2',
    subject: 'Mathematics',
    set: 1,
    year: 2024,
    difficulty: 'Medium',
    section: 'Theory',
    type: 'theory',
    marks: 10,
    question: `A surveyor standing at point $A$ on level ground observes the top of a communication mast $T$ at an angle of elevation of $32^\\circ$. Walking $40\\text{ m}$ directly towards the base of the mast to point $B$, the angle of elevation becomes $55^\\circ$.

Calculate, correct to $2$ decimal places:
(a) the height of the communication mast.
(b) the distance from point $B$ to the base of the mast.`,
    options: [],
    correctAnswer: -1,
    explanation: `**Solution:**
Let the height of the mast be $h$ and distance from $B$ to mast base $C$ be $d$.
Then distance from $A$ to base $C$ is $(40 + d)$.

1. From $\\triangle TBC$:
   $$\\tan 55^\\circ = \\frac{h}{d} \\implies h = d \\tan 55^\\circ \\approx 1.4281 d$$
2. From $\\triangle TAC$:
   $$\\tan 32^\\circ = \\frac{h}{40 + d} \\implies h = (40 + d) \\tan 32^\\circ \\approx (40 + d)(0.6249)$$
3. Equate expressions for $h$:
   $$1.4281 d = 0.6249(40 + d) = 24.996 + 0.6249 d$$
   $$(1.4281 - 0.6249)d = 24.996 \\implies 0.8032 d = 24.996$$
   $$d = \\frac{24.996}{0.8032} \\approx 31.12\\text{ m}$$
4. Calculate $h$:
   $$h = 31.12 \\times 1.4281 \\approx 44.44\\text{ m}$$

**Final Answers:**
(a) Height of mast $= 44.44\\text{ m}$
(b) Distance from $B$ to base $= 31.12\\text{ m}$.`,
    modelAnswer: `(a) Height of mast = 44.44 m. (b) Distance = 31.12 m.`,
    topic: 'Trigonometry & Angles of Elevation',
    allowedExamTypes: ['WAEC', 'WAEC GCE', 'Personal CBT']
  }
];
