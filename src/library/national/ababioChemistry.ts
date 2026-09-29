import { LibraryBook } from '../types';

export const ABABIO_CHEMISTRY_BOOK: LibraryBook = {
  id: 'nat_new_school_chem',
  title: 'New School Chemistry for Senior Secondary',
  author: 'Osei Yaw Ababio',
  section: 'national',
  subject: 'Chemistry',
  description: 'The premier senior secondary chemistry textbook across Nigeria and West Africa. Comprehensive guide to Atomic Structure, Chemical Bonding, Stoichiometry, Energetics, Periodic Table, Electrochemistry, and Organic Chemistry.',
  keywords: ['ababio', 'new school chemistry', 'osei yaw ababio', 'jamb chemistry', 'waec chemistry', 'organic chemistry', 'stoichiometry', 'periodic table'],
  format: 'both',
  examTarget: 'JAMB / WAEC / NECO Chemistry',
  coverImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=800&auto=format&fit=crop',
  pageCount: 640,
  amazonUrl: 'https://www.amazon.com/s?k=New+School+Chemistry+Ababio',
  fileName: 'New_School_Chemistry_Osei_Yaw_Ababio.pdf',
  fileType: 'pdf',
  fileSize: '24.2 MB',
  fileUrl: 'data:text/plain;charset=utf-8,New%20School%20Chemistry%20by%20Osei%20Yaw%20Ababio...',
  pageImages: [
    'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=800&auto=format&fit=crop'
  ],
  chapters: [
    {
      id: 'ab_ch1',
      title: 'Chapter 1: Atomic Structure & Chemical Bonding',
      content: `### 1.1 Atomic Models & Subatomic Particles
An atom consists of a dense central nucleus containing Protons ($+1$) and Neutrons ($0$), surrounded by Electrons ($-1$) moving in defined energy shells.

* **Atomic Number ($Z$)**: Total number of protons in an atomic nucleus.
* **Mass Number ($A$)**: Sum of protons and neutrons ($A = Z + N$).
* **Isotopes**: Atoms of the same element having the same atomic number but different mass numbers (e.g., $^{12}_6\\text{C}$ and $^{14}_6\\text{C}$).

### 1.2 Types of Chemical Bonding
1. **Electrovalent (Ionic) Bonding**: Complete transfer of electrons from a metal to a non-metal (e.g., $\\text{NaCl}, \\text{CaO}$). High melting points, soluble in polar solvents.
2. **Covalent Bonding**: Sharing of electron pairs between non-metals (e.g., $\\text{H}_2\\text{O}, \\text{CH}_4, \\text{CO}_2$).
3. **Metallic Bonding**: Electrostatic attraction between positive metal ions and a "sea" of delocalized electrons.`,
      figures: [
        {
          id: 'fig_c1',
          title: 'Figure 1.1: Atomic Energy Shells & Electronic Configuration',
          url: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=800&auto=format&fit=crop',
          caption: 'Bohr model showing electronic energy levels (K, L, M shells) and electron transitions.'
        }
      ]
    },
    {
      id: 'ab_ch2',
      title: 'Chapter 2: Gas Laws & Stoichiometry',
      content: `### 2.1 Fundamental Gas Laws
* **Boyle\'s Law**: At constant temperature, the volume $V$ of a given mass of gas is inversely proportional to its pressure $P$:
  $$P_1 V_1 = P_2 V_2$$
* **Charles\'s Law**: At constant pressure, the volume $V$ of a gas is directly proportional to its absolute temperature $T$ (in Kelvin):
  $$\\frac{V_1}{T_1} = \\frac{V_2}{T_2}$$
* **General Gas Equation**:
  $$\\frac{P_1 V_1}{T_1} = \\frac{P_2 V_2}{T_2}$$

### 2.2 Mole Concept & Molar Volume
One mole of any substance contains Avogadro's constant ($6.022 \\times 10^{23}$) particles.
At STP (Standard Temperature & Pressure: $0^\\circ\\text{C}$, $1\\text{ atm}$), 1 mole of any gas occupies $22.4\\text{ dm}^3$ ($22,400\\text{ cm}^3$).`,
      figures: [
        {
          id: 'fig_c2',
          title: 'Figure 2.1: Graphical Representation of Gas Laws',
          url: 'https://images.unsplash.com/photo-1603126857599-f6e70ddee140?q=80&w=800&auto=format&fit=crop',
          caption: 'Isotherm curves for Boyle\'s law (P vs V) and isobar lines for Charles\'s law (V vs T).'
        }
      ]
    },
    {
      id: 'ab_ch3',
      title: 'Chapter 3: Introduction to Organic Chemistry',
      content: `### 3.1 Hydrocarbons
Hydrocarbons are organic compounds composed solely of Carbon and Hydrogen.

* **Alkanes** ($\\text{C}_n\\text{H}_{2n+2}$): Saturated hydrocarbons with single C-C bonds (Methane, Ethane, Propane).
* **Alkenes** ($\\text{C}_n\\text{H}_{2n}$): Unsaturated hydrocarbons containing at least one carbon-carbon double bond ($\\text{C}=\\text{C}$).
* **Alkynes** ($\\text{C}_n\\text{H}_{2n-2}$): Unsaturated hydrocarbons containing carbon-carbon triple bonds ($\\text{C}\\equiv\\text{C}$).`,
      figures: [
        {
          id: 'fig_c3',
          title: 'Figure 3.1: Structural Isomerism in Alkanes',
          url: 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?q=80&w=800&auto=format&fit=crop',
          caption: 'Branched and straight-chain hydrocarbon structures demonstrating structural isomerism.'
        }
      ]
    }
  ]
};
