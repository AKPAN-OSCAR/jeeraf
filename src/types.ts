export type Subject = 
  | 'English' 
  | 'Mathematics' 
  | 'Physics' 
  | 'Chemistry' 
  | 'Biology' 
  | 'Economics' 
  | 'Government' 
  | 'Literature' 
  | 'Geography'
  | 'Commerce'
  | 'Accounting'
  | 'Agricultural Science'
  | 'Civic Education'
  | 'Further Mathematics'
  | 'History'
  | 'CRK'
  | 'IRK'
  | 'Yoruba'
  | 'Hausa'
  | 'Igbo'
  | 'French'
  | 'General';

export type ExamType = 'JAMB' | 'WAEC' | 'NECO' | 'WAEC GCE' | 'NECO GCE' | 'Personal CBT';

export type QuestionSection = 'Comprehension' | 'Lexis and Structure' | 'Word Stress' | 'Oral English' | 'General' | 'Theory' | 'Practical';

export type ExamPaperFormat = 'objective' | 'theory' | 'both_continuation';
export type ExamTimingMode = 'one_by_one' | 'merged';
export type ContinuationOrder = 'obj_first' | 'theory_first';

export interface ExamSessionConfig {
  examType: ExamType;
  timingMode: ExamTimingMode;
  subjects: Subject[];
  startingSubject?: Subject; // For Merged mode: which subject starts first
  paperFormat: ExamPaperFormat;
  continuationOrder?: ContinuationOrder;
  breakDurationMinutes?: number; // Minimum 15 minutes as per Pomofocus rule
  durationMinutes: number;
  practiceMode: 'yearly' | 'random';
  selectedYear?: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  role: 'user' | 'admin';
  fullName?: string;
  nickname?: string;
  gender?: string;
  age?: string;
  profileImage?: string;
  subscriptionStatus: 'free' | 'pending' | 'paid';
  isPremium: boolean;
  trialExpiresAt?: string;
  createdAt: any;
  updatedAt: any;
}

export interface PaymentRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  amount: number;
  currency: string;
  receiptUrl: string; // Base64 string of the image
  status: 'pending' | 'verified' | 'rejected';
  createdAt: any;
  verifiedAt?: any;
}

export interface Question {
  id: string;
  subject: Subject;
  examType: ExamType;
  set?: number;
  year?: number; // Standard year of the exam
  difficulty?: 'Easy' | 'Medium' | 'Hard'; // Standard difficulty levels
  section?: QuestionSection;
  type?: 'objective' | 'theory';
  marks?: number; // For theory questions
  passage?: string; // For comprehension passages
  question: string;
  options: string[];
  correctAnswer: number; // Index of options
  explanation: string;
  modelAnswer?: string; // Model answer for theory questions
  topic?: string;
  images?: string[]; // Supporting diagrams/images
  imageUrl?: string; // Supporting diagram image URL
  diagram?: string | null; // Supporting SVG or HTML diagram
  solutionDiagram?: string | null; // Supporting SVG solution diagram
  tags?: string[]; // Custom tags for filtering
}

export interface QuizResult {
  userId: string;
  userName: string;
  subject: Subject;
  examType: ExamType;
  score: number;
  totalQuestions: number;
  timeTaken: number;
  date: string;
  answers: {
    questionId: string;
    selectedAnswer: number | null;
    isCorrect: boolean;
    theoryAnswer?: string;
  }[];
  theoryAnswers?: Record<string, string>;
  isContinuation?: boolean;
  timingMode?: ExamTimingMode;
}
