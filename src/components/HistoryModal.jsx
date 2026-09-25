import React from 'react';

export default function HistoryModal({ isOpen, onClose, history = [], onClearHistory }) {
  if (!isOpen) return null;

  const totalTests = history.length;
  const bestWpm = totalTests > 0 ? Math.max(...history.map(h => h.wpm || 0)) : 0;
  const avgWpm = totalTests > 0 ? Math.round(history.reduce((acc, h) => acc + (h.wpm || 0), 0) / totalTests) : 0;
  const avgAccuracy = totalTests > 0 ? Math.round(history.reduce((acc, h) => acc + (h.accuracy || 0), 0) / totalTests) : 0;

  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear your entire typing history?")) {
      onClearHistory();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>📊</span>
            <h3 style={{ margin: 0 }}>Typing History & Performance</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Summary Stats Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '10px',
            marginBottom: '20px'
          }}>
            <div style={{ background: 'var(--bg-card-subtle)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-light)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Tests</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>{totalTests}</div>
            </div>
            <div style={{ background: 'var(--bg-card-subtle)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-light)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Best WPM</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--stat-green)' }}>{bestWpm}</div>
            </div>
            <div style={{ background: 'var(--bg-card-subtle)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-light)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Avg WPM</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--stat-blue)' }}>{avgWpm}</div>
            </div>
            <div style={{ background: 'var(--bg-card-subtle)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-light)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Avg Accuracy</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--forest-600)' }}>{avgAccuracy}%</div>
            </div>
          </div>

          {/* Sessions List */}
          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-muted)' }}>
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '10px' }}>⌨️</span>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>No typing sessions yet. Complete your first test to see your progress.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1.4fr 1fr 1fr 1fr 1fr',
                padding: '8px 12px',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                borderBottom: '1px solid var(--border-light)'
              }}>
                <span>Date</span>
                <span>WPM</span>
                <span>Accuracy</span>
                <span>Errors</span>
                <span>Difficulty</span>
              </div>

              {history.map((item, idx) => (
                <div key={idx} style={{
                  display: 'grid',
                  gridTemplateColumns: '1.4fr 1fr 1fr 1fr 1fr',
                  padding: '10px 12px',
                  fontSize: '0.86rem',
                  background: 'var(--bg-card)',
                  borderRadius: '6px',
                  border: '1px solid var(--border-light)',
                  alignItems: 'center'
                }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{item.date}</span>
                  <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{item.wpm}</span>
                  <span style={{ fontWeight: 700, color: 'var(--stat-green)' }}>{item.accuracy}%</span>
                  <span style={{ color: item.errors > 0 ? 'var(--stat-red)' : 'var(--text-muted)' }}>{item.errors}</span>
                  <span style={{
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    background: 'var(--bg-card-subtle)',
                    width: 'fit-content'
                  }}>
                    {item.difficulty || 'Medium'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          {history.length > 0 ? (
            <button className="btn btn-outline btn-sm" onClick={handleClear} style={{ color: 'var(--stat-red)', borderColor: 'rgba(220, 38, 38, 0.3)' }}>
              Clear History
            </button>
          ) : <div></div>}
          <button className="btn btn-primary btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
