import React from 'react';

export default function Navbar({ activeScreen, onNavigate, theme, onToggleTheme, onShowAbout, onShowHistory }) {
  return (
    <nav className="app-navbar">
      <div className="nav-brand" onClick={() => onNavigate(1)}>
        <div className="brand-icon">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L4 7L12 12L20 7L12 2Z" fill="#2d6a4f"/>
            <path d="M4 7V17L12 22V12L4 7Z" fill="#1b4332"/>
            <path d="M20 7V17L12 22V12L20 7Z" fill="#40916c"/>
          </svg>
        </div>
        <span className="brand-name">TypeAI</span>
      </div>

      <div className="nav-links">
        <button
          className={`nav-item ${activeScreen === 1 ? 'active' : ''}`}
          onClick={() => onNavigate(1)}
        >
          Home
        </button>
        <button
          className={`nav-item ${activeScreen === 2 || activeScreen === 3 || activeScreen === 4 ? 'active' : ''}`}
          onClick={() => onNavigate(2)}
        >
          Test
        </button>
        <button
          className="nav-item"
          onClick={onShowHistory}
        >
          History
        </button>
        <button
          className="nav-item"
          onClick={onShowAbout}
        >
          About
        </button>
      </div>

      <div
        className="nav-theme-toggle"
        onClick={onToggleTheme}
        title="Toggle Light/Dark Theme"
      >
        <span className="toggle-sun">☀️</span>
        <span className="toggle-moon">🌙</span>
        <span className="toggle-knob"></span>
      </div>
    </nav>
  );
}
