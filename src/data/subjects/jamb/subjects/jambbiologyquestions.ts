import { RawQuestion } from '../../../questions';

export const jambBiologyQuestions: RawQuestion[] = [
  {
    id: 'jamb-bio-1',
    subject: 'Biology',
    set: 1,
    year: 2024,
    difficulty: 'Medium',
    question: 'In genetics, if a heterozygous tall plant ($Tt$) is crossed with a homozygous dwarf plant ($tt$), what is the expected phenotypic ratio of the offspring?',
    options: ['1 Tall : 1 Dwarf', '3 Tall : 1 Dwarf', 'All Tall', 'All Dwarf'],
    correctAnswer: 0,
    explanation: `Step 1: Perform the genetic cross (Punnett Square) between $Tt$ and $tt$:
   - Cross: $Tt \\times tt$
   - Possible gametes from $Tt$: $T$ and $t$
   - Possible gametes from $tt$: $t$ and $t$
Step 2: Determine offspring genotypes:
   - $T \\times t \\rightarrow Tt$ (Tall)
   - $T \\times t \\rightarrow Tt$ (Tall)
   - $t \\times t \\rightarrow tt$ (Dwarf)
   - $t \\times t \\rightarrow tt$ (Dwarf)
Step 3: Analyze offspring phenotypes:
   - 2 plants are Tall ($Tt$), and 2 plants are Dwarf ($tt$).
   - Ratio is $2:2$, which simplifies to $1:1$.
Result: The expected phenotypic ratio is 1 Tall : 1 Dwarf.`,
    topic: 'Genetics',
    allowedExamTypes: ['JAMB', 'Personal CBT']
  },
  {
    id: 'jamb-bio-2',
    subject: 'Biology',
    set: 1,
    year: 2024,
    difficulty: 'Easy',
    question: 'Which of the following cellular organelles is primarily responsible for cellular respiration and ATP synthesis?',
    options: ['Mitochondria', 'Ribosome', 'Golgi apparatus', 'Endoplasmic reticulum'],
    correctAnswer: 0,
    explanation: `Step 1: Understand organelle functions:
   - Mitochondria: The "powerhouse of the cell", site of the Krebs cycle and oxidative phosphorylation generating ATP.
   - Ribosome: Site of protein synthesis.
   - Golgi apparatus: Modification and packaging of proteins.
   - Endoplasmic reticulum: Synthesis of lipids and transport.
Result: Mitochondria is the organelle responsible for ATP synthesis.`,
    topic: 'Cell Biology',
    allowedExamTypes: ['JAMB', 'Personal CBT']
  },
  {
    id: 'jamb-bio-3',
    subject: 'Biology',
    set: 1,
    year: 2024,
    difficulty: 'Medium',
    question: 'The process of maintaining a constant internal environment in living organisms is known as:',
    options: ['Homeostasis', 'Metabolism', 'Osmoregulation', 'Chemosynthesis'],
    correctAnswer: 0,
    explanation: `Step 1: Define the biological terms:
   - Homeostasis: The regulation and maintenance of constant internal chemical and physical conditions (e.g. temperature, pH, blood glucose).
   - Osmoregulation: Specific control of water and solute potential.
   - Metabolism: Total biochemical reactions in a cell.
Result: The correct term is Homeostasis.`,
    topic: 'Physiology',
    allowedExamTypes: ['JAMB', 'Personal CBT']
  },
  {
    id: 'jamb-bio-4',
    subject: 'Biology',
    set: 1,
    year: 2024,
    difficulty: 'Hard',
    question: 'In an ecosystem, the primary producers occupy which trophic level?',
    options: ['First trophic level', 'Second trophic level', 'Third trophic level', 'Fourth trophic level'],
    correctAnswer: 0,
    explanation: `Step 1: Identify trophic levels:
   - First trophic level ($T_1$): Primary producers (autotrophs such as green plants and phytoplankton).
   - Second trophic level ($T_2$): Primary consumers (herbivores).
   - Third trophic level ($T_3$): Secondary consumers (carnivores).
Result: Primary producers occupy the First trophic level.`,
    topic: 'Ecology',
    allowedExamTypes: ['JAMB', 'Personal CBT']
  },
  {
    id: 'jamb-bio-5',
    subject: 'Biology',
    set: 1,
    year: 2024,
    difficulty: 'Medium',
    question: 'Which enzyme is responsible for the digestion of starch in the human mouth?',
    options: ['Ptyalin (Salivary Amylase)', 'Pepsin', 'Trypsin', 'Lipase'],
    correctAnswer: 0,
    explanation: `Step 1: Identify digestive enzymes and their secretion sites:
   - Ptyalin (Salivary Amylase): Secreted in saliva, hydrolyzes starch into maltose.
   - Pepsin: Secreted in the stomach, breaks proteins into peptides.
   - Trypsin: Secreted by pancreas into duodenum for protein digestion.
   - Lipase: Breaks down emulsified lipids into fatty acids and glycerol.
Result: Ptyalin (Salivary Amylase) digests starch in the mouth.`,
    topic: 'Nutrition & Digestion',
    allowedExamTypes: ['JAMB', 'Personal CBT']
  }
];
