
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export async function analyzeMessage(text: string): Promise<AnalysisResult> {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the following message for phishing/scam potential in the Indian context (consider Indian languages and code-mixed text like Hinglish): "${text}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING, enum: ['Safe', 'Suspicious', 'Phishing'] },
          score: { type: Type.NUMBER, description: "Risk score from 0 (safe) to 100 (high risk)" },
          language: { type: Type.STRING, description: "Detected language (e.g., Hinglish, Hindi, English, Tamil)" },
          reasoning: { type: Type.STRING, description: "Explanation of why this label was chosen" },
          triggeredRules: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "List of identified risk categories like 'Urgency', 'Impersonation', 'Bad Link'"
          },
          threatType: { type: Type.STRING, description: "Type of threat, e.g., 'Banking Fraud', 'Lottery Scam'" },
          highlightedTerms: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Specific words in the original message that triggered risk"
          }
        },
        required: ["label", "score", "language", "reasoning", "triggeredRules", "threatType", "highlightedTerms"]
      },
      systemInstruction: "You are a world-class cybersecurity expert specializing in Indian phishing patterns. Detect scams involving KYC, Banking, Electricity bills, and Lottery. Be aware of Hinglish, Tamil-English, and other code-mixed variations."
    }
  });

  return JSON.parse(response.text) as AnalysisResult;
}
