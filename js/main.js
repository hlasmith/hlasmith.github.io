// hlasmith.co.uk: theme, Islands nav (menu + search), filters, Work rows, copy email.
(function () {
  'use strict';
  var root = document.documentElement;
  var BASE = document.body.getAttribute('data-base') || '';

  // ---------- Theme ----------
  var themeBtn = document.querySelector('.nav-theme');
  var themeMeta = document.querySelector('meta[name="theme-color"]');
  // Light by default for everyone; dark only when the visitor chooses it.
  function isDark() { return root.getAttribute('data-theme') === 'dark'; }
  function syncTheme() {
    var dark = isDark();
    if (themeBtn) themeBtn.setAttribute('aria-pressed', String(dark));
    if (themeMeta) themeMeta.setAttribute('content', dark ? '#0C1824' : '#EEF3F6');
  }
  syncTheme();
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = isDark() ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      syncTheme();
    });
  }

  // ---------- Nav: menu sheet ----------
  var nav = document.querySelector('.nav');
  var menuBtn = document.querySelector('.nav-btn--menu');
  var menu = document.getElementById('nav-menu');
  function setMenu(open, focusBack) {
    if (!menuBtn || !menu) return;
    menu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Menu');
    if (!open && focusBack) menuBtn.focus();
  }
  if (menuBtn) {
    menuBtn.addEventListener('click', function () { setMenu(menu.hidden, false); });
  }

  // ---------- Nav: search ----------
  var searchBtn = document.querySelector('.nav-search-open');
  var searchForm = document.querySelector('.nav-search');
  var searchInput = searchForm && searchForm.querySelector('input');
  var searchClose = searchForm && searchForm.querySelector('.nav-search-close');
  var panel = document.getElementById('nav-search-panel');
  var hits = panel && panel.querySelector('.search-hits');
  var note = panel && panel.querySelector('.search-note');
  var moreLink = panel && panel.querySelector('.more');

  function esc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : s; return d.innerHTML; }

  function openSearch() {
    if (!nav) return;
    setMenu(false, false);
    nav.classList.add('is-searching');
    if (panel) panel.hidden = false;
    if (searchBtn) searchBtn.setAttribute('aria-expanded', 'true');
    if (searchInput) searchInput.focus();
  }
  function closeSearch() {
    if (!nav) return;
    nav.classList.remove('is-searching');
    if (panel) panel.hidden = true;
    if (searchBtn) { searchBtn.setAttribute('aria-expanded', 'false'); searchBtn.focus(); }
  }
  function runSearch(q) {
    q = (q || '').trim();
    if (!q || !hits) return;
    if (moreLink) moreLink.href = BASE + 'search.html?q=' + encodeURIComponent(q);
    note.textContent = 'Searching…';
    hits.innerHTML = '';
    fetch('/api/search?q=' + encodeURIComponent(q))
      .then(function (r) { return r.json(); })
      .then(function (d) {
        var res = (d && d.results) || [];
        if (!res.length) { note.textContent = 'No close matches. Try different words, or browse Writing.'; return; }
        note.textContent = res.length + ' closest match' + (res.length === 1 ? '' : 'es') + '.';
        hits.innerHTML = res.map(function (x) {
          return '<li><a href="' + esc(x.url) + '"><strong>' + esc(x.title) + '</strong><span>' + esc(x.category || '') + '</span></a></li>';
        }).join('');
      })
      .catch(function () { note.textContent = 'Search is unavailable right now. Please browse Writing instead.'; });
  }
  if (searchBtn) searchBtn.addEventListener('click', openSearch);
  if (searchClose) searchClose.addEventListener('click', closeSearch);
  if (searchForm) searchForm.addEventListener('submit', function (e) { e.preventDefault(); runSearch(searchInput.value); });
  if (panel) {
    panel.querySelectorAll('.suggests button').forEach(function (b) {
      b.addEventListener('click', function () { searchInput.value = b.textContent; runSearch(b.textContent); });
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (nav && nav.classList.contains('is-searching')) closeSearch();
    else if (menu && !menu.hidden) setMenu(false, true);
  });

  // "Ask the archive" forms elsewhere send the question to the nav search.
  document.querySelectorAll('form[data-ask]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = f.querySelector('input').value;
      openSearch();
      if (searchInput) searchInput.value = q;
      runSearch(q);
    });
  });

  // ---------- Filter chips (Writing shelves, Work sectors) ----------
  document.querySelectorAll('[data-filter-group]').forEach(function (group) {
    var target = document.getElementById(group.getAttribute('data-filter-group'));
    var status = document.getElementById(group.getAttribute('data-status'));
    var empty = document.getElementById(group.getAttribute('data-empty'));
    var hideWhenFiltered = document.querySelectorAll('[data-hide-when-filtered="' + group.id + '"]');
    var chips = group.querySelectorAll('.chip');
    function apply(value, label) {
      chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c.getAttribute('data-value') === value)); });
      var items = target.querySelectorAll('[data-shelf]');
      var shown = 0;
      items.forEach(function (it) {
        var match = value === 'all' ? !it.hasAttribute('data-only-filtered') : it.getAttribute('data-shelf') === value;
        it.hidden = !match;
        if (match) shown++;
      });
      target.querySelectorAll('[data-group]').forEach(function (g) {
        g.hidden = !g.querySelector('[data-shelf]:not([hidden])');
      });
      hideWhenFiltered.forEach(function (el) { el.hidden = value !== 'all'; });
      if (empty) {
        empty.hidden = shown !== 0;
        var nm = empty.querySelector('[data-empty-name]');
        if (nm) nm.textContent = label;
      }
      if (status) {
        var noun = status.getAttribute('data-noun') || 'posts';
        status.textContent = value === 'all' ? status.getAttribute('data-all')
          : (shown ? 'Showing ' + shown + ' ' + (shown === 1 ? noun.replace(/s$/, '') : noun) + ' in ' + label + '.' : 'Nothing in ' + label + ' yet.');
      }
      target.dispatchEvent(new CustomEvent('filtered'));
    }
    chips.forEach(function (c) {
      c.addEventListener('click', function () { apply(c.getAttribute('data-value'), c.getAttribute('data-label')); });
    });
    document.querySelectorAll('[data-show-all="' + group.id + '"]').forEach(function (b) {
      b.addEventListener('click', function () { apply('all', 'All'); });
    });
    // Deep links: writing.html?shelf=delivery
    var param = new URLSearchParams(location.search).get(group.getAttribute('data-param') || 'shelf');
    if (param) {
      var chip = group.querySelector('.chip[data-value="' + param + '"]');
      if (chip) apply(param, chip.getAttribute('data-label'));
    }
  });

  // ---------- Work: expandable project rows + show all ----------
  document.querySelectorAll('.proj-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var p = document.getElementById(btn.getAttribute('aria-controls'));
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      p.hidden = open;
    });
  });
  var projList = document.getElementById('projects');
  var showAll = document.getElementById('projects-more');
  function limitProjects() {
    if (!projList || !showAll) return;
    var LIMIT = 6, expanded = showAll.getAttribute('data-expanded') === 'true';
    var visible = Array.prototype.filter.call(projList.querySelectorAll('[data-shelf]'), function (li) { return !li.hidden || li.hasAttribute('data-limited'); });
    visible.forEach(function (li, i) {
      var over = !expanded && i >= LIMIT;
      if (over) { li.hidden = true; li.setAttribute('data-limited', ''); }
      else if (li.hasAttribute('data-limited')) { li.hidden = false; li.removeAttribute('data-limited'); }
    });
    showAll.hidden = expanded || visible.length <= LIMIT;
    showAll.querySelector('span').textContent = visible.length;
  }
  if (projList && showAll) {
    showAll.addEventListener('click', function () { showAll.setAttribute('data-expanded', 'true'); limitProjects(); });
    projList.addEventListener('filtered', function () {
      projList.querySelectorAll('[data-limited]').forEach(function (li) { li.removeAttribute('data-limited'); });
      limitProjects();
    });
    limitProjects();
  }

  // ---------- Contact: copy email ----------
  document.querySelectorAll('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var text = b.getAttribute('data-copy');
      var label = b.querySelector('span');
      var live = document.getElementById(b.getAttribute('data-live'));
      var done = function () { label.textContent = 'Copied'; if (live) live.textContent = 'Email address copied'; };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () {});
    });
  });
})();
