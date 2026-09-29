/**
 * @file tech_and_trends.ts
 * @description Technology, Science, and Innovation Knowledge Base for SilverIBOM AI.
 *
 * DEVELOPER NOTE:
 * Provides SilverIBOM AI with rich context on technology trends, computer science,
 * digital skills, software engineering, artificial intelligence, and STEM concepts.
 */

export interface TechTopic {
  title: string;
  category: 'ai' | 'programming' | 'digital_skills' | 'future_trends';
  description: string;
  keyInsights: string[];
}

export const TECH_KNOWLEDGE: TechTopic[] = [
  {
    title: 'Artificial Intelligence & Machine Learning Fundamentals',
    category: 'ai',
    description: 'How modern generative AI, Large Language Models (LLMs), and neural networks process text and audio.',
    keyInsights: [
      'LLMs are trained on billions of parameters to recognize patterns in human language.',
      'Transformer Architecture enables parallel processing of text tokens using self-attention mechanisms.',
      'Multimodal AI can understand text, speech audio, and visual images simultaneously.'
    ]
  },
  {
    title: 'Software Development & Computer Science Core Concepts',
    category: 'programming',
    description: 'Foundational principles of algorithms, data structures, and web technologies.',
    keyInsights: [
      'Frontend Development: HTML5, CSS3, JavaScript/TypeScript, React for user interfaces.',
      'Data Structures: Arrays, Linked Lists, Hash Tables, Trees, Graphs, and Stacks/Queues.',
      'Algorithms: Time complexity (Big-O notation) measures how runtime scales with input size.'
    ]
  },
  {
    title: 'Digital Literacy & Emerging Technologies',
    category: 'future_trends',
    description: 'Key technological skills driving 21st-century careers.',
    keyInsights: [
      'Cloud Computing: Scalable serverless infrastructure, databases, and containerization.',
      'Cybersecurity: Public key encryption, multi-factor authentication, secure API practices.',
      'Data Analytics: Utilizing Python, R, and SQL to extract actionable insights from big data.'
    ]
  }
];
