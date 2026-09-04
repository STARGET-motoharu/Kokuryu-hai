(() => {
  const cfg = window.KOKURYU_BGM || {};
  const tracks = Array.isArray(cfg.tracks) ? cfg.tracks : [];
  const SESSION_KEY = 'kokuryu.sound.v3';
  const DEFAULT_VOLUME = 0.18;
  const clamp = (n,min,max)=>Math.min(max,Math.max(min,n));
  let prefs = {muted:false, volume:DEFAULT_VOLUME};
  try { prefs = {...prefs, ...(JSON.parse(sessionStorage.getItem(SESSION_KEY)||'{}'))}; } catch(e) {}
  prefs.volume = clamp(Number(prefs.volume)||DEFAULT_VOLUME,0,1);

  const audio = new Audio();
  audio.preload = 'metadata';
  audio.playsInline = true;
  audio.loop = tracks.length === 1;
  let bag = [], current = -1, blocked = false;

  const save = () => { try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(prefs)); } catch(e) {} };
  const titleFor = () => current >= 0 && tracks[current] ? (tracks[current].title || 'Untitle') : (tracks.length ? 'Untitle' : 'NO BGM');
  const gainFor = () => current >= 0 && tracks[current] ? clamp(Number(tracks[current].gain)||1,0.5,1.25) : 1;
  const applyVolume = () => { audio.volume = clamp(prefs.volume * gainFor(),0,1); };

  const shuffleBag = () => {
    const ids = tracks.map((_,i)=>i);
    for(let i=ids.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [ids[i],ids[j]]=[ids[j],ids[i]]; }
    if(ids.length>1 && ids[0]===current) [ids[0],ids[1]]=[ids[1],ids[0]];
    bag = ids;
  };
  const nextIndex = () => {
    if(!tracks.length) return -1;
    if(tracks.length===1) return 0;
    if(!bag.length) shuffleBag();
    return bag.shift();
  };

  if(!tracks.length) return;

  const dock = document.createElement('div');
  dock.className = 'soundDock';
  dock.innerHTML = `<button class="soundToggle" type="button" aria-label="BGM 再生・停止">▶</button><div class="soundMeta"><small>${cfg.label || 'KOKURYU SOUND'}</small><span class="soundTrack">Untitle</span></div><input class="soundMiniVolume" type="range" min="0" max="100" step="1" aria-label="BGM音量">`;
  document.body.appendChild(dock);
  const toggle = dock.querySelector('.soundToggle');
  const dockTrack = dock.querySelector('.soundTrack');
  const miniVolume = dock.querySelector('.soundMiniVolume');
  miniVolume.value = Math.round(prefs.volume*100);

  const updateDock = () => {
    dockTrack.textContent = titleFor();
    const playing = !audio.paused && !!audio.src && !prefs.muted;
    toggle.textContent = prefs.muted ? '×' : (playing ? 'Ⅱ' : '▶');
    toggle.setAttribute('aria-label', prefs.muted ? 'BGMをオンにする' : (playing ? 'BGMを一時停止' : 'BGMを再生'));
    dock.classList.toggle('is-muted', prefs.muted);
    dock.classList.toggle('is-blocked', blocked);
  };

  const setTrack = (idx) => {
    if(idx<0 || !tracks[idx]) return;
    current = idx;
    audio.src = tracks[idx].src;
    audio.loop = tracks.length === 1;
    applyVolume();
    updateDock();
  };
  const playCurrent = async () => {
    if(!tracks.length || prefs.muted) { updateDock(); return; }
    if(current<0) setTrack(nextIndex());
    try { await audio.play(); blocked = false; }
    catch(e) { blocked = true; }
    updateDock();
  };
  const playNext = async () => {
    if(!tracks.length || prefs.muted) return;
    setTrack(nextIndex());
    await playCurrent();
  };

  audio.addEventListener('ended', () => {
    if(prefs.muted || tracks.length===1) return;
    playNext();
  });
  audio.addEventListener('play', updateDock);
  audio.addEventListener('pause', updateDock);

  toggle.addEventListener('click', async () => {
    if(prefs.muted){ prefs.muted=false; save(); await playCurrent(); return; }
    if(audio.paused) await playCurrent(); else audio.pause();
  });
  miniVolume.addEventListener('input', e => {
    prefs.volume = clamp(Number(e.target.value)/100,0,1);
    prefs.muted = prefs.volume <= 0;
    applyVolume(); save(); updateDock();
    if(!prefs.muted && audio.paused) playCurrent();
  });

  setTrack(nextIndex());
  if(!prefs.muted) playCurrent();
  updateDock();

  // If autoplay is blocked, the first ordinary click on the page retries playback.
  const retry = () => { if(blocked && !prefs.muted) playCurrent(); };
  document.addEventListener('pointerdown', retry, {once:true, passive:true});
})();
