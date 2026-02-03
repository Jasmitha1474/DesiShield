
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  ShieldQuestion, 
  Mic, 
  MicOff, 
  Send, 
  RefreshCw, 
  Download,
  AlertCircle,
  ExternalLink,
  Info
} from 'lucide-react';
import { DEMO_CASES } from './constants';
import { AnalysisResult, FeedbackLog, Label } from './types';
import { analyzeMessage } from './services/gemini';

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [logs, setLogs] = useState<FeedbackLog[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-IN'; // Supports mixed Indian English

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsRecording(false);
      };

      recognitionRef.current.onerror = () => {
        setIsRecording(false);
        setError("Speech recognition failed. Try again.");
      };
    }
  }, []);

  const handleStartRecording = () => {
    if (!recognitionRef.current) {
      setError("Speech recognition not supported in this browser.");
      return;
    }
    setError(null);
    setIsRecording(true);
    recognitionRef.current.start();
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    recognitionRef.current.stop();
  };

  const runAnalysis = async (textToAnalyze?: string) => {
    const finalContent = textToAnalyze || inputText;
    if (!finalContent.trim()) return;

    setIsAnalyzing(true);
    setError(null);
    try {
      const data = await analyzeMessage(finalContent);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "An error occurred during analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFeedback = (userLabel: Label) => {
    if (!result) return;
    const newLog: FeedbackLog = {
      timestamp: new Date().toLocaleString(),
      message: inputText,
      predictedLabel: result.label,
      userLabel,
      language: result.language,
      score: result.score
    };
    setLogs(prev => [newLog, ...prev]);
    alert(`Feedback logged: Mark as ${userLabel}`);
  };

  const exportCSV = () => {
    if (logs.length === 0) return;
    const headers = "Timestamp,Message,Predicted,UserLabel,Language,Score\n";
    const csvContent = logs.map(l => 
      `"${l.timestamp}","${l.message.replace(/"/g, '""')}","${l.predictedLabel}","${l.userLabel}","${l.language}",${l.score}`
    ).join("\n");
    const blob = new Blob([headers + csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `desishield_feedback_${new Date().getTime()}.csv`;
    a.click();
  };

  const renderBadge = (label: Label) => {
    const styles = {
      'Safe': 'bg-green-100 text-green-700 border-green-200',
      'Suspicious': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'Phishing': 'bg-red-100 text-red-700 border-red-200'
    };
    const Icons = {
      'Safe': ShieldCheck,
      'Suspicious': ShieldQuestion,
      'Phishing': ShieldAlert
    };
    const Icon = Icons[label];

    return (
      <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-semibold ${styles[label]}`}>
        <Icon size={16} />
        {label}
      </div>
    );
  };

  const getScoreColor = (score: number) => {
    if (score < 30) return 'text-green-600';
    if (score < 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <ShieldAlert size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">DesiShield</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">HACKATHON PROTOTYPE</span>
            <div className="w-8 h-8 rounded-full bg-slate-200"></div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Intro Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl">
          <h2 className="text-3xl font-bold mb-2">Multilingual Scam Detection</h2>
          <p className="text-blue-100 max-w-2xl">
            Protecting users from banking fraud, fake prizes, and phishing in English, Hindi, Tamil, and Hinglish. 
            Analyze SMS, Chat, or Email content instantly.
          </p>
        </div>

        {/* Input Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">INPUT MESSAGE</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setInputText('')}
                    className="p-1 hover:bg-slate-200 rounded text-slate-500 transition-colors"
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste SMS, Email or Chat text here... (Hinglish/Regional supported)"
                  className="w-full h-40 p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-all"
                />
              </div>
              <div className="p-4 bg-slate-50 border-t flex flex-wrap gap-3 items-center justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={isRecording ? handleStopRecording : handleStartRecording}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      isRecording 
                        ? 'bg-red-100 text-red-600 animate-pulse' 
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
                    {isRecording ? 'Stop' : 'Voice Input'}
                  </button>
                </div>
                <button
                  onClick={() => runAnalysis()}
                  disabled={isAnalyzing || !inputText.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95"
                >
                  {isAnalyzing ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
                  Analyze Now
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-center gap-3 text-red-700">
                <AlertCircle size={20} />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            {/* Analysis Result Display */}
            {result && !isAnalyzing && (
              <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-6 space-y-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Analysis Result</h3>
                      <p className="text-sm text-slate-500">Language: <span className="font-semibold text-slate-700">{result.language}</span></p>
                    </div>
                    {renderBadge(result.label)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Risk Score</div>
                      <div className="flex items-end gap-2">
                        <span className={`text-4xl font-black ${getScoreColor(result.score)}`}>{result.score}</span>
                        <span className="text-slate-400 font-medium mb-1">/ 100</span>
                      </div>
                      <div className="mt-4 w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${result.score > 70 ? 'bg-red-500' : result.score > 30 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${result.score}%` }}
                        />
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Threat Type</div>
                      <div className="text-lg font-bold text-slate-700 mb-2">{result.threatType}</div>
                      <div className="flex flex-wrap gap-2">
                        {result.triggeredRules.map((rule, idx) => (
                          <span key={idx} className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                            {rule}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Info size={16} className="text-blue-500" />
                      Explainability Logic
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed bg-blue-50 p-4 rounded-lg border border-blue-100">
                      {result.reasoning}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-bold text-slate-700">Trigger Words Highlighted</div>
                    <div className="flex flex-wrap gap-2">
                      {result.highlightedTerms.map((term, idx) => (
                        <span key={idx} className="bg-orange-50 text-orange-700 border border-orange-200 text-xs font-medium px-2 py-1 rounded">
                          {term}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Feedback Loop */}
                  <div className="pt-4 border-t border-dashed flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-slate-500">Is this analysis correct?</span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleFeedback('Safe')}
                        className="px-4 py-2 border border-green-200 text-green-700 hover:bg-green-50 rounded-lg text-sm font-bold transition-all"
                      >
                        Mark as Safe
                      </button>
                      <button 
                        onClick={() => handleFeedback('Phishing')}
                        className="px-4 py-2 border border-red-200 text-red-700 hover:bg-red-50 rounded-lg text-sm font-bold transition-all"
                      >
                        Mark as Scam
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Demo Buttons */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <ExternalLink size={16} className="text-blue-500" />
                ONE-CLICK DEMO
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {DEMO_CASES.map((demo) => (
                  <button
                    key={demo.id}
                    onClick={() => {
                      setInputText(demo.text);
                      runAnalysis(demo.text);
                    }}
                    className="text-left p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50 group transition-all"
                  >
                    <div className="text-xs font-bold text-blue-600 mb-1">{demo.type}</div>
                    <div className="text-sm font-semibold text-slate-800 group-hover:text-blue-900">{demo.title}</div>
                    <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">{demo.text}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* History / Logs */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900">FEEDBACK LOG</h3>
                <button 
                  onClick={exportCSV}
                  disabled={logs.length === 0}
                  className="text-blue-600 hover:text-blue-800 disabled:text-slate-300 text-xs font-bold flex items-center gap-1"
                >
                  <Download size={14} />
                  Export
                </button>
              </div>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {logs.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs italic">
                    No feedback recorded yet.
                  </div>
                ) : (
                  logs.map((log, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-[11px]">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-slate-400">{log.timestamp}</span>
                        <span className={`font-bold ${log.userLabel === 'Safe' ? 'text-green-600' : 'text-red-600'}`}>
                          {log.userLabel}
                        </span>
                      </div>
                      <div className="text-slate-700 line-clamp-2 italic">"{log.message}"</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 w-full bg-white border-t border-slate-200 py-3 px-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="text-xs text-slate-500 font-medium">
            &copy; 2024 DesiShield Prototype • Powered by Gemini AI
          </div>
          <div className="flex gap-4">
             <a href="#" className="text-xs text-blue-600 font-bold hover:underline">Documentation</a>
             <a href="#" className="text-xs text-blue-600 font-bold hover:underline">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
