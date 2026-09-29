import { LibraryBook } from '../types';

export const CAMPBELL_BIOLOGY_BOOK: LibraryBook = {
  id: 'univ_campbell_biology',
  title: 'Campbell Biology (Global University Edition)',
  author: 'Lisa A. Urry, Michael L. Cain, & Steven A. Wasserman',
  section: 'universal',
  subject: 'Biology & Medicine',
  description: 'The world\'s most widely used college biology textbook. Covers Cell Biology, Molecular Genetics, Evolution, Plant & Animal Physiology, Ecology, and Biotechnology.',
  keywords: ['campbell biology', 'biology', 'genetics', 'cell biology', 'evolution', 'botany', 'zoology', 'biotechnology', 'medicine'],
  format: 'both',
  coverImage: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=800&auto=format&fit=crop',
  pageCount: 1480,
  amazonUrl: 'https://www.amazon.com/s?k=Campbell+Biology+Global+Edition',
  fileName: 'Campbell_Biology_12th_Global_Edition.pdf',
  fileType: 'pdf',
  fileSize: '56.3 MB',
  fileUrl: 'data:text/plain;charset=utf-8,Campbell%20Biology%20Global%20Edition...',
  pageImages: [
    'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1530210124550-912dc1381cb8?q=80&w=800&auto=format&fit=crop'
  ],
  chapters: [
    {
      id: 'cb_ch1',
      title: 'Chapter 1: The Chemical Basis of Life & Cell Structure',
      content: `### 1.1 Macromolecules of Life
1. **Carbohydrates**: Monosaccharides (Glucose, Fructose) linked by glycosidic bonds.
2. **Proteins**: Amino acid polymers joined by peptide bonds. Primary, secondary, tertiary, and quaternary structures.
3. **Nucleic Acids**: DNA and RNA polymers of nucleotides (Phosphate + Pentose Sugar + Nitrogenous Base).
4. **Lipids**: Hydrophobic molecules including Phospholipids (membrane bilayers), Triglycerides, and Steroids.

### 1.2 Eukaryotic Organelles
* **Nucleus**: Houses chromatin and nucleolus (ribosome assembly).
* **Mitochondria**: Site of Cellular Respiration and ATP generation via Oxidative Phosphorylation.
* **Ribosomes**: Protein synthesis machinery (80S in eukaryotes).`,
      figures: [
        {
          id: 'fig_b1',
          title: 'Figure 1.1: Eukaryotic Cell Structure & Organelle Anatomy',
          url: 'https://images.unsplash.com/photo-1530210124550-912dc1381cb8?q=80&w=800&auto=format&fit=crop',
          caption: 'Diagram of animal cell showing nucleus, mitochondria, endoplasmic reticulum, and Golgi apparatus.'
        }
      ]
    },
    {
      id: 'cb_ch2',
      title: 'Chapter 2: Molecular Genetics & DNA Replication',
      content: `### 2.1 The Central Dogma of Molecular Biology
$$\\text{DNA} \\xrightarrow{\\text{Transcription}} \\text{mRNA} \\xrightarrow{\\text{Translation}} \\text{Protein}$$

* **DNA Polymerase III**: Synthesizes new DNA strand in the $5' \\to 3'$ direction.
* **Transcription**: RNA Polymerase binds promoter region, synthesizing pre-mRNA.
* **Genetic Code**: Triplet codons on mRNA mapped to specific amino acids.`,
      figures: [
        {
          id: 'fig_b2',
          title: 'Figure 2.1: DNA Double Helix Structure & Base Pairing',
          url: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=800&auto=format&fit=crop',
          caption: 'Double-stranded DNA helix showing complementary base pairing (A-T, G-C) and sugar-phosphate backbone.'
        }
      ]
    }
  ]
};
