import React, { useState } from 'react';
import ShareAchievementModal from './ShareAchievementModal.jsx';
import { getWpmTier } from '../utils/achievementShare.js';

export default function HistoryModal({ isOpen, onClose, history = [], onClearHistory }) {
  const [viewingItem, setViewingItem] = useState(null);
  const [shareItem, setShareItem] = useState(null);

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

  // History items store `time` as "60s" and `date` as an already-formatted
  // display string — convert them into the shape ShareAchievementModal /
  // achievementShare expects, without losing the record's real date.
  const toShareStats = (item) => ({
    wpm: item.wpm,
    accuracy: item.accuracy,
    errors: item.errors,
    difficulty: item.difficulty,
    timeTaken: parseInt(item.time, 10) || 60,
    dateLabel: item.date
  });

  const handleClose = () => {
    setViewingItem(null);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal-dialog" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        {viewingItem ? (
          <>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => setViewingItem(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--text-secondary)', padding: '2px 4px' }}
                  title="Back to history"
                >
                  ←
                </button>
                <h3 style={{ margin: 0 }}>Session Details</h3>
              </div>
              <button className="modal-close-btn" onClick={handleClose}>✕</button>
            </div>

            <div className="modal-body" style={{ textAlign: 'center' }}>
              {(() => {
                const tier = getWpmTier(viewingItem.wpm || 0);
                return (
                  <>
                    <span style={{ fontSize: '2.4rem', display: 'block', marginBottom: '4px' }}>{tier.emoji}</span>
                    <h2 style={{ margin: '0 0 4px 0', fontSize: '1.6rem' }}>{viewingItem.wpm} WPM</h2>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '5px 12px',
                        borderRadius: '999px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        background: `${tier.color}22`,
                        color: tier.color,
                        border: `1px solid ${tier.color}55`
                      }}
                    >
                      {tier.label}
                    </span>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '10px' }}>
                      {viewingItem.date} • {viewingItem.difficulty || 'Medium'} difficulty
                    </p>
                  </>
                );
              })()}

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '10px',
                margin: '20px 0'
              }}>
                <div style={{ background: 'var(--bg-card-subtle)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>🎯 Accuracy</span>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--stat-green)' }}>{viewingItem.accuracy}%</div>
                </div>
                <div style={{ background: 'var(--bg-card-subtle)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>❌ Errors</span>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>{viewingItem.errors}</div>
                </div>
                <div style={{ background: 'var(--bg-card-subtle)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>⏱️ Time</span>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>{viewingItem.time}</div>
                </div>
              </div>

              <button
                className="btn btn-primary"
                onClick={() => setShareItem(viewingItem)}
              >
                🔗 Share This Result
              </button>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setViewingItem(null)}>Back to List</button>
            </div>
          </>
        ) : (
          <>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>📊</span>
                <h3 style={{ margin: 0 }}>Typing History & Performance</h3>
              </div>
              <button className="modal-close-btn" onClick={handleClose}>✕</button>
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
                    gridTemplateColumns: '1.3fr 0.8fr 0.9fr 0.7fr 0.9fr auto',
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
                    <span></span>
                  </div>

                  {history.map((item, idx) => {
                    const tier = getWpmTier(item.wpm || 0);
                    return (
                      <div
                        key={idx}
                        onClick={() => setViewingItem(item)}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1.3fr 0.8fr 0.9fr 0.7fr 0.9fr auto',
                          padding: '10px 12px',
                          fontSize: '0.86rem',
                          background: 'var(--bg-card)',
                          borderRadius: '6px',
                          border: '1px solid var(--border-light)',
                          alignItems: 'center',
                          cursor: 'pointer'
                        }}
                        title="Click to view this session"
                      >
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{item.date}</span>
                        <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                          {tier.emoji} {item.wpm}
                        </span>
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
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShareItem(item);
                          }}
                          title="Share this result"
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            padding: '2px 4px',
                            color: 'var(--text-secondary)'
                          }}
                        >
                          🔗
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              {history.length > 0 ? (
                <button className="btn btn-outline btn-sm" onClick={handleClear} style={{ color: 'var(--stat-red)', borderColor: 'rgba(220, 38, 38, 0.3)' }}>
                  Clear History
                </button>
              ) : <div></div>}
              <button className="btn btn-primary btn-sm" onClick={handleClose}>
                Close
              </button>
            </div>
          </>
        )}
      </div>

      <ShareAchievementModal
        isOpen={!!shareItem}
        onClose={() => setShareItem(null)}
        stats={shareItem ? toShareStats(shareItem) : {}}
      />
    </div>
  );
}