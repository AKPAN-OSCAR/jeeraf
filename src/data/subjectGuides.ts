import { Subject } from '../types';

export interface Topic {
  title: string;
  content: string;
  diagram?: {
    url: string;
    caption: string;
  };
}

export interface SubjectGuide {
  subject: Subject;
  overview: string;
  topics: Topic[];
}

export const subjectGuides: Partial<Record<Subject, SubjectGuide>> = {
  'Physics': {
    subject: 'Physics',
    overview: 'Physics is the study of matter, energy, and their universal interactions. This master guide covers the complete JARB and WAEC curriculum, focusing on conceptual clarity and problem-solving techniques for physical laws.',
    topics: [
      {
        title: 'Units, Measurements and Quantities',
        content: 'All of Physics is built upon the foundation of measurement.\n- Fundamental Quantities: Mass (kg), Length (m), Time (s), Temperature (K), Current (A), Luminous Intensity (cd), and Amount of Substance (mol).\n- Derived Quantities: Speed (m/s), Force (N), Pressure (Pa), etc.\n\nPrecision Instruments:\n1. Vernier Calipers: Measures internal/external diameters and depths to 0.1mm accuracy.\n2. Micrometer Screw Gauge: For very small dimensions like wire thickness, accurate to 0.01mm.\n\nDimensional Analysis: A technique to check the validity of equations by ensuring both sides have the same fundamental dimensions [M], [L], [T].',
        diagram: {
          url: 'https://picsum.photos/seed/physics-measure-tools/800/400',
          caption: 'High-precision tools: Vernier caliper vs. Micrometer screw gauge.'
        }
      },
      {
        title: 'Motion and Kinematics',
        content: 'Motion is described using scalars (distance, speed) and vectors (displacement, velocity, acceleration).\n\nEquations of Motion (Uniform Acceleration):\n1. v = u + at\n2. s = ut + ½at²\n3. v² = u² + 2as\n\nProjectile Motion: A 2D motion where an object moves under gravity. Time of flight (T), Maximum height (H), and Range (R) are calculated by resolving motion into horizontal (constant velocity) and vertical (uniform g) components.',
        diagram: {
          url: 'https://picsum.photos/seed/projectile-path/800/400',
          caption: 'The parabolic trajectory of a projectile with vector components.'
        }
      },
      {
        title: 'Dynamics: Newton\'s Laws and Momentum',
        content: 'Newton\'s Laws:\n1. Inertia: A body remains at rest or uniform motion unless acted upon by an external force.\n2. F = ma: Force is the rate of change of momentum.\n3. Action/Reaction: For every action, there is an equal and opposite reaction.\n\nMomentum (p = mv): The product of mass and velocity. The Law of Conservation of Momentum states that total momentum remains constant in a closed system (e.g., collisions).',
        diagram: {
          url: 'https://picsum.photos/seed/physics-collision/800/400',
          caption: 'Elastic vs Inelastic collisions and vector momentum diagrams.'
        }
      },
      {
        title: 'Work, Energy, and Power',
        content: 'Work (W = Fd): Done when force causes displacement. (Joules).\nEnergy Forms:\n- Kinetic Energy (K.E) = ½mv²\n- Gravitational Potential Energy (P.E) = mgh\n\nLaw of Conservation of Mechanical Energy: In a conservative field (like gravity), total energy E = K.E + P.E remains constant.\n\nPower (P = W/t): The rate of work. Efficiency (%) = (Output Work / Input Work) × 100.',
        diagram: {
          url: 'https://picsum.photos/seed/energy-transfer/800/400',
          caption: 'Energy transformation in a hydroelectric dam system.'
        }
      },
      {
        title: 'Circular and Harmonic Motion',
        content: 'Circular Motion: Requires a centripetal force (F = mv²/r) directed toward the center. Angular velocity (ω) = 2πf.\n\nSimple Harmonic Motion (SHM): A periodic motion where acceleration is proportional to displacement but in the opposite direction (e.g., a simple pendulum or a loaded spring).\n- Period of Pendulum: T = 2π√(L/g).',
        diagram: {
          url: 'https://picsum.photos/seed/physics-shm/800/400',
          caption: 'Wave tracking of a simple pendulum over time.'
        }
      },
      {
        title: 'Properties of Solids and Fluids',
        content: 'Elasticity: Hooke\'s Law (F = ke). Young\'s Modulus measures material stiffness.\n\nFluid Mechanics:\n- Density = Mass / Volume\n- Pressure = Force / Area; P = hρg (Liquid pressure).\n- Archimedes\' Principle: Upthrust equals weight of fluid displaced.\n- Bernoulli\'s Principle: As speed of fluid increases, its pressure decreases (Explains airplane lift).',
        diagram: {
          url: 'https://picsum.photos/seed/physics-fluids/800/400',
          caption: 'Pascal\'s Law in hydraulic systems and Archimedes upthrust.'
        }
      },
      {
        title: 'Heat and Thermodynamics',
        content: 'Heat is energy transfer due to temperature difference.\n- Expansion: Linear, Area, and Volume expansivity.\n- Specific Heat Capacity (Q = mcΔθ).\n- Latent Heat (Q = mL): Energy for phase change at constant temperature.\n- Gas Laws: Boyle\'s (PV=k), Charles\' (V/T=k), and Ideal Gas Law (PV=nRT).',
        diagram: {
          url: 'https://picsum.photos/seed/heat-graph/800/400',
          caption: 'Heating curve of water showing phase transitions.'
        }
      },
      {
        title: 'Waves and Optics',
        content: 'Waves: Longitudinal (Sound) vs Transverse (Light). Velocity V = fλ.\nOptics:\n- Reflection: Real vs Virtual images in mirrors.\n- Refraction: Snell\'s Law (n = sin i / sin r). Total Internal Reflection (TIR) occurs above the critical angle.\n- Lenses: Used in microscopes, telescopes, and vision correction (concave for myopia).',
        diagram: {
          url: 'https://picsum.photos/seed/light-optics/800/400',
          caption: 'Refraction through a glass prism showing dispersion.'
        }
      },
      {
        title: 'Electricity and Magnetism',
        content: 'Electrostatics: Coulomb\'s Law (Force between charges).\nCurrent Electricity: Ohm\'s Law (V = IR). Series and Parallel resistor networks.\n\nElectromagnetism:\n- Faraday\'s Law: Changing magnetic fields induce EMF.\n- Lenz\'s Law: Induced current opposes the change causing it.\n- Transformers: Step-up vs Step-down (Vp/Vs = Np/Ns).',
        diagram: {
          url: 'https://picsum.photos/seed/elec-mag/800/400',
          caption: 'The working principle of an AC generator.'
        }
      }
    ]
  },
  'Chemistry': {
    subject: 'Chemistry',
    overview: 'Chemistry explores the composition, structure, and properties of matter. This guide provides a deep dive into the atomic world, chemical kinetics, and organic synthesis required for JAMB and WAEC success.',
    topics: [
      {
        title: 'Atomic Structure and the Periodic Table',
        content: 'Everything is made of atoms. Electrons, protons, and neutrons are the primary subatomic particles.\n- Quantum Numbers: Determine the position and energy of electrons (s, p, d, f orbitals).\n- Periodic Law: Elements are arranged by atomic number. Groups have similar valence electrons and chemical properties.\n- Periodicity: Trends in Atomic Radius, Ionization Energy, and Electronegativity across the table.',
        diagram: {
          url: 'https://picsum.photos/seed/chem-periodic/800/400',
          caption: 'The modern periodic table with orbital block highlights.'
        }
      },
      {
        title: 'Chemical Bonding and Stoichiometry',
        content: 'Chemical Bonds:\n1. Ionic: Electrostatic attraction between ions.\n2. Covalent: Sharing electron pairs. Polar vs Non-polar.\n3. Metallic: Delocalized valence electrons.\n\nStoichiometry:\n- The Mole: 6.02 × 10²³ entities.\n- Empirial vs Molecular Formulas.\n- Limiting Reactants: The substance that is completely consumed in a reaction.',
        diagram: {
          url: 'https://picsum.photos/seed/chem-mole/800/400',
          caption: 'The molar volume of gases and stoichiometric calculations.'
        }
      },
      {
        title: 'States of Matter and Gas Laws',
        content: 'Solid, Liquid, and Gas phases. Kinetic Molecular Theory explains gas behavior.\n\nIdeal Gas Equation: PV = nRT.\n- Dalton\'s Law of Partial Pressures: Total P = P1 + P2 + ...\n- Graham\'s Law of Diffusion: Rate ∝ 1/√(Molar Mass). Higher mass gases diffuse slower.',
        diagram: {
          url: 'https://picsum.photos/seed/gas-laws/800/400',
          caption: 'Cylinder-piston models illustrating Boyle\'s and Charles\' laws.'
        }
      },
      {
        title: 'Chemical Energetics and Equilibrium',
        content: 'Enthalpy (ΔH): Heat content change. Exothermic (-ΔH) vs Endothermic (+ΔH).\nChemical Equilibrium:\n- Le Chatelier\'s Principle: Systems respond to stress (concentration, P, T) to restore equilibrium.\n- Haber Process: Industrial production of Ammonia (Fe catalyst, high P).',
        diagram: {
          url: 'https://picsum.photos/seed/chem-energy/800/400',
          caption: 'Potential energy profiles showing activation energy peaks.'
        }
      },
      {
        title: 'Acids, Bases, and Salts',
        content: 'Definitions (Arrhenius, Bronsted-Lowry, Lewis).\n- pH Scale: Measurement of [H+]. pH = -log[H+].\n- Titration: Neutralization using burettes and pipettes with specific indicators.\n- Buffer Solutions: Resist pH change upon addition of small amounts of acid/base.',
        diagram: {
          url: 'https://picsum.photos/seed/acid-titrate/800/400',
          caption: 'Standard titration setup and pH indicator color curves.'
        }
      },
      {
        title: 'Electrochemistry',
        content: 'Redox Reactions: Transfer of electrons (Oxidation/Reduction).\n- Electrochemical Cells: Convert chemical energy to electrical.\n- Electrolysis: Decomposing compounds via electricity.\n- Faraday\'s Laws: m = Zit. mass is proportional to electrochemical equivalent and total charge.',
        diagram: {
          url: 'https://picsum.photos/seed/elec-chem-cell/800/400',
          caption: 'Galvanic cell vs Electrolytic cell configurations.'
        }
      },
      {
        title: 'Organic Chemistry: Hydrocarbons and Groups',
        content: 'Carbon\'s unique ability to form chains/rings.\n- Alkanes, Alkenes, Alkynes nomenclature.\n- Functional Groups: Alcohols (-OH), Carboxylic Acids (-COOH), Esters (-COOR), and Amines (-NH2).\n- Polymerization: Joining small monomers into large macromolecules (e.g., Polyethene).',
        diagram: {
          url: 'https://picsum.photos/seed/organic-struct/800/400',
          caption: 'Structural isomerism and functional group taxonomy.'
        }
      },
      {
        title: 'Metals and Industrial Chemistry',
        content: 'Extraction of metals (Reduction with Carbon or Electrolysis).\n- Iron: Blast furnace operations.\n- Aluminum: Hall-Heroult process.\n- Industrial Processes: Contact process for H2SO4, Solvay process for Na2CO3.',
        diagram: {
          url: 'https://picsum.photos/seed/industrial-chem/800/400',
          caption: 'Blast furnace diagram for the production of pig iron.'
        }
      }
    ]
  },
  'Biology': {
    subject: 'Biology',
    overview: 'Biology is the study of living organisms, their structure, function, growth, and evolution.',
    topics: [
      {
        title: 'Cell Structure and Functions',
        content: 'Cells are the basic units of life. Plant cells have cell walls and chloroplasts, which animal cells lack. Nucleus (control center), Mitochondria (powerhouse), and Ribosomes (protein synthesis) are key organelles.',
        diagram: {
          url: 'https://picsum.photos/seed/biology-cell/800/450',
          caption: 'Comparison of Animal vs. Plant Cell structures.'
        }
      },
      {
        title: 'Genetics and Heredity',
        content: 'Studying how traits are passed from parents to offspring. Genes are located on chromosomes. Dominant and recessive alleles determine phenotypes. Mendel\'s laws of segregation and independent assortment are core.',
        diagram: {
          url: 'https://picsum.photos/seed/dna-helix/800/450',
          caption: 'The Double Helix structure of DNA.'
        }
      },
      {
        title: 'Ecology and Habitats',
        content: 'Interaction between organisms and their environment. Food chains show flow of energy. Ecosystems consist of biotic (living) and abiotic (non-living) components. Nutrient cycles (Carbon, Nitrogen) sustain life.',
        diagram: {
          url: 'https://picsum.photos/seed/ecosystem/800/450',
          caption: 'A simple food web and energy pyramid.'
        }
      },
      {
        title: 'Human Physiology',
        content: 'Organs working together (Circulatory, Respiratory, Nervous, etc.). Homeostasis is the maintenance of a constant internal environment (like body temperature and blood sugar).',
        diagram: {
          url: 'https://picsum.photos/seed/human-anatomy/800/450',
          caption: 'The human circulatory system: Heart and blood vessels.'
        }
      },
      {
        title: 'Nutrition and Digestion',
        content: 'Nutrition is the process by which organisms obtain and use food.\n- Autotrophic: Green plants making their own food via photosynthesis.\n- Heterotrophic: Animals obtaining food from external sources.\n\nDigestive System:\n1. Ingestion (Mouth)\n2. Digestion (Stomach/Small Intestine)\n3. Absorption (Villi in Small Intestine)\n4. Assimilation (Use of absorbed food by cells)\n5. Egestion (Removal of undigested waste).',
        diagram: {
          url: 'https://picsum.photos/seed/bio-digest/800/450',
          caption: 'The human digestive tract and nutrient absorption pathways.'
        }
      },
      {
        title: 'Plant Transport and Transpiration',
        content: 'Plants require transport systems for water and nutrients.\n- Xylem: Transports water and minerals from roots to leaves.\n- Phloem: Transports manufactured food (glucose) from leaves to other parts.\n\nTranspiration: The loss of water vapor from the leaves through stomata. It creates a "transpiration pull" which helps in water ascent.',
        diagram: {
          url: 'https://picsum.photos/seed/bio-plant-trans/800/450',
          caption: 'Water movement through xylem and phloem in plants.'
        }
      },
      {
        title: 'Evolution and Variation',
        content: 'Evolution is the gradual change in the characteristics of a population over time.\n- Natural Selection: Darwin\'s theory that organisms better adapted to their environment tend to survive and produce more offspring.\n- Variation: Morphological (height, eye color) vs. Physiological (blood group, rolling of tongue).\n- Evidence: Fossils, comparative anatomy, and vestigial organs.',
        diagram: {
          url: 'https://picsum.photos/seed/bio-evolution/800/450',
          caption: 'The tree of life and evolutionary lineages.'
        }
      }
    ]
  },
  'Mathematics': {
    subject: 'Mathematics',
    overview: 'Mathematics is the structural language of logic, patterns, and quantitative reasoning. This comprehensive guide covers the unified syllabus for JAMB and WAEC, from foundational number theory to advanced calculus and statistics.',
    topics: [
      {
        title: 'Number Bases',
        content: 'Number bases are systems for counting. The most common is Base 10 (Denary), but computers use Base 2 (Binary).\n\nKey Operations:\n1. Converting from Base n to Base 10: Multiply each digit by the base raised to its position power.\n   Example: 1101₂ = (1 × 2³) + (1 × 2²) + (0 × 2¹) + (1 × 2⁰) = 8 + 4 + 0 + 1 = 13₁₀.\n2. Converting from Base 10 to Base n: Repeatedly divide by the target base and record remainders from bottom to top.\n3. Basic Arithmetic in Bases: Addition and subtraction follow the same rules as base 10, but you "carry over" or "borrow" in units of the base.',
        diagram: {
          url: 'https://picsum.photos/seed/math-binary/800/400',
          caption: 'Place value table for Binary (Base 2) vs Denary (Base 10).'
        }
      },
      {
        title: 'Indices and Logarithms',
        content: 'Indices (Exponents) represent repeated multiplication.\nLaws of Indices:\n- aᵐ × aⁿ = aᵐ⁺ⁿ\n- aᵐ / aⁿ = aᵐ⁻ⁿ\n- (aᵐ)ⁿ = aᵐⁿ\n- a⁻ⁿ = 1/aⁿ\n- a¹/ⁿ = ⁿ√a\n\nLogarithms are the power to which a base must be raised to produce a number.\ny = aˣ ⇔ x = logₐ(y)\nLaws of Logarithms:\n- log(MN) = log M + log N\n- log(M/N) = log M - log N\n- log(Mᵖ) = p log M\n- logₐ(a) = 1; logₐ(1) = 0',
        diagram: {
          url: 'https://picsum.photos/seed/math-indices/800/400',
          caption: 'The inverse relationship between Exponential and Logarithmic functions.'
        }
      },
      {
        title: 'Fractions, Decimals, and Percentages',
        content: 'These are different ways of representing parts of a whole.\n- Fractions: Proper (3/4), Improper (5/2), and Mixed (2½).\n- Decimals: Recurring decimals can be converted back to fractions using algebraic methods.\n- Percentages: Parts per hundred. x% = x/100.\n\nRatio and Proportion:\n- Ratio compares quantities (e.g., 2:3).\n- Proportion shows equality between two ratios. Direct proportion (y ∝ x) vs Inverse proportion (y ∝ 1/x).',
        diagram: {
          url: 'https://picsum.photos/seed/math-fractions/800/400',
          caption: 'Pie chart and Bar model visualizations of fractions and percentages.'
        }
      },
      {
        title: 'Algebraic Fractions',
        content: 'Algebraic fractions are fractions where the numerator or denominator (or both) are algebraic expressions.\n\nSimplification Methods:\n1. Factorization: Factorize the numerator and denominator completely before attempting to simplify.\n2. Cancellation: Cancel out common factors from both the numerator and denominator. Never cancel terms that are separated by plus or minus signs unless they are part of a factored bracket.\n3. Operations: Addition and subtraction require finding the Lowest Common Multiple (LCM) of the denominators. Multiplication and division follow the same rules as numerical fractions.\n\nExample:\nSimplify (x² - 9) / (x² + 5x + 6)\n= ((x - 3)(x + 3)) / ((x + 2)(x + 3))\n= (x - 3) / (x + 2).',
        diagram: {
          url: 'https://picsum.photos/seed/math-algebraic-frac/800/400',
          caption: 'Simplification process for algebraic fractions.'
        }
      },
      {
        title: 'Binary Operations',
        content: 'A binary operation (denoted by symbols like ∗, ⊕, or Δ) is a rule that combines two elements of a set to produce another element.\n\nProperties to identify:\n1. Closure: If a ∗ b results in an element within the same set.\n2. Commutativity: a ∗ b = b ∗ a.\n3. Associativity: (a ∗ b) ∗ c = a ∗ (b ∗ c).\n4. Identity Element (e): a ∗ e = e ∗ a = a.\n5. Inverse Element (a⁻¹): a ∗ a⁻¹ = a⁻¹ ∗ a = e.\n\nSolving Table Problems: Operations defined by a grid where outcomes are checked for symmetry (commutativity) and identity patterns.',
        diagram: {
          url: 'https://picsum.photos/seed/math-binary-op/800/400',
          caption: 'Cayley table for a binary operation illustrating identity and symmetry.'
        }
      },
      {
        title: 'Variation',
        content: 'Variation describes how one quantity changes in relation to others.\n1. Direct Variation: y = kx (y increases as x increases).\n2. Inverse Variation: y = k/x (y decreases as x increases).\n3. Joint Variation: y = kxz (y varies with multiple variables).\n4. Partial Variation: y = a + kx (part constant, part varying).\n\nKey Step: Always find the constant of variation (k) first using given initial values.',
        diagram: {
          url: 'https://picsum.photos/seed/math-variation/800/400',
          caption: 'Graphical representation of Direct vs. Inverse variation curves.'
        }
      },
      {
        title: 'Sets and Venn Diagrams',
        content: 'A set is a collection of distinct objects.\nKey Symbols:\n- ∈ : Element of\n- ∪ : Union (All elements in either or both)\n- ∩ : Intersection (Elements in both only)\n- ∅ : Null or Empty set\n- ξ or U : Universal set\n- A\' : Complement of A\n\nVenn Diagrams are essential for solving logic problems. For two sets: n(A∪B) = n(A) + n(B) - n(A∩B). For three sets, the diagram becomes more complex but follows the same exclusion-inclusion principle.',
        diagram: {
          url: 'https://picsum.photos/seed/venn-detailed/800/400',
          caption: 'Interactive Venn Diagram for three overlapping sets A, B, and C.'
        }
      },
      {
        title: 'Sequences and Series (AP & GP)',
        content: 'Arithmetic Progression (AP): Each term is found by adding a common difference (d).\n- n-th term: Tₙ = a + (n-1)d\n- Sum: Sₙ = n/2 [2a + (n-1)d]\n\nGeometric Progression (GP): Each term is found by multiplying by a common ratio (r).\n- n-th term: Tₙ = arⁿ⁻¹\n- Sum: Sₙ = a(rⁿ - 1) / (r - 1) for r > 1\n- Sum to Infinity (for |r| < 1): S∞ = a / (1 - r)',
        diagram: {
          url: 'https://picsum.photos/seed/series-math/800/400',
          caption: 'Growth patterns of Arithmetic vs Geometric sequences.'
        }
      },
      {
        title: 'Polynomials and Quadratic Equations',
        content: 'Polynomials are expressions with variables and exponents.\n- Division: Use long division or synthetic division.\n- Remainder Theorem: If P(x) is divided by (x - a), the remainder is P(a).\n- Factor Theorem: If P(a) = 0, then (x - a) is a factor.\n\nQuadratic Equations (ax² + bx + c = 0):\n- Roots: α + β = -b/a; αβ = c/a.\n- Quadratic Formula: x = [-b ± √(b² - 4ac)] / 2a.\n- Nature of Roots: Determined by discriminant D = b² - 4ac.',
        diagram: {
          url: 'https://picsum.photos/seed/poly-roots/800/400',
          caption: 'Parabola graphs showing two roots, one root, and no real roots.'
        }
      },
      {
        title: 'Simultaneous Equations and Inequalities',
        content: 'System of Equations:\n- Elimination Method: Multiply equations to make one variable coefficient identical, then add/subtract.\n- Substitution Method: Express one variable in terms of another.\n- Graphical Method: Finding the intersection point.\n\nInequalities:\n- Linear: 3x + 2 < 11 ⇒ 3x < 9 ⇒ x < 3.\n- Quadratic: x² - 5x + 6 > 0 ⇒ (x-2)(x-3) > 0. Check intervals (x < 2 or x > 3).\n- Note: Flipping an inequality occurs when multiplying or dividing by a negative number.',
        diagram: {
          url: 'https://picsum.photos/seed/inequality-graph/800/400',
          caption: 'Shaded regions on a Cartesian plane representing linear inequalities.'
        }
      },
      {
        title: 'Matrices and Determinants',
        content: 'A matrix is a rectangular array of numbers.\n- Addition/Subtraction: Add corresponding elements.\n- Multiplication: Row by Column.\n- Determinant (2x2): |A| = ad - bc.\n- Inverse (A⁻¹): (1/|A|) × Adjoint Matrix.\n- Applications: Solving systems of equations using Cramer\'s Rule or Inverse Matrix method.',
        diagram: {
          url: 'https://picsum.photos/seed/matrix-array/800/400',
          caption: 'Step-by-step matrix multiplication (dot product) visualization.'
        }
      },
      {
        title: 'Euclidean Geometry & Circle Theorems',
        content: 'Angles:\n- Complementary (Sum = 90°)\n- Supplementary (Sum = 180°)\n- Vertically Opposite (Equal)\n\nCircle Theorems:\n1. Angle at circumference in a semi-circle is 90°.\n2. Angle at center is twice angle at circumference.\n3. Angles in the same segment are equal.\n4. Cyclic Quadrilateral: Opposite angles sum to 180°.\n5. Alternate Segment Theorem: Angle between chord and tangent equals angle in alternate segment.',
        diagram: {
          url: 'https://picsum.photos/seed/geometry-circles/800/400',
          caption: 'Comprehensive visual of all essential circle theorems.'
        }
      },
      {
        title: 'Mensuration (Area and Volume)',
        content: '2D Shapes:\n- Rectangle: L × W\n- Triangle: ½ × b × h\n- Circle: πr² (Area); 2πr (Circumference)\n- Trapezium: ½ × (a + b) × h\n\n3D Shapes:\n- Cylinder: V = πr²h; Surface Area = 2πrh + 2πr²\n- Sphere: V = 4/3 πr³; Surface Area = 4πr²\n- Cone: V = 1/3 πr²h; Surface Area = πrl + πr² (where l = slant height)\n- Prisms and Pyramids: Based on cross-section or base area.',
        diagram: {
          url: 'https://picsum.photos/seed/mensuration-3d/800/400',
          caption: 'Nets of 3D solids and their volume/area formulas.'
        }
      },
      {
        title: 'Trigonometry',
        content: 'Trig Ratios for Right-angled Triangles: SOH CAH TOA.\n\nSine and Cosine Rules:\n- Sine Rule: a/sin A = b/sin B = c/sin C\n- Cosine Rule: a² = b² + c² - 2bc cos A\n\nTrig Identities:\n- sin²θ + cos²θ = 1\n- tan θ = sin θ / cos θ\n- Graphs: y = sin x and y = cos x exhibit periodic behavior with amplitude 1 and period 360°.',
        diagram: {
          url: 'https://picsum.photos/seed/trig-waves/800/400',
          caption: 'The Unit Circle and corresponding Sine/Cosine wave generation.'
        }
      },
      {
        title: 'Differentiation',
        content: 'The derivative dy/dx measures the rate of change.\n- Power Rule: If y = xⁿ, dy/dx = nxⁿ⁻¹.\n- Constant Rule: d/dx(c) = 0.\n- Chain Rule: d/dx[f(g(x))] = f\'(g(x))g\'(x).\n- Product/Quotient Rules: For UV and U/V.\n- Applications: Finding gradients, finding stationary points (turning points) where dy/dx = 0, and optimizing functions.',
        diagram: {
          url: 'https://picsum.photos/seed/calculus-diff-slope/800/400',
          caption: 'The derivative as the slope of the tangent at a specific point.'
        }
      },
      {
        title: 'Integration',
        content: 'Integration is the process of finding the antiderivative (Area finding).\n- Power Rule: ∫ xⁿ dx = [xⁿ⁺¹ / (n+1)] + C.\n- Definite Integrals: Finding areas between boundaries [a, b].\n- Applications: Finding area under curves, calculating total accumulated quantity from a rate, and resolving physical problems involving work or displacement.',
        diagram: {
          url: 'https://picsum.photos/seed/calculus-area-sum/800/400',
          caption: 'Integrals as the sum of infinite thin rectangles under a curve.'
        }
      },
      {
        title: 'Statistics',
        content: 'Data Collection and Interpretation.\n- Measures of Center: Mean (Σfx/Σf), Median, Mode.\n- Measures of Spread: Range, Mean Deviation, Variance (σ²), and Standard Deviation (σ).\n- Data Representation: Histograms (Frequency Density vs Class boundaries), Pie Charts, and Ogives (Cumulative Frequency Curves).\n- Ogive Utility: Finding the median and quartiles (Q1, Q3) graphically.',
        diagram: {
          url: 'https://picsum.photos/seed/stats-ogive/800/400',
          caption: 'Cumulative frequency curve (Ogive) for percentile determination.'
        }
      },
      {
        title: 'Probability',
        content: 'Likelihood of an event. 0 ≤ P(E) ≤ 1.\n- Mutually Exclusive Events: P(A or B) = P(A) + P(B).\n- Independent Events: P(A and B) = P(A) × P(B).\n- Conditional Probability: Probability of event A given B has occurred.\n- Tree Diagrams: Useful for visualizing multi-stage experiments.',
        diagram: {
          url: 'https://picsum.photos/seed/prob-tree/800/400',
          caption: 'Probability tree for two-stage independent event trials.'
        }
      }
    ]
  },
  'Economics': {
    subject: 'Economics',
    overview: 'Economics studies how individuals, businesses, and governments make choices about allocating resources. This guide covers micro and macro principles for exam preparation.',
    topics: [
      {
        title: 'Demand and Supply',
        content: 'Demand is the quantity consumers are willing to buy at a price. Supply is the quantity producers offer. Equilibrium occurs where demand equals supply. Shifts in curves result from non-price factors like income, tastes, and technology.',
        diagram: {
          url: 'https://picsum.photos/seed/economics-demand/800/450',
          caption: 'Demand and Supply curve showing market equilibrium (E).'
        }
      },
      {
        title: 'National Income Accounting',
        content: 'Measurement of the total value of goods and services produced in an economy.\n- Gross Domestic Product (GDP): Value within a country.\n- Gross National Product (GNP): Value by citizens regardless of location.\n- Methods of Calculation: Output method, Income method, and Expenditure method (C+I+G+X-M).',
        diagram: {
          url: 'https://picsum.photos/seed/national-income/800/450',
          caption: 'Circulatory flow of income between households and firms.'
        }
      },
      {
        title: 'Money and Banking',
        content: 'Money serves as a medium of exchange, measure of value, store of wealth, and standard for deferred payment.\n- Commercial Banks: Accept deposits and lend to individuals.\n- Central Bank: Regulates the banking system, issues currency, and manages monetary policy.',
        diagram: {
          url: 'https://picsum.photos/seed/money-banking/800/450',
          caption: 'The role of the Central Bank in the financial system.'
        }
      },
      {
        title: 'International Trade',
        content: 'Exchange of goods and services between countries.\n- Absolute Advantage (Adam Smith): Efficiency in production.\n- Comparative Advantage (David Ricardo): Specializing where opportunity cost is lowest.\n- Balance of Payments (BOP): Record of transactions between a country and the rest of the world.',
        diagram: {
          url: 'https://picsum.photos/seed/intl-trade/800/450',
          caption: 'Concepts of specialization and global trade flows.'
        }
      },
      {
        title: 'Production and Costs',
        content: 'Factors of production: Land, Labor, Capital, and Entrepreneurship. Law of Diminishing Returns: as more of a variable input is added, the marginal output eventually decreases.',
        diagram: {
          url: 'https://picsum.photos/seed/production-cost/800/450',
          caption: 'Average Fixed Cost vs. Average Variable Cost curves.'
        }
      },
      {
        title: 'Market Structures',
        content: 'Perfect Competition, Monopoly, Monopolistic Competition, and Oligopoly. Each has different characteristics regarding the number of firms, product type, and barriers to entry.',
        diagram: {
          url: 'https://picsum.photos/seed/market-structure/800/450',
          caption: 'Profit maximization in a Monopoly market.'
        }
      }
    ]
  },
  'Government': {
    subject: 'Government',
    overview: 'The study of political systems, governance, and civic rights and responsibilities. This guide explores the machinery of government and geopolitical relations.',
    topics: [
      {
        title: 'Arms of Government',
        content: 'Executive (Implements laws), Legislature (Makes laws), and Judiciary (Interprets laws). Checks and balances prevent the abuse of power by any single arm.',
        diagram: {
          url: 'https://picsum.photos/seed/gov-arms/800/450',
          caption: 'Tripartite system of power: Separation of powers.'
        }
      },
      {
        title: 'Political Parties and Pressure Groups',
        content: 'Political Parties: Organizations seeking to gain power and implement policies.\n- Manifestos: Public declarations of policies.\n- Pressure Groups: Organizations seeking to influence policy without seeking power (e.g., labor unions, environmental groups).',
        diagram: {
          url: 'https://picsum.photos/seed/pol-parties/800/450',
          caption: 'Interaction between the electorate, parties, and government.'
        }
      },
      {
        title: 'Public Administration',
        content: 'The implementation of government policy through civil service.\n- Civil Service: Permanent professional staff of government departments.\n- Bureaucracy: Administrative system with hierarchy and standardized rules.\n- Public Corporations: Statutory bodies created by act of parliament to provide services (e.g., PHCN, NNPC).',
        diagram: {
          url: 'https://picsum.photos/seed/public-admin/800/450',
          caption: 'Organizational structure of the Nigerian Civil Service.'
        }
      },
      {
        title: 'International Organizations',
        content: 'Geopolitical cooperation through organized bodies.\n- ECOWAS: Economic community of West African states, focused on regional integration.\n- African Union (AU): Promotes unity and sustainable development across Africa.\n- United Nations (UN): Maintains international peace and security.',
        diagram: {
          url: 'https://picsum.photos/seed/intl-orgs/800/450',
          caption: 'Global and regional organizational frameworks.'
        }
      },
      {
        title: 'Forms of Government',
        content: 'Federalism (Power shared between central and states), Unitary (Power centralized), Democracy (Rule by the people), and Monarchy (Rule by a king/queen).',
        diagram: {
          url: 'https://picsum.photos/seed/federal-system/800/450',
          caption: 'Structure of a Federal System of Government.'
        }
      },
      {
        title: 'Citizenship and Rights',
        content: 'Acquisition of citizenship (birth, naturalization). Fundamental Human Rights: Freedom of speech, assembly, and movement. Duties of a citizen: paying taxes, voting, obeying laws.',
        diagram: {
          url: 'https://picsum.photos/seed/rights-symbol/800/450',
          caption: 'Pillars of Democracy and Human Rights.'
        }
      }
    ]
  },
  'Geography': {
    subject: 'Geography',
    overview: 'Geography explores the Earth\'s landscapes, environments, and relations between people and environments. This guide covers physical, human, and regional geography.',
    topics: [
      {
        title: 'Physical Geography',
        content: 'Study of rocks (Igneous, Sedimentary, Metamorphic), landforms (mountains, valleys), and water bodies. Weathering and erosion shape the Earth\'s surface over time.',
        diagram: {
          url: 'https://picsum.photos/seed/rock-cycle/800/450',
          caption: 'The Rock Cycle: Transformation of rock types.'
        }
      },
      {
        title: 'Human Geography and Population',
        content: 'Focuses on human activity and its impact on the planet.\n- Population Density and Distribution: Factors like soil fertility and industrial centers.\n- Urbanization: Growth of cities and associated challenges (pollution, housing).\n- Settlement Patterns: Nucleated, dispersed, and linear.',
        diagram: {
          url: 'https://picsum.photos/seed/human-geog/800/450',
          caption: 'Global population density distribution map.'
        }
      },
      {
        title: 'Regional Geography of Nigeria',
        content: 'In-depth study of the Nigerian landscape.\n- Physical Regions: High Plains of Hausaland, Niger Delta, Cross River basin.\n- Economic Activities: Agriculture (Cocoa, Palm Oil), Mining (Petroleum in the Delta, Tin in Jos).\n- Infrastructure: Transportation networks (Railway, Road, River).',
        diagram: {
          url: 'https://picsum.photos/seed/nigeria-geog/800/450',
          caption: 'Major geographical and economic regions of Nigeria.'
        }
      },
      {
        title: 'Environmental Hazards',
        content: 'Threats to the physical and human environment.\n- Flooding: Causes (heavy rain, dam failure) and effects.\n- Desertification: Encroachment of desert in the north due to overgrazing and deforestation.\n- Pollution: Air, water, and land pollution from industrial and domestic waste.',
        diagram: {
          url: 'https://picsum.photos/seed/env-hazard/800/450',
          caption: 'Impact of desertification and soil erosion on landscapes.'
        }
      },
      {
        title: 'Climate and Vegetation',
        content: 'Climate zones (Tropical, Temperate, Polar). Factors affecting climate: latitude, altitude, and distance from sea. Vegetation types include forests, grasslands, and deserts.',
        diagram: {
          url: 'https://picsum.photos/seed/climate-map/800/450',
          caption: 'Global climate zones and vegetation distribution.'
        }
      },
      {
        title: 'Map Reading and Analysis',
        content: 'Understanding scales, contours, and conventional symbols. Contours show relief (height of land). Closely spaced contours indicate steep slopes. Gradients and cross-sections help visualize the terrain.',
        diagram: {
          url: 'https://picsum.photos/seed/map-contour/800/450',
          caption: 'Topographic map showing hills and valleys using contour lines.'
        }
      }
    ]
  },
  'Literature': {
    subject: 'Literature',
    overview: 'Literature involve reading and analyzing poems, plays, and novels to understand themes and literary devices.',
    topics: [
      {
        title: 'Literary Devices',
        content: 'Tools used by writers: Simile (like/as), Metaphor (direct comparison), Personification (human traits to non-humans), Alliteration (repeated sounds), and Onomatopoeia (sound-words).',
        diagram: {
          url: 'https://picsum.photos/seed/lit-devices/800/450',
          caption: 'Visualizing imagery and figurative language.'
        }
      },
      {
        title: 'Drama and Poetry',
        content: 'Drama focuses on dialogue and performance (Comedy, Tragedy). Poetry uses rhythm and meter to convey deep emotions and ideas (Sonnet, Ode, Epic).',
        diagram: {
          url: 'https://picsum.photos/seed/theater-masks/800/450',
          caption: 'The classic Tragedy and Comedy theater masks.'
        }
      }
    ]
  },
  'Commerce': {
    subject: 'Commerce',
    overview: 'Commerce studies business activities, trade, and the distribution of goods and services.',
    topics: [
      {
        title: 'Introduction to Commerce',
        content: 'Commerce involves trade (buying and selling) and aids to trade (banking, insurance, transport, etc.). It connects producers to consumers.',
        diagram: {
          url: 'https://picsum.photos/seed/commerce-trade/800/450',
          caption: 'The flow of goods and services in a commercial system.'
        }
      },
      {
        title: 'Documents of Trade',
        content: 'Invoices, receipts, delivery notes, and purchase orders. These documents provide proof of transaction and details of goods traded.',
        diagram: {
          url: 'https://picsum.photos/seed/trade-docs/800/450',
          caption: 'Samples of standard trading documents.'
        }
      }
    ]
  },
  'Accounting': {
    subject: 'Accounting',
    overview: 'Accounting is the systematic recording and reporting of financial transactions.',
    topics: [
      {
        title: 'Double Entry Principle',
        content: 'Every transaction has two sides: a Debit and a Credit. Debits are on the left; Credits are on the right. Assets = Liabilities + Capital.',
        diagram: {
          url: 'https://picsum.photos/seed/accounting-ledger/800/450',
          caption: 'T-Account structure showing Debit and Credit sides.'
        }
      },
      {
        title: 'Financial Statements',
        content: 'Trading Account, Profit and Loss Account, and Balance Sheet. These help determine the performance and financial position of a business.',
        diagram: {
          url: 'https://picsum.photos/seed/balance-sheet/800/450',
          caption: 'Structure of a simple vertical Balance Sheet.'
        }
      }
    ]
  },
  'Agricultural Science': {
    subject: 'Agricultural Science',
    overview: 'Agriculture is the art and science of cultivating the soil, growing crops, and raising livestock. This guide covers soil management, mechanization, and extension services.',
    topics: [
      {
        title: 'Soil Science and Management',
        content: 'Soil is the medium for plant growth.\n- Soil Profile: O, A, B, C, R horizons.\n- Soil Texture: Sand, Silt, Clay.\n- Soil Fertility: Nutrients (NPK), pH, and organic matter.\n- Management: Fertilizer application, irrigation, and crop rotation.',
        diagram: {
          url: 'https://picsum.photos/seed/soil-science/800/450',
          caption: 'Standard soil profile showing different horizons.'
        }
      },
      {
        title: 'Farm Mechanization',
        content: 'The use of machines for agricultural operations.\n- Hand Tools: Cutlass, hoe, rake.\n- Power-operated Machines: Tractor, plow, harrow, ridger.\n- Benefits: Increased efficiency, reduced drudgery, and large-scale production.',
        diagram: {
          url: 'https://picsum.photos/seed/farm-mech/800/450',
          caption: 'Primary vs. Secondary tillage equipment for farming.'
        }
      },
      {
        title: 'Agricultural Extension and Economics',
        content: 'The link between research and farmers.\n- Extension Services: Teaching farmers new techniques and providing support.\n- Agric Economics: Law of demand/supply in agriculture, production costs, and marketing boards.',
        diagram: {
          url: 'https://picsum.photos/seed/agric-ext/800/450',
          caption: 'The agricultural extension system cycle.'
        }
      },
      {
        title: 'Crop Production',
        content: 'Classification of crops (cereals, legumes, tubers). Processes involved: land preparation, planting, weeding, and harvesting. Pests and diseases management is crucial for high yields.',
        diagram: {
          url: 'https://picsum.photos/seed/agriculture-crop/800/450',
          caption: 'Life cycle of a flowering plant (e.g., Maize).'
        }
      },
      {
        title: 'Animal Husbandry',
        content: 'Raising livestock for food or profit. Key animals include cattle, sheep, goats, poultry, and pigs. Management practices: feeding (balanced rations), housing (ventilation), and disease control (vaccination).',
        diagram: {
          url: 'https://picsum.photos/seed/farm-animals/800/450',
          caption: 'Common livestock and their classification.'
        }
      }
    ]
  },
  'Civic Education': {
    subject: 'Civic Education',
    overview: 'Civic education teaches citizens their rights, duties, and the values of democratic living. This guide covers national identity, governance, and communal harmony.',
    topics: [
      {
        title: 'National Values and Identity',
        content: 'National Values: Honesty, integrity, discipline, and patriotism. \nNational Identity: Symbols that represent the country (National Flag, Anthem, Pledge, and Coat of Arms). These unify diverse groups within the nation.',
        diagram: {
          url: 'https://picsum.photos/seed/civic-values/800/450',
          caption: 'National symbols and core pillars of a strong civic society.'
        }
      },
      {
        title: 'Democracy and the Rule of Law',
        content: 'Democracy: Government of the people, by the people, and for the people. \nRule of Law: The legal principle that law should govern a nation, as opposed to being governed by arbitrary decisions of individual government officials. It emphasizes equality before the law.',
        diagram: {
          url: 'https://picsum.photos/seed/civic-demo/800/450',
          caption: 'The structure of democratic governance and legal equality.'
        }
      },
      {
        title: 'Social Issues: Cultism and Drug Abuse',
        content: 'Challenges facing modern society.\n- Cultism: Secret organizations that engage in violence and illegal activities.\n- Drug Abuse: The excessive or improper use of drugs, leading to physical and psychological harm.\n- Solutions: Education, rehabilitation, and law enforcement.',
        diagram: {
          url: 'https://picsum.photos/seed/social-issues/800/450',
          caption: 'Awareness and prevention strategies for social vices.'
        }
      },
      {
        title: 'Human Rights',
        content: 'Universal Declaration of Human Rights. Right to life, freedom of movement, and freedom from discrimination. Limitations exist, such as public safety and the rights of others.',
        diagram: {
          url: 'https://picsum.photos/seed/human-rights/800/450',
          caption: 'Symbolic representation of justice and equality.'
        }
      }
    ]
  },
  'Further Mathematics': {
    subject: 'Further Mathematics',
    overview: 'Advanced mathematical concepts building on standard mathematics, focused on higher logic and calculus.',
    topics: [
      {
        title: 'Calculus - Differentiation',
        content: 'Finding rates of change. Derivatives of trigonometric functions and composite functions using Chain Rule.',
        diagram: {
          url: 'https://picsum.photos/seed/calculus-diff/800/450',
          caption: 'Graph of a function showing the tangent line as a derivative.'
        }
      },
      {
        title: 'Matrices and Determinants',
        content: 'Arrays of numbers used in solving linear equations and transformations. Methods for finding 2x2 and 3x3 determinants.',
        diagram: {
          url: 'https://picsum.photos/seed/matrix-math/800/450',
          caption: 'Matrix multiplication and transformation illustrations.'
        }
      },
      {
        title: 'Coordinate Geometry and Conics',
        content: 'Coordinate geometry relates algebra and geometry using coordinates.\n- Straight Line: y - y₁ = m(x - x₁)\n- Circles: (x - h)² + (y - k)² = r²\n- Conic Sections: Parabola, Ellipse, and Hyperbola defined by their eccentricities.',
        diagram: {
          url: 'https://picsum.photos/seed/math-conics/800/450',
          caption: 'Geometric representation of circles and conic sections.'
        }
      },
      {
        title: 'Projectiles and Particle Dynamics',
        content: 'Projectiles follow a parabolic path under gravity.\n- Vertical Motion (Uniform g): v = u - gt\n- Horizontal Motion (Constant v): x = ucosθ(t)\n- Range R = (u²sin2θ)/g\n- Max Height H = (u²sin²θ)/2g.',
        diagram: {
          url: 'https://picsum.photos/seed/math-projectiles/800/450',
          caption: 'Vector resolution of a projectile in motion.'
        }
      }
    ]
  },
  'History': {
    subject: 'History',
    overview: 'Study of past events, particularly in Nigeria and West Africa, to understand the present. This guide covers pre-colonial systems, colonialism, and contemporary politics.',
    topics: [
      {
        title: 'Pre-Colonial Nigeria',
        content: 'History of empires like the Oyo Empire, Sokoto Caliphate, and Benin Kingdom. Their political systems (e.g., Oyo Mesi) and cultural achievements (e.g., Benin Bronzes).',
        diagram: {
          url: 'https://picsum.photos/seed/history-niga/800/450',
          caption: 'Map of Pre-colonial West African empires.'
        }
      },
      {
        title: 'Colonial Rule and Nationalism',
        content: 'The Amalgamation of 1914 by Lord Lugard. \nNationalism: The movement for independence led by figures like Herbert Macaulay (Father of Nigerian Nationalism), Nnamdi Azikiwe, and Obafemi Awolowo.',
        diagram: {
          url: 'https://picsum.photos/seed/colonial-rule/800/450',
          caption: 'Chronology of Nigeria\'s path from colony to nation.'
        }
      },
      {
        title: 'Independence and Post-Colonial Politics',
        content: 'Nigeria gained independence on Oct 1, 1960. \nKey Events:\n- The First Republic (1960-1966)\n- The Civil War (1967-1970)\n- Military Rule interspersed with democratic experiments.\n- Returning to Democracy in 1999.',
        diagram: {
          url: 'https://picsum.photos/seed/post-colonial/800/450',
          caption: 'Key leaders and milestones in modern Nigerian history.'
        }
      }
    ]
  },
  'CRK': {
    subject: 'CRK',
    overview: 'Christian Religious Knowledge explores the teachings of the Bible and Christian faith.',
    topics: [
      {
        title: 'The Creation',
        content: 'Biblical account of how God created the world in six days and rested on the seventh. Man was created in God\'s image.',
        diagram: {
          url: 'https://picsum.photos/seed/crk-creation/800/450',
          caption: 'Illustration of the six days of creation.'
        }
      },
      {
        title: 'Parables of Jesus',
        content: 'Stories used by Jesus to teach spiritual truths, such as the Good Samaritan, the Prodigal Son, and the Sower.',
        diagram: {
          url: 'https://picsum.photos/seed/parables/800/450',
          caption: 'Themes and lessons from the major parables.'
        }
      }
    ]
  },
  'IRK': {
    subject: 'IRK',
    overview: 'Islamic Religious Knowledge examines the Quranic teachings and the life of Prophet Muhammad (SAW).',
    topics: [
      {
        title: 'The Five Pillars of Islam',
        content: 'Shahadah (Faith), Salat (Prayer), Zakat (Almsgiving), Sawm (Fasting), and Hajj (Pilgrimage).',
        diagram: {
          url: 'https://picsum.photos/seed/irk-pillars/800/450',
          caption: 'Visual representation of the Five Pillars of Islam.'
        }
      },
      {
        title: 'Life of the Prophet',
        content: 'The birth of Prophet Muhammad in Makkah, the Hijra to Madinah, and the spread of Islam based on Hadith.',
        diagram: {
          url: 'https://picsum.photos/seed/hijra-map/800/450',
          caption: 'The historical route of the Hijra from Makkah to Madinah.'
        }
      }
    ]
  },
  'French': {
    subject: 'French',
    overview: 'French language focuses on vocabulary, grammar, and comprehension of the French world.',
    topics: [
      {
        title: 'Greetings and Introductions',
        content: 'Learning how to say Hello (Bonjour), Goodbye (Au revoir), and introducing oneself (Je m\'appelle...).',
        diagram: {
          url: 'https://picsum.photos/seed/french-greet/800/450',
          caption: 'Basic French greetings and common phrases.'
        }
      },
      {
        title: 'Grammar - Verbes',
        content: 'Conjugation of basic verbs like Être (to be) and Avoir (to have) in the present tense.',
        diagram: {
          url: 'https://picsum.photos/seed/french-verbs/800/450',
          caption: 'Conjugation table for "Être" and "Avoir".'
        }
      }
    ]
  },
  'English': {
    subject: 'English',
    overview: 'Language proficiency is about understanding structure, vocabulary, and context. This guide covers grammar, summary techniques, and phonetics for JAMB/WAEC.',
    topics: [
      {
        title: 'Grammar and Structure',
        content: 'Subject-Verb agreement, tenses, and sentence construction. Knowing nouns, verbs, adverbs, and adjectives helps build correct sentences.',
        diagram: {
          url: 'https://picsum.photos/seed/english-gram/800/450',
          caption: 'A sentence diagram showing subject and predicate.'
        }
      },
      {
        title: 'Summary Writing',
        content: 'Summary writing involves condensing a long passage into its main points. \n1. Identify the central theme.\n2. Pick out topic sentences from each paragraph.\n3. Avoid unnecessary details and illustrations.\n4. Ensure clarity and grammatical accuracy.',
        diagram: {
          url: 'https://picsum.photos/seed/summary-write/800/450',
          caption: 'The process of extraction and condensation in summary writing.'
        }
      },
      {
        title: 'Reading Comprehension Strategies',
        content: 'Techniques for answering comprehension questions accurately:\n- Skimming: Quick reading for the general idea.\n- Scanning: Looking for specific facts or keywords.\n- Contextual Analysis: Understanding word meanings based on surrounding text.\n- Inference: Drawing logical conclusions from implicit information.',
        diagram: {
          url: 'https://picsum.photos/seed/reading-compre/800/450',
          caption: 'Active reading techniques: Skimming vs. Scanning.'
        }
      },
      {
        title: 'Phonetics and Oral English',
        content: 'Focuses on speech sounds and pronunciation.\n- Vowel Sounds: Monophthongs and Diphthongs.\n- Consonant Sounds: Voiced and Voiceless.\n- Word Stress: Emphasis on specific syllables.\n- Intonation: The rise and fall of voice in speaking.',
        diagram: {
          url: 'https://picsum.photos/seed/oral-english/800/450',
          caption: 'The phonetic alphabet chart for English vowels and consonants.'
        }
      },
      {
        title: 'Lexis and Vocabulary',
        content: 'Synonyms (similar meaning), Antonyms (opposite meaning), and Register (specific field language). Understanding context helps choose the right words.',
        diagram: {
          url: 'https://picsum.photos/seed/vocab-tree/800/450',
          caption: 'Word associations and semantic mapping.'
        }
      }
    ]
  },
  'Yoruba': {
    subject: 'Yoruba',
    overview: 'Asa ati Ede Yoruba focuses on the language, culture, and traditions of the Yoruba people.',
    topics: [
      {
        title: 'Alifabeti ati Ihun Oro',
        content: 'Learning the Yoruba alphabet (A B D E E...) and how to form words using tones (Amin ohun).',
        diagram: {
          url: 'https://picsum.photos/seed/yoruba-lang/800/450',
          caption: 'Yoruba alphabet and tone markers illustration.'
        }
      },
      {
        title: 'Asa ati Ibale',
        content: 'Understanding cultural practices such as greetings (Ikini), dressing (Irosun), and traditional religion.',
        diagram: {
          url: 'https://picsum.photos/seed/yoruba-culture/800/450',
          caption: 'Traditional Yoruba attire and cultural symbols.'
        }
      }
    ]
  },
  'Hausa': {
    subject: 'Hausa',
    overview: 'Harshen Hausa focuses on the communication, literature, and culture of the Hausa-speaking community.',
    topics: [
      {
        title: 'Harufan Hausa',
        content: 'Introduction to Hausa letters (Boko) and basic sentence construction (Jumloli).',
        diagram: {
          url: 'https://picsum.photos/seed/hausa-lang/800/450',
          caption: 'Hausa alphabet and basic word formations.'
        }
      },
      {
        title: 'Al\'adun Hausawa',
        content: 'Traditions including marriage, festivals (Eid/Durbar), and traditional leadership (Sarakuna).',
        diagram: {
          url: 'https://picsum.photos/seed/hausa-culture/800/450',
          caption: 'Visuals of Hausa traditional architecture and Durbar festival.'
        }
      }
    ]
  },
  'Igbo': {
    subject: 'Igbo',
    overview: 'Asusu na Agumagu Igbo explores the linguistic structure and rich cultural heritage of the Igbo people.',
    topics: [
      {
        title: 'Mkpuruedemede Igbo',
        content: 'The Igbo alphabet (Abidii) and phonology, centering on clear pronunciation and tonal variations.',
        diagram: {
          url: 'https://picsum.photos/seed/igbo-lang/800/450',
          caption: 'The Igbo Abidii (alphabet) chart.'
        }
      },
      {
        title: 'Omenala Igbo',
        content: 'Core traditions such as Iwa Ji (New Yam Festival), apprenticeship systems, and respect for elders.',
        diagram: {
          url: 'https://picsum.photos/seed/igbo-culture/800/450',
          caption: 'Igbo cultural artifacts and New Yam Festival imagery.'
        }
      }
    ]
  }
};
