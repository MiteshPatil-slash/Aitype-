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