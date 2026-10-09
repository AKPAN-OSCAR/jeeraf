# Africa Continental Question Bank Registry

This directory contains past question databases for African examination bodies.

## Folder Organization

```text
africa/
├── countries/
│   ├── nigeria/
│   │   ├── jamb/          -> JAMB UTME past questions (by subject & year)
│   │   ├── neco/          -> NECO SSCE past questions (June/July)
│   │   ├── neco_gce/      -> NECO GCE past questions (Nov/Dec private)
│   │   └── index.ts       -> Domestic Nigeria registry + linked regional WAEC exams
│   ├── ghana/
│   │   ├── bece/          -> Basic Education Certificate Examination
│   │   └── index.ts       -> Domestic Ghana registry + linked regional WAEC exams
│   ├── kenya/
│   │   ├── kcse/          -> Kenya Certificate of Secondary Education
│   │   └── index.ts       -> Kenya registry
│   ├── south_africa/
│   │   ├── nsc/           -> National Senior Certificate Matric
│   │   └── index.ts       -> South Africa registry
│   └── index.ts           -> Aggregates all domestic questions
│
├── regional_exams/        -> Shared multinational exams
│   ├── waec/              -> WAEC May/June WASSCE (Shared across West Africa)
│   ├── waec_gce/          -> WAEC Nov/Dec GCE (Shared across West Africa)
│   └── index.ts           -> Shared regional questions registry
│
├── helper.ts              -> Normalization and deduplication helper
└── index.ts               -> Continent-wide export (deduplicated)
```

## Adding Questions
1. Put the questions JSON file in `[exam]/[subject]/[exam]_[subject]_[year].json`.
2. Import the JSON in the exam's `index.ts`.
3. Add it to `manualQuestions`.
Everything else updates automatically through the module export tree!
