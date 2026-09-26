// Encodes a typing session's real stats into a compact string that can be
// embedded in a URL, so a shared link/QR code needs no backend or database —
// the achievement data travels entirely inside the link itself.

export function encodeAchievement(stats = {}) {
  const payload = {
    wpm: stats.wpm ?? 0,
    accuracy: stats.accuracy ?? 0,
    errors: stats.errors ?? 0,
    correctCount: stats.correctCount ?? 0,
    incorrectCount: stats.incorrectCount ?? 0,
    timeTaken: stats.timeTaken ?? stats.elapsedTime ?? 60,
    difficulty: stats.difficulty || 'Medium',
    date: new Date().toISOString()
  };
  return btoa(JSON.stringify(payload));
}

export function decodeAchievement(encoded) {
  if (!encoded) return null;
  try {
    return JSON.parse(atob(encoded));
  } catch {
    return null;
  }
}

export function buildShareUrl(stats) {
  const encoded = encodeAchievement(stats);
  const url = new URL(window.location.href);
  url.search = '';
  url.searchParams.set('share', encoded);
  return url.toString();
}

// A fun, game-like rank for a WPM score — used to give the results and
// share screens some personality instead of a plain number.
const WPM_TIERS = [
  { min: 0, emoji: '🐢', label: 'Just Getting Started', color: '#94a3b8' },
  { min: 20, emoji: '🚶', label: 'Warming Up', color: '#60a5fa' },
  { min: 40, emoji: '⚡', label: 'Solid Typer', color: '#34d399' },
  { min: 60, emoji: '🔥', label: 'Fast Fingers', color: '#fb923c' },
  { min: 80, emoji: '🚀', label: 'Speed Demon', color: '#a78bfa' },
  { min: 100, emoji: '🏆', label: 'Typing Legend', color: '#f59e0b' }
];

export function getWpmTier(wpm = 0) {
  let tier = WPM_TIERS[0];
  for (const t of WPM_TIERS) {
    if (wpm >= t.min) tier = t;
  }
  return tier;
}