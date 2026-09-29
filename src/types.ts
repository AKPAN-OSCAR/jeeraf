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
  passage?: string; // For comprehension passages
  question: string;
  options: string[];
  correctAnswer: number; // Index of options
  explanation: string;
  topic?: string;
  images?: string[]; // Supporting diagrams/images
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
  }[];
}
