import React, { useState, useEffect, useRef } from 'react';
import Navbar from './Navbar.jsx';

const SAMPLE_TEXTS = {
  easy: [
    "Typing fast is a great skill that saves time and opens new creative paths. Practice every day with patience and focus.",
    "A calm morning walk can clear your mind and set a positive tone for the whole day ahead of you.",
    "Simple habits like drinking water, taking short breaks, and sleeping well make a big difference over time.",
    "Reading a little every night is an easy way to learn new words and relax before bed.",
    "Small steps taken consistently lead to big results, so keep practicing a little bit each day.",
    "Fresh fruit and a short walk in the sun are simple ways to feel better during a busy week."
  ],
  medium: [
    "Technology has transformed the way we live, work, and communicate. It brings people closer, creates new opportunities, and solves real-world problems. By learning consistently and staying curious, we can build a better future for everyone around the world.",
    "Learning a new skill takes patience and repetition, but the reward is a lasting sense of confidence. Whether it is a language, an instrument, or a craft, steady practice turns confusion into clarity over time.",
    "Cities around the world are experimenting with green spaces, bike lanes, and public transport to reduce pollution. These changes often start small, but they gradually reshape how millions of people move and live.",
    "Good communication is built on listening as much as speaking. When people take time to understand each other's perspective, conflicts shrink and collaboration becomes far easier to sustain.",
    "The human brain adapts remarkably well to new challenges, forming fresh connections every time we learn something unfamiliar. This is why consistent practice, even in short sessions, produces noticeable improvement.",
    "Space exploration continues to push the limits of engineering and human endurance. Each mission teaches scientists new lessons about materials, navigation, and how the body responds to life beyond Earth."
  ],
  hard: [
    "Algorithmic synthesis and asynchronous paradigms demand meticulous syntactic precision, whereas cryptographic verifiability underpins contemporary decentralized computational architectures.",
    "Quantum decoherence introduces probabilistic ambiguity into otherwise deterministic computational frameworks, necessitating error-correction protocols of extraordinary mathematical sophistication.",
    "Epistemological frameworks grounded in empirical falsifiability remain foundational to scientific inquiry, notwithstanding persistent philosophical contention regarding underdetermination and paradigm incommensurability.",
    "Macroeconomic equilibria are perpetually destabilized by exogenous shocks, compelling policymakers to recalibrate fiscal and monetary instruments amid pervasive informational asymmetry.",
    "Neuroplasticity underlies the brain's capacity for synaptic reorganization, a phenomenon extensively leveraged in rehabilitative therapeutics following traumatic cerebrovascular incidents.",
    "Distributed consensus mechanisms must reconcile Byzantine fault tolerance with latency constraints, a tension that continues to challenge architects of scalable blockchain infrastructure."
  ]
};

function pickRandomParagraph(level) {
  const list = SAMPLE_TEXTS[level] || SAMPLE_TEXTS.medium;
  return list[Math.floor(Math.random() * list.length)];
}

export default function TypingTestScreen({
  onNavigate,
  theme,
  onToggleTheme,
  onShowAbout,
  onShowHistory,
  customParagraph,
  onFinishTest
}) {
  const [difficulty, setDifficulty] = useState('medium');
  const [timeLimit, setTimeLimit] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [testState, setTestState] = useState('ready'); // 'ready' | 'running' | 'completed'

  // Dynamic paragraph generated via Gemini
  const [dynamicParagraph, setDynamicParagraph] = useState(null);
  const [isGeneratingText, setIsGeneratingText] = useState(false);

  // Randomly-picked default paragraph for the current difficulty. Re-picked
  // (via handleDifficultyChange) whenever the difficulty changes, and freshly
  // randomized on every mount — so refreshing the page or navigating back
  // into this screen shows a different paragraph instead of the same fixed one.
  const [staticParagraph, setStaticParagraph] = useState(() => pickRandomParagraph('medium'));

  // Active target text
  const targetText = customParagraph || dynamicParagraph || staticParagraph;
  const [inputVal, setInputVal] = useState('');

  // Live Stats
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [errors, setErrors] = useState(0);

  const inputRef = useRef(null);
  const inputValRef = useRef('');
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const testStateRef = useRef('ready'); // mirrors testState synchronously, avoids stale-closure race in handleInputChange
  const hasFinishedRef = useRef(false); // guards against finishTest firing more than once per test

  useEffect(() => {
    testStateRef.current = testState;
  }, [testState]);

  // Synchronize when custom paragraph changes from AI Analysis Screen
  useEffect(() => {
    if (customParagraph) {
      setDynamicParagraph(null);
      resetTest();
    }
  }, [customParagraph]);

  // Synchronize time limit when changing in ready state
  useEffect(() => {
    if (testState === 'ready') {
      setTimeLeft(timeLimit);
    }
  }, [timeLimit, testState]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleDifficultyChange = (level) => {
    if (testState === 'running') {
      clearInterval(timerRef.current);
    }
    setDifficulty(level);
    setDynamicParagraph(null);
    setStaticParagraph(pickRandomParagraph(level));
    resetTest();
  };

  const handleTimeChange = (secs) => {
    if (testState === 'running') {
      clearInterval(timerRef.current);
    }
    setTimeLimit(secs);
    setTimeLeft(secs);
    resetTest();
  };

  const handleGenerateAiText = async () => {
    if (testState === 'running') {
      clearInterval(timerRef.current);
    }
    setIsGeneratingText(true);
    try {
      const res = await fetch('/api/generate-paragraph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty })
      });
      const data = await res.json();
      if (data && data.paragraph) {
        setDynamicParagraph(data.paragraph);
        resetTest();
      }
    } catch (e) {
      console.error("Failed to generate dynamic AI paragraph:", e);
    } finally {
      setIsGeneratingText(false);
    }
  };

  /**
   * Evaluates user typing strictly and accurately with zero fake metrics.
   * `typed` is always clamped to the target paragraph's length by the caller,
   * so correctCount + incorrectCount + skippedCount === targetText.length
   * always holds, and accuracy always matches correct/total exactly.
   */
  const computeStats = (currentInput = inputValRef.current) => {
    // Defensive clamp: typed can never be longer than the paragraph itself.
    const typed = (currentInput || '').slice(0, targetText.length);
    let correct = 0;
    let incorrect = 0;
    const mistypedMap = {};

    for (let i = 0; i < typed.length; i++) {
      const expected = targetText[i];
      const actual = typed[i];
      if (actual === expected) {
        correct++;
      } else {
        incorrect++;
        const k = expected.toLowerCase();
        const displayKey = k === ' ' ? 'space' : k;
        mistypedMap[displayKey] = (mistypedMap[displayKey] || 0) + 1;
      }
    }

    const skipped = Math.max(0, targetText.length - typed.length);
    // Total is always the full paragraph length: typed chars (correct + incorrect) + not-yet-typed (skipped)
    const total = correct + incorrect + skipped;
    const calcAccuracy = total > 0 ? Math.max(0, Math.min(100, Math.round((correct / total) * 100))) : 0;

    // Elapsed time is always measured from the real test start, clamped so it
    // can never exceed the configured time limit (e.g. timer-expiry finish).
    const rawElapsedSeconds = startTimeRef.current
      ? (Date.now() - startTimeRef.current) / 1000
      : (timeLimit - timeLeft);
    const elapsedSeconds = Math.max(1, Math.min(timeLimit, Math.round(rawElapsedSeconds)));
    const elapsedMinutes = elapsedSeconds / 60;
    const calcWpm = elapsedMinutes > 0 ? Math.round((correct / 5) / elapsedMinutes) : 0;

    const sortedMistyped = Object.entries(mistypedMap)
      .sort((a, b) => b[1] - a[1])
      .map(([key, count]) => ({ key, count }));

    return {
      typedText: typed,
      paragraph: targetText,
      wpm: calcWpm,
      accuracy: calcAccuracy,
      errors: incorrect,
      correctCount: correct,
      incorrectCount: incorrect,
      skippedCount: skipped,
      timeTaken: elapsedSeconds,
      elapsedTime: elapsedSeconds,
      duration: timeLimit,
      difficulty: difficulty,
      totalChars: total,
      mistypedKeys: sortedMistyped.map(item => item.key).slice(0, 6)
    };
  };

  const startTest = () => {
    clearInterval(timerRef.current);
    setInputVal('');
    inputValRef.current = '';
    setTimeLeft(timeLimit);
    setWpm(0);
    setAccuracy(100);
    setErrors(0);
    setTestState('running');
    testStateRef.current = 'running';
    hasFinishedRef.current = false;

    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          finishTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Focus input
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 50);
  };

  const resetTest = () => {
    clearInterval(timerRef.current);
    setInputVal('');
    inputValRef.current = '';
    setTimeLeft(timeLimit);
    setTestState('ready');
    testStateRef.current = 'ready';
    hasFinishedRef.current = false;
    setWpm(0);
    setAccuracy(100);
    setErrors(0);
  };

  const handleInputChange = (e) => {
    // Use the ref (updated synchronously) instead of the `testState` closure
    // value, which can be stale for a render or two right after finishTest()
    // calls setTestState('completed') — that stale-ness previously let a few
    // extra keystrokes slip through and inflate the error count.
    if (testStateRef.current !== 'running' || hasFinishedRef.current) return;

    // Never let the typed value grow past the paragraph itself.
    const value = e.target.value.slice(0, targetText.length);
    setInputVal(value);
    inputValRef.current = value;

    const stats = computeStats(value);
    setErrors(stats.errors);
    setAccuracy(stats.accuracy);
    setWpm(stats.wpm);

    // Check if finished entire target text
    if (value.length >= targetText.length) {
      finishTest(stats);
    }
  };

  const finishTest = (providedStats = null) => {
    // A test can only be finished once (auto-complete, timer expiry, and the
    // manual "View Results" button could otherwise all fire in quick
    // succession and each report slightly different numbers).
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;

    clearInterval(timerRef.current);
    setTestState('completed');
    testStateRef.current = 'completed';

    const finalStats = providedStats || computeStats(inputValRef.current);
    setErrors(finalStats.errors);
    setAccuracy(finalStats.accuracy);
    setWpm(finalStats.wpm);

    if (onFinishTest) {
      onFinishTest(finalStats);
    }
  };

  const focusInput = () => {
    if (testState === 'ready') {
      startTest();
    } else if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Format Time Remaining 00:60 or 01:00
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Render highlighted paragraph
  const renderParagraph = () => {
    const chars = targetText.split('');
    const typedChars = inputVal.split('');

    return chars.map((char, index) => {
      let className = 'char-pending';
      const isCurrent = testState === 'running' && index === typedChars.length;

      if (index < typedChars.length) {
        if (typedChars[index] === char) {
          className = 'char-correct';
        } else {
          className = 'char-incorrect';
        }
      }

      return (
        <span
          key={index}
          className={`${className} ${isCurrent ? 'char-current' : ''}`}
        >
          {char}
        </span>
      );
    });
  };

  const currentLength = inputVal.length;
  const totalLength = targetText.length;
  const progressPercent = Math.min(100, Math.round((currentLength / totalLength) * 100));

  return (
    <div className="screen-wrapper">
      <Navbar
        activeScreen={2}
        onNavigate={onNavigate}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onShowAbout={onShowAbout}
        onShowHistory={onShowHistory}
      />

      <div className="screen-content test-content">
        {/* Controls Filter Bar with Requirements & Start Button */}
        <div className="test-controls-bar">
          <div className="control-requirements-left">
            <div className="control-group">
              <span className="control-label">Difficulty :</span>
              <div className="pill-group">
                <button
                  className={`filter-pill ${difficulty === 'easy' && !dynamicParagraph ? 'active' : ''}`}
                  onClick={() => handleDifficultyChange('easy')}
                >
                  Easy
                </button>
                <button
                  className={`filter-pill ${difficulty === 'medium' && !dynamicParagraph ? 'active' : ''}`}
                  onClick={() => handleDifficultyChange('medium')}
                >
                  Medium
                </button>
                <button
                  className={`filter-pill ${difficulty === 'hard' && !dynamicParagraph ? 'active' : ''}`}
                  onClick={() => handleDifficultyChange('hard')}
                >
                  Hard
                </button>
              </div>
            </div>

            <div className="control-group">
              <span className="control-label">Time :</span>
              <div className="pill-group">
                <button
                  className={`filter-pill ${timeLimit === 30 ? 'active' : ''}`}
                  onClick={() => handleTimeChange(30)}
                >
                  30s
                </button>
                <button
                  className={`filter-pill ${timeLimit === 60 ? 'active' : ''}`}
                  onClick={() => handleTimeChange(60)}
                >
                  60s
                </button>
                <button
                  className={`filter-pill ${timeLimit === 120 ? 'active' : ''}`}
                  onClick={() => handleTimeChange(120)}
                >
                  120s
                </button>
              </div>
            </div>

            <div className="control-group">
              <span className="control-label">AI Text :</span>
              <button
                className="filter-pill"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderColor: dynamicParagraph ? 'var(--brand-green)' : undefined,
                  color: dynamicParagraph ? 'var(--brand-green)' : undefined,
                  fontWeight: dynamicParagraph ? 600 : undefined
                }}
                onClick={handleGenerateAiText}
                disabled={isGeneratingText}
                title="Generate a brand new AI practice paragraph"
              >
                {isGeneratingText ? (
                  <span>Generating...</span>
                ) : (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="currentColor"/>
                    </svg>
                    <span>{dynamicParagraph ? '✨ New AI Text' : '✨ AI Generate'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Start Test / Reset Action Button */}
          <div className="control-requirements-right">
            {testState === 'ready' ? (
              <button className="btn btn-primary btn-start-test" onClick={startTest}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                <span>Start Test</span>
              </button>
            ) : (
              <button className="btn-restart" onClick={() => resetTest()}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
                </svg>
                <span>Reset Settings</span>
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Typing Paragraph Area */}
        <div
          className={`typing-card ${testState === 'ready' ? 'typing-card-ready' : 'typing-card-active'}`}
          onClick={focusInput}
        >
          {testState === 'ready' && (
            <div className="typing-ready-badge">
              <span className="ready-indicator"></span>
              <span>Select difficulty & time, then click <strong>Start Test</strong> to begin</span>
            </div>
          )}

          <div className="typing-text-display">
            {renderParagraph()}
          </div>

          <textarea
            ref={inputRef}
            className="hidden-typing-input"
            value={inputVal}
            onChange={handleInputChange}
            disabled={testState !== 'running'}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck="false"
          />
        </div>

        {/* 4 Live Stat Cards */}
        <div className="live-stats-grid">
          {/* WPM */}
          <div className="stat-card stat-wpm">
            <div className="stat-icon-circle icon-green">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
                <path d="M16.2 7.8l2-2"/>
              </svg>
            </div>
            <div className="stat-meta">
              <span className="stat-label">WPM</span>
              <span className="stat-value">{testState === 'ready' ? 0 : wpm}</span>
            </div>
          </div>

          {/* Accuracy */}
          <div className="stat-card stat-accuracy">
            <div className="stat-icon-circle icon-blue">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="6"/>
                <circle cx="12" cy="12" r="2"/>
              </svg>
            </div>
            <div className="stat-meta">
              <span className="stat-label">Accuracy</span>
              <span className="stat-value">{testState === 'ready' ? '100%' : `${accuracy}%`}</span>
            </div>
          </div>

          {/* Errors */}
          <div className="stat-card stat-errors">
            <div className="stat-icon-circle icon-red">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div className="stat-meta">
              <span className="stat-label">Errors</span>
              <span className="stat-value">{testState === 'ready' ? 0 : errors}</span>
            </div>
          </div>

          {/* Time Left */}
          <div className="stat-card stat-time">
            <div className="stat-icon-circle icon-purple">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div className="stat-meta">
              <span className="stat-label">Time Left</span>
              <span className="stat-value">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>

        {/* Progress & Actions Bar */}
        <div className="test-progress-bar-container">
          <span className="progress-title">Progress</span>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${testState === 'ready' ? 0 : progressPercent}%` }}
            />
          </div>
          <span className="progress-count">
            {testState === 'ready' ? `0 / ${totalLength}` : `${currentLength} / ${totalLength}`}
          </span>
          <div className="test-action-buttons">
            {testState === 'running' && (
              <button className="btn-restart" onClick={() => resetTest()}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
                </svg>
                <span>Restart Test</span>
              </button>
            )}
            <button
              className="btn btn-primary btn-sm"
              onClick={() => finishTest()}
              disabled={testState !== 'running'}
            >
              <span>View Results →</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}