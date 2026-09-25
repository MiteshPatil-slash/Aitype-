import React from 'react';
import Navbar from './Navbar.jsx';

// --- Dynamic fallback helpers -----------------------------------------
// These only run when the real Gemini `/api/analyze` response is missing
// (e.g. the call failed). They build content entirely out of the REAL
// session numbers (accuracy, wpm, errors, mistypedKeys) — never static
// placeholder text — so whatever is shown always reflects what the person
// actually typed in this specific test.

function buildDynamicSuggestions(accuracy, wpm, mistypedKeys) {
  const tips = [];

  if (accuracy < 60) {
    tips.push('Slow down dramatically and focus on hitting the correct key every time, even if it costs speed.');
  } else if (accuracy < 90) {
    tips.push('Prioritize accuracy over speed for a few sessions — speed will follow naturally once accuracy is solid.');
  } else {
    tips.push('Your accuracy is strong — focus on gradually increasing your typing speed from here.');
  }

  if (mistypedKeys.length > 0) {
    const keyList = mistypedKeys.slice(0, 3).map(k => (k === 'space' ? 'space bar' : `"${k}"`)).join(', ');
    tips.push(`Do a few short drills that repeat the ${keyList} key${mistypedKeys.length > 1 ? 's' : ''} until they feel automatic.`);
  }

  if (wpm < 30) {
    tips.push('Keep your fingers anchored on the home row and look at the screen, not the keyboard, while typing.');
  } else if (wpm < 60) {
    tips.push('Try short, focused practice sessions (5–10 minutes) daily to build speed steadily.');
  } else {
    tips.push('Challenge yourself with a harder difficulty to keep pushing your speed further.');
  }

  tips.push('Compare this result to your next test to see if your weak keys are actually improving.');
  return tips;
}

function buildDynamicParagraph(mistypedKeys) {
  // A small sentence bank keyed by letter — lets us assemble a practice
  // paragraph that's weighted toward whatever keys THIS person actually
  // struggled with, instead of a fixed generic sentence.
  const bank = {
    a: 'A quiet afternoon allowed ample time to absorb a variety of articles.',
    b: 'Bright blue birds bounced between branches before breakfast began.',
    c: 'Careful cyclists cautiously crossed the cracked concrete curb.',
    d: 'Determined drivers delivered dozens of documents downtown daily.',
    e: 'Every evening, eager engineers examine each element extremely early.',
    f: 'Fifty fearless firefighters fought a fierce fire near the farm.',
    g: 'Great gardeners gently gather grapes growing near the gate.',
    h: 'Happy hikers hurried home before heavy hail hit the hills.',
    i: 'Inside, an inventive inventor imagined incredible ideas instantly.',
    j: 'Jolly joggers jumped joyfully just before the January journey.',
    k: 'Kind kids kept kites flying above the quiet kitchen window.',
    l: 'Local librarians loaned lovely little leather-bound legends.',
    m: 'Many merchants measured mountains of merchandise mid-morning.',
    n: 'Nine nurses noted nothing new near the north nursery.',
    o: 'Older owls often observe other owls over open orchards.',
    p: 'Patient painters prepared purple paint for the porch project.',
    q: 'Quiet quails quickly questioned every quirky, quaint request.',
    r: 'Rapid runners raced rough roads regardless of rising rain.',
    s: 'Seven sailors safely steered ships through the stormy sea.',
    t: 'Talented teachers taught twelve talkative teenagers together.',
    u: 'Unusual umbrellas usually stay unopened until unexpectedly needed.',
    v: 'Various vendors visited the vibrant valley village on Friday.',
    w: 'Wise women wandered west, watching wild waves wash the wall.',
    x: 'Extra exam boxes were examined next to the exit exhibit.',
    y: 'Young youths yearly yield yellow yarn at the yard sale.',
    z: 'Zealous zookeepers zipped through the zoo with zero delay.',
    space: 'Short, simple words with clear spaces help rebuild a steady typing rhythm.'
  };

  const relevant = mistypedKeys
    .map(k => bank[typeof k === 'string' ? k.toLowerCase() : k])
    .filter(Boolean);

  if (relevant.length === 0) {
    return "Consistent, focused practice with clear, simple sentences is the best way to keep building both your speed and your accuracy over time.";
  }

  return relevant.slice(0, 5).join(' ');
}

export default function AiAnalysisScreen({
  onNavigate,
  theme,
  onToggleTheme,
  onShowAbout,
  onShowHistory,
  stats = {},
  analysis = null,
  onStartNextTest
}) {
  // Every value below is derived from the REAL session stats (computed live
  // during the typing test) unless the real Gemini `analysis` response is
  // present — nothing here is a static/hardcoded placeholder, so whatever
  // shows on screen always reflects the test that was actually just taken.
  const realAccuracy = stats.accuracy ?? 0;
  const realWpm = stats.wpm ?? 0;
  const realErrors = stats.errors ?? 0;
  const realMistypedKeys = Array.isArray(stats.mistypedKeys) ? stats.mistypedKeys : [];

  const activePerformance = analysis?.overallPerformance || (
    realAccuracy >= 95 ? "Excellent" :
    realAccuracy >= 85 ? "Very Good" :
    realAccuracy >= 60 ? "Needs Practice" :
    "Low Accuracy – Slow Down"
  );

  const activeSummary = analysis?.summary || (
    realMistypedKeys.length > 0
      ? `You reached ${realAccuracy}% accuracy at ${realWpm} WPM with ${realErrors} errors. Your most frequently mistyped key${realMistypedKeys.length > 1 ? 's were' : ' was'} "${realMistypedKeys.slice(0, 3).join('", "')}". Slowing down and focusing on ${realMistypedKeys.length > 1 ? 'these keys' : 'this key'} should raise your accuracy quickly.`
      : `You reached ${realAccuracy}% accuracy at ${realWpm} WPM with ${realErrors} errors. Keep practicing consistently to build both speed and accuracy.`
  );

  const rawKeys = analysis?.mistypedKeys && analysis.mistypedKeys.length > 0
    ? analysis.mistypedKeys
    : realMistypedKeys;

  const mistypedList = rawKeys.map(k => typeof k === 'object' ? { key: k.key, count: k.count } : { key: String(k), count: null });

  const commonErrors = analysis?.commonErrors && analysis.commonErrors.length > 0
    ? analysis.commonErrors
    : (realMistypedKeys.length > 0
        ? realMistypedKeys.slice(0, 4).map(k => `Frequently mistyping the "${k === 'space' ? 'space bar' : k}" key`)
        : ['No recurring mistyped keys detected — nice and clean session.']
      );

  const suggestions = analysis?.suggestions && analysis.suggestions.length > 0
    ? analysis.suggestions
    : buildDynamicSuggestions(realAccuracy, realWpm, realMistypedKeys);

  const nextParagraph = analysis?.nextParagraph || buildDynamicParagraph(realMistypedKeys);

  const whyThisParagraph = analysis?.whyThisParagraph || (
    realMistypedKeys.length > 0
      ? `This paragraph repeats the keys you struggled with most in your last session — ${realMistypedKeys.slice(0, 5).join(', ')} — to help you build muscle memory for them.`
      : "This is a fresh paragraph to keep building on your solid accuracy."
  );

  const handleStartNext = () => {
    if (onStartNextTest) {
      onStartNextTest(nextParagraph);
    } else {
      onNavigate(2);
    }
  };

  return (
    <div className="screen-wrapper">
      <Navbar
        activeScreen={4}
        onNavigate={onNavigate}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onShowAbout={onShowAbout}
        onShowHistory={onShowHistory}
      />

      <div className="screen-content ai-analysis-content">
        {/* Back and Title Header */}
        <div className="sub-nav-row ai-subnav">
          <button className="btn-subnav-back" onClick={() => onNavigate(3)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span>Back</span>
          </button>

          <div className="ai-header-badge">
            <div className="ai-sparkle-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#2d6a4f" stroke="#2d6a4f" strokeWidth="1.5">
                <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z"/>
              </svg>
              <h2>AI Analysis</h2>
            </div>
            <p className="ai-subtitle">Here's your typing analysis and personalized feedback from Gemini AI.</p>
          </div>
        </div>

        {/* Two-Column Grid */}
        <div className="ai-two-col-grid">
          {/* Left Column */}
          <div className="ai-left-col">
            {/* Overall Performance */}
            <div className="ai-panel-card">
              <h4 className="card-heading">Overall Performance</h4>
              <div className="overall-perf-body">
                <div className="mini-donut-wrapper">
                  <svg viewBox="0 0 80 80" className="mini-donut-svg">
                    <circle cx="40" cy="40" r="30" className="donut-ring-base"></circle>
                    <circle
                      cx="40"
                      cy="40"
                      r="30"
                      className="donut-ring-green"
                      strokeDasharray={`${(realAccuracy / 100) * 188.5} 188.5`}
                      strokeDashoffset="0"
                    ></circle>
                  </svg>
                  <span className="mini-donut-val">{realAccuracy}%</span>
                </div>
                <div className="perf-text-block">
                  <span className="perf-rating-badge">{activePerformance}</span>
                  <p className="perf-comment">
                    {activeSummary}
                  </p>
                </div>
              </div>
            </div>

            {/* Frequently Mistyped Keys */}
            <div className="ai-panel-card">
              <h4 className="card-heading">Frequently Mistyped Keys</h4>
              <div className="mistyped-keys-row">
                {mistypedList.map((item, idx) => (
                  <span
                    key={idx}
                    className="key-box"
                    title={item.count ? `${item.count} mistakes` : 'Mistyped key'}
                  >
                    {item.key}
                  </span>
                ))}
              </div>
            </div>

            {/* Common Error Patterns */}
            <div className="ai-panel-card">
              <h4 className="card-heading">Common Error Patterns</h4>
              <ul className="pattern-list">
                {commonErrors.map((err, idx) => (
                  <li key={idx}>
                    <span className="pattern-dot"></span>
                    <span>{err}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column */}
          <div className="ai-right-col">
            {/* Personalized Suggestions */}
            <div className="ai-panel-card">
              <div className="panel-header-with-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2d6a4f" strokeWidth="2">
                  <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z"/>
                </svg>
                <h4 className="card-heading">Personalized Suggestions</h4>
              </div>
              <ul className="suggestions-list">
                {suggestions.map((sug, idx) => (
                  <li key={idx}>
                    <span className="check-icon">✓</span>
                    <span>{sug}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* AI Generated Next Paragraph */}
            <div className="ai-panel-card ai-generated-card">
              <div className="panel-header-with-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2d6a4f" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
                <div>
                  <h4 className="card-heading">AI Generated Next Paragraph</h4>
                  <p className="card-sub-hint">
                    {whyThisParagraph}
                  </p>
                </div>
              </div>

              <div className="ai-text-box">
                {nextParagraph}
              </div>

              <button className="btn btn-primary btn-full-width" onClick={handleStartNext}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                <span>Start Next Test →</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}