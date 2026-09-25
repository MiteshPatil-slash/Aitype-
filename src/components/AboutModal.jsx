import React from 'react';

export default function AboutModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>About TypeAI</h3>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            <strong>TypeAI</strong> is a sophisticated, human-designed typing speed and accuracy testing platform. Designed to depart from generic AI aesthetic clichés, TypeAI features a warm cream/charcoal palette, muted forest green accents, and subtle analytical metrics.
          </p>
          <div style={{ marginTop: '16px', padding: '12px 16px', background: 'var(--bg-card-subtle)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
              <span>🌱</span><span>Core Design System</span>
            </div>
            <ul style={{ margin: '0 0 0 16px', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              <li>Warm cream/off-white background with subtle borders</li>
              <li>Muted forest green buttons and highlights</li>
              <li>Real-time dynamic typing engine with live WPM & accuracy</li>
              <li>AI-generated follow-up paragraphs targeting specific user mistypes</li>
            </ul>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>Got it</button>
        </div>
      </div>
    </div>
  );
}
