import React from 'react';

export default function PresentationToolbar({
  viewMode,
  onSetViewMode,
  activeScreen,
  onNavigate,
  theme,
  onToggleTheme
}) {
  return (
    <header className="presentation-header">
      <div className="pres-brand">
        <div className="pres-logo-svg">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L4 7V17L12 22L20 17V7L12 2Z" fill="#1b4332" opacity="0.15"/>
            <path d="M12 2L4 7L12 12L20 7L12 2Z" fill="#2d6a4f"/>
            <path d="M4 7V17L12 22V12L4 7Z" fill="#1b4332"/>
            <path d="M20 7V17L12 22V12L20 7Z" fill="#40916c"/>
          </svg>
        </div>
        <div className="pres-title-group">
          <span className="pres-title">TypeAI</span>
          <span className="pres-badge">UI/UX Design Presentation</span>
        </div>
      </div>

      <div className="pres-controls">
        {/* Toggle between 2x2 Presentation & Interactive Mode */}
        <div className="view-toggle-group">
          <button
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => onSetViewMode('grid')}
            title="View all 4 screens in a 2x2 presentation board"
          >
            <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
              <path d="M3 3h6v6H3V3zm8 0h6v6h-6V3zM3 11h6v6H3v-6zm8 0h6v6h-6v-6z"/>
            </svg>
            <span>2×2 Presentation</span>
          </button>
          <button
            className={`view-btn ${viewMode === 'interactive' ? 'active' : ''}`}
            onClick={() => onSetViewMode('interactive')}
            title="Interactive single screen app view"
          >
            <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2v8h10V6H5z" clipRule="evenodd"/>
            </svg>
            <span>Interactive App</span>
          </button>
        </div>

        {/* Quick Screen Nav */}
        <div className="screen-selector-group">
          <button
            className={`screen-jump-btn ${activeScreen === 1 ? 'active' : ''}`}
            onClick={() => onNavigate(1)}
          >
            1. Home
          </button>
          <button
            className={`screen-jump-btn ${activeScreen === 2 ? 'active' : ''}`}
            onClick={() => onNavigate(2)}
          >
            2. Test
          </button>
          <button
            className={`screen-jump-btn ${activeScreen === 3 ? 'active' : ''}`}
            onClick={() => onNavigate(3)}
          >
            3. Results
          </button>
          <button
            className={`screen-jump-btn ${activeScreen === 4 ? 'active' : ''}`}
            onClick={() => onNavigate(4)}
          >
            4. AI Analysis
          </button>
        </div>

        {/* Global Light/Dark Theme Switcher */}
        <div
          className="global-theme-toggle"
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          <span className="theme-icon sun">☀️</span>
          <span className="theme-icon moon">🌙</span>
          <span className="theme-indicator"></span>
        </div>
      </div>
    </header>
  );
}
