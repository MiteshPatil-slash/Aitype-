import React from 'react';
import Navbar from './Navbar.jsx';

export default function HomeScreen({ onNavigate, theme, onToggleTheme, onShowAbout, onShowHistory, onOpenDemo }) {
  return (
    <div className="screen-wrapper">
      <Navbar
        activeScreen={1}
        onNavigate={onNavigate}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onShowAbout={onShowAbout}
        onShowHistory={onShowHistory}
      />

      <div className="screen-content home-content">
        <div className="home-grid">
          {/* Left Hero Content */}
          <div className="hero-left">
            <div className="hero-badge">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="#2d6a4f" stroke="#2d6a4f"/>
              </svg>
              <span>AI Powered Typing Experience</span>
            </div>

            <h1 className="hero-headline">
              Type Better.<br />
              Learn <span className="highlight-green">Smarter</span><br />
              with AI.
            </h1>

            <p className="hero-description">
              Test your typing speed, get intelligent feedback and practice with personalized content to improve your skills.
            </p>

            <div className="hero-actions">
              <button className="btn btn-primary btn-cta" onClick={() => onNavigate(2)}>
                <span>Start Typing Test</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
              <button className="btn btn-secondary btn-demo" onClick={onOpenDemo}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                <span>Watch Demo</span>
              </button>
            </div>

            {/* 3 Value Benefit Cards */}
            <div className="hero-benefits">
              <div className="benefit-card">
                <div className="benefit-icon-wrapper icon-lightning">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                </div>
                <div className="benefit-text">
                  <h4>Real-time Feedback</h4>
                  <p>See your performance as you type</p>
                </div>
              </div>

              <div className="benefit-card">
                <div className="benefit-icon-wrapper icon-brain">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04z"/>
                    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04z"/>
                  </svg>
                </div>
                <div className="benefit-text">
                  <h4>AI Analysis</h4>
                  <p>Get personalized suggestions</p>
                </div>
              </div>

              <div className="benefit-card">
                <div className="benefit-icon-wrapper icon-chart">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="20" x2="18" y2="10"/>
                    <line x1="12" y1="20" x2="12" y2="4"/>
                    <line x1="6" y1="20" x2="6" y2="14"/>
                  </svg>
                </div>
                <div className="benefit-text">
                  <h4>Track Progress</h4>
                  <p>View your improvement over time</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Hero Visual: Workspace desk with laptop */}
          <div className="hero-right">
            <div className="photo-frame">
              <img
                src="/image/lapptop.png"
                alt="Clean workspace desk with laptop running TypeAI"
                className="hero-desk-photo"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
