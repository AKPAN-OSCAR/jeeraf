# TypeScript Question Registry Guide

This guide provides complete, production-grade instructions on how to write, wire, and maintain the TypeScript registries that power the JeeRaf CBT Question Bank system.

---

## 1. Architectural Overview

The JeeRaf CBT question bank is built on a **Decoupled Registry Pattern**:

```text
┌─────────────────────────────────────────────────────────────┐
│                 App / CBT Engine Execution                  │
│                     (src/App.tsx)                           │
└─────────────────────────────▲───────────────────────────────┘
                              │
┌─────────────────────────────┴───────────────────────────────┐
│              Global Dataset: src/data/questions.ts          │
└─────────────────────────────▲───────────────────────────────┘
                              │
┌─────────────────────────────┴───────────────────────────────┐
│     Level 1: Master Registry: src/data/question_banks/index.ts│
│       Combines WAEC, JAMB, NECO, WAEC GCE, NECO GCE         │
└─────────────────────────────▲───────────────────────────────┘
                              │
┌─────────────────────────────┴───────────────────────────────┐
│     Level 2: Exam Body Registries (e.g., waec/index.ts)     │
│       Combines subjects and years for that exam body        │
└─────────────────────────────▲───────────────────────────────┘
                              │
┌─────────────────────────────┴───────────────────────────────┐
│     Level 3: Pure JSON Data Files                           │
│       (e.g., mathematics/waec_math_2015.json)               │
└─────────────────────────────────────────────────────────────┘
```

### Why this design?
1. **Zero Coding for Question Creators:** You never have to write JavaScript or TypeScript wrappers when adding questions. You simply drop pure `.json` files into subject folders.
2. **Strict Type Safety:** TypeScript verifies that all ingested questions conform to the `Question` interface.
3. **Instant Hot-Loading & Offline Availability:** Questions are resolved by Vite during compilation (`resolveJsonModule: true`), resulting in 0ms database fetch delay and full offline functionality.

---

## 2. Directory & File Organization

Inside `src/data/question_banks/`:

```text
src/data/question_banks/
├── index.ts                         # Master registry (combines all bodies)
├── REGISTRY_GUIDE.md                # This registry guide
├── README.md                        # Question Ingestion & AI Prompt guide
│
├── waec/
│   ├── index.ts                     # WAEC exam body registry
│   ├── mathematics/
│   │   ├── waec_math_2015.json      # Year 2015
│   │   └── waec_math_2016.json      # Year 2016
│   └── english/
│       └── waec_english_2015.json   # WAEC English 2015
│
├── jamb/
│   ├── index.ts                     # JAMB exam body registry
│   ├── mathematics/
│   │   └── jamb_math_2024.json
│   ├── english/
│   │   └── jamb_english_2024.json
│   ├── physics/
│   │   └── jamb_physics_2024.json
│   ├── chemistry/
│   │   └── jamb_chemistry_2024.json
│   └── biology/
│       └── jamb_biology_2024.json
│
├── neco/
│   ├── index.ts                     # NECO exam body registry
│   └── mathematics/
│       └── neco_math_2024.json
│
├── waec_gce/
│   ├── index.ts                     # WAEC GCE registry
│   └── mathematics/
│       └── waec_gce_math_2024.json
│
└── neco_gce/
    ├── index.ts                     # NECO GCE registry
    └── mathematics/
        └── neco_gce_math_2024.json
```

---

## 3. How to Register a New Year (e.g., WAEC Math 2016)

### Step 1: Create the JSON file
Create your file at:
```text
src/data/question_banks/waec/mathematics/waec_math_2016.json
```
Paste your valid JSON array containing the 2016 questions.

### Step 2: Open the Exam Body Registry
Open `src/data/question_banks/waec/index.ts`.

### Step 3: Add the Import and Spread into the Array
```typescript
import { Question } from '../../../types';

// 1. Import your JSON files
import waecMath2015 from './mathematics/waec_math_2015.json';
import waecMath2016 from './mathematics/waec_math_2016.json'; // <--- NEW IMPORT

/**
 * WAEC Question Bank Registry
 */
export const waecQuestions: Question[] = [
  ...(waecMath2015 as unknown as Question[]),
  ...(waecMath2016 as unknown as Question[])                  // <--- NEW SPREAD
];
```

> **Why `as unknown as Question[]`?**  
> JSON modules imported in TypeScript have literal inferenced types. Casting via `as unknown as Question[]` tells the TypeScript compiler that the JSON array satisfies the global `Question` contract.

---

## 4. How to Add a Brand New Subject (e.g., WAEC Physics)

### Step 1: Create the Subject Folder
Create the directory for the subject:
```text
src/data/question_banks/waec/physics/
```

### Step 2: Create the JSON File
Create `waec_physics_2015.json` inside the new folder:
```text
src/data/question_banks/waec/physics/waec_physics_2015.json
```

### Step 3: Register in `waec/index.ts`
Open `src/data/question_banks/waec/index.ts` and add:

```typescript
import { Question } from '../../../types';

// Mathematics
import waecMath2015 from './mathematics/waec_math_2015.json';
import waecMath2016 from './mathematics/waec_math_2016.json';

// Physics
import waecPhysics2015 from './physics/waec_physics_2015.json'; // <--- NEW

export const waecQuestions: Question[] = [
  // Mathematics
  ...(waecMath2015 as unknown as Question[]),
  ...(waecMath2016 as unknown as Question[]),

  // Physics
  ...(waecPhysics2015 as unknown as Question[])               // <--- NEW
];
```

---

## 5. How to Add a Brand New Exam Body (e.g., NABTEB)

If you ever wish to add a new national examination body such as **NABTEB**:

### Step 1: Create the Exam Body Folder
```text
src/data/question_banks/nabteb/
```

### Step 2: Create `nabteb/index.ts`
```typescript
import { Question } from '../../../types';
import nabtebMath2024 from './mathematics/nabteb_math_2024.json';

export const nabtebQuestions: Question[] = [
  ...(nabtebMath2024 as unknown as Question[])
];
```

### Step 3: Wire into the Master Registry (`src/data/question_banks/index.ts`)
Open `src/data/question_banks/index.ts` and add `nabtebQuestions`:

```typescript
import { Question } from '../../types';
import { waecQuestions } from './waec';
import { jambQuestions } from './jamb';
import { necoQuestions } from './neco';
import { waecGceQuestions } from './waec_gce';
import { necoGceQuestions } from './neco_gce';
import { nabtebQuestions } from './nabteb'; // <--- NEW

export const allBuiltinQuestions: Question[] = [
  ...waecQuestions,
  ...jambQuestions,
  ...necoQuestions,
  ...waecGceQuestions,
  ...necoGceQuestions,
  ...nabtebQuestions                      // <--- NEW
];

export { 
  waecQuestions, 
  jambQuestions, 
  necoQuestions, 
  waecGceQuestions, 
  necoGceQuestions,
  nabtebQuestions                         // <--- NEW
};
```

---

## 6. Type Definitions & Required Values

When writing questions in JSON, ensure the `subject` and `examType` values match the strict unions defined in `src/types.ts`:

### Allowed `examType` values:
* `"WAEC"`
* `"JAMB"`
* `"NECO"`
* `"WAEC GCE"`
* `"NECO GCE"`

### Allowed `subject` values:
* `"English"`
* `"Mathematics"`
* `"Physics"`
* `"Chemistry"`
* `"Biology"`
* `"Economics"`
* `"Government"`
* `"Literature"`
* `"Geography"`
* `"Commerce"`
* `"Accounting"`
* `"Agricultural Science"`
* `"Civic Education"`
* `"Further Mathematics"`
* `"History"`
* `"CRK"`
* `"IRK"`

---

## 7. Common Pitfalls & How to Avoid Them

| Mistake | Consequence | Fix |
| :--- | :--- | :--- |
| **Trailing commas in JSON** | JSON parse error | Standard JSON requires no comma after the last item. |
| **Wrong relative path** | `Cannot find module ...` | Remember `index.ts` is in `waec/`, so import with `./mathematics/...`. |
| **Forgot `as unknown as Question[]`** | Type mismatch error | Always cast JSON imports: `...(file as unknown as Question[])`. |
| **Misspelled subject** | Subject filter won't find it | Use exact capitalization: `"Mathematics"`, NOT `"math"` or `"Maths"`. |
| **Year missing or string** | Year filter won't find it | Must be a number: `"year": 2015`, NOT `"year": "2015"`. |

---

## 8. Verifying Your Changes

After editing or registering files, run these commands in your terminal to guarantee that there are no syntax or type errors:

```bash
# 1. Run TypeScript check
npm run lint

# 2. Test full production build
npm run build
```

If both commands exit cleanly with no errors, your new questions are 100% active, verified, and available in the CBT exam runner!
