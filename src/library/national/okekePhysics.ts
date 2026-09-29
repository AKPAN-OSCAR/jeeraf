import { LibraryBook } from '../types';

export const OKEKE_PHYSICS_BOOK: LibraryBook = {
  id: 'nat_senior_physics',
  title: 'Senior Secondary Physics (PN Okeke)',
  author: 'P.N. Okeke & M.W. Anyakoha',
  section: 'national',
  subject: 'Physics',
  description: 'The standard national physics textbook for WAEC, JAMB, NECO, and GCE. Comprehensive coverage of Mechanics, Heat, Waves, Optics, Electricity, Magnetism, and Atomic Physics with step-by-step solved examples and diagrams.',
  keywords: ['okeke physics', 'pn okeke', 'senior secondary physics', 'waec physics', 'jamb physics', 'neco physics', 'motion', 'electricity', 'optics', 'vectors', 'projectiles'],
  format: 'both',
  examTarget: 'WAEC / JAMB / NECO SSCE',
  coverImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800&auto=format&fit=crop',
  pageCount: 520,
  amazonUrl: 'https://www.amazon.com/s?k=Senior+Secondary+Physics+PN+Okeke',
  fileName: 'Senior_Secondary_Physics_PN_Okeke_10th_Edition.pdf',
  fileType: 'pdf',
  fileSize: '18.4 MB',
  fileUrl: 'data:text/plain;charset=utf-8,Senior%20Secondary%20Physics%20by%20P.N.%20Okeke...',
  pageImages: [
    'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=800&auto=format&fit=crop'
  ],
  chapters: [
    {
      id: 'phy_ch1',
      title: 'Chapter 1: Units, Measurement & Vectors',
      content: `### 1.1 Physical Quantities & SI Units
Physical quantities are divided into Fundamental (Base) and Derived Quantities.

* **Fundamental Quantities**: Length (meters, m), Mass (kilograms, kg), Time (seconds, s), Electric Current (amperes, A), Thermodynamic Temperature (kelvin, K), Amount of Substance (mole, mol), Luminous Intensity (candela, cd).
* **Derived Quantities**: Velocity (m/s), Acceleration (m/s²), Force (N = kg·m/s²), Work/Energy (J), Power (W).

### 1.2 Vectors vs. Scalars
* **Scalar**: Magnitude only (e.g., speed, mass, temperature, distance, time, density).
* **Vector**: Magnitude AND direction (e.g., displacement, velocity, acceleration, force, momentum, electric field strength).

### 1.3 Vector Addition & Resolution
When two vectors $\\vec{A}$ and $\\vec{B}$ act at an angle $\\theta$ to each other:
$$R = \\sqrt{A^2 + B^2 + 2AB \\cos\\theta}$$
To resolve a vector $\\vec{F}$ at angle $\\theta$ to the horizontal:
* Horizontal component: $F_x = F \\cos\\theta$
* Vertical component: $F_y = F \\sin\\theta$`,
      figures: [
        {
          id: 'fig_p1',
          title: 'Figure 1.1: Resolution of Vectors in 2D Cartesian Space',
          url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800&auto=format&fit=crop',
          caption: 'Resolving force F into perpendicular horizontal (F cos θ) and vertical (F sin θ) components.'
        },
        {
          id: 'fig_p2',
          title: 'Figure 1.2: Precision Measuring Instruments (Micrometer & Vernier Caliper)',
          url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop',
          caption: 'Vernier calipers measure internal and external diameters with precision of 0.01 cm.'
        }
      ]
    },
    {
      id: 'phy_ch2',
      title: 'Chapter 2: Motion Under Gravity & Projectiles',
      content: `### 2.1 Equations of Uniformly Accelerated Motion
1. $v = u + at$
2. $s = ut + \\frac{1}{2}at^2$
3. $v^2 = u^2 + 2as$

### 2.2 Projectile Motion
When a projectile is fired with initial speed $u$ at angle $\\theta$ to the horizontal:
* **Time of Flight ($T$)**: $T = \\frac{2u \\sin\\theta}{g}$
* **Maximum Height ($H$)**: $H = \\frac{u^2 \\sin^2\\theta}{2g}$
* **Horizontal Range ($R$)**: $R = \\frac{u^2 \\sin 2\\theta}{g}$ (Maximum range occurs when $\\theta = 45^\\circ$).

### Solved Example 2.1 (JAMB/WAEC Standard)
A cannonball is launched with initial velocity $u = 100\\text{ m/s}$ at angle $\\theta = 30^\\circ$. Take $g = 10\\text{ m/s}^2$.
1. Maximum Height $H = \\frac{(100)^2 (0.5)^2}{2(10)} = \\frac{10000 \\times 0.25}{20} = 125\\text{ m}$.
2. Time of Flight $T = \\frac{2(100)(0.5)}{10} = 10\\text{ s}$.`,
      figures: [
        {
          id: 'fig_p3',
          title: 'Figure 2.1: Parabolic Trajectory of a Projectile',
          url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=800&auto=format&fit=crop',
          caption: 'Path of projectile showing maximum height H, angle theta, and maximum horizontal range R.'
        }
      ]
    },
    {
      id: 'phy_ch3',
      title: 'Chapter 3: Electric Current & Ohm\'s Law',
      content: `### 3.1 Electric Potential & Current
Current $I = \\frac{Q}{t}$, measured in Amperes ($1\\text{ A} = 1\\text{ Coulomb/second}$).

### 3.2 Ohm\'s Law
Ohm's Law states that current $I$ flowing through a metallic conductor is directly proportional to the potential difference $V$ across its ends, provided temperature remains constant:
$$V = IR$$

### 3.3 Resistor Combinations
* **Series**: $R_{\\text{total}} = R_1 + R_2 + R_3$
* **Parallel**: $\\frac{1}{R_{\\text{total}}} = \\frac{1}{R_1} + \\frac{1}{R_2} + \\frac{1}{R_3}$`,
      figures: [
        {
          id: 'fig_p4',
          title: 'Figure 3.1: Circuit Diagram for Ohm\'s Law Verification',
          url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop',
          caption: 'Standard electric circuit setup with ammeter in series, voltmeter in parallel, and variable resistor.'
        }
      ]
    }
  ]
};
