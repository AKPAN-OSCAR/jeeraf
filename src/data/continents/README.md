# Global Continental Question Registry Architecture

Welcome to the **Continental CBT Question Database**. This directory structure is designed to be cleanly modular, hierarchically organized, and completely intuitive for all developers.

---

## 🌍 Directory Hierarchy

```text
src/data/continents/
├── helper.ts                         # Universal normalization & typing helpers
├── index.ts                          # Master global registry (aggregates all continents)
│
├── africa/                           # Active Continent: Africa
│   ├── helper.ts                     # Local helper bridge
│   ├── countries/                    # All African Countries
│   │   ├── nigeria/                  # Nigeria Exams (JAMB, NECO, NECO GCE) + linked WAEC
│   │   │   ├── jamb/
│   │   │   ├── neco/
│   │   │   ├── neco_gce/
│   │   │   └── index.ts
│   │   ├── ghana/                    # Ghana Exams (BECE) + linked WAEC
│   │   │   ├── bece/
│   │   │   └── index.ts
│   │   ├── kenya/                    # Kenya Exams (KCSE)
│   │   │   ├── kcse/
│   │   │   └── index.ts
│   │   ├── south_africa/             # South Africa Exams (NSC Matric)
│   │   │   ├── nsc/
│   │   │   └── index.ts
│   │   └── index.ts                  # Aggregator of all African countries
│   │
│   ├── regional_exams/               # Shared exams taken across multiple African nations
│   │   ├── waec/                     # WAEC WASSCE (Nigeria, Ghana, Sierra Leone, etc.)
│   │   ├── waec_gce/                 # WAEC GCE
│   │   └── index.ts                  # Shared regional exams registry
│   │
│   ├── README.md                     # Africa developer guide
│   └── index.ts                      # Africa master aggregator & deduplicator
│
├── europe/                           # Continent: Europe (Provisioning)
│   ├── countries/
│   ├── regional_exams/
│   └── index.ts
│
├── americas/                         # Continent: Americas (Provisioning)
│   ├── countries/
│   ├── regional_exams/
│   └── index.ts
│
└── asia/                             # Continent: Asia (Provisioning)
    ├── countries/
    ├── regional_exams/
    └── index.ts
```

---

## 💡 Key Design Rules for Developers

### 1. Country-Specific Domestic Exams Live Inside the Country Folder
- **NECO**, **JAMB**, and **NECO GCE** are in `continents/africa/countries/nigeria/` (NECO is never placed beside a country!).
- **BECE** is inside `continents/africa/countries/ghana/bece/`.
- **KCSE** is inside `continents/africa/countries/kenya/kcse/`.
- **NSC** is inside `continents/africa/countries/south_africa/nsc/`.

### 2. Multi-National / Shared Regional Exams Live in `regional_exams`
Exams like **WAEC WASSCE** and **WAEC GCE** are written by students in multiple countries (Nigeria, Ghana, Sierra Leone, Liberia, The Gambia).
- The JSON question bank files are stored **once** under `continents/africa/regional_exams/waec/`.
- Nigeria's `index.ts` and Ghana's `index.ts` **link** to it.
- **Result:** No duplicate question files, and students in both Nigeria and Ghana see WAEC in their dashboard!

### 3. How to Add a New Question File (Step-by-Step)

#### Example: Adding WAEC Mathematics 2024
1. Save your JSON file at:
   `src/data/continents/africa/regional_exams/waec/mathematics/waec_math_2024.json`
2. Open `src/data/continents/africa/regional_exams/waec/index.ts`:
   ```ts
   import waecMath2024Json from './mathematics/waec_math_2024.json';

   export const manualQuestions: Question[] = [
     ...(waecMath2024Json as unknown as Question[]),
     // other years...
   ];
   ```
3. That's it! Because WAEC is already wired to Nigeria, Ghana, and the global registry, your questions are instantly live in CBT Mode, Exam Config, and Results!

#### Example: Adding a New Year for JAMB Physics
1. Save JSON at:
   `src/data/continents/africa/countries/nigeria/jamb/physics/jamb_physics_2025.json`
2. In `src/data/continents/africa/countries/nigeria/jamb/index.ts`:
   Import and add to `manualQuestions`. Done!
