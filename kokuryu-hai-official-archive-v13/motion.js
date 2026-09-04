(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const progress = document.createElement('div');
  progress.id = 'scrollProgress';
  document.body.appendChild(progress);
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
  };
  addEventListener('scroll', updateProgress, {passive:true}); updateProgress();

  const revealSelectors = ['.sectionHead','.origin > *','.latestCopy','.latestLogo','.road > *','.milestone','.cup','.championItem','.dataCard','.galleryItem','.faqItem','.noticeCard','.archiveCard','.hostGrid > *','.teamCard','.team','.resultBlock','.champion','.rulesGrid article','.rule','.schedule article','.mediaGrid a','.nextTournament > *'];
  const els = [...document.querySelectorAll(revealSelectors.join(','))];
  els.forEach((el,i)=>{ el.classList.add('motion-reveal'); el.style.setProperty('--reveal-delay', `${Math.min(i%5,4)*70}ms`); });
  if (!reduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target)}}),{threshold:.12,rootMargin:'0px 0px -5%'});
    els.forEach(el=>io.observe(el));
  } else els.forEach(el=>el.classList.add('is-visible'));

  const cards=[...document.querySelectorAll('.latestCard,.cup,.championItem,.dataCard,.galleryItem,.faqItem,.archiveCard,.social,.teamCard,.team,.resultBlock,.rule,.mediaGrid a')];
  cards.forEach(card=>{
    card.classList.add('motion-card');
    if(reduce) return;
    card.addEventListener('pointermove',e=>{const r=card.getBoundingClientRect();card.style.setProperty('--mx',`${e.clientX-r.left}px`);card.style.setProperty('--my',`${e.clientY-r.top}px`)});
  });

  // subtle horizontal auto-drift for gallery, paused on interaction
  const rail=document.querySelector('.galleryRail');
  if(rail && !reduce){let dir=1,paused=false,last=performance.now();rail.addEventListener('pointerenter',()=>paused=true);rail.addEventListener('pointerleave',()=>paused=false);rail.addEventListener('touchstart',()=>paused=true,{passive:true});
    const tick=(t)=>{if(!paused && t-last>35){rail.scrollLeft+=.35*dir;last=t;if(rail.scrollLeft+rail.clientWidth>=rail.scrollWidth-2)dir=-1;if(rail.scrollLeft<=1)dir=1}requestAnimationFrame(tick)};requestAnimationFrame(tick)}

  // KOKURYU custom crosshair cursor (desktop / fine pointer only)
  if (matchMedia('(pointer:fine)').matches) {
    const ring=document.createElement('div'); ring.className='kokuryuCursor';
    const dot=document.createElement('div'); dot.className='kokuryuCursorDot';
    document.body.append(ring,dot);
    let tx=-100,ty=-100,rx=-100,ry=-100;
    addEventListener('pointermove',e=>{tx=e.clientX;ty=e.clientY;dot.style.transform=`translate3d(${tx-2}px,${ty-2}px,0)`},{passive:true});
    const cursorTick=()=>{rx+=(tx-rx)*.2;ry+=(ty-ry)*.2;ring.style.transform=`translate3d(${rx-18}px,${ry-18}px,0)`;requestAnimationFrame(cursorTick)};requestAnimationFrame(cursorTick);
    document.addEventListener('pointerover',e=>ring.classList.toggle('is-link',!!e.target.closest('a,button,[data-lightbox]')));
  }

  // Gallery image popup
  const lightbox=document.getElementById('galleryLightbox');
  if(lightbox){
    const img=document.getElementById('lightboxImage'); const caption=document.getElementById('lightboxCaption'); const credit=document.getElementById('lightboxCredit');
    const close=()=>{lightbox.classList.remove('is-open');lightbox.setAttribute('aria-hidden','true');img.removeAttribute('src');if(credit)credit.textContent='';document.documentElement.style.overflow=''};
    document.querySelectorAll('[data-lightbox]').forEach(el=>el.addEventListener('click',()=>{img.src=el.dataset.lightbox;img.alt=el.dataset.caption||'';caption.textContent=el.dataset.caption||'';if(credit)credit.textContent=el.dataset.credit||'';lightbox.classList.add('is-open');lightbox.setAttribute('aria-hidden','false');document.documentElement.style.overflow='hidden'}));
    lightbox.querySelector('.lightboxClose')?.addEventListener('click',close);
    lightbox.addEventListener('click',e=>{if(e.target===lightbox)close()});
    addEventListener('keydown',e=>{if(e.key==='Escape'&&lightbox.classList.contains('is-open'))close()});
  }

})();