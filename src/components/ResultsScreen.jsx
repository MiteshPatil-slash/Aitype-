import React, { useState } from 'react';
import Navbar from './Navbar.jsx';
import ShareAchievementModal from './ShareAchievementModal.jsx';

export default function ResultsScreen({
  onNavigate,
  theme,
  onToggleTheme,
  onShowAbout,
  onShowHistory,
  stats = {
    wpm: 72,
    accuracy: 97,
    errors: 4,
    timeTaken: 60,
    correctCount: 356,
    incorrectCount: 12,
    skippedCount: 0
  },
  previousStats = null,
  onGetAiAnalysis,
  isAnalyzing = false,
  aiError = null
}) {
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const accuracyVal = stats.accuracy ?? 97;
  const incorrectVal = Math.max(0, 100 - accuracyVal);
  const wpmVal = stats.wpm ?? 72;
  const correctVal = stats.correctCount ?? 356;
  const incorrectCountVal = stats.incorrectCount ?? 12;
  const typedChars = correctVal + incorrectCountVal;

  // SVG Donut calculations (circumference = 2 * PI * 38 ≈ 238.76)
  const circumference = 238.76;
  const correctStroke = (accuracyVal / 100) * circumference;
  const incorrectStroke = (incorrectVal / 100) * circumference;

  // Real comparison to the previous session, instead of a hardcoded "+2%".
  // Only shown when there actually is a previous test to compare against.
  const accuracyDiff = previousStats ? accuracyVal - (previousStats.accuracy ?? 0) : null;
  const diffLabel = accuracyDiff === null
    ? null
    : accuracyDiff === 0
      ? 'Same accuracy as last test'
      : `${accuracyDiff > 0 ? '+' : ''}${accuracyDiff}% from last test`;

  // Headline + message driven entirely by what actually happened this test.
  let heroTitle = 'Great Job!';
  let heroSubtitle = `You typed at ${wpmVal} WPM with ${accuracyVal}% accuracy.`;

  if (typedChars === 0) {
    heroTitle = 'No Input Detected';
    heroSubtitle = "You didn't type anything during this test — give it another go!";
  } else if (accuracyVal < 50) {
    heroTitle = 'Needs Practice';
    heroSubtitle = `Only ${accuracyVal}% accuracy and ${stats.errors ?? 0} errors this round. Slow down and focus on each key.`;
  } else if (accuracyVal < 85) {
    heroTitle = 'Good Effort!';
    heroSubtitle = `${wpmVal} WPM at ${accuracyVal}% accuracy — keep practicing to sharpen it up.`;
  } else {
    heroTitle = 'Great Job!';
    heroSubtitle = `Excellent run — ${wpmVal} WPM at ${accuracyVal}% accuracy.`;
  }

  return (
    <div className="screen-wrapper">
      <Navbar
        activeScreen={3}
        onNavigate={onNavigate}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onShowAbout={onShowAbout}
        onShowHistory={onShowHistory}
      />

      <div className="screen-content results-content">
        {/* Back navigation button */}
        <div className="sub-nav-row">
          <button className="btn-subnav-back" onClick={() => onNavigate(2)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span>Back</span>
          </button>
        </div>

        {/* Celebration Trophy Banner */}
        <div className="celebration-hero">
          <div className="confetti-field">
            <span className="sparkle-dot dot-1"></span>
            <span className="sparkle-dot dot-2"></span>
            <span className="sparkle-dot dot-3"></span>
            <span className="sparkle-dot dot-4"></span>
            <span className="sparkle-dot dot-5"></span>
            <span className="sparkle-dot dot-6"></span>
          </div>
          <div className="trophy-badge">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
              <path d="M6 9V3H18V9C18 12.3137 15.3137 15 12 15C8.68629 15 6 12.3137 6 9Z" fill="#F59E0B"/>
              <path d="M6 5H3C2.44772 5 2 5.44772 2 6C2 7.65685 3.34315 9 5 9H6V5Z" fill="#FBBF24"/>
              <path d="M18 5H21C21.5523 5 22 5.44772 22 6C22 7.65685 20.6569 9 19 9H18V5Z" fill="#FBBF24"/>
              <path d="M10 15V18H14V15" stroke="#D97706" strokeWidth="2"/>
              <path d="M8 21H16" stroke="#D97706" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="celebration-text">
            <h2 className="celebration-title">{heroTitle}</h2>
            <p className="celebration-subtitle">{heroSubtitle}</p>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="results-stats-grid">
          <div className="res-stat-card">
            <div className="res-icon-circle icon-blue">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <div className="res-stat-body">
              <span className="res-stat-label">WPM</span>
              <span className="res-stat-number">{stats.wpm ?? 72}</span>
              <span className="res-stat-hint">Words per minute</span>
            </div>
          </div>

          <div className="res-stat-card">
            <div className="res-icon-circle icon-green">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="6"/>
                <circle cx="12" cy="12" r="2"/>
              </svg>
            </div>
            <div className="res-stat-body">
              <span className="res-stat-label">Accuracy</span>
              <span className="res-stat-number">{stats.accuracy ?? 97}%</span>
              {diffLabel && (
                <span className={`res-stat-diff ${accuracyDiff >= 0 ? 'text-success' : 'text-danger'}`}>
                  {diffLabel}
                </span>
              )}
            </div>
          </div>

          <div className="res-stat-card">
            <div className="res-icon-circle icon-red">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div className="res-stat-body">
              <span className="res-stat-label">Errors</span>
              <span className="res-stat-number">{stats.errors ?? 4}</span>
              <span className="res-stat-hint">Total mistakes</span>
            </div>
          </div>

          <div className="res-stat-card">
            <div className="res-icon-circle icon-purple">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div className="res-stat-body">
              <span className="res-stat-label">Time Taken</span>
              <span className="res-stat-number">{stats.timeTaken ?? 60}s</span>
              <span className="res-stat-hint">Test duration</span>
            </div>
          </div>
        </div>

        {/* Character Breakdown Card */}
        <div className="breakdown-card">
          <div className="breakdown-header">
            <h4 className="card-heading">Character Breakdown</h4>
          </div>

          <div className="breakdown-body">
            {/* Left Bars */}
            <div className="breakdown-bars">
              <div className="breakdown-item">
                <div className="breakdown-item-labels">
                  <span>Correct Characters</span>
                  <span className="breakdown-pct">{accuracyVal}%</span>
                </div>
                <div className="breakdown-track">
                  <div
                    className="breakdown-bar-fill bar-green"
                    style={{ width: `${accuracyVal}%` }}
                  />
                </div>
              </div>

              <div className="breakdown-item">
                <div className="breakdown-item-labels">
                  <span>Incorrect Characters</span>
                  <span className="breakdown-pct">{incorrectVal}%</span>
                </div>
                <div className="breakdown-track">
                  <div
                    className="breakdown-bar-fill bar-red"
                    style={{ width: `${incorrectVal}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Center Donut Chart */}
            <div className="donut-chart-wrapper">
              <svg viewBox="0 0 100 100" className="donut-chart-svg">
                <circle cx="50" cy="50" r="38" className="donut-ring-base"></circle>
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  className="donut-ring-correct"
                  strokeDasharray={`${correctStroke} ${circumference}`}
                  strokeDashoffset="0"
                ></circle>
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  className="donut-ring-incorrect"
                  strokeDasharray={`${incorrectStroke} ${circumference}`}
                  strokeDashoffset={-correctStroke}
                ></circle>
              </svg>
              <div className="donut-center-text">
                <span className="donut-value">{accuracyVal}%</span>
              </div>
            </div>

            {/* Right Legend */}
            <div className="breakdown-legend">
              <div className="legend-row">
                <span className="legend-dot dot-correct"></span>
                <span className="legend-name">Correct</span>
                <span className="legend-val">{stats.correctCount ?? 356}</span>
              </div>
              <div className="legend-row">
                <span className="legend-dot dot-incorrect"></span>
                <span className="legend-name">Incorrect</span>
                <span className="legend-val">{stats.incorrectCount ?? 12}</span>
              </div>
              <div className="legend-row">
                <span className="legend-dot dot-skipped"></span>
                <span className="legend-name">Skipped</span>
                <span className="legend-val">{stats.skippedCount ?? 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="results-actions-bar">
          <button className="btn btn-outline" onClick={() => onNavigate(2)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
            </svg>
            <span>Try Again</span>
          </button>
          {onGetAiAnalysis && (
            <button
              className="btn btn-primary"
              onClick={onGetAiAnalysis}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spin-icon">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2l1.8 5.6L19 9.5l-5.2 1.9L12 17l-1.8-5.6L5 9.5l5.2-1.9z"/>
                    <path d="M19 15l.7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7z"/>
                  </svg>
                  <span>Get AI Analysis</span>
                </>
              )}
            </button>
          )}
          <button
            className="btn btn-primary"
            onClick={() => onNavigate(1)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span>Back to Home</span>
          </button>
          <button
            className="btn btn-outline"
            onClick={() => setShareModalOpen(true)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3"/>
              <circle cx="6" cy="12" r="3"/>
              <circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            <span>Share Achievement</span>
          </button>
        </div>

        {aiError && (
          <p className="ai-error-text" style={{ textAlign: 'center', color: 'var(--danger, #dc2626)', marginTop: '12px' }}>
            {aiError}
          </p>
        )}
      </div>

      <ShareAchievementModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        stats={stats}
      />
    </div>
  );
}