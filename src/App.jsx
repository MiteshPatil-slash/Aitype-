import React, { useState, useEffect } from 'react';
import HomeScreen from './components/HomeScreen.jsx';
import TypingTestScreen from './components/TypingTestScreen.jsx';
import ResultsScreen from './components/ResultsScreen.jsx';
import AiAnalysisScreen from './components/AiAnalysisScreen.jsx';
import AboutModal from './components/AboutModal.jsx';
import DemoModal from './components/DemoModal.jsx';
import HistoryModal from './components/HistoryModal.jsx';
import SharedAchievementScreen from './components/SharedAchievementScreen.jsx';
import { decodeAchievement } from './utils/achievementShare.js';

export default function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('typeai_theme') || 'light';
  });

  // If the URL has a ?share=... param, this is a shared achievement link —
  // decode it once on load and show the read-only shared view instead of
  // the normal app flow.
  const [shareView, setShareView] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('share');
    if (!encoded) return null;
    return { stats: decodeAchievement(encoded) };
  });

  const exitShareView = () => {
    window.history.replaceState({}, '', window.location.pathname);
    setShareView(null);
  };

  const [activeScreen, setActiveScreen] = useState(1);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Completed typing session data
  const [sessionData, setSessionData] = useState({
    paragraph: "Technology has transformed the way we live, work, and communicate. It brings people closer, creates new opportunities, and solves real-world problems. By learning consistently and staying curious, we can build a better future for everyone around the world.",
    typedText: "Technology has transformed the way we live, work, and communicate.",
    wpm: 72,
    accuracy: 97,
    errors: 4,
    elapsedTime: 60,
    difficulty: "Medium",
    duration: 60,
    timeTaken: 60,
    correctCount: 356,
    incorrectCount: 12,
    skippedCount: 0,
    mistypedKeys: ['t', 'r', 'e', 's', 'h']
  });

  // Real Gemini AI Analysis State
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState(null);

  // Dynamic next paragraph from AI
  const [customParagraph, setCustomParagraph] = useState(null);

  // LocalStorage Persistent History
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('typeai_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync theme
  useEffect(() => {
    document.body.className = `theme-${theme}`;
    localStorage.setItem('typeai_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleNavigate = (screenNum) => {
    setActiveScreen(screenNum);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Called when typing test finishes.
  // `results` (from TypingTestScreen's computeStats) is already internally
  // consistent: correctCount + incorrectCount + skippedCount === paragraph
  // length, and accuracy === round(correctCount / total * 100). We trust it
  // as-is instead of re-deriving numbers, which previously could silently
  // fall back to hardcoded placeholder values (e.g. correctCount defaulting
  // to 356) whenever a field looked falsy.
  const handleFinishTest = (results) => {
    const updated = {
      ...sessionData,
      ...results
    };

    setSessionData(updated);

    // Save session to history in localStorage
    const newHistoryRecord = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      wpm: results.wpm ?? 0,
      accuracy: results.accuracy ?? 0,
      errors: results.errors ?? 0,
      time: `${results.timeTaken ?? results.elapsedTime ?? 60}s`,
      difficulty: results.difficulty || 'Medium'
    };

    const newHistoryList = [newHistoryRecord, ...history].slice(0, 50);
    setHistory(newHistoryList);
    try {
      localStorage.setItem('typeai_history', JSON.stringify(newHistoryList));
    } catch (e) {
      console.warn("Failed to persist history to localStorage", e);
    }

    setActiveScreen(3);
    showToast("Typing test completed! Results calculated.");
  };

  // Connects frontend to Gemini AI backend: POST /api/analyze
  const handleGetAiAnalysis = async () => {
    setIsAnalyzing(true);
    setAiError(null);

    try {
      const payload = {
        paragraph: sessionData.paragraph,
        typedText: sessionData.typedText,
        wpm: sessionData.wpm,
        accuracy: sessionData.accuracy,
        errors: sessionData.errors,
        elapsedTime: sessionData.elapsedTime || sessionData.timeTaken || 60,
        difficulty: sessionData.difficulty || "Medium",
        duration: sessionData.duration || 60
      };

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success && data.analysis) {
        setAiAnalysis(data.analysis);
        setActiveScreen(4); // Navigate to AI Analysis Screen!
        showToast("Gemini AI Analysis generated successfully!");
      } else {
        const errorMsg = data.error || "AI analysis is temporarily unavailable.";
        setAiError(errorMsg);
        showToast(errorMsg);
      }
    } catch (err) {
      console.error("Network or API error:", err);
      const networkError = "AI analysis is temporarily unavailable. Check your network or server.";
      setAiError(networkError);
      showToast(networkError);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Called from AI Analysis Screen: Start Next Test with generated paragraph
  const handleStartNextAiTest = (newParagraph) => {
    setCustomParagraph(newParagraph);
    setActiveScreen(2);
    showToast("AI Generated Paragraph loaded into Typing Test!");
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('typeai_history');
    } catch {}
    showToast("Typing history cleared.");
  };

  return (
    <div className="typeai-app">
      {/* Soft botanical ambient background */}
      <div className="canvas-botanical-bg"></div>

      {/* Full Page Main Viewport */}
      <div className="app-page-wrapper">
        {shareView ? (
          <SharedAchievementScreen
            stats={shareView.stats}
            onTryYourself={exitShareView}
          />
        ) : (
          <>
        {activeScreen === 1 && (
          <HomeScreen
            onNavigate={handleNavigate}
            theme={theme}
            onToggleTheme={toggleTheme}
            onShowAbout={() => setAboutOpen(true)}
            onShowHistory={() => setHistoryOpen(true)}
            onOpenDemo={() => setDemoOpen(true)}
          />
        )}

        {activeScreen === 2 && (
          <TypingTestScreen
            onNavigate={handleNavigate}
            theme={theme}
            onToggleTheme={toggleTheme}
            onShowAbout={() => setAboutOpen(true)}
            onShowHistory={() => setHistoryOpen(true)}
            customParagraph={customParagraph}
            onFinishTest={handleFinishTest}
          />
        )}

        {activeScreen === 3 && (
          <ResultsScreen
            onNavigate={handleNavigate}
            theme={theme}
            onToggleTheme={toggleTheme}
            onShowAbout={() => setAboutOpen(true)}
            onShowHistory={() => setHistoryOpen(true)}
            stats={sessionData}
            onGetAiAnalysis={handleGetAiAnalysis}
            isAnalyzing={isAnalyzing}
            aiError={aiError}
          />
        )}

        {activeScreen === 4 && (
          <AiAnalysisScreen
            onNavigate={handleNavigate}
            theme={theme}
            onToggleTheme={toggleTheme}
            onShowAbout={() => setAboutOpen(true)}
            onShowHistory={() => setHistoryOpen(true)}
            stats={sessionData}
            analysis={aiAnalysis}
            onStartNextTest={handleStartNextAiTest}
          />
        )}
          </>
        )}
      </div>

      {/* History Modal */}
      <HistoryModal
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={history}
        onClearHistory={handleClearHistory}
      />

      {/* About Modal */}
      <AboutModal
        isOpen={aboutOpen}
        onClose={() => setAboutOpen(false)}
      />

      {/* Demo Modal */}
      <DemoModal
        isOpen={demoOpen}
        onClose={() => setDemoOpen(false)}
        onStartTest={() => {
          setDemoOpen(false);
          setActiveScreen(2);
        }}
      />

      {/* Toast Feedback */}
      {toast && (
        <div className="toast-container">
          <div className="toast-message">{toast}</div>
        </div>
      )}
    </div>
  );
}