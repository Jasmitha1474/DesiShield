
export type Label = 'Safe' | 'Suspicious' | 'Phishing';

export interface AnalysisResult {
  label: Label;
  score: number; // 0 to 100
  language: string;
  reasoning: string;
  triggeredRules: string[];
  threatType: string;
  highlightedTerms: string[];
}

export interface FeedbackLog {
  timestamp: string;
  message: string;
  predictedLabel: Label;
  userLabel: Label;
  language: string;
  score: number;
}

export interface DemoCase {
  id: string;
  title: string;
  text: string;
  type: string;
}
