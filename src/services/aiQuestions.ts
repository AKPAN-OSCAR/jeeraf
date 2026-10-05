import { GoogleGenAI, Type } from "@google/genai";
import { collection, addDoc, serverTimestamp, doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";
import { db, auth } from "../firebase";
import { Question, Subject, ExamType } from "../types";

export interface ApiKeyItem {
  id: string;
  key: string;
  label: string;
  target: 'ibom_ai' | 'admin_ai' | 'all';
  active: boolean;
  model?: string;
  createdAt: string;
}

export interface SystemSettings {
  subscriberMode: 'tokens' | 'without_tokens';
  nonSubscriberMode: 'tokens' | 'without_tokens';
  totalTokensUsed: number;
  totalTokensBudget: number;
  aiModelName: string;
  ibomAiModel?: string;
  adminAiModel?: string;
  ibomAiApiKey?: string;
  adminAiApiKey?: string;
  apiKeysList?: ApiKeyItem[];
  localJsEngineCode: string;
}

export const DEFAULT_SETTINGS: SystemSettings = {
  subscriberMode: 'tokens',
  nonSubscriberMode: 'without_tokens',
  totalTokensUsed: 154200,
  totalTokensBudget: 5000000,
  aiModelName: 'gemini-3.8-flash',
  ibomAiModel: 'gemini-3.8-flash',
  adminAiModel: 'gemini-3.1-pro-preview',
  ibomAiApiKey: '',
  adminAiApiKey: '',
  apiKeysList: [],
  localJsEngineCode: `/* Fallback Local JS Engine */
function generateLocalQuestions(subject, count) {
  const questions = [];
  const sampleTopics = {
    "Mathematics": [
      { q: "Solve for x: 2x + 10 = 20", opts: ["x = 5", "x = 10", "x = 15", "x = 2"], ans: 0, exp: "Subtract 10 from both sides: 2x = 10. Divide by 2: x = 5." },
      { q: "What is the square root of 144?", opts: ["12", "14", "10", "16"], ans: 0, exp: "12 times 12 is equal to 144." },
      { q: "What is the derivative of x^2?", opts: ["2x", "x", "2", "3x^2"], ans: 0, exp: "Using power rule, d/dx(x^n) = n*x^(n-1). Thus d/dx(x^2) = 2x." }
    ],
    "Physics": [
      { q: "What is the SI unit of Force?", opts: ["Newton", "Joule", "Watt", "Pascal"], ans: 0, exp: "Newton (N) is the SI unit of force, named after Sir Isaac Newton." },
      { q: "What is the acceleration due to gravity on Earth?", opts: ["9.8 m/s²", "10.5 m/s²", "3.0 x 10^8 m/s", "1.6 m/s²"], ans: 0, exp: "Acceleration due to gravity is approximately 9.8 meters per second squared." }
    ],
    "Chemistry": [
      { q: "What is the chemical formula of Water?", opts: ["H2O", "CO2", "NaCl", "O2"], ans: 0, exp: "Water is composed of two hydrogen atoms and one oxygen atom (H2O)." },
      { q: "What element has the atomic number 1?", opts: ["Hydrogen", "Helium", "Oxygen", "Carbon"], ans: 0, exp: "Hydrogen is the first element on the periodic table with atomic number 1." }
    ]
  };

  const pool = sampleTopics[subject] || [
    { q: "Which of the following describes a standard offline test question?", opts: ["Generated client-side", "Requires API key", "Needs database server", "Hosted on premium AI"], ans: 0, exp: "Client-side generation operates independently without internet or token overhead." },
    { q: "What is the primary benefit of Without-Tokens mode?", opts: ["No API token costs", "Advanced generative depth", "Speech synthesis integrations", "Live model fine-tuning"], ans: 0, exp: "Operating without tokens bypasses provider charges and ensures constant system availability." }
  ];

  for (let i = 0; i < count; i++) {
    const item = pool[i % pool.length];
    questions.push({
      subject: subject || "General",
      question: item.q + " (Set " + (Math.floor(i / pool.length) + 1) + ")",
      options: item.opts,
      correctAnswer: item.ans,
      explanation: item.exp + " [Offline Local Engine Response]",
      topic: "Core Syllabus"
    });
  }
  return questions;
}`
};

export async function getSystemSettings(): Promise<SystemSettings> {
  try {
    if (!db) return DEFAULT_SETTINGS;
    const docRef = doc(db, "sib_settings", "global");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { ...DEFAULT_SETTINGS, ...docSnap.data() } as SystemSettings;
    } else {
      await setDoc(docRef, DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
  } catch (err) {
    console.error("Error reading system settings:", err);
    return DEFAULT_SETTINGS;
  }
}

export async function logTokenUsage(inputLength: number, outputLength: number) {
  try {
    if (!db) return;
    const estInput = Math.ceil(inputLength * 0.28);
    const estOutput = Math.ceil(outputLength * 0.28);
    const totalEst = estInput + estOutput;

    const docRef = doc(db, "sib_settings", "global");
    await updateDoc(docRef, {
      totalTokensUsed: increment(totalEst)
    });
    console.log(`[Token Tracker] Logged ~${totalEst} tokens (Input: ${estInput}, Output: ${estOutput}).`);
  } catch (err) {
    console.error("Failed to update token usage in Firestore:", err);
  }
}

export async function isUserPremiumDirectly(): Promise<boolean> {
  if (!auth?.currentUser || !db) return false;
  try {
    const profileRef = doc(db, 'sib_profiles', auth.currentUser.uid);
    const profileSnap = await getDoc(profileRef);
    if (profileSnap.exists()) {
      return !!profileSnap.data().isPremium;
    }
  } catch (err) {
    console.error("Error reading premium status inside AI service:", err);
  }
  return false;
}

export async function determineOperatingMode(): Promise<{ mode: 'tokens' | 'without_tokens'; settings: SystemSettings }> {
  const settings = await getSystemSettings();
  // All features unlocked for all users per product specification
  return { mode: 'tokens', settings };
}

export function guessSubject(text: string): Subject {
  const lower = text.toLowerCase();
  if (lower.includes("equation") || lower.includes("solve") || lower.includes("triangle")) return "Mathematics";
  if (lower.includes("force") || lower.includes("gravity") || lower.includes("newton")) return "Physics";
  if (lower.includes("molecule") || lower.includes("chemical") || lower.includes("periodic table")) return "Chemistry";
  if (lower.includes("cell") || lower.includes("organism") || lower.includes("biology") || lower.includes("plant")) return "Biology";
  if (lower.includes("literature") || lower.includes("poetry") || lower.includes("novel")) return "Literature";
  if (lower.includes("supply") || lower.includes("demand") || lower.includes("market") || lower.includes("economics")) return "Economics";
  return "General";
}

export function executeLocalJsEngine(code: string, subject: string, count: number): Question[] {
  try {
    const runner = new Function('subject', 'count', `
      ${code}
      if (typeof generateLocalQuestions === 'function') {
        return generateLocalQuestions(subject, count);
      } else {
        throw new Error('function generateLocalQuestions(subject, count) was not found in the custom code.');
      }
    `);
    const results = runner(subject, count);
    if (Array.isArray(results)) {
      return results.map((q: any, i: number) => ({
        id: `local-js-${Date.now()}-${i}`,
        subject: q.subject || subject || "General",
        examType: "Personal CBT",
        set: q.set || 1,
        question: q.question || "Untitled Question",
        options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
        explanation: q.explanation || "No explanation provided.",
        topic: q.topic || "General",
        difficulty: q.difficulty || "Medium",
        year: q.year || new Date().getFullYear()
      }));
    }
    throw new Error("Local JS Engine did not return an array of questions.");
  } catch (err) {
    console.error("Local JS Engine Execution Failed:", err);
    const fallbackRunner = new Function('subject', 'count', `
      const questions = [];
      for (let i = 0; i < count; i++) {
        questions.push({
          subject: subject || "General",
          question: "Practice question " + (i + 1) + " about " + (subject || "General") + " (Fallback Offline Mode)",
          options: ["Correct answer option", "Alternative option 2", "Alternative option 3", "Alternative option 4"],
          correctAnswer: 0,
          explanation: "This is a safe fallback offline question generated because the custom JS code has an error: " + ${JSON.stringify(String(err))},
          topic: "General Practice"
        });
      }
      return questions;
    `);
    return fallbackRunner(subject, count);
  }
}

// Helper function to log system alerts / API failures to Firestore for the administrator
export async function logSystemAlert(service: string, errorType: string, message: string, rawError?: any) {
  try {
    const alertRef = collection(db, "sib_alerts");
    await addDoc(alertRef, {
      service,
      errorType,
      message,
      timestamp: serverTimestamp(),
      userId: auth?.currentUser?.uid || "anonymous",
      userEmail: auth?.currentUser?.email || "anonymous",
      context: "Gemini API integration error",
      rawError: rawError ? (typeof rawError === 'object' ? JSON.stringify(rawError) : String(rawError)) : ""
    });
    console.log(`[System Alert] Logged ${errorType} for ${service} to Firestore.`);
  } catch (err) {
    console.error("Failed to write system alert to Firestore:", err);
  }
}

export function getActiveApiKey(target?: 'ibom_ai' | 'admin_ai'): string | undefined {
  if (typeof localStorage !== 'undefined') {
    if (target === 'ibom_ai') {
      const ibomKey = localStorage.getItem('sib_ibom_ai_api_key');
      if (ibomKey && ibomKey.trim()) return ibomKey.trim();
    } else if (target === 'admin_ai') {
      const adminKey = localStorage.getItem('sib_admin_ai_api_key');
      if (adminKey && adminKey.trim()) return adminKey.trim();
    }
    const genericKey = localStorage.getItem('sib_active_gemini_key');
    if (genericKey && genericKey.trim()) return genericKey.trim();
  }
  return process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY;
}

export function getAI(customApiKey?: string) {
  const apiKey = customApiKey || getActiveApiKey();
  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Please enter an active API Key in the Admin Console or set GEMINI_API_KEY.");
  }
  return new GoogleGenAI({ apiKey });
}

async function generateBatch(
  text: string,
  examType: ExamType,
  count: number,
  topics: string | undefined,
  batchIndex: number
): Promise<Question[]> {
  // First, attempt to call the secure server-side AI orchestrator proxy
  try {
    const res = await fetch('/api/ai/personal-cbt/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: guessSubject(text),
        topics: topics || '',
        difficulty: 'Mixed',
        questionCount: count,
        documentText: text,
        examType
      })
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.questions) && data.questions.length > 0) {
        return data.questions.map((q: any, idx: number) => ({
          ...q,
          id: q.id || `ai-${Date.now()}-${batchIndex}-${idx}`,
          examType: q.examType || examType
        }));
      }
    }
  } catch (proxyErr) {
    console.warn('[AI Question Generator] Server proxy call failed, falling back to direct GenAI client:', proxyErr);
  }

  const maxRetries = 3;
  let attempt = 0;
  const ai = getAI();
  // Using gemini-3.1-pro-preview for deep academic reasoning, falling back to gemini-3.8-flash
  let currentModel = "gemini-3.1-pro-preview"; 

  while (attempt <= maxRetries) {
    try {
      const response = await ai.models.generateContent({
        model: currentModel,
        contents: `You are an expert examiner. Generate ${count} high-quality, relevant multiple-choice questions based on the provided educational material.
        
        Target Exam Type: ${examType}
        
        ${topics ? `Focus Areas: The user has requested to focus specifically on these topics or keywords: "${topics}". 
        Ensure a significant portion (or all if applicable) of the questions target these areas while still being grounded in the provided Content Material.` : 'Focus Areas: Generate questions that cover a representative sample of all key concepts found in the provided Content Material.'}

        Content Material:
        ${text}
        
        Strict Instructions:
        1. Questions must test core concepts, definitions, and applications found in the text.
        2. Each question must have exactly 4 plausible options.
        3. The 'correctAnswer' must be the index (0-3) of the correct option.
        4. Provide a detailed 'explanation' for why the answer is correct.
        5. Map each question to one of these subjects: English, Mathematics, Physics, Chemistry, Biology, Economics, Government, Literature, Geography, Commerce, Accounting, CRK, IRK, or General. Use "General" if the topic doesn't fit the others.
        6. Use the educational level appropriate for ${examType === 'Personal CBT' ? 'Secondary/Tertiary students' : examType}.
        7. Ensure 100% factual accuracy relative to the provided text.
        `,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                subject: { type: Type.STRING },
                question: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  minItems: 4,
                  maxItems: 4
                },
                correctAnswer: { type: Type.INTEGER },
                explanation: { type: Type.STRING },
                topic: { type: Type.STRING }
              },
              required: ['subject', 'question', 'options', 'correctAnswer', 'explanation']
            }
          }
        }
      });

      const textResponse = response.text;
      if (!textResponse) throw new Error("AI returned empty response");
      
      // Log token usage
      await logTokenUsage(text.length + 1200, textResponse.length);

      const questionsData = JSON.parse(textResponse);
      
      return questionsData.map((data: any, index: number) => ({
        ...data,
        id: `ai-${Date.now()}-${batchIndex}-${index}`,
        examType,
        set: 1
      }));
    } catch (error) {
      attempt++;
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isRateLimit = errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED');
      
      console.error(`Batch ${batchIndex}, Attempt ${attempt} failed (${currentModel}):`, errorMessage);
      
      // Fallback logic for rate limits/high demand or model availability
      if (isRateLimit || errorMessage.includes('403') || errorMessage.includes('not found') || errorMessage.includes('deprecated')) {
        if (currentModel === "gemini-3.1-pro-preview") {
          currentModel = "gemini-3.8-flash";
        } else if (currentModel === "gemini-3.8-flash") {
          currentModel = "gemini-3.1-flash-lite";
        }
      }

      if (attempt > maxRetries) {
        if (isRateLimit) {
          await logSystemAlert("Gemini API - Question Generator", "RESOURCE_EXHAUSTED", errorMessage, error);
          throw new Error('AI service is currently experiencing high demand. Please try again with fewer questions or wait a moment.');
        }
        if (errorMessage.includes('403') || errorMessage.includes('permission')) {
          await logSystemAlert("Gemini API - Question Generator", "PERMISSION_DENIED", errorMessage, error);
          throw new Error('AI Permission Denied: The system could not access the AI service. Please check your Gemini API key in the App Settings.');
        }
        if (errorMessage.includes('Rpc failed') || errorMessage.includes('time limit')) {
          await logSystemAlert("Gemini API - Question Generator", "TIMEOUT", errorMessage, error);
          throw new Error('The AI service timed out. Please try again with a slightly smaller file.');
        }
        await logSystemAlert("Gemini API - Question Generator", "FATAL_ERROR", errorMessage, error);
        throw error;
      }
      
      // Use longer backoff for rate limits
      const baseDelay = isRateLimit ? 3000 : 1500;
      const delay = Math.pow(2, attempt - 1) * baseDelay;
      console.log(`Retrying batch ${batchIndex} in ${delay}ms...`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  return [];
}

export async function generateQuestionsFromAudio(
  audioBase64: string,
  mimeType: string,
  examType: ExamType = 'Personal CBT',
  count: number = 20,
  topics?: string
): Promise<Question[]> {
  // First attempt: Call secure server-side AI orchestrator proxy
  try {
    const res = await fetch('/api/ai/audio-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        audioBase64,
        mimeType,
        questionCount: count,
        topics: topics || '',
        examType
      })
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.questions) && data.questions.length > 0) {
        return data.questions;
      }
    }
  } catch (proxyErr) {
    console.warn('[Audio Generator] Server proxy failed, trying direct GenAI:', proxyErr);
  }

  const maxRetries = 3;
  let attempt = 0;
  const ai = getAI();
  const model = "gemini-3.8-flash"; 

  while (attempt <= maxRetries) {
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: [
          {
            inlineData: {
              mimeType,
              data: audioBase64
            }
          },
          {
            text: `You are an expert examiner. Listen to the provided audio material and generate ${count} high-quality, relevant multiple-choice questions based on it.
            
            Target Exam Type: ${examType}
            ${topics ? `Focus Areas: "${topics}"` : ''}

            Strict Instructions:
            1. Questions must test concepts discussed in the audio.
            2. Each question must have exactly 4 plausible options.
            3. The 'correctAnswer' must be the index (0-3).
            4. Provide a detailed 'explanation'.
            5. Map each question to a relevant subject (English, Mathematics, Physics, Chemistry, Biology, Economics, Government, Literature, Geography, Commerce, Accounting, CRK, IRK, or General).
            `
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                subject: { type: Type.STRING },
                question: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  minItems: 4,
                  maxItems: 4
                },
                correctAnswer: { type: Type.INTEGER },
                explanation: { type: Type.STRING },
                topic: { type: Type.STRING }
              },
              required: ['subject', 'question', 'options', 'correctAnswer', 'explanation']
            }
          }
        }
      });

      const textResponse = response.text;
      if (!textResponse) throw new Error("AI returned empty response");
      
      // Log token usage
      await logTokenUsage(12000, textResponse.length);

      const questionsData = JSON.parse(textResponse);
      
      return questionsData.map((data: any, index: number) => ({
        ...data,
        id: `ai-audio-${Date.now()}-${index}`,
        examType,
        set: 1
      }));
    } catch (error) {
      attempt++;
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isRateLimit = errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED');
      
      console.error(`Audio Generation Attempt ${attempt} failed:`, errorMessage);

      if (attempt > maxRetries) {
        const errorType = isRateLimit ? "RESOURCE_EXHAUSTED" : (errorMessage.includes('403') ? "PERMISSION_DENIED" : "FATAL_ERROR");
        await logSystemAlert("Gemini API - Audio Generator", errorType, errorMessage, error);
        if (isRateLimit) {
          throw new Error('AI service is currently experiencing high demand. Please try again with fewer questions or wait a moment.');
        }
        throw error;
      }

      const delay = Math.pow(2, attempt - 1) * (isRateLimit ? 3000 : 1500);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  return [];
}

export async function getAudioExplanation(
  audioBase64: string,
  mimeType: string
): Promise<string> {
  // First attempt: Call secure server-side AI orchestrator proxy
  try {
    const res = await fetch('/api/ai/audio-explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        audioBase64,
        mimeType
      })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.text) {
        return data.text;
      }
    }
  } catch (proxyErr) {
    console.warn('[Audio Explanation] Server proxy failed, trying direct GenAI:', proxyErr);
  }

  const maxRetries = 3;
  let attempt = 0;
  const ai = getAI();
  const model = "gemini-3.8-flash";

  while (attempt <= maxRetries) {
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: [
          {
            inlineData: {
              mimeType,
              data: audioBase64
            }
          },
          {
            text: `Please listen to this audio lecture or study recording and provide an extremely detailed, comprehensive explanation of everything spoken. 
            Structure your output as follows:
            1. **Title**: A descriptive title for the session.
            2. **Overview**: A high-level summary of the main subject.
            3. **Key Concepts**: Detailed bullet points explaining every major idea or formula mentioned.
            4. **Deep Dive**: Elaborate on complex sections or nuanced points.
            5. **Study Notes**: Summary "cheat sheet" style notes for memorization.
            6. **Conclusion**: A final wrap-up.
            
            Use Markdown for professional formatting. Highlight the most important terms in **bold**. Include sections for "Important Formulas" or "Crucial Dates" if applicable to the audio content.`
          }
        ]
      });

      const textResponse = response.text || "No explanation could be generated.";
      await logTokenUsage(15000, textResponse.length);
      return textResponse;
    } catch (error) {
      attempt++;
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isRateLimit = errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED');
      
      console.error(`Audio Explanation Attempt ${attempt} failed:`, errorMessage);

      if (attempt > maxRetries) {
        const errorType = isRateLimit ? "RESOURCE_EXHAUSTED" : (errorMessage.includes('403') ? "PERMISSION_DENIED" : "FATAL_ERROR");
        await logSystemAlert("Gemini API - Audio Explanation", errorType, errorMessage, error);
        if (isRateLimit) {
          throw new Error('AI service is currently experiencing high demand. Please try again with fewer questions or wait a moment.');
        }
        throw error;
      }

      const delay = Math.pow(2, attempt - 1) * (isRateLimit ? 3000 : 1500);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  return "Explanation service is currently busy. Please try again.";
}

export async function generateQuestionsFromText(
  text: string, 
  examType: ExamType = 'Personal CBT',
  count: number = 20,
  topics?: string
): Promise<Question[]> {
  const { mode, settings } = await determineOperatingMode();
  if (mode === 'without_tokens') {
    const subj = guessSubject(text);
    console.log(`[System Mode] Operating in 'without_tokens' mode. Executing custom local JS engine for subject: ${subj}`);
    return executeLocalJsEngine(settings.localJsEngineCode, subj, count);
  }

  const BATCH_SIZE = 10; // Smaller batches for better stability
  const numBatches = Math.ceil(count / BATCH_SIZE);
  let allQuestions: Question[] = [];

  // Calculate text chunks to ensure we cover the whole document across batches
  const textLength = text.length;
  // Use a more conservative chunk size to avoid RPC timeouts
  const idealChunkSize = 30000; 

  for (let i = 0; i < numBatches; i++) {
    const currentBatchCount = Math.min(BATCH_SIZE, count - i * BATCH_SIZE);
    
    // Determine the chunk for this batch. 
    // We try to slide through the text to get different context for each batch
    let start = Math.min(textLength, i * Math.floor(textLength / numBatches));
    let end = Math.min(textLength, start + idealChunkSize);
    
    const chunk = text.slice(start, end);
    
    try {
      const batch = await generateBatch(chunk, examType, currentBatchCount, topics, i);
      allQuestions = [...allQuestions, ...batch];
    } catch (error) {
      console.error(`Batch ${i} failed completely:`, error);
      // If one batch fails, we continue with others unless it's a fatal error
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('Limit Reached') || msg.includes('Permission Denied')) {
        throw error; // Fatal
      }
      // Otherwise just continue, maybe we get enough questions from other batches
    }
    
    // Add a small delay between batches to avoid hits on rate limits
    if (i < numBatches - 1) {
      await new Promise(r => setTimeout(r, 1500));
    }
  }

  return allQuestions;
}

export async function extractQuestionsWithAI(
  fileData: { base64?: string; mimeType?: string; rawText?: string },
  subject: Subject,
  examType: ExamType,
  additionalPrompt?: string
): Promise<Question[]> {
  const { mode, settings } = await determineOperatingMode();
  if (mode === 'without_tokens') {
    console.log("[System Mode] Operating in 'without_tokens' mode. Executing custom local JS engine for questions extraction.");
    return executeLocalJsEngine(settings.localJsEngineCode, subject, 10);
  }

  const ai = getAI();
  const model = "gemini-3.1-pro-preview";

  const contents: any[] = [];

  if (fileData.base64 && fileData.mimeType) {
    contents.push({
      inlineData: {
        mimeType: fileData.mimeType,
        data: fileData.base64
      }
    });
  }

  const promptText = `You are an expert examiner and questions parser. 
  Extract and format ALL multiple-choice questions found in the provided material.
  
  Target Exam Type: ${examType}
  Subject: ${subject}
  
  ${additionalPrompt ? `Additional instructions from the admin: "${additionalPrompt}"` : ''}
  
  ${fileData.rawText ? `Content Material text:\n${fileData.rawText}` : 'Please extract from the uploaded file.'}
  
  Strict Instructions:
  1. Carefully parse every question. Ensure they are multiple-choice with EXACTLY 4 options.
  2. Map the correct answer to its index (0 for Option A, 1 for Option B, 2 for Option C, 3 for Option D).
  3. Generate a clear, helpful "explanation" for why that option is correct.
  4. Assign an appropriate "topic" if possible.
  5. Format the output STRICTLY as a JSON array matching this schema:
  [
    {
      "question": "The question text",
      "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
      "correctAnswer": 0,
      "explanation": "Why this answer is correct",
      "topic": "The specific topic of this question"
    }
  ]
  Do not include any Markdown wrap like \`\`\`json or surrounding text, just the raw JSON.`;

  contents.push({ text: promptText });

  try {
    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        responseMimeType: "application/json"
      }
    });

    const textResponse = response.text;
    if (!textResponse) throw new Error("AI returned empty response");
    
    // Log token usage
    await logTokenUsage(Math.ceil((fileData.rawText || "").length + 1000), textResponse.length);

    const parsed = JSON.parse(textResponse.trim());
    
    return parsed.map((q: any, i: number) => ({
      id: `admin-ai-${Date.now()}-${i}`,
      subject,
      examType,
      set: 1,
      question: q.question,
      options: q.options || ["", "", "", ""],
      correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
      explanation: q.explanation || "",
      topic: q.topic || "General",
      difficulty: "Medium",
      year: new Date().getFullYear()
    }));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isRateLimit = errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED');
    const errorType = isRateLimit ? "RESOURCE_EXHAUSTED" : (errorMessage.includes('403') ? "PERMISSION_DENIED" : "FATAL_ERROR");
    await logSystemAlert("Gemini API - Question Extractor", errorType, errorMessage, error);
    if (isRateLimit) {
      throw new Error('AI service is currently experiencing high demand. Please try again with fewer questions or wait a moment.');
    }
    throw error;
  }
}

export async function chatWithAIQuestionsAgent(
  message: string,
  currentQuestions: Question[],
  subject: Subject,
  examType: ExamType
): Promise<{ text: string; updatedQuestions?: Question[] }> {
  const { mode } = await determineOperatingMode();
  if (mode === 'without_tokens') {
    return {
      text: "👋 Hello! The CBT AI Assistant is currently operating in local offline mode (Without Tokens Mode). Online conversational adjustments are paused to save API quota. You can still modify questions manually in the Questions Manager!",
      updatedQuestions: currentQuestions
    };
  }

  const ai = getAI();
  const model = "gemini-3.1-pro-preview";

  const prompt = `You are an expert AI Exam Assistant helping an administrator manage examination questions.
  The administrator is currently working on:
  - Subject: ${subject}
  - CBT Exam Type: ${examType}
  
  Here is the current list of questions they have parsed/extracted so far:
  ${JSON.stringify(currentQuestions, null, 2)}
  
  Admin Message: "${message}"
  
  Your Task:
  1. Understand what the administrator wants (e.g. modify a question, fix a typo, add a new question, change options, analyze a question, explain an answer).
  2. Provide a helpful, friendly, human-like response in the "text" field.
  3. If their request involves modifying or adding to the questions list, provide the FULL updated array of questions in the "questions" field. Ensure the format of the questions remains exactly the same.
  
  Format your entire response strictly as a JSON object with this schema:
  {
    "text": "Your helpful, conversational response explaining what you did or answering their question.",
    "questions": [ ... optionally the full updated questions array if changed, otherwise omit or return current questions ... ]
  }
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  correctAnswer: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                  topic: { type: Type.STRING }
                },
                required: ["id", "question", "options", "correctAnswer"]
              }
            }
          },
          required: ["text"]
        }
      }
    });

    const resText = response.text;
    if (!resText) throw new Error("Empty response from AI Agent");
    
    // Log token usage
    await logTokenUsage(message.length + 2000, resText.length);

    const parsed = JSON.parse(resText.trim());
    return {
      text: parsed.text,
      updatedQuestions: parsed.questions ? parsed.questions.map((q: any) => ({
        ...q,
        subject,
        examType,
        set: 1,
        difficulty: q.difficulty || "Medium",
        year: q.year || new Date().getFullYear()
      })) : undefined
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isRateLimit = errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED');
    const errorType = isRateLimit ? "RESOURCE_EXHAUSTED" : (errorMessage.includes('403') ? "PERMISSION_DENIED" : "FATAL_ERROR");
    await logSystemAlert("Gemini API - CBT Assistant Chat", errorType, errorMessage, error);
    if (isRateLimit) {
      throw new Error('AI Assistant is currently experiencing high demand. Please try again in a moment.');
    }
    throw error;
  }
}

export async function chatWithPublicAI(
  message: string,
  chatHistory: { role: 'user' | 'model'; text: string }[]
): Promise<string> {
  const { mode } = await determineOperatingMode();
  if (mode === 'without_tokens') {
    return "👋 Welcome to JeeRaf Help Desk! We are currently operating in offline client-side support mode. JeeRaf CBT is an elite mock exam preparation environment supporting JAMB, WAEC, and NECO exams with dynamic timers, a built-in calculator, and performance analytics. To unlock premium real-time AI-powered lecture transcriptions and study chat, please contact your administrator to re-enable token-based features!";
  }

  const ai = getAI();
  const model = "gemini-3.8-flash";

  const contents = [
    {
      role: "user" as const,
      parts: [{
        text: `You are the official JeeRaf CBT AI Help Desk Assistant, a warm, highly-intelligent educational concierge.
Your job is to answer questions from students, parents, teachers, and curious visitors about the JeeRaf CBT examination platform.

About the System:
- JeeRaf CBT is an elite Computer Based Testing preparation environment simulating JAMB, WAEC, NECO, post-UTME, and subject-specific examinations.
- AI-Powered Question Extraction: Users can upload notes, textbooks, rough drafts, or even record/upload audio (like lectures), and the system's AI automatically parses, generates, and styles JAMB-style multiple-choice questions complete with answers and explanations!
- Subject Coverage: Robust tests covering English, Mathematics, Physics, Chemistry, Biology, Economics, Government, Literature, Geography, Commerce, Accounting, CRK, IRK, and General Knowledge.
- Interactive Dashboard: Real-time timers, intuitive answering controls, progress master charts, and correct/incorrect breakdown.
- Study Companion: Integrated textbook reference selections for guided reading.
- Subscription Plan: Full lifetime premium access or generous trial access. Payment confirmation requests are reviewed for security.
- Admin Console: Allows teachers/admin to drag-and-drop raw questions, format drafts using AI parsing, and publish them to students.

Instructions:
1. Speak with professional warmth, positivity, and clarity. Be extremely encouraging, especially to students!
2. Keep your response highly readable, clean, and concise (usually 2-3 paragraphs max).
3. Be helpful, answer queries directly, and prompt them to try creating an account to experience the platform!
4. If they ask how to use it, guide them step-by-step.
`
      }]
    },
    ...chatHistory.map(h => ({
      role: h.role,
      parts: [{ text: h.text }]
    })),
    {
      role: "user" as const,
      parts: [{ text: message }]
    }
  ];

  try {
    const response = await ai.models.generateContent({
      model,
      contents,
    });

    const resText = response.text;
    if (!resText) throw new Error("Could not reach JeeRaf AI Help Desk. Please try again.");
    
    // Log token usage
    await logTokenUsage(message.length + 3000, resText.length);
    return resText;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isRateLimit = errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED');
    const errorType = isRateLimit ? "RESOURCE_EXHAUSTED" : (errorMessage.includes('403') ? "PERMISSION_DENIED" : "FATAL_ERROR");
    await logSystemAlert("Gemini API - Public AI Help Desk", errorType, errorMessage, error);
    if (isRateLimit) {
      throw new Error('AI Help Desk is currently busy. Please try again in a moment.');
    }
    throw error;
  }
}
