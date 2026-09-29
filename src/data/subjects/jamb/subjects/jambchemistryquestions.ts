import { RawQuestion } from '../../../questions';

export const jambChemistryQuestions: RawQuestion[] = [
  {
    id: 'jamb-chm-1',
    subject: 'Chemistry',
    set: 1,
    year: 2024,
    difficulty: 'Medium',
    question: 'What volume of oxygen at s.t.p. is required to completely combust $44\\text{ g}$ of propane ($\\text{C}_3\\text{H}_8$)? [$\\text{C} = 12, \\text{H} = 1$, Molar Volume at s.t.p. $= 22.4\\text{ dm}^3$]',
    options: ['$112.0\\text{ dm}^3$', '$22.4\\text{ dm}^3$', '$44.8\\text{ dm}^3$', '$56.0\\text{ dm}^3$'],
    correctAnswer: 0,
    explanation: `Step 1: Write the balanced chemical reaction for propane combustion:
   $\\text{C}_3\\text{H}_8 + 5\\text{O}_2 \\rightarrow 3\\text{CO}_2 + 4\\text{H}_2\\text{O}$
Step 2: Calculate the molar mass of $\\text{C}_3\\text{H}_8$:
   $(3 \\times 12) + (8 \\times 1) = 36 + 8 = 44\\text{ g/mol}$.
Step 3: Determine the moles of propane:
   $n(\\text{C}_3\\text{H}_8) = \\frac{44\\text{ g}}{44\\text{ g/mol}} = 1\\text{ mol}$.
Step 4: From the mole ratio, $1\\text{ mol } \\text{C}_3\\text{H}_8$ reacts with $5\\text{ mol } \\text{O}_2$.
Step 5: Calculate oxygen volume at s.t.p.:
   $V(\\text{O}_2) = 5\\text{ mol} \\times 22.4\\text{ dm}^3/\\text{mol} = 112.0\\text{ dm}^3$.
Result: Required volume of oxygen is $112.0\\text{ dm}^3$.`,
    topic: 'Stoichiometry & Gases',
    allowedExamTypes: ['JAMB', 'Personal CBT']
  },
  {
    id: 'jamb-chm-2',
    subject: 'Chemistry',
    set: 1,
    year: 2024,
    difficulty: 'Easy',
    question: 'The electronic configuration of an element with atomic number $17$ (Chlorine) is:',
    options: ['$2, 8, 7$', '$2, 8, 8$', '$2, 8, 6$', '$2, 7, 8$'],
    correctAnswer: 0,
    explanation: `Step 1: Distribute 17 electrons across atomic shells (K, L, M):
   - K shell: 2 electrons
   - L shell: 8 electrons
   - M shell: $17 - (2 + 8) = 7$ electrons.
Result: The electronic configuration is $2, 8, 7$ (or $1s^2 2s^2 2p^6 3s^2 3p^5$).`,
    topic: 'Atomic Structure & Periodic Table',
    allowedExamTypes: ['JAMB', 'Personal CBT']
  },
  {
    id: 'jamb-chm-3',
    subject: 'Chemistry',
    set: 1,
    year: 2024,
    difficulty: 'Medium',
    question: 'Calculate the pH of a $0.001\\text{ M}$ solution of hydrochloric acid ($\\text{HCl}$).',
    options: ['$3$', '$2$', '$1$', '$4$'],
    correctAnswer: 0,
    explanation: `Step 1: Understand that $\\text{HCl}$ is a strong monobasic acid that completely dissociates:
   $\\text{HCl} \\rightarrow \\text{H}^+ + \\text{Cl}^-$
Step 2: $[\\text{H}^+] = 0.001\\text{ M} = 10^{-3}\\text{ M}$.
Step 3: Apply the pH formula:
   $\\text{pH} = -\\log_{10}[\\text{H}^+] = -\\log_{10}(10^{-3}) = 3$.
Result: The pH is $3$.`,
    topic: 'Acids, Bases & Salts',
    allowedExamTypes: ['JAMB', 'Personal CBT']
  },
  {
    id: 'jamb-chm-4',
    subject: 'Chemistry',
    set: 1,
    year: 2024,
    difficulty: 'Medium',
    question: 'Which of the following functional groups characterizes alkanols (alcohols)?',
    options: ['$-\\text{OH}$ (Hydroxyl)', '$-\\text{COOH}$ (Carboxyl)', '$-\\text{CHO}$ (Carbonyl/Alkanal)', '$-\\text{COOCH}_3$ (Ester)'],
    correctAnswer: 0,
    explanation: `Step 1: Review standard IUPAC organic functional groups:
   - Alkanols / Alcohols: contain the Hydroxyl group ($-\\text{OH}$).
   - Alkanoic acids: contain the Carboxyl group ($-\\text{COOH}$).
   - Alkanals: contain the Formyl/Aldehyde group ($-\\text{CHO}$).
   - Esters: contain the Alkoxycarbonyl group ($-\\text{COOR}$).
Result: Hydroxyl group ($-\\text{OH}$).`,
    topic: 'Organic Chemistry',
    allowedExamTypes: ['JAMB', 'Personal CBT']
  },
  {
    id: 'jamb-chm-5',
    subject: 'Chemistry',
    set: 1,
    year: 2024,
    difficulty: 'Hard',
    question: 'During the electrolysis of acidified water, which gas is liberated at the anode (+)?',
    options: ['Oxygen gas ($\\text{O}_2$)', 'Hydrogen gas ($\\text{H}_2$)', 'Chlorine gas ($\\text{Cl}_2$)', 'Nitrogen dioxide ($\\text{NO}_2$)'],
    correctAnswer: 0,
    explanation: `Step 1: Identify ions present in acidified water: $\\text{H}^+, \\text{OH}^-, \\text{SO}_4^{2-}$.
Step 2: At the Anode (positive electrode), oxidation occurs. $\\text{OH}^-$ ions are discharged preferentially over $\\text{SO}_4^{2-}$ due to lower standard electrode potential:
   $4\\text{OH}^- \\rightarrow 2\\text{H}_2\\text{O} + \\text{O}_2 + 4e^-$
Result: Oxygen gas is liberated at the anode.`,
    topic: 'Electrochemistry',
    allowedExamTypes: ['JAMB', 'Personal CBT']
  }
];
