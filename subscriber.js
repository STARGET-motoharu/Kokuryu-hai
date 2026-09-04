(() => {
  const cfg = window.KOKURYU_SUBSCRIBERS || {};
  const goal = Number(cfg.goal || 500);
  const countEl = document.getElementById('subscriberCount');
  const barEl = document.getElementById('subscriberBar');
  const pctEl = document.getElementById('subscriberPercent');
  const remainEl = document.getElementById('subscriberRemaining');
  const statusEl = document.getElementById('subscriberStatus');
  if (!countEl || !barEl || !pctEl || !remainEl || !statusEl) return;

  const render = (count, live, updatedAt) => {
    count = Math.max(0, Number(count) || 0);
    const pct = goal > 0 ? Math.min(100, (count / goal) * 100) : 0;
    const remaining = Math.max(0, goal - count);
    countEl.textContent = new Intl.NumberFormat('ja-JP').format(count);
    pctEl.textContent = `${pct.toFixed(1)}%`;
    remainEl.textContent = new Intl.NumberFormat('ja-JP').format(remaining);
    barEl.style.width = `${pct}%`;
    statusEl.textContent = live ? 'LIVE / YOUTUBE DATA API' : `LAST KNOWN / ${updatedAt || 'MANUAL'}`;
  };

  const fallback = () => render(cfg.fallbackCount || 0, false, cfg.fallbackUpdatedAt);
  if (!cfg.endpoint) { fallback(); return; }

  const cacheKey = 'kokuryuSubscriberCacheV1';
  const maxAge = Math.max(1, Number(cfg.cacheMinutes || 30)) * 60 * 1000;
  try {
    const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
    if (cached && Date.now() - cached.savedAt < maxAge && Number.isFinite(Number(cached.count))) {
      render(cached.count, true, cached.updatedAt);
      return;
    }
  } catch (_) {}

  fetch(cfg.endpoint, { headers: { 'Accept': 'application/json' }, cache: 'no-store' })
    .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
    .then(data => {
      const count = Number(data.subscriberCount ?? data.count);
      if (!Number.isFinite(count)) throw new Error('subscriberCount missing');
      const updatedAt = data.updatedAt || new Date().toISOString();
      render(count, true, updatedAt);
      try { localStorage.setItem(cacheKey, JSON.stringify({ count, updatedAt, savedAt: Date.now() })); } catch (_) {}
    })
    .catch(fallback);
})();
