import { RawQuestion } from '../../../questions';

export const jambPhysicsQuestions: RawQuestion[] = [
  {
    id: 'jamb-phy-1',
    subject: 'Physics',
    set: 1,
    year: 2024,
    difficulty: 'Medium',
    question: 'A projectile is launched from the ground with an initial velocity of $40\\text{ m/s}$ at an angle of $30^\\circ$ to the horizontal. Calculate the maximum height reached. [$g = 10\\text{ m/s}^2$]',
    options: ['$20\\text{ m}$', '$40\\text{ m}$', '$80\\text{ m}$', '$10\\text{ m}$'],
    correctAnswer: 0,
    explanation: `Step 1: Identify given values: Initial velocity $u = 40\\text{ m/s}$, launch angle $\\theta = 30^\\circ$, $g = 10\\text{ m/s}^2$.
Step 2: Use the maximum height formula for projectile motion:
   $H = \\frac{u^2 \\sin^2 \\theta}{2g}$
Step 3: Calculate $\\sin(30^\\circ) = 0.5 \\implies \\sin^2(30^\\circ) = 0.25$.
Step 4: Substitute the numbers:
   $H = \\frac{(40)^2 \\times 0.25}{2 \\times 10} = \\frac{1600 \\times 0.25}{20} = \\frac{400}{20} = 20\\text{ m}$.
Result: The maximum height reached is $20\\text{ m}$.`,
    topic: 'Kinematics & Projectiles',
    allowedExamTypes: ['JAMB', 'Personal CBT']
  },
  {
    id: 'jamb-phy-2',
    subject: 'Physics',
    set: 1,
    year: 2024,
    difficulty: 'Easy',
    question: 'A body of mass $5\\text{ kg}$ is acted upon by a constant resultant force of $20\\text{ N}$. Calculate the acceleration produced.',
    options: ['$4\\text{ m/s}^2$', '$2\\text{ m/s}^2$', '$5\\text{ m/s}^2$', '$100\\text{ m/s}^2$'],
    correctAnswer: 0,
    explanation: `Step 1: State Newton's Second Law of Motion: $F = ma$.
Step 2: Rearrange for acceleration: $a = \\frac{F}{m}$.
Step 3: Substitute $F = 20\\text{ N}$ and $m = 5\\text{ kg}$:
   $a = \\frac{20}{5} = 4\\text{ m/s}^2$.
Result: Acceleration is $4\\text{ m/s}^2$.`,
    topic: 'Dynamics',
    allowedExamTypes: ['JAMB', 'Personal CBT']
  },
  {
    id: 'jamb-phy-3',
    subject: 'Physics',
    set: 1,
    year: 2024,
    difficulty: 'Medium',
    question: 'Two resistors of $6\\,\\Omega$ and $3\\,\\Omega$ are connected in parallel across a $12\\text{ V}$ battery of negligible internal resistance. Calculate the total current drawn from the battery.',
    options: ['$6\\text{ A}$', '$4\\text{ A}$', '$2\\text{ A}$', '$9\\text{ A}$'],
    correctAnswer: 0,
    explanation: `Step 1: Calculate equivalent parallel resistance $R_p$:
   $\\frac{1}{R_p} = \\frac{1}{6} + \\frac{1}{3} = \\frac{1 + 2}{6} = \\frac{3}{6} = \\frac{1}{2} \\implies R_p = 2\\,\\Omega$.
Step 2: Use Ohm's Law $I = \\frac{V}{R_p}$:
   $I = \\frac{12\\text{ V}}{2\\,\\Omega} = 6\\text{ A}$.
Result: The total current is $6\\text{ A}$.`,
    topic: 'Current Electricity',
    allowedExamTypes: ['JAMB', 'Personal CBT']
  },
  {
    id: 'jamb-phy-4',
    subject: 'Physics',
    set: 1,
    year: 2024,
    difficulty: 'Medium',
    question: 'A sound wave of frequency $500\\text{ Hz}$ travels through air at a speed of $340\\text{ m/s}$. What is its wavelength?',
    options: ['$0.68\\text{ m}$', '$1.47\\text{ m}$', '$0.34\\text{ m}$', '$170\\text{ m}$'],
    correctAnswer: 0,
    explanation: `Step 1: Use the universal wave equation: $v = f\\lambda$.
Step 2: Rearrange for wavelength: $\\lambda = \\frac{v}{f}$.
Step 3: Substitute speed $v = 340\\text{ m/s}$ and frequency $f = 500\\text{ Hz}$:
   $\\lambda = \\frac{340}{500} = 0.68\\text{ m}$.
Result: The wavelength is $0.68\\text{ m}$.`,
    topic: 'Waves & Sound',
    allowedExamTypes: ['JAMB', 'Personal CBT']
  },
  {
    id: 'jamb-phy-5',
    subject: 'Physics',
    set: 1,
    year: 2024,
    difficulty: 'Hard',
    question: 'An ideal transformer has $500$ turns in the primary coil and $100$ turns in the secondary coil. If the primary AC voltage is $220\\text{ V}$, what is the secondary output voltage?',
    options: ['$44\\text{ V}$', '$1100\\text{ V}$', '$22\\text{ V}$', '$55\\text{ V}$'],
    correctAnswer: 0,
    explanation: `Step 1: State the transformer turn-ratio equation:
   $\\frac{V_s}{V_p} = \\frac{N_s}{N_p}$
Step 2: Rearrange for secondary voltage $V_s$:
   $V_s = V_p \\times \\frac{N_s}{N_p} = 220 \\times \\frac{100}{500} = 220 \\times 0.2 = 44\\text{ V}$.
Result: The secondary voltage is $44\\text{ V}$.`,
    topic: 'Electromagnetism',
    allowedExamTypes: ['JAMB', 'Personal CBT']
  }
];
