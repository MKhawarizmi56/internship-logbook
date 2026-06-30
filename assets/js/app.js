(() => {
  'use strict';

  const entries = Array.isArray(window.LOGBOOK_ENTRIES) ? window.LOGBOOK_ENTRIES : [];
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const state = {
    section: 'dashboard',
    theme: localStorage.getItem('mls-theme') || 'dark',
    lang: localStorage.getItem('mls-lang') || 'en',
    motion: localStorage.getItem('mls-motion') || 'on',
    density: localStorage.getItem('mls-density') || 'comfortable',
    view: 'timeline',
    search: '',
    week: 'all',
    status: 'all',
    focus: 'all',
    tag: 'all',
    bookmarksOnly: false,
    expandedAll: false,
    xp: Number(localStorage.getItem('mls-xp') || '0'),
    bookmarks: new Set(JSON.parse(localStorage.getItem('mls-bookmarks') || '[]'))
  };

  const focusRules = {
    system: ['system', 'hepa pro', 'hepa g-fund', 'hepa qms', 'code', 'backend', 'database', 'deploy', 'deployment', 'prototype', 'webhook'],
    design: ['poster', 'design', 'canva', 'slide', 'certificate', 'visual'],
    technical: ['printer', 'driver', 'technical', 'troubleshoot', 'server', 'backup', 'cict', 'it officer'],
    event: ['programme', 'program', 'celebration', 'our day', 'hari raya', 'kuca suro', 'meeting', 'gotong'],
    documentation: ['proposal', 'documentation', 'document', 'excel', 'word', 'report', 'file']
  };

  const quotes = [
    'Small progress, repeated daily, becomes proof.',
    'Build the system. Document the journey. Present the impact.',
    'The best portfolio is the one that shows real work clearly.',
    'Every solved bug is a future explanation made easier.',
    'Clarity turns ordinary tasks into professional evidence.',
    'A good logbook does not only record work; it shows growth.'
  ];

  const projects = [
    {
      name: 'HEPA PRO',
      status: 'Developed & refined',
      desc: 'Performance reporting system work involving workflow correction, data structure, UI refinement and deployment preparation.',
      tags: ['System', 'KPI', 'Reporting', 'UMK'],
      metrics: ['QMS-ready structure', 'Data-driven', 'Admin workflow']
    },
    {
      name: 'HEPA G-FUND',
      status: 'Published milestone',
      desc: 'Funding and contribution management system developed during internship and prepared for actual institutional use under HEPA environment.',
      tags: ['Funding', 'Database', 'Deployment', 'CICT'],
      metrics: ['Relaunch phase', 'Real data testing', 'Technical follow-up']
    },
    {
      name: 'HEPA QMS',
      status: 'Prototype & flow refinement',
      desc: 'Quality management related system prototype with improved flow, stakeholder feedback, and practical user introduction planning.',
      tags: ['QMS', 'Prototype', 'Flow', 'Training'],
      metrics: ['User flow', 'Review-ready', 'Briefing plan']
    }
  ];

  const quizQuestions = [
    { q: 'When a task suddenly changes, what do you usually do?', a: ['Plan again quickly', 'Ask for examples', 'Try and fix as I go'], r: ['System Builder', 'Careful Coordinator', 'Creative Problem Solver'] },
    { q: 'Your strongest internship energy?', a: ['Building systems', 'Designing materials', 'Helping people'], r: ['System Builder', 'Creative Problem Solver', 'Reliable Supporter'] },
    { q: 'A bug appears before presentation. What now?', a: ['Debug step-by-step', 'Document workaround', 'Ask technical officer'], r: ['System Builder', 'Reliable Supporter', 'Careful Coordinator'] }
  ];

  const escapeHTML = (value) => String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  const slug = (entry) => `${entry.date}-${entry.title}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const weekNumber = (week) => Number((String(week).match(/\d+/) || ['999'])[0]);
  const parseDate = (dateStr) => new Date(dateStr);
  const sortedEntries = () => [...entries].sort((a, b) => weekNumber(a.week) - weekNumber(b.week) || parseDate(a.date) - parseDate(b.date));
  const unique = (arr) => [...new Set(arr.filter(Boolean))];

  function saveState(){
    localStorage.setItem('mls-theme', state.theme);
    localStorage.setItem('mls-lang', state.lang);
    localStorage.setItem('mls-motion', state.motion);
    localStorage.setItem('mls-density', state.density);
    localStorage.setItem('mls-xp', String(state.xp));
    localStorage.setItem('mls-bookmarks', JSON.stringify([...state.bookmarks]));
  }

  function toast(message){
    const box = $('#toast');
    if(!box) return;
    box.textContent = message;
    box.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => box.classList.remove('show'), 2200);
  }

  function addXP(amount){
    state.xp = Math.max(0, state.xp + amount);
    saveState();
    renderXP();
  }

  function renderXP(){
    const level = Math.floor(state.xp / 100) + 1;
    const current = state.xp % 100;
    const levelLabel = $('#levelLabel');
    const xpText = $('#xpText');
    const xpFill = $('#xpFill');
    if(levelLabel) levelLabel.textContent = `Level ${level}`;
    if(xpText) xpText.textContent = `${current} / 100 EXP`;
    if(xpFill) xpFill.style.width = `${current}%`;
  }

  function applyUIState(){
    document.body.dataset.theme = state.theme;
    document.body.dataset.lang = state.lang;
    document.body.dataset.motion = state.motion;
    document.body.dataset.density = state.density;
    const themeBtn = $('#themeBtn');
    const langBtn = $('#langBtn');
    const motionBtn = $('#motionBtn');
    const densityBtn = $('#densityBtn');
    if(themeBtn) themeBtn.textContent = state.theme === 'dark' ? 'Dark' : 'Light';
    if(langBtn) langBtn.textContent = state.lang === 'en' ? 'EN' : 'BM';
    if(motionBtn) motionBtn.textContent = state.motion === 'on' ? (state.lang === 'en' ? 'Motion: On' : 'Gerakan: On') : (state.lang === 'en' ? 'Motion: Off' : 'Gerakan: Off');
    if(densityBtn) densityBtn.textContent = state.density === 'comfortable' ? (state.lang === 'en' ? 'Comfort' : 'Selesa') : 'Compact';
    $$('[data-en]').forEach(el => {
      const text = el.dataset[state.lang === 'ms' ? 'ms' : 'en'];
      if(text) el.textContent = text;
    });
    saveState();
  }

  function navigate(section){
    state.section = section;
    $$('.section').forEach(sec => sec.classList.toggle('active', sec.id === section));
    $$('.nav-link').forEach(btn => btn.classList.toggle('active', btn.dataset.section === section));
    const pageTitle = $('#pageTitle');
    const pageKicker = $('#pageKicker');
    const active = $(`.nav-link[data-section="${section}"] b`);
    if(pageTitle && active) pageTitle.textContent = active.textContent;
    if(pageKicker) pageKicker.textContent = section === 'logbook' ? 'Core Record' : section === 'dashboard' ? 'Overview' : 'Workspace';
    $('#sidebar')?.classList.remove('open');
    if(section === 'logbook') addXP(3);
    if(section === 'games') addXP(2);
    window.scrollTo({top:0, behavior:'smooth'});
  }

  function initNav(){
    $$('.nav-link').forEach(btn => btn.addEventListener('click', () => navigate(btn.dataset.section)));
    $$('[data-jump]').forEach(btn => btn.addEventListener('click', () => navigate(btn.dataset.jump)));
    $('#menuBtn')?.addEventListener('click', () => $('#sidebar')?.classList.toggle('open'));
    $('#themeBtn')?.addEventListener('click', () => { state.theme = state.theme === 'dark' ? 'light' : 'dark'; applyUIState(); });
    $('#langBtn')?.addEventListener('click', () => { state.lang = state.lang === 'en' ? 'ms' : 'en'; applyUIState(); renderAll(); });
    $('#motionBtn')?.addEventListener('click', () => { state.motion = state.motion === 'on' ? 'off' : 'on'; applyUIState(); });
    $('#densityBtn')?.addEventListener('click', () => { state.density = state.density === 'comfortable' ? 'compact' : 'comfortable'; applyUIState(); });
    $('#spriteBtn')?.addEventListener('click', () => navigate('guide'));
  }

  function initWelcome(){
    const overlay = $('#welcomeOverlay');
    const video = $('#welcomeVideo');
    const visual = $('.welcome-visual');
    const inlineVideo = $('#inlineWelcomeVideo');
    const inlineBox = $('#inlineVideoBox');

    const showVideo = (vid, box) => {
      if(box) box.classList.add('has-video');
      if(vid){ vid.muted = true; vid.currentTime = 0; vid.play().catch(() => {}); }
    };
    video?.addEventListener('loadedmetadata', () => showVideo(video, visual));
    video?.addEventListener('error', () => visual?.classList.remove('has-video'));
    inlineVideo?.addEventListener('loadedmetadata', () => inlineBox?.classList.add('has-video'));
    inlineVideo?.addEventListener('error', () => inlineBox?.classList.remove('has-video'));

    const closeWelcome = () => {
      overlay?.classList.add('hide');
      video?.pause();
      localStorage.setItem('mls-welcomed', 'yes');
      addXP(5);
    };
    $('#skipWelcomeBtn')?.addEventListener('click', closeWelcome);
    $('#startExperienceBtn')?.addEventListener('click', closeWelcome);
    $('#openWelcomeBtn')?.addEventListener('click', () => { overlay?.classList.remove('hide'); showVideo(video, visual); });
    $('#playInlineVideo')?.addEventListener('click', () => {
      if(inlineVideo && inlineBox?.classList.contains('has-video')){
        inlineVideo.muted = false;
        inlineVideo.controls = true;
        inlineVideo.play().catch(() => {});
      }else{
        overlay?.classList.remove('hide');
      }
    });
    if(localStorage.getItem('mls-welcomed') === 'yes') overlay?.classList.add('hide');
  }

  function renderClock(){
    const now = new Date();
    const time = now.toLocaleTimeString('en-MY', {hour:'2-digit', minute:'2-digit', second:'2-digit'});
    const date = now.toLocaleDateString(state.lang === 'ms' ? 'ms-MY' : 'en-MY', {weekday:'long', year:'numeric', month:'long', day:'numeric'});
    $('#clockTime') && ($('#clockTime').textContent = time);
    $('#clockDate') && ($('#clockDate').textContent = date);
  }

  function initClock(){
    renderClock();
    setInterval(renderClock, 1000);
    let quoteIndex = 0;
    setInterval(() => {
      quoteIndex = (quoteIndex + 1) % quotes.length;
      const box = $('#quoteBox');
      if(box) box.textContent = quotes[quoteIndex];
    }, 6500);
  }

  function classifyFocus(entry){
    const text = [entry.title, entry.challenge, entry.solution, entry.reflection, ...(entry.tasks||[]), ...(entry.tools||[]), ...(entry.skills||[])].join(' ').toLowerCase();
    return Object.entries(focusRules).filter(([, keys]) => keys.some(key => text.includes(key))).map(([name]) => name);
  }

  function getFilteredEntries(){
    const term = state.search.toLowerCase().trim();
    return sortedEntries().filter(entry => {
      const text = [entry.date, entry.week, entry.day, entry.title, entry.status, entry.challenge, entry.solution, entry.reflection, ...(entry.tasks||[]), ...(entry.tools||[]), ...(entry.skills||[])].join(' ').toLowerCase();
      const id = slug(entry);
      const focuses = classifyFocus(entry);
      return (!term || text.includes(term)) &&
        (state.week === 'all' || entry.week === state.week) &&
        (state.status === 'all' || entry.status === state.status) &&
        (state.focus === 'all' || focuses.includes(state.focus)) &&
        (state.tag === 'all' || text.includes(state.tag)) &&
        (!state.bookmarksOnly || state.bookmarks.has(id));
    });
  }

  function renderStats(){
    const data = sortedEntries();
    const completed = data.filter(e => e.status === 'Completed').length;
    const weeks = unique(data.map(e => e.week)).length;
    const skills = unique(data.flatMap(e => e.skills || [])).length;
    const systems = data.filter(e => classifyFocus(e).includes('system')).length;
    const cards = [
      ['Total Entries', data.length, 'daily records'],
      ['Completed Days', completed, 'verified work'],
      ['Weeks Recorded', weeks, 'training weeks'],
      ['System Days', systems, 'development focus']
    ];
    const root = $('#statGrid');
    if(!root) return;
    root.innerHTML = cards.map(([label, value, sub]) => `<article class="stat glass"><small>${escapeHTML(label)}</small><strong>${escapeHTML(value)}</strong><span>${escapeHTML(sub)}</span></article>`).join('');
  }

  function renderWeekOptions(){
    const weeks = unique(sortedEntries().map(e => e.week));
    const weekFilter = $('#weekFilter');
    if(weekFilter) weekFilter.innerHTML = `<option value="all">All Weeks</option>` + weeks.map(w => `<option value="${escapeHTML(w)}">${escapeHTML(w)}</option>`).join('');
    const statuses = unique(sortedEntries().map(e => e.status));
    const statusFilter = $('#statusFilter');
    if(statusFilter) statusFilter.innerHTML = `<option value="all">All Status</option>` + statuses.map(s => `<option value="${escapeHTML(s)}">${escapeHTML(s)}</option>`).join('');
  }

  function renderWeekMap(){
    const groups = {};
    sortedEntries().forEach(e => { groups[e.week] = (groups[e.week] || 0) + 1; });
    const root = $('#weekMap');
    if(root) root.innerHTML = Object.entries(groups).map(([week, count]) => `<button class="week-pill" data-week="${escapeHTML(week)}"><strong>${escapeHTML(week)}</strong><span>${count} entries</span></button>`).join('');
    $('#weekCountLabel') && ($('#weekCountLabel').textContent = `${Object.keys(groups).length} weeks`);
    $$('.week-pill').forEach(btn => btn.addEventListener('click', () => { state.week = btn.dataset.week; $('#weekFilter').value = state.week; navigate('logbook'); renderEntries(); }));
  }

  function renderSkillBars(){
    const counts = {};
    sortedEntries().flatMap(e => e.skills || []).forEach(skill => {
      const key = String(skill).toLowerCase();
      counts[key] = (counts[key] || 0) + 1;
    });
    const top = Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,8);
    const max = top[0]?.[1] || 1;
    const root = $('#skillBars');
    if(root) root.innerHTML = top.map(([skill,count]) => `
      <div class="skill-item">
        <div class="skill-top"><span>${escapeHTML(skill)}</span><b>${count}</b></div>
        <div class="skill-track"><i style="width:${Math.max(12, (count/max)*100)}%"></i></div>
      </div>
    `).join('');
  }

  function renderMilestones(){
    const milestones = [
      ['HEPA G-FUND', 'System relaunch, real-data testing, CICT technical follow-up and publication preparation.'],
      ['HEPA PRO', 'Reporting workflow, data structure, interface refinement and system readiness.'],
      ['HEPA QMS', 'New system planning, prototype, flow correction and user introduction preparation.']
    ];
    const root = $('#milestones');
    if(root) root.innerHTML = milestones.map(([title, desc]) => `<article class="milestone"><b>${escapeHTML(title)}</b><p>${escapeHTML(desc)}</p></article>`).join('');
  }

  function renderTags(){
    const tags = ['system','poster','CICT','proposal','Excel','driver','HEPA G-FUND','HEPA PRO','HEPA QMS','Our Day'];
    const root = $('#tagCloud');
    if(!root) return;
    root.innerHTML = tags.map(tag => `<button class="pill ${state.tag === tag.toLowerCase() ? 'active' : ''}" data-tag="${escapeHTML(tag.toLowerCase())}">${escapeHTML(tag)}</button>`).join('');
    $$('[data-tag]', root).forEach(btn => btn.addEventListener('click', () => { state.tag = state.tag === btn.dataset.tag ? 'all' : btn.dataset.tag; renderEntries(); renderTags(); }));
  }

  function evidenceHTML(entry){
    const src = escapeHTML(entry.image || '');
    if(!src) return `<div class="evidence-placeholder">No evidence image inserted yet.</div>`;
    return `<img src="${src}" alt="${escapeHTML(entry.title)}" loading="lazy" onerror="this.remove(); this.parentElement.innerHTML='<div class=&quot;evidence-placeholder&quot;>Image not found. Put the file in the images folder.</div>'">`;
  }

  function renderEntryCard(entry, index){
    const id = slug(entry);
    const bookmarked = state.bookmarks.has(id);
    const month = String(entry.date).split(' ').slice(1).join(' ');
    const day = String(entry.date).split(' ')[0];
    const openClass = state.expandedAll || index === 0 ? 'open' : '';
    const timelineClass = state.view === 'timeline' ? 'timeline' : '';
    const taskList = (entry.tasks || []).map(task => `<li>${escapeHTML(task)}</li>`).join('');
    const tools = (entry.tools || []).join(', ');
    const skills = (entry.skills || []).join(', ');
    return `
      <article class="entry-card glass ${timelineClass} ${openClass}" data-entry-id="${id}">
        <div class="date-box"><div><strong>${escapeHTML(day)}</strong><span>${escapeHTML(month)}</span></div></div>
        <div class="entry-main">
          <div class="entry-head">
            <div class="entry-title">
              <h3>${escapeHTML(entry.title)}</h3>
              <p>${escapeHTML(entry.day)} • ${escapeHTML(entry.date)} • ${escapeHTML(entry.week)}</p>
            </div>
            <span class="status">${escapeHTML(entry.status)}</span>
          </div>
          <div class="entry-actions">
            <button class="mini-btn toggle-entry">Read</button>
            <button class="mini-btn focus-entry">Focus</button>
            <button class="mini-btn bookmark-entry">${bookmarked ? '★ Saved' : '☆ Save'}</button>
            <button class="mini-btn copy-entry">Copy</button>
          </div>
          <div class="entry-details">
            <div class="task-card"><h4>Tasks Performed</h4><ul>${taskList}</ul></div>
            <div class="info-card">
              <h4>Learning Record</h4>
              <div class="info-grid">
                <div><strong>Tools / Software</strong>${escapeHTML(tools)}</div>
                <div><strong>Skills Learned</strong>${escapeHTML(skills)}</div>
                <div><strong>Challenge</strong>${escapeHTML(entry.challenge)}</div>
                <div><strong>Solution</strong>${escapeHTML(entry.solution)}</div>
                <div><strong>Reflection</strong>${escapeHTML(entry.reflection)}</div>
              </div>
              <button class="evidence" type="button">${evidenceHTML(entry)}</button>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  function renderEntries(){
    const data = getFilteredEntries();
    const root = $('#entriesContainer');
    const meta = $('#entryMetaLine');
    if(!root) return;
    root.className = `entries ${state.view === 'cards' ? 'cards-view' : ''} ${state.view === 'evidence' ? 'evidence-view' : ''}`;
    if(meta) meta.textContent = `${data.length} entries shown` + (state.week !== 'all' ? ` • ${state.week}` : '');
    if(!data.length){
      root.innerHTML = `<article class="panel glass"><p>No entries found. Try reset filters.</p></article>`;
      return;
    }
    root.innerHTML = data.map(renderEntryCard).join('');
    bindEntryButtons(data);
  }

  function entryText(entry){
    return `${entry.date} - ${entry.title}\n\nTasks:\n${(entry.tasks||[]).map(t=>`- ${t}`).join('\n')}\n\nTools: ${(entry.tools||[]).join(', ')}\nSkills: ${(entry.skills||[]).join(', ')}\nChallenge: ${entry.challenge}\nSolution: ${entry.solution}\nReflection: ${entry.reflection}`;
  }

  function bindEntryButtons(currentData){
    $$('.entry-card').forEach(card => {
      const id = card.dataset.entryId;
      const entry = currentData.find(e => slug(e) === id) || entries.find(e => slug(e) === id);
      card.querySelector('.toggle-entry')?.addEventListener('click', () => { card.classList.toggle('open'); addXP(1); });
      card.querySelector('.bookmark-entry')?.addEventListener('click', () => {
        if(state.bookmarks.has(id)) state.bookmarks.delete(id); else state.bookmarks.add(id);
        saveState(); renderEntries(); toast('Bookmark updated');
      });
      card.querySelector('.copy-entry')?.addEventListener('click', async () => {
        await navigator.clipboard.writeText(entryText(entry)).catch(()=>{});
        toast('Entry copied'); addXP(2);
      });
      card.querySelector('.focus-entry')?.addEventListener('click', () => openEntryModal(entry));
      card.querySelector('.evidence')?.addEventListener('click', () => openMediaModal(entry.image, entry.title));
    });
  }

  function openEntryModal(entry){
    const dialog = $('#entryDialog');
    if(!dialog) return;
    dialog.innerHTML = `<div class="modal-body"><button class="modal-close">Close</button><h2>${escapeHTML(entry.title)}</h2><p>${escapeHTML(entry.day)} • ${escapeHTML(entry.date)} • ${escapeHTML(entry.week)}</p><div class="task-card"><h4>Tasks</h4><ul>${(entry.tasks||[]).map(t=>`<li>${escapeHTML(t)}</li>`).join('')}</ul></div><div class="info-grid" style="margin-top:14px"><div><strong>Tools</strong>${escapeHTML((entry.tools||[]).join(', '))}</div><div><strong>Skills</strong>${escapeHTML((entry.skills||[]).join(', '))}</div><div><strong>Challenge</strong>${escapeHTML(entry.challenge)}</div><div><strong>Solution</strong>${escapeHTML(entry.solution)}</div><div><strong>Reflection</strong>${escapeHTML(entry.reflection)}</div></div></div>`;
    dialog.querySelector('.modal-close')?.addEventListener('click', () => dialog.close());
    dialog.showModal(); addXP(2);
  }

  function openMediaModal(src, title){
    const dialog = $('#mediaDialog');
    if(!dialog) return;
    if(!src){ toast('No media file linked yet'); return; }
    const safe = escapeHTML(src);
    const isVideo = /\.(mp4|webm|ogg)$/i.test(src);
    dialog.innerHTML = `<div class="modal-body"><button class="modal-close">Close</button><h2>${escapeHTML(title || 'Media Preview')}</h2>${isVideo ? `<video src="${safe}" controls autoplay></video>` : `<img src="${safe}" alt="${escapeHTML(title)}" onerror="this.replaceWith(document.createTextNode('File not found.'))">`}</div>`;
    dialog.querySelector('.modal-close')?.addEventListener('click', () => dialog.close());
    dialog.showModal(); addXP(1);
  }

  function initFilters(){
    $('#searchInput')?.addEventListener('input', e => { state.search = e.target.value; renderEntries(); });
    $('#weekFilter')?.addEventListener('change', e => { state.week = e.target.value; renderEntries(); });
    $('#statusFilter')?.addEventListener('change', e => { state.status = e.target.value; renderEntries(); });
    $('#focusFilter')?.addEventListener('change', e => { state.focus = e.target.value; renderEntries(); });
    $$('[data-view]').forEach(btn => btn.addEventListener('click', () => { state.view = btn.dataset.view; $$('[data-view]').forEach(b => b.classList.toggle('active', b === btn)); renderEntries(); }));
    $('#bookmarkOnlyBtn')?.addEventListener('click', () => { state.bookmarksOnly = !state.bookmarksOnly; $('#bookmarkOnlyBtn').classList.toggle('active', state.bookmarksOnly); renderEntries(); });
    $('#expandAllBtn')?.addEventListener('click', () => { state.expandedAll = !state.expandedAll; $('#expandAllBtn').textContent = state.expandedAll ? 'Collapse All' : 'Expand All'; renderEntries(); });
    $('#resetFiltersBtn')?.addEventListener('click', resetFilters);
    $('#latestBtn')?.addEventListener('click', () => { const last = sortedEntries().at(-1); if(last){ state.week = last.week; $('#weekFilter').value = state.week; renderEntries(); setTimeout(()=> $('.entry-card')?.scrollIntoView({behavior:'smooth', block:'start'}), 60); }});
    $('#copyWeekBtn')?.addEventListener('click', copyWeek);
    $('#exportCsvBtn')?.addEventListener('click', exportCSV);
    $('#exportJsonBtn')?.addEventListener('click', exportJSON);
    $('#printBtn')?.addEventListener('click', () => window.print());
  }

  function resetFilters(){
    state.search = ''; state.week = 'all'; state.status = 'all'; state.focus = 'all'; state.tag = 'all'; state.bookmarksOnly = false;
    $('#searchInput') && ($('#searchInput').value = ''); $('#weekFilter') && ($('#weekFilter').value = 'all'); $('#statusFilter') && ($('#statusFilter').value = 'all'); $('#focusFilter') && ($('#focusFilter').value = 'all');
    $('#bookmarkOnlyBtn')?.classList.remove('active'); renderTags(); renderEntries(); toast('Filters reset');
  }

  async function copyWeek(){
    const data = getFilteredEntries();
    const weekName = state.week === 'all' ? 'current view' : state.week;
    const text = `Logbook summary - ${weekName}\n\n` + data.map(e => `${e.date} - ${e.title}\n${(e.tasks||[]).slice(0,4).map(t=>`- ${t}`).join('\n')}`).join('\n\n');
    await navigator.clipboard.writeText(text).catch(()=>{}); toast('Week summary copied'); addXP(4);
  }

  function downloadFile(name, content, type){
    const blob = new Blob([content], {type});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }
  function exportCSV(){
    const rows = [['Date','Week','Day','Title','Status','Tools','Skills','Reflection'], ...getFilteredEntries().map(e => [e.date,e.week,e.day,e.title,e.status,(e.tools||[]).join('; '),(e.skills||[]).join('; '),e.reflection])];
    const csv = rows.map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g,'""')}"`).join(',')).join('\n');
    downloadFile('my-logbook-current-view.csv', csv, 'text/csv'); toast('CSV exported'); addXP(5);
  }
  function exportJSON(){
    downloadFile('my-logbook-current-view.json', JSON.stringify(getFilteredEntries(), null, 2), 'application/json'); toast('JSON exported'); addXP(5);
  }

  function renderProjects(){
    const root = $('#projectGrid');
    if(!root) return;
    root.innerHTML = projects.map(project => `
      <article class="project-card glass">
        <span class="status">${escapeHTML(project.status)}</span>
        <h3>${escapeHTML(project.name)}</h3>
        <p>${escapeHTML(project.desc)}</p>
        <div class="project-tags">${project.tags.map(t=>`<span>${escapeHTML(t)}</span>`).join('')}</div>
        <div class="project-metrics">${project.metrics.map(t=>`<span>${escapeHTML(t)}</span>`).join('')}</div>
      </article>
    `).join('');
  }

  function renderMedia(){
    const root = $('#mediaGrid');
    if(!root) return;
    const items = sortedEntries().filter((_, i) => i % 2 === 0).slice(0,24).map(e => ({title:e.title, meta:`${e.date} • ${e.week}`, src:e.image}));
    items.unshift({title:'Welcome Video', meta:'videos/welcome.mp4', src:'videos/welcome.mp4'});
    root.innerHTML = items.map(item => {
      const isVideo = /\.mp4$/i.test(item.src || '');
      return `<button class="media-item glass" data-src="${escapeHTML(item.src)}" data-title="${escapeHTML(item.title)}">
        <div class="media-thumb">${isVideo ? '<span class="play-circle">▶</span>' : `<img src="${escapeHTML(item.src)}" alt="${escapeHTML(item.title)}" loading="lazy" onerror="this.remove(); this.parentElement.innerHTML='<span>Image</span>'">`}</div>
        <div class="media-caption"><strong>${escapeHTML(item.title)}</strong><span>${escapeHTML(item.meta)}</span></div>
      </button>`;
    }).join('');
    $$('.media-item').forEach(btn => btn.addEventListener('click', () => openMediaModal(btn.dataset.src, btn.dataset.title)));
    $('#shuffleMediaBtn')?.addEventListener('click', () => { root.append(...$$('.media-item', root).sort(()=>Math.random()-.5)); toast('Media shuffled'); });
  }

  function initSudoku(){
    const board = $('#sudokuBoard');
    const puzzles = [
      {p:[1,0,0,4,0,4,1,0,0,1,4,0,4,0,0,1], s:[1,2,3,4,3,4,1,2,2,1,4,3,4,3,2,1]},
      {p:[0,2,3,0,3,0,0,2,2,0,0,3,0,3,2,0], s:[1,2,3,4,3,4,1,2,2,1,4,3,4,3,2,1]},
      {p:[1,0,0,4,0,4,1,0,0,1,4,0,4,0,0,1], s:[1,2,3,4,3,4,1,2,2,1,4,3,4,3,2,1]}
    ];
    let current = puzzles[0];
    function draw(){
      current = puzzles[Math.floor(Math.random()*puzzles.length)];
      board.innerHTML = current.p.map((n,i)=>`<input inputmode="numeric" maxlength="1" data-i="${i}" ${n?`value="${n}" disabled`:''}>`).join('');
      $('#sudokuMsg').textContent = 'Fill the empty boxes with 1–4.';
      $$('input', board).forEach(inp => inp.addEventListener('input', () => { inp.value = inp.value.replace(/[^1-4]/g,'').slice(0,1); }));
    }
    $('#newSudokuBtn')?.addEventListener('click', draw);
    $('#checkSudokuBtn')?.addEventListener('click', () => {
      const values = $$('input', board).map(input => Number(input.value));
      const ok = values.every((v,i)=>v === current.s[i]);
      $('#sudokuMsg').textContent = ok ? 'Correct. Clean solve.' : 'Not yet. Check rows, columns and boxes.';
      if(ok){ toast('Sudoku solved +25 EXP'); addXP(25); }
    });
    draw();
  }

  function initMemory(){
    const icons = ['💻','🎨','📊','🛠️','📁','🚀'];
    let first = null, lock = false, matched = 0;
    const board = $('#memoryBoard');
    function draw(){
      first = null; lock = false; matched = 0;
      const deck = [...icons, ...icons].sort(()=>Math.random()-.5);
      board.innerHTML = deck.map((icon,i)=>`<button class="mem-card" data-icon="${icon}" data-i="${i}">?</button>`).join('');
      $('#memoryScore').textContent = '0 / 6 pairs';
      $$('.mem-card', board).forEach(card => card.addEventListener('click', () => {
        if(lock || card.classList.contains('matched') || card === first) return;
        card.textContent = card.dataset.icon; card.classList.add('flipped');
        if(!first){ first = card; return; }
        lock = true;
        if(first.dataset.icon === card.dataset.icon){
          first.classList.add('matched'); card.classList.add('matched'); matched++;
          $('#memoryScore').textContent = `${matched} / 6 pairs`;
          first = null; lock = false;
          if(matched === icons.length){ toast('Memory complete +20 EXP'); addXP(20); }
        }else{
          setTimeout(()=>{ first.textContent='?'; card.textContent='?'; first.classList.remove('flipped'); card.classList.remove('flipped'); first=null; lock=false; }, 650);
        }
      }));
    }
    $('#resetMemoryBtn')?.addEventListener('click', draw);
    draw();
  }

  function initReflex(){
    const arena = $('#reflexArena');
    const target = $('#reflexTarget');
    const msg = $('#reflexMsg');
    let started = false, startTime = 0;
    function move(){
      const w = arena.clientWidth - 80, h = arena.clientHeight - 80;
      target.style.left = `${40 + Math.random()*Math.max(1,w)}px`;
      target.style.top = `${40 + Math.random()*Math.max(1,h)}px`;
      target.textContent = 'Tap';
      startTime = performance.now();
    }
    target?.addEventListener('click', () => {
      if(!started){ started = true; msg.textContent = 'Catch the target as fast as possible.'; move(); return; }
      const ms = Math.round(performance.now() - startTime);
      msg.textContent = `Reaction: ${ms} ms`;
      addXP(15); toast(`Reflex ${ms}ms +15 EXP`);
      setTimeout(move, 500);
    });
  }

  function initQuiz(){
    const box = $('#quizBox');
    let index = 0;
    const scores = {};
    function draw(){
      if(index >= quizQuestions.length){
        const winner = Object.entries(scores).sort((a,b)=>(b[1]||0)-(a[1]||0))[0]?.[0] || 'Balanced Intern';
        box.innerHTML = `<h3>${escapeHTML(winner)}</h3><p class="game-msg">Your site personality result: focused, adaptable and ready to improve.</p>`;
        toast('Quiz completed +20 EXP'); addXP(20); return;
      }
      const q = quizQuestions[index];
      box.innerHTML = `<h3>${escapeHTML(q.q)}</h3>${q.a.map((ans,i)=>`<button data-result="${escapeHTML(q.r[i])}">${escapeHTML(ans)}</button>`).join('')}`;
      $$('button', box).forEach(btn => btn.addEventListener('click', () => { scores[btn.dataset.result] = (scores[btn.dataset.result] || 0) + 1; index++; draw(); }));
    }
    $('#restartQuizBtn')?.addEventListener('click', () => { index = 0; Object.keys(scores).forEach(k=>delete scores[k]); draw(); });
    draw();
  }

  function initGames(){ initSudoku(); initMemory(); initReflex(); initQuiz(); }

  function assistantReply(input){
    const text = input.toLowerCase();
    const last = sortedEntries().at(-1);
    if(text.includes('latest')) return `Latest entry: ${last.date} — ${last.title}. Go to Logbook and click Latest to focus it.`;
    if(text.includes('add') || text.includes('entry')) return 'To add a new entry, open assets/js/data.js, copy the entry template, paste it before the closing ]; and update date, week, day, title, tasks, tools, skills, challenge, solution, reflection and image.';
    if(text.includes('github') || text.includes('upload')) return 'For GitHub Pages: upload index.html, assets folder, images folder, videos folder and docs folder. Commit changes, then wait for Pages to deploy.';
    if(text.includes('project')) return 'Project summary: HEPA PRO, HEPA G-FUND and HEPA QMS were developed/refined as practical systems to support JHEPA workflow and digital operations.';
    if(text.includes('print') || text.includes('pdf')) return 'Open the Logbook section, apply filters if needed, then press Print / PDF. The print mode hides navigation and focuses on entries.';
    if(text.includes('video')) return 'Put your welcome video at videos/welcome.mp4. The welcome overlay and media vault will detect it automatically.';
    if(text.includes('game')) return 'Game Lab has Sudoku, Memory Match, Reflex Tap and Personality Check. Each completed action adds EXP.';
    return 'I can guide the logbook, projects, media, games, GitHub upload, welcome video and print/PDF. Try asking: “how to add entry”.';
  }

  function pushChat(message, sender='bot'){
    const chat = $('#assistantChat');
    if(!chat) return;
    const div = document.createElement('div');
    div.className = `chat-msg ${sender === 'user' ? 'user' : ''}`;
    div.textContent = message;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
  }
  function askAssistant(message){
    if(!message.trim()) return;
    pushChat(message, 'user');
    setTimeout(() => pushChat(assistantReply(message), 'bot'), 220);
    addXP(1);
  }
  function initAssistant(){
    pushChat('Hi, I am RizoX Guide. Ask me about adding entries, GitHub upload, projects, video, games or print/PDF.');
    $('#assistantSendBtn')?.addEventListener('click', () => { const input = $('#assistantInput'); askAssistant(input.value); input.value=''; });
    $('#assistantInput')?.addEventListener('keydown', e => { if(e.key === 'Enter'){ $('#assistantSendBtn').click(); } });
    $$('.assistant-prompts button').forEach(btn => btn.addEventListener('click', () => askAssistant(btn.dataset.ask || btn.textContent)));
  }

  function wallpaper(){
    const canvas = $('#wallpaper'); if(!canvas) return;
    const ctx = canvas.getContext('2d');
    let w=0,h=0,t=0,mouse={x:0,y:0,active:false};
    const particles = Array.from({length:90}, () => ({x:Math.random(), y:Math.random(), r:Math.random()*1.9+0.6, vx:(Math.random()-.5)*0.00055, vy:(Math.random()-.5)*0.00045}));
    const resize = () => { w = canvas.width = Math.floor(innerWidth * devicePixelRatio); h = canvas.height = Math.floor(innerHeight * devicePixelRatio); canvas.style.width=innerWidth+'px'; canvas.style.height=innerHeight+'px'; };
    addEventListener('resize', resize); resize();
    addEventListener('pointermove', e => { mouse.x = e.clientX * devicePixelRatio; mouse.y = e.clientY * devicePixelRatio; mouse.active = true; });
    function draw(){
      if(state.motion === 'off'){ requestAnimationFrame(draw); return; }
      t += 0.008;
      ctx.clearRect(0,0,w,h);
      const dark = document.body.dataset.theme !== 'light';
      const grad = ctx.createLinearGradient(0,0,w,h);
      grad.addColorStop(0, dark ? 'rgba(10,25,50,.82)' : 'rgba(217,245,255,.76)');
      grad.addColorStop(.5, dark ? 'rgba(5,20,42,.74)' : 'rgba(236,251,255,.70)');
      grad.addColorStop(1, dark ? 'rgba(8,12,34,.72)' : 'rgba(205,235,255,.68)');
      ctx.fillStyle = grad; ctx.fillRect(0,0,w,h);
      for(let layer=0; layer<4; layer++){
        ctx.beginPath();
        const amp = (20 + layer*13) * devicePixelRatio;
        const yBase = h*(0.25+layer*.18);
        for(let x=0; x<=w; x+=18*devicePixelRatio){
          const y = yBase + Math.sin(x*0.002 + t*(1.5+layer*.35) + layer)*amp + Math.cos(x*0.004 + t)*amp*.35;
          if(x===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        }
        ctx.strokeStyle = dark ? `rgba(57,217,255,${0.11-layer*.015})` : `rgba(0,111,171,${0.13-layer*.02})`;
        ctx.lineWidth = (1.2 + layer*.4)*devicePixelRatio;
        ctx.stroke();
      }
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; if(p.x<0||p.x>1) p.vx*=-1; if(p.y<0||p.y>1) p.vy*=-1;
        const px=p.x*w, py=p.y*h;
        const dx=px-mouse.x, dy=py-mouse.y, dist=Math.sqrt(dx*dx+dy*dy);
        const glow = mouse.active && dist < 170*devicePixelRatio ? .8 : .25;
        ctx.beginPath(); ctx.arc(px,py,p.r*devicePixelRatio*(1+glow*.7),0,Math.PI*2);
        ctx.fillStyle = dark ? `rgba(103,232,249,${.18+glow*.26})` : `rgba(14,116,144,${.16+glow*.18})`; ctx.fill();
      });
      for(let i=0;i<particles.length;i++) for(let j=i+1;j<particles.length;j++){
        const a=particles[i], b=particles[j]; const ax=a.x*w, ay=a.y*h, bx=b.x*w, by=b.y*h;
        const d=Math.hypot(ax-bx, ay-by); if(d<130*devicePixelRatio){ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);ctx.strokeStyle=dark?`rgba(57,217,255,${.07*(1-d/(130*devicePixelRatio))})`:`rgba(0,111,171,${.075*(1-d/(130*devicePixelRatio))})`;ctx.lineWidth=devicePixelRatio;ctx.stroke();}
      }
      if(mouse.active){
        const g=ctx.createRadialGradient(mouse.x,mouse.y,0,mouse.x,mouse.y,240*devicePixelRatio);
        g.addColorStop(0,dark?'rgba(57,217,255,.16)':'rgba(57,217,255,.22)'); g.addColorStop(1,'transparent'); ctx.fillStyle=g; ctx.fillRect(mouse.x-260*devicePixelRatio,mouse.y-260*devicePixelRatio,520*devicePixelRatio,520*devicePixelRatio);
      }
      requestAnimationFrame(draw);
    }
    draw();
  }

  function renderAll(){ renderStats(); renderWeekMap(); renderSkillBars(); renderMilestones(); renderTags(); renderEntries(); renderProjects(); renderMedia(); }

  function boot(){
    applyUIState(); renderXP(); initNav(); initWelcome(); initClock(); renderWeekOptions(); initFilters(); renderAll(); initGames(); initAssistant(); wallpaper();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
