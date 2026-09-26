import React, { useState } from 'react';
import { buildShareUrl, getWpmTier } from '../utils/achievementShare.js';

export default function ShareAchievementModal({ isOpen, onClose, stats = {} }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = buildShareUrl(stats);
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(shareUrl)}`;
  const tier = getWpmTier(stats.wpm ?? 0);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can be blocked in some browsers; the link is still
      // visible in the input for the person to copy manually.
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🔗 Share Your Achievement</h3>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body" style={{ textAlign: 'center' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '999px',
              fontSize: '0.85rem',
              fontWeight: 600,
              background: `${tier.color}22`,
              color: tier.color,
              border: `1px solid ${tier.color}55`,
              marginBottom: '12px'
            }}
          >
            <span>{tier.emoji}</span>
            <span>{tier.label}</span>
          </span>

          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Anyone who scans this code (or opens the link) will see your ⚡ {stats.wpm ?? 0} WPM
            result at 🎯 {stats.accuracy ?? 0}% accuracy.
          </p>

          <img
            src={qrImageUrl}
            alt="QR code linking to your typing achievement"
            width={220}
            height={220}
            style={{
              borderRadius: '10px',
              border: '1px solid var(--border-light)',
              background: '#fff',
              padding: '8px'
            }}
          />

          <div style={{ display: 'flex', gap: '8px', marginTop: '18px' }}>
            <input
              type="text"
              readOnly
              value={shareUrl}
              onClick={(e) => e.target.select()}
              style={{
                flex: 1,
                minWidth: 0,
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem'
              }}
            />
            <button className="btn btn-primary btn-sm" onClick={handleCopy}>
              {copied ? '✅ Copied!' : '📋 Copy Link'}
            </button>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}