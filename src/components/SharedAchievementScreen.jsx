import React from 'react';

export default function SharedAchievementScreen({ stats, onTryYourself }) {
  if (!stats) {
    return (
      <div className="screen-wrapper">
        <nav className="app-navbar">
          <div className="nav-brand" onClick={onTryYourself} style={{ cursor: 'pointer' }}>
            <div className="brand-icon">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L4 7L12 12L20 7L12 2Z" fill="#2d6a4f"/>
                <path d="M4 7V17L12 22V12L4 7Z" fill="#1b4332"/>
                <path d="M20 7V17L12 22V12L20 7Z" fill="#40916c"/>
              </svg>
            </div>
            <span className="brand-name">TypeAI</span>
          </div>
        </nav>
        <div className="screen-content results-content">
          <div className="celebration-hero">
            <div className="celebration-text">
              <h2 className="celebration-title">Link Not Valid</h2>
              <p className="celebration-subtitle">
                This share link looks broken or incomplete. Ask for a fresh one, or try the test yourself.
              </p>
            </div>
          </div>
          <div className="results-actions-bar">
            <button className="btn btn-primary" onClick={onTryYourself}>
              <span>Try TypeAI Yourself →</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const wpm = stats.wpm ?? 0;
  const accuracy = stats.accuracy ?? 0;
  const errors = stats.errors ?? 0;
  const timeTaken = stats.timeTaken ?? 60;
  const difficulty = stats.difficulty || 'Medium';
  const dateStr = stats.date
    ? new Date(stats.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <div className="screen-wrapper">
      <nav className="app-navbar">
        <div className="nav-brand" onClick={onTryYourself} style={{ cursor: 'pointer' }}>
          <div className="brand-icon">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L4 7L12 12L20 7L12 2Z" fill="#2d6a4f"/>
              <path d="M4 7V17L12 22V12L4 7Z" fill="#1b4332"/>
              <path d="M20 7V17L12 22V12L20 7Z" fill="#40916c"/>
            </svg>
          </div>
          <span className="brand-name">TypeAI</span>
        </div>
        <button className="btn btn-primary btn-sm" onClick={onTryYourself}>
          Try It Yourself →
        </button>
      </nav>

      <div className="screen-content results-content">
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
            <h2 className="celebration-title">Shared Typing Achievement</h2>
            <p className="celebration-subtitle">
              {dateStr ? `Recorded on ${dateStr} — ` : ''}{wpm} WPM at {accuracy}% accuracy on {difficulty} difficulty.
            </p>
          </div>
        </div>

        {/* Stat Cards */}
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
              <span className="res-stat-number">{wpm}</span>
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
              <span className="res-stat-number">{accuracy}%</span>
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
              <span className="res-stat-number">{errors}</span>
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
              <span className="res-stat-number">{timeTaken}s</span>
              <span className="res-stat-hint">Test duration</span>
            </div>
          </div>
        </div>

        <div className="results-actions-bar">
          <button className="btn btn-primary" onClick={onTryYourself}>
            <span>Try TypeAI Yourself →</span>
          </button>
        </div>
      </div>
    </div>
  );
}