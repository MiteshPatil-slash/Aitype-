import React from 'react';

export default function DemoModal({ isOpen, onClose, onStartTest }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>TypeAI — Product Walkthrough</h3>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-card)' }}>
            <img
              src="/image/lapptop.png"
              alt="TypeAI Walkthrough Desk Visual"
              style={{ width: '100%', display: 'block' }}
            />
          </div>
          <p style={{ marginTop: '14px', fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            Watch how TypeAI captures your keypress latency, categorizes error patterns (such as <code>t</code>, <code>r</code>, and <code>th</code> digrams), and instantly structures customized practice drills to elevate your speed.
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          <button
            className="btn btn-primary"
            onClick={() => {
              onClose();
              if (onStartTest) onStartTest();
            }}
          >
            Try Typing Test Now
          </button>
        </div>
      </div>
    </div>
  );
}
