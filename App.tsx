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
  ArrowLeft,
  Sun,
  Moon,
} from 'lucide-react';
import { DEMO_CASES } from './constants';
import { AnalysisResult, FeedbackLog, Label } from './types';
import { analyzeMessage } from './services/gemini';

type Screen = 'home' | 'text-scan' | 'voice-scan';

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('home');
  const [darkMode, setDarkMode] = useState(true);
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
      recognitionRef.current.lang = 'en-IN';

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
      'Safe': { bg: darkMode ? 'rgba(59, 167, 118, 0.15)' : 'rgba(59, 167, 118, 0.08)', text: '#3ba776', border: darkMode ? '#3ba776' : '#3ba776' },
      'Suspicious': { bg: darkMode ? 'rgba(240, 173, 78, 0.15)' : 'rgba(240, 173, 78, 0.08)', text: '#f0ad4e', border: darkMode ? '#f0ad4e' : '#f0ad4e' },
      'Phishing': { bg: darkMode ? 'rgba(217, 83, 79, 0.15)' : 'rgba(217, 83, 79, 0.08)', text: '#d9534f', border: darkMode ? '#d9534f' : '#d9534f' }
    };
    const Icons = {
      'Safe': ShieldCheck,
      'Suspicious': ShieldQuestion,
      'Phishing': ShieldAlert
    };
    const Icon = Icons[label];

    return (
      <div 
        className="flex items-center gap-3 px-6 py-3 rounded-full border text-lg font-semibold"
        style={{ 
          backgroundColor: styles[label].bg,
          color: styles[label].text,
          borderColor: styles[label].border,
          borderWidth: '1.5px'
        }}
      >
        <Icon size={24} />
        {label}
      </div>
    );
  };

  const getScoreColor = (score: number) => {
    if (score < 30) return '#3ba776';
    if (score < 70) return '#f0ad4e';
    return '#d9534f';
  };

  const accentColor = darkMode ? '#c6a96b' : '#b89b5e';
  const bgPrimary = darkMode ? '#0a0a0a' : '#f6f5f2';
  const bgCard = darkMode ? '#111111' : '#ffffff';
  const bgBorder = darkMode ? '#262626' : '#e8e5e0';
  const bgSubtle = darkMode ? '#1a1a1a' : '#faf9f7';
  const textPrimary = darkMode ? '#f5f5f5' : '#111111';
  const textSecondary = darkMode ? '#a8a8a8' : '#555555';

  // Premium background with gradient and shapes
  const premiumBackground = darkMode 
    ? `linear-gradient(135deg, #0a0a0a 0%, #1a1409 25%, #0f0f0f 50%, #1a0f1a 75%, #0a0a0a 100%)`
    : `linear-gradient(135deg, #f6f5f2 0%, #faf8f4 25%, #f7f6f3 50%, #fdf9f4 75%, #f6f5f2 100%)`;

  return (
    <div 
      className="min-h-screen transition-colors duration-300"
      style={{ 
        background: premiumBackground,
        color: textPrimary,
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
      }}
    >
      {/* Subtle animated background overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-40"
        style={{
          background: darkMode 
            ? 'radial-gradient(circle at 20% 50%, rgba(198, 169, 107, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(198, 169, 107, 0.03) 0%, transparent 50%)'
            : 'radial-gradient(circle at 20% 50%, rgba(184, 155, 94, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(184, 155, 94, 0.02) 0%, transparent 50%)',
          animation: 'float 20s ease-in-out infinite'
        }}
      />

      {/* Navigation Bar */}
      <nav 
        className="sticky top-0 z-50 border-b transition-all duration-300"
        style={{ 
          borderColor: bgBorder,
          backgroundColor: darkMode ? 'rgba(10, 10, 10, 0.8)' : 'rgba(246, 245, 242, 0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)'
        }}
      >
        <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {screen !== 'home' && (
              <button
                onClick={() => {
                  setScreen('home');
                  setInputText('');
                  setResult(null);
                  setError(null);
                }}
                className="p-2 hover:opacity-70 transition-opacity"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <div 
              style={{ color: accentColor, fontFamily: 'Italiana, serif', fontSize: '24px', fontWeight: 400, letterSpacing: '-0.5px' }}
            >
              DesiShield
            </div>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 hover:opacity-70 transition-opacity"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </nav>

      {/* Home Screen */}
      {screen === 'home' && (
        <>
          {/* Hero Section - Full Height Immersive */}
          <section 
            className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-8"
            style={{ paddingTop: '60px' }}
          >
            {/* Hero Background Accent */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: darkMode
                  ? 'radial-gradient(ellipse at center, rgba(198, 169, 107, 0.08) 0%, transparent 70%)'
                  : 'radial-gradient(ellipse at center, rgba(184, 155, 94, 0.05) 0%, transparent 70%)',
              }}
            />

            {/* DesiShield Heading */}
            <h1
              style={{
                fontFamily: 'Italiana, serif',
                fontSize: 'clamp(48px, 10vw, 96px)',
                fontWeight: 400,
                color: textPrimary,
                lineHeight: 1.1,
                letterSpacing: '-2px',
                animation: 'slideUp 1s ease-out'
              }}
            >
              DesiShield
            </h1>

            {/* Hero Content */}
            <div className="relative z-10 text-center space-y-8 max-w-4xl animate-fade-in">
              <div style={{ overflow: 'hidden' }} />

              <div style={{ overflow: 'hidden', animation: 'slideUp 1s ease-out 0.2s backwards' }}>
                <h2 
                  style={{
                    fontFamily: 'Italiana, serif',
                    fontSize: 'clamp(28px, 6vw, 56px)',
                    fontWeight: 400,
                    color: accentColor,
                    lineHeight: 1.2,
                    letterSpacing: '-1px'
                  }}
                >
                  Stay Ahead of Scams
                </h2>
              </div>

              <p 
                style={{
                  fontSize: '18px',
                  color: textSecondary,
                  maxWidth: '600px',
                  margin: '0 auto',
                  lineHeight: 1.6,
                  animation: 'fadeInUp 1s ease-out 0.4s backwards',
                  fontWeight: 400
                }}
              >
                Multilingual protection against phishing, fraud, and scam messages across India. Detect threats in English, Hindi, Tamil, and Hinglish.
              </p>

              {/* CTA Buttons */}
              <div 
                className="flex flex-col sm:flex-row gap-6 justify-center pt-8"
                style={{ animation: 'fadeInUp 1s ease-out 0.6s backwards' }}
              >
                <button
                  onClick={() => setScreen('text-scan')}
                  className="group px-12 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
                  style={{
                    backgroundColor: accentColor,
                    color: '#000',
                    fontSize: '16px',
                    boxShadow: darkMode 
                      ? `0 20px 60px rgba(198, 169, 107, 0.15)` 
                      : `0 20px 60px rgba(184, 155, 94, 0.1)`
                  }}
                >
                  Analyze Message
                </button>
                <button
                  onClick={() => setScreen('voice-scan')}
                  className="group px-12 py-4 rounded-full font-semibold border-2 transition-all duration-300 hover:scale-105 active:scale-95"
                  style={{
                    borderColor: accentColor,
                    color: accentColor,
                    fontSize: '16px',
                    backgroundColor: 'transparent'
                  }}
                >
                  Try Voice Scan
                </button>
              </div>
            </div>

            {/* Scroll Indicator */}
            <div
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-none"
              style={{
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }}
            >
              <div style={{ width: '24px', height: '40px', border: `2px solid ${accentColor}`, borderRadius: '12px', position: 'relative' }}>
                <div style={{ width: '2px', height: '8px', backgroundColor: accentColor, position: 'absolute', top: '8px', left: '50%', transform: 'translateX(-50%)', animation: 'scrollDot 2s infinite' }} />
              </div>
            </div>
          </section>

          {/* Feature Section 1: Message Scan */}
          <section className="relative py-32 px-8">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="order-2 lg:order-1 space-y-8">
                  <div>
                    <h2 
                      style={{
                        fontFamily: 'Italiana, serif',
                        fontSize: 'clamp(32px, 6vw, 56px)',
                        fontWeight: 400,
                        color: textPrimary,
                        lineHeight: 1.2,
                        letterSpacing: '-1.5px',
                        marginBottom: '24px'
                      }}
                    >
                      Message Scan
                    </h2>
                    <p style={{ fontSize: '18px', color: textSecondary, lineHeight: 1.8 }}>
                      Analyze SMS, emails, and chat messages in real-time. Our AI detects phishing patterns, urgency triggers, and fraudulent links across multiple languages.
                    </p>
                  </div>
                  <ul className="space-y-4">
                    {['Multilingual detection', 'Phishing pattern recognition', 'Real-time analysis', 'Explained results'].map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: accentColor }} />
                        <span style={{ color: textSecondary }}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => setScreen('text-scan')}
                    className="px-8 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105 active:scale-95 border-2 w-fit"
                    style={{
                      borderColor: accentColor,
                      color: accentColor,
                      backgroundColor: 'transparent'
                    }}
                  >
                    Start Scanning
                  </button>
                </div>
                <div 
                  className="order-1 lg:order-2 relative rounded-2xl p-8 overflow-hidden min-h-96"
                  style={{
                    backgroundColor: bgCard,
                    border: `1px solid ${bgBorder}`,
                    boxShadow: darkMode 
                      ? '0 20px 60px rgba(0, 0, 0, 0.3)' 
                      : '0 20px 60px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <div 
                    className="absolute inset-0 opacity-50"
                    style={{
                      background: `radial-gradient(circle at 30% 50%, rgba(198, 169, 107, 0.1) 0%, transparent 50%)`
                    }}
                  />
                  <div className="relative z-10 space-y-4">
                    <div style={{ height: '12px', backgroundColor: bgBorder, borderRadius: '6px', width: '80%' }} />
                    <div style={{ height: '12px', backgroundColor: bgBorder, borderRadius: '6px', width: '100%' }} />
                    <div style={{ height: '12px', backgroundColor: bgBorder, borderRadius: '6px', width: '90%' }} />
                    <div style={{ height: '80px', backgroundColor: bgBorder, borderRadius: '6px', marginTop: '24px' }} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Feature Section 2: Voice Scan */}
          <section className="relative py-32 px-8">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-8">
                  <div>
                    <h2 
                      style={{
                        fontFamily: 'Italiana, serif',
                        fontSize: 'clamp(32px, 6vw, 56px)',
                        fontWeight: 400,
                        color: textPrimary,
                        lineHeight: 1.2,
                        letterSpacing: '-1.5px',
                        marginBottom: '24px'
                      }}
                    >
                      Voice Scan
                    </h2>
                    <p style={{ fontSize: '18px', color: textSecondary, lineHeight: 1.8 }}>
                      Detect voice-based scams and fraudulent calls. Record your transcription and let our intelligence system analyze the threat level and provide insights.
                    </p>
                  </div>
                  <ul className="space-y-4">
                    {['Live recording', 'Voice transcription', 'Threat detection', 'Pattern analysis'].map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: accentColor }} />
                        <span style={{ color: textSecondary }}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => setScreen('voice-scan')}
                    className="px-8 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105 active:scale-95 border-2 w-fit"
                    style={{
                      borderColor: accentColor,
                      color: accentColor,
                      backgroundColor: 'transparent'
                    }}
                  >
                    Start Recording
                  </button>
                </div>
                <div 
                  className="relative rounded-2xl p-8 overflow-hidden min-h-96 flex items-center justify-center"
                  style={{
                    backgroundColor: bgCard,
                    border: `1px solid ${bgBorder}`,
                    boxShadow: darkMode 
                      ? '0 20px 60px rgba(0, 0, 0, 0.3)' 
                      : '0 20px 60px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <div 
                    className="absolute inset-0 opacity-50"
                    style={{
                      background: `radial-gradient(circle at 70% 50%, rgba(198, 169, 107, 0.1) 0%, transparent 50%)`
                    }}
                  />
                  <div 
                    className="relative z-10 w-32 h-32 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: `${accentColor}20`,
                      border: `2px solid ${accentColor}`,
                      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                    }}
                  >
                    <Mic size={64} style={{ color: accentColor }} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer 
            className="border-t py-12 px-8"
            style={{ borderColor: bgBorder }}
          >
            <div className="max-w-7xl mx-auto text-center">
              <p style={{ color: textSecondary, fontSize: '14px' }}>
                © 2026 DesiShield • Multilingual Phishing Detection for India
              </p>
            </div>
          </footer>
        </>
      )}

      {/* Text Analysis Screen */}
      {screen === 'text-scan' && (
        <main className="relative min-h-screen pt-12 pb-32 px-8">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Input Section */}
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 
                  style={{
                    fontFamily: 'Italiana, serif',
                    fontSize: '44px',
                    fontWeight: 400,
                    color: textPrimary,
                    lineHeight: 1.2,
                    letterSpacing: '-1px',
                    marginBottom: '8px'
                  }}
                >
                  Analyze Message
                </h2>
                <p style={{ color: textSecondary, fontSize: '16px' }}>Paste your message to detect phishing and scams</p>
              </div>

              <div 
                className="rounded-2xl p-8 border transition-all duration-300"
                style={{
                  backgroundColor: bgCard,
                  borderColor: bgBorder,
                  boxShadow: darkMode 
                    ? '0 20px 60px rgba(0, 0, 0, 0.3)' 
                    : '0 20px 60px rgba(0, 0, 0, 0.05)'
                }}
              >
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste SMS, Email, or Chat text here..."
                  className="w-full p-6 rounded-xl border resize-none focus:outline-none transition-all"
                  style={{
                    minHeight: '200px',
                    backgroundColor: bgSubtle,
                    borderColor: bgBorder,
                    color: textPrimary,
                    fontSize: '16px',
                    lineHeight: '1.6',
                    fontFamily: 'Inter, sans-serif'
                  }}
                />

                <div className="mt-8 space-y-4">
                  <div className="flex gap-4">
                    <button
                      onClick={isRecording ? handleStopRecording : handleStartRecording}
                      className="flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-full font-semibold transition-all border-2"
                      style={{
                        borderColor: isRecording ? '#d9534f' : bgBorder,
                        backgroundColor: isRecording ? 'rgba(217, 83, 79, 0.1)' : 'transparent',
                        color: isRecording ? '#d9534f' : textPrimary
                      }}
                    >
                      {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                      {isRecording ? 'Stop Recording' : 'Voice Input'}
                    </button>
                    <button
                      onClick={() => runAnalysis()}
                      disabled={isAnalyzing || !inputText.trim()}
                      className="flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-full font-semibold transition-all disabled:opacity-50 hover:scale-105 active:scale-95"
                      style={{
                        backgroundColor: accentColor,
                        color: '#000'
                      }}
                    >
                      {isAnalyzing ? <RefreshCw size={20} className="animate-spin" /> : <Send size={20} />}
                      {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Demo Cases */}
              <div>
                <h3 style={{ color: textPrimary, fontSize: '14px', fontWeight: 600, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Try Demo Cases
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {DEMO_CASES.map((demo) => (
                    <button
                      key={demo.id}
                      onClick={() => {
                        setInputText(demo.text);
                        runAnalysis(demo.text);
                      }}
                      className="text-left p-6 rounded-xl border transition-all duration-300 hover:border-opacity-100 hover:scale-105 active:scale-95"
                      style={{
                        backgroundColor: bgCard,
                        borderColor: bgBorder,
                        color: textPrimary
                      }}
                    >
                      <div style={{ color: accentColor, fontSize: '12px', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {demo.type}
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>{demo.title}</div>
                      <div style={{ color: textSecondary, fontSize: '13px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {demo.text}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div 
                className="p-6 rounded-xl border flex items-center gap-4 animate-fade-in"
                style={{
                  backgroundColor: 'rgba(217, 83, 79, 0.1)',
                  borderColor: '#d9534f',
                  color: '#d9534f'
                }}
              >
                <AlertCircle size={24} />
                <span className="font-semibold">{error}</span>
              </div>
            )}

            {/* Analysis Result */}
            {result && !isAnalyzing && (
              <div 
                className="space-y-8 animate-fade-in"
                style={{
                  animation: 'fadeInUp 0.6s ease-out'
                }}
              >
                {/* Result Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div>
                    <h2 
                      style={{
                        fontFamily: 'Italiana, serif',
                        fontSize: '44px',
                        fontWeight: 400,
                        color: textPrimary,
                        lineHeight: 1.2,
                        letterSpacing: '-1px'
                      }}
                    >
                      Analysis Result
                    </h2>
                    <p style={{ color: textSecondary, marginTop: '8px' }}>
                      Language: <span style={{ color: accentColor, fontWeight: 600 }}>{result.language}</span>
                    </p>
                  </div>
                  {renderBadge(result.label)}
                </div>

                {/* Risk Score */}
                <div 
                  className="rounded-2xl p-12 border"
                  style={{
                    backgroundColor: bgCard,
                    borderColor: bgBorder,
                    boxShadow: darkMode 
                      ? '0 20px 60px rgba(0, 0, 0, 0.3)' 
                      : '0 20px 60px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <div style={{ color: accentColor, fontSize: '13px', fontWeight: 600, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Risk Assessment
                  </div>
                  <div className="flex items-end gap-4 mb-8">
                    <div style={{ fontSize: 'clamp(48px, 12vw, 96px)', fontWeight: 300, color: getScoreColor(result.score), lineHeight: 1 }}>
                      {result.score}
                    </div>
                    <div style={{ color: textSecondary, fontSize: '20px', marginBottom: '8px', fontWeight: 300 }}>
                      / 100
                    </div>
                  </div>
                  <div className="w-full h-3 rounded-full overflow-hidden" style={{ backgroundColor: bgBorder }}>
                    <div 
                      className="h-full transition-all duration-1000"
                      style={{
                        width: `${result.score}%`,
                        backgroundColor: getScoreColor(result.score)
                      }}
                    />
                  </div>
                  <div style={{ color: textSecondary, marginTop: '12px', fontSize: '14px' }}>
                    {result.score < 30 ? 'Safe Message' : result.score < 70 ? 'Suspicious - Use Caution' : 'High Risk - Likely Phishing'}
                  </div>
                </div>

                {/* Threat Classification */}
                <div 
                  className="rounded-2xl p-8 border"
                  style={{
                    backgroundColor: bgCard,
                    borderColor: bgBorder,
                    boxShadow: darkMode 
                      ? '0 20px 60px rgba(0, 0, 0, 0.3)' 
                      : '0 20px 60px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <div style={{ color: accentColor, fontSize: '13px', fontWeight: 600, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Threat Type
                  </div>
                  <h3 style={{ fontSize: '28px', fontWeight: 500, color: textPrimary, marginBottom: '16px' }}>
                    {result.threatType}
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {result.triggeredRules.map((rule, idx) => (
                      <div
                        key={idx}
                        style={{
                          backgroundColor: `${accentColor}20`,
                          color: accentColor,
                          padding: '8px 16px',
                          borderRadius: '20px',
                          fontSize: '13px',
                          fontWeight: 600
                        }}
                      >
                        {rule}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Explanation */}
                <div 
                  className="rounded-2xl p-8 border"
                  style={{
                    backgroundColor: bgCard,
                    borderColor: bgBorder,
                    boxShadow: darkMode 
                      ? '0 20px 60px rgba(0, 0, 0, 0.3)' 
                      : '0 20px 60px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <div style={{ color: accentColor, fontSize: '13px', fontWeight: 600, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Why This Detection
                  </div>
                  <p style={{ fontSize: '16px', color: textSecondary, lineHeight: 1.8 }}>
                    {result.reasoning}
                  </p>
                </div>

                {/* Highlighted Terms */}
                <div 
                  className="rounded-2xl p-8 border"
                  style={{
                    backgroundColor: bgCard,
                    borderColor: bgBorder,
                    boxShadow: darkMode 
                      ? '0 20px 60px rgba(0, 0, 0, 0.3)' 
                      : '0 20px 60px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <div style={{ color: accentColor, fontSize: '13px', fontWeight: 600, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Flagged Terms
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {result.highlightedTerms.map((term, idx) => (
                      <div
                        key={idx}
                        className="px-4 py-2 rounded-lg border"
                        style={{
                          backgroundColor: darkMode ? 'rgba(240, 173, 78, 0.1)' : 'rgba(240, 173, 78, 0.05)',
                          borderColor: '#f0ad4e',
                          color: '#f0ad4e',
                          fontSize: '14px',
                          fontWeight: 500
                        }}
                      >
                        {term}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Feedback */}
                <div 
                  className="rounded-2xl p-8 border"
                  style={{
                    backgroundColor: bgCard,
                    borderColor: bgBorder,
                    boxShadow: darkMode 
                      ? '0 20px 60px rgba(0, 0, 0, 0.3)' 
                      : '0 20px 60px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <div style={{ color: textSecondary, fontSize: '14px', marginBottom: '16px', fontWeight: 500 }}>
                    Help improve DesiShield accuracy
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleFeedback('Safe')}
                      className="flex-1 px-6 py-3 rounded-full font-semibold border-2 transition-all hover:scale-105 active:scale-95"
                      style={{
                        borderColor: '#3ba776',
                        color: '#3ba776',
                        backgroundColor: 'rgba(59, 167, 118, 0.05)'
                      }}
                    >
                      Mark as Safe
                    </button>
                    <button
                      onClick={() => handleFeedback('Phishing')}
                      className="flex-1 px-6 py-3 rounded-full font-semibold border-2 transition-all hover:scale-105 active:scale-95"
                      style={{
                        borderColor: '#d9534f',
                        color: '#d9534f',
                        backgroundColor: 'rgba(217, 83, 79, 0.05)'
                      }}
                    >
                      Mark as Scam
                    </button>
                  </div>
                </div>

                {/* Feedback Log */}
                {logs.length > 0 && (
                  <div 
                    className="rounded-2xl p-8 border"
                    style={{
                      backgroundColor: bgCard,
                      borderColor: bgBorder,
                      boxShadow: darkMode 
                        ? '0 20px 60px rgba(0, 0, 0, 0.3)' 
                        : '0 20px 60px rgba(0, 0, 0, 0.05)'
                    }}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div style={{ color: accentColor, fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Feedback History
                      </div>
                      <button
                        onClick={exportCSV}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-70"
                        style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
                      >
                        <Download size={16} />
                        Export CSV
                      </button>
                    </div>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {logs.map((log, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-lg border"
                          style={{
                            backgroundColor: bgSubtle,
                            borderColor: bgBorder
                          }}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span style={{ color: textSecondary, fontSize: '12px' }}>{log.timestamp}</span>
                            <span 
                              style={{
                                fontSize: '12px',
                                fontWeight: 600,
                                color: log.userLabel === 'Safe' ? '#3ba776' : '#d9534f'
                              }}
                            >
                              {log.userLabel}
                            </span>
                          </div>
                          <p style={{ color: textPrimary, fontSize: '14px', lineHeight: 1.5 }}>
                            "{log.message}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      )}

      {/* Voice Analysis Screen */}
      {screen === 'voice-scan' && (
        <main className="relative min-h-screen pt-12 pb-32 px-8">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Voice Recording Section */}
            <div className="space-y-8 animate-fade-in">
              <div>
                <h2 
                  style={{
                    fontFamily: 'Italiana, serif',
                    fontSize: '44px',
                    fontWeight: 400,
                    color: textPrimary,
                    lineHeight: 1.2,
                    letterSpacing: '-1px',
                    marginBottom: '8px'
                  }}
                >
                  Voice Scan
                </h2>
                <p style={{ color: textSecondary, fontSize: '16px' }}>Record and analyze voice calls for phishing threats</p>
              </div>

              <div 
                className="rounded-2xl p-16 border flex flex-col items-center justify-center min-h-96"
                style={{
                  backgroundColor: bgCard,
                  borderColor: bgBorder,
                  boxShadow: darkMode 
                    ? '0 20px 60px rgba(0, 0, 0, 0.3)' 
                    : '0 20px 60px rgba(0, 0, 0, 0.05)',
                  background: darkMode 
                    ? `linear-gradient(135deg, #111111 0%, #1a1509 100%)`
                    : `linear-gradient(135deg, #ffffff 0%, #faf9f7 100%)`
                }}
              >
                <button
                  onClick={isRecording ? handleStopRecording : handleStartRecording}
                  className="group relative mb-8 transition-all duration-300 hover:scale-110 active:scale-95"
                >
                  <div 
                    className="w-40 h-40 rounded-full flex items-center justify-center transition-all duration-300"
                    style={{
                      backgroundColor: accentColor,
                      boxShadow: isRecording 
                        ? `0 0 60px ${accentColor}, 0 0 120px ${accentColor}80`
                        : `0 20px 60px ${accentColor}40`,
                      animation: isRecording ? 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none'
                    }}
                  >
                    {isRecording ? <MicOff size={80} color="#000" /> : <Mic size={80} color="#000" />}
                  </div>
                  {isRecording && (
                    <>
                      <div 
                        className="absolute inset-0 rounded-full border-4"
                        style={{
                          borderColor: accentColor,
                          animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
                          opacity: 0.75
                        }}
                      />
                    </>
                  )}
                </button>

                <h3 style={{ fontSize: '24px', fontWeight: 500, color: textPrimary, marginBottom: '8px' }}>
                  {isRecording ? 'Listening...' : 'Tap to Start Recording'}
                </h3>
                <p style={{ color: textSecondary, fontSize: '14px', textAlign: 'center' }}>
                  {isRecording 
                    ? 'Recording in progress. Click the button to stop.' 
                    : 'Click the microphone to begin recording your voice sample.'}
                </p>
              </div>
            </div>

            {/* Transcription */}
            {inputText && (
              <div 
                className="space-y-8 animate-fade-in"
                style={{
                  animation: 'fadeInUp 0.6s ease-out'
                }}
              >
                <div 
                  className="rounded-2xl p-8 border"
                  style={{
                    backgroundColor: bgCard,
                    borderColor: bgBorder,
                    boxShadow: darkMode 
                      ? '0 20px 60px rgba(0, 0, 0, 0.3)' 
                      : '0 20px 60px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <div style={{ color: accentColor, fontSize: '13px', fontWeight: 600, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Transcription
                  </div>
                  <p style={{ fontSize: '16px', color: textPrimary, lineHeight: 1.8 }}>
                    {inputText}
                  </p>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      setInputText('');
                      setResult(null);
                    }}
                    className="flex-1 px-6 py-4 rounded-full font-semibold border-2 transition-all hover:scale-105 active:scale-95"
                    style={{
                      borderColor: bgBorder,
                      color: textPrimary,
                      backgroundColor: 'transparent'
                    }}
                  >
                    Re-record
                  </button>
                  <button
                    onClick={() => runAnalysis()}
                    disabled={isAnalyzing || !inputText.trim()}
                    className="flex-1 px-6 py-4 rounded-full font-semibold transition-all disabled:opacity-50 hover:scale-105 active:scale-95"
                    style={{
                      backgroundColor: accentColor,
                      color: '#000'
                    }}
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                  </button>
                </div>
              </div>
            )}

            {/* Analysis Result */}
            {result && !isAnalyzing && (
              <div 
                className="space-y-8 animate-fade-in"
                style={{
                  animation: 'fadeInUp 0.6s ease-out'
                }}
              >
                {/* Result Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div>
                    <h2 
                      style={{
                        fontFamily: 'Italiana, serif',
                        fontSize: '44px',
                        fontWeight: 400,
                        color: textPrimary,
                        lineHeight: 1.2,
                        letterSpacing: '-1px'
                      }}
                    >
                      Analysis Result
                    </h2>
                  </div>
                  {renderBadge(result.label)}
                </div>

                {/* Risk Score */}
                <div 
                  className="rounded-2xl p-12 border"
                  style={{
                    backgroundColor: bgCard,
                    borderColor: bgBorder,
                    boxShadow: darkMode 
                      ? '0 20px 60px rgba(0, 0, 0, 0.3)' 
                      : '0 20px 60px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <div style={{ color: accentColor, fontSize: '13px', fontWeight: 600, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Risk Assessment
                  </div>
                  <div className="flex items-end gap-4 mb-8">
                    <div style={{ fontSize: 'clamp(48px, 12vw, 96px)', fontWeight: 300, color: getScoreColor(result.score), lineHeight: 1 }}>
                      {result.score}
                    </div>
                    <div style={{ color: textSecondary, fontSize: '20px', marginBottom: '8px', fontWeight: 300 }}>
                      / 100
                    </div>
                  </div>
                  <div className="w-full h-3 rounded-full overflow-hidden" style={{ backgroundColor: bgBorder }}>
                    <div 
                      className="h-full transition-all duration-1000"
                      style={{
                        width: `${result.score}%`,
                        backgroundColor: getScoreColor(result.score)
                      }}
                    />
                  </div>
                </div>

                {/* Threat Classification */}
                <div 
                  className="rounded-2xl p-8 border"
                  style={{
                    backgroundColor: bgCard,
                    borderColor: bgBorder,
                    boxShadow: darkMode 
                      ? '0 20px 60px rgba(0, 0, 0, 0.3)' 
                      : '0 20px 60px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <div style={{ color: accentColor, fontSize: '13px', fontWeight: 600, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Threat Type
                  </div>
                  <h3 style={{ fontSize: '28px', fontWeight: 500, color: textPrimary, marginBottom: '16px' }}>
                    {result.threatType}
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {result.triggeredRules.map((rule, idx) => (
                      <div
                        key={idx}
                        style={{
                          backgroundColor: `${accentColor}20`,
                          color: accentColor,
                          padding: '8px 16px',
                          borderRadius: '20px',
                          fontSize: '13px',
                          fontWeight: 600
                        }}
                      >
                        {rule}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Explanation */}
                <div 
                  className="rounded-2xl p-8 border"
                  style={{
                    backgroundColor: bgCard,
                    borderColor: bgBorder,
                    boxShadow: darkMode 
                      ? '0 20px 60px rgba(0, 0, 0, 0.3)' 
                      : '0 20px 60px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <div style={{ color: accentColor, fontSize: '13px', fontWeight: 600, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Why This Detection
                  </div>
                  <p style={{ fontSize: '16px', color: textSecondary, lineHeight: 1.8 }}>
                    {result.reasoning}
                  </p>
                </div>

                {/* Flagged Terms */}
                <div 
                  className="rounded-2xl p-8 border"
                  style={{
                    backgroundColor: bgCard,
                    borderColor: bgBorder,
                    boxShadow: darkMode 
                      ? '0 20px 60px rgba(0, 0, 0, 0.3)' 
                      : '0 20px 60px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <div style={{ color: accentColor, fontSize: '13px', fontWeight: 600, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Flagged Terms
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {result.highlightedTerms.map((term, idx) => (
                      <div
                        key={idx}
                        className="px-4 py-2 rounded-lg border"
                        style={{
                          backgroundColor: darkMode ? 'rgba(240, 173, 78, 0.1)' : 'rgba(240, 173, 78, 0.05)',
                          borderColor: '#f0ad4e',
                          color: '#f0ad4e',
                          fontSize: '14px',
                          fontWeight: 500
                        }}
                      >
                        {term}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Feedback */}
                <div 
                  className="rounded-2xl p-8 border"
                  style={{
                    backgroundColor: bgCard,
                    borderColor: bgBorder,
                    boxShadow: darkMode 
                      ? '0 20px 60px rgba(0, 0, 0, 0.3)' 
                      : '0 20px 60px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <div style={{ color: textSecondary, fontSize: '14px', marginBottom: '16px', fontWeight: 500 }}>
                    Help improve DesiShield accuracy
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleFeedback('Safe')}
                      className="flex-1 px-6 py-3 rounded-full font-semibold border-2 transition-all hover:scale-105 active:scale-95"
                      style={{
                        borderColor: '#3ba776',
                        color: '#3ba776',
                        backgroundColor: 'rgba(59, 167, 118, 0.05)'
                      }}
                    >
                      Mark as Safe
                    </button>
                    <button
                      onClick={() => handleFeedback('Phishing')}
                      className="flex-1 px-6 py-3 rounded-full font-semibold border-2 transition-all hover:scale-105 active:scale-95"
                      style={{
                        borderColor: '#d9534f',
                        color: '#d9534f',
                        backgroundColor: 'rgba(217, 83, 79, 0.05)'
                      }}
                    >
                      Mark as Scam
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div 
                className="p-6 rounded-xl border flex items-center gap-4 animate-fade-in"
                style={{
                  backgroundColor: 'rgba(217, 83, 79, 0.1)',
                  borderColor: '#d9534f',
                  color: '#d9534f'
                }}
              >
                <AlertCircle size={24} />
                <span className="font-semibold">{error}</span>
              </div>
            )}
          </div>
        </main>
      )}

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(20px);
          }
        }

        @keyframes scrollDot {
          0% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(12px);
          }
        }

        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        .animate-fade-in {
          animation: fadeInUp 0.8s ease-out;
        }
      `}</style>
    </div>
  );
};

export default App;
