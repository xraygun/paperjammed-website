import { templates, templateOrder, categories } from './templates/index.js';
import { calibrationBars } from './calibrationBars.js';
import { SITE_URL } from './siteConfig.js';

const API_ENDPOINT = '/api/counter';

const state = {
  currentTemplateKey: 'jamRemover',
  jamCoverage: 35,
  jamFlavor: 'strawberry',
  toastiness: 'golden',
  splatterDensity: 50,
  trayFeedCount: 5,
  certTechName: '',
  orderAnimal: '',
  orderRecipient: '',
  orderAddress: '',
  dailyTemplateData: null,
  dailyHash: String(Math.floor(Math.random() * 1e9)),
  dailyIntensity: 0,
  dailySwapIndex: {},
  categoryFilter: 'all'
};

// ----------------------------------------------------------------------------
// Print counter (live total from the Cloudflare Worker proxy)
// ----------------------------------------------------------------------------
// The header shows 1 until the live total arrives, then counts up to it.
// Nothing is cached in the browser, so the number shown is never higher
// than the real one.
const COUNT_UP_MS = 900;
let displayedCount = 1;
let countUpFrame = null;

function showCount(num) {
  displayedCount = num;
  const el = document.getElementById('globalPrintCount');
  if (el) el.innerText = num.toLocaleString();
}

function countUpTo(target) {
  if (countUpFrame) cancelAnimationFrame(countUpFrame);
  const from = Math.min(displayedCount, target);
  const start = performance.now();
  const step = (now) => {
    const t = Math.min(1, (now - start) / COUNT_UP_MS);
    const eased = 1 - Math.pow(1 - t, 3);
    showCount(Math.round(from + (target - from) * eased));
    countUpFrame = t < 1 ? requestAnimationFrame(step) : null;
  };
  countUpFrame = requestAnimationFrame(step);
}

function parseServerCount(json) {
  const val = parseInt(
    json?.data?.up_count ?? json?.data?.value ?? json?.up_count ?? json?.value ?? NaN,
    10
  );
  return isNaN(val) ? null : val;
}

function setSyncStatus(isLive) {
  const dot = document.getElementById('syncStatusDot');
  if (dot) {
    if (isLive) {
      dot.className = 'w-2 h-2 rounded-full bg-emerald-400 animate-pulse';
      dot.title = 'Cloud Synced (Cloudflare Worker Proxy)';
    } else {
      dot.className = 'w-2 h-2 rounded-full bg-amber-400';
      dot.title = 'Counter offline';
    }
  }
}

async function loadPrintCount() {
  showCount(1);
  // Earlier versions cached the total here; clear it from returning browsers.
  try { localStorage.removeItem('pj_print_count'); } catch (e) {}

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`${API_ENDPOINT}?action=get&t=${Date.now()}`, {
      method: 'GET',
      signal: controller.signal
    }).catch(() => null);

    clearTimeout(timeoutId);

    const json = res && res.ok ? await res.json().catch(() => null) : null;
    const serverVal = json ? parseServerCount(json) : null;
    if (serverVal !== null) {
      countUpTo(serverVal);
      setSyncStatus(true);
    } else {
      setSyncStatus(false);
    }
  } catch (e) {
    setSyncStatus(false);
  }
}

// Cooldown gate so a single print action (button click + the resulting
// afterprint event, or someone hammering Ctrl+P / the print button) can only
// bump the counter once every PRINT_COOLDOWN_MS. Persisted in localStorage
// (not just in-memory) so it survives page reloads and covers real print
// dialogs, which routinely stay open longer than a short in-memory lock
// would.
const PRINT_COOLDOWN_MS = 5000;
const COOLDOWN_STORAGE_KEY = 'pj_last_increment_at';

function isInCooldown() {
  try {
    const last = parseInt(localStorage.getItem(COOLDOWN_STORAGE_KEY) || '0', 10);
    return Date.now() - last < PRINT_COOLDOWN_MS;
  } catch (e) {
    return false;
  }
}

function markIncrementTime() {
  try {
    localStorage.setItem(COOLDOWN_STORAGE_KEY, String(Date.now()));
  } catch (e) {
    // ignore storage errors (e.g. private browsing)
  }
}

function incrementCounter() {
  if (isInCooldown()) return;
  markIncrementTime();

  if (countUpFrame) cancelAnimationFrame(countUpFrame);
  showCount(displayedCount + 1);

  try {
    fetch(`${API_ENDPOINT}?action=up&t=${Date.now()}`, {
      method: 'GET'
    }).then(async (res) => {
      if (res && res.ok) {
        const json = await res.json().catch(() => null);
        const serverVal = json ? parseServerCount(json) : null;
        if (serverVal !== null && serverVal > 0) {
          showCount(serverVal);
        }
        setSyncStatus(true);
      } else {
        setSyncStatus(false);
      }
    }).catch(() => setSyncStatus(false));
  } catch (e) {
    setSyncStatus(false);
  }
}

// The actual increment happens once, from the shared 'afterprint' listener
// below — it fires for this button AND for native Ctrl+P/menu-triggered
// prints, so counting here too would double-count this button's prints.
function handlePrintAction() {
  window.print();
}

window.addEventListener('afterprint', () => {
  incrementCounter();
});

// ----------------------------------------------------------------------------
// Auto shrink-to-fit for single-page templates.
//
// Multi-page templates (multiPage: true) are deliberately EXCLUDED — they're
// built from one or more fixed-height .print-page divs whose sizing and
// page-break math depends on staying their true size. Scaling those down
// would throw off pagination and make each page a different, unpredictable
// size. Only #templateContent for single-page templates gets scaled.
// ----------------------------------------------------------------------------
const SHRINK_MIN_SCALE = 0.55; // below this, the content is too long — trim it instead of relying on shrinking
const SHRINK_FOOTER_RESERVE_PX = 90; // rough space reserved for the absolutely-positioned global footer

function mmToPx(mm) {
  return (mm * 96) / 25.4;
}

function resetShrinkToFit() {
  const contentEl = document.getElementById('templateContent');
  if (!contentEl) return;
  contentEl.style.transform = '';
  contentEl.style.transformOrigin = '';
  contentEl.style.width = '';
}

function applyShrinkToFit() {
  const t = templates[state.currentTemplateKey];
  resetShrinkToFit();
  if (!t) return;

  const printSheet = document.getElementById('printSheet');
  const contentEl = document.getElementById('templateContent');
  if (!printSheet || !contentEl) return;

  // Never scale multi-page templates. t.multiPage covers templates that
  // are ALWAYS multi-page; printSheet's own live class also covers Daily
  // Mystery's Unhinged state, which goes multi-page dynamically (see
  // renderDailyMysteryIfActive) without t.multiPage ever being true.
  if (t.multiPage || printSheet.classList.contains('multi-page-mode')) return;

  const availableHeight = printSheet.clientHeight - 2 * mmToPx(10) - SHRINK_FOOTER_RESERVE_PX;
  const naturalHeight = contentEl.scrollHeight;

  if (naturalHeight > availableHeight && availableHeight > 0) {
    const scale = Math.max(availableHeight / naturalHeight, SHRINK_MIN_SCALE);
    contentEl.style.transformOrigin = 'top left';
    contentEl.style.transform = `scale(${scale})`;
    contentEl.style.width = `${100 / scale}%`;
    if (scale <= SHRINK_MIN_SCALE) {
      console.warn(
        `[${t.key}] content is too tall to shrink-to-fit cleanly (would need scale ${(availableHeight / naturalHeight).toFixed(2)}). ` +
        `Capped at ${SHRINK_MIN_SCALE} — consider trimming this template's content instead.`
      );
    }
  }
}

window.addEventListener('beforeprint', applyShrinkToFit);
window.addEventListener('afterprint', resetShrinkToFit);

// ----------------------------------------------------------------------------
// Sidebar rendering (fully data-driven off the template registry)
// ----------------------------------------------------------------------------
function renderTemplateItem(key) {
    const t = templates[key];
    const badgeHtml = t.badge
      ? `<span class="text-[10px] ${t.badge.className} font-bold px-1.5 py-0.5 rounded shrink-0 max-w-[50%] text-center leading-tight uppercase tracking-wider">${t.badge.text}</span>`
      : '';
    const iconHtml = t.icon ? `<i class="fa-solid ${t.icon} text-xs"></i> ` : '';
    const labelSpanClass = t.labelTextClass ? `${t.labelTextClass} font-bold` : '';
    const labelInner = typeof t.labelHtml === 'function' ? t.labelHtml(state) : t.label;

    // Optional per-template flourish: a background layer behind the label
    // (currently only Daily Mystery's starfield). Sits under the label via
    // z-index; pointer-events:none so it never blocks the click-to-select.
    // The warp-in overlay is a SIBLING of #starfield-${key}, not a child —
    // refreshDailyStarfield() replaces that element's innerHTML wholesale
    // on every hash/intensity change, which would delete the warp div too
    // if it lived inside it.
    const overlayHtml = typeof t.starfieldHtml === 'function'
      ? `<div class="dm-warp"></div><div class="dm-starfield-layer" id="starfield-${key}">${t.starfieldHtml(state)}</div>`
      : '';

    const controlsHtml = typeof t.controlsHtml === 'function'
      ? `<div id="controls-${key}" style="display: none;">${t.controlsHtml(state)}</div>`
      : '';

    const descriptionHtml = t.description
      ? `<p class="text-xs text-slate-300 mt-0.5">${t.description}</p>`
      : '';

    return `
      <div id="tpl-${key}">
        <label onclick="setTemplate('${key}', true)" class="template-btn relative overflow-hidden flex items-start gap-3 p-3 rounded-lg border ${t.borderClasses} cursor-pointer transition">
          ${overlayHtml}
          <input type="radio" name="template" value="${key}" ${key === state.currentTemplateKey ? 'checked' : ''} class="relative z-10 mt-1 ${t.radioAccent}">
          <div class="relative z-10 w-full min-w-0">
            <div class="font-medium text-white flex items-center justify-between gap-2">
              <span class="flex items-center gap-1.5 min-w-0 ${labelSpanClass}">${iconHtml}${labelInner}</span>
              ${badgeHtml}
            </div>
            ${descriptionHtml}
          </div>
        </label>
        ${controlsHtml}
      </div>
    `;
}

// The list is grouped under category headers (see `categories` in
// templates/index.js), with a row of filter chips above it. A template no
// category lists still shows, under "Other", so it can't silently vanish.
function renderSidebar() {
  const container = document.getElementById('templateList');
  if (!container) return;

  const placed = new Set(categories.flatMap((c) => c.keys));
  const groups = categories
    .map((c) => ({ id: c.id, label: c.label, keys: templateOrder.filter((k) => c.keys.includes(k)) }))
    .filter((g) => g.keys.length);
  const other = templateOrder.filter((k) => !placed.has(k));
  if (other.length) groups.push({ id: 'other', label: 'Other', keys: other });

  container.innerHTML = groups.map((g) => `
    <div class="template-group space-y-3" data-category="${g.id}">
      <h3 class="text-[11px] font-semibold uppercase tracking-wider text-slate-500">${g.label}</h3>
      ${g.keys.map(renderTemplateItem).join('')}
    </div>
  `).join('');

  const bar = document.getElementById('categoryFilter');
  if (bar) {
    bar.innerHTML = [{ id: 'all', label: 'All' }, ...groups].map((c) => `
      <button type="button" data-filter="${c.id}" onclick="setCategoryFilter('${c.id}')"
        class="shrink-0 text-xs font-semibold px-3 py-1 rounded-full border border-slate-600 bg-slate-700/60 text-slate-300 hover:text-white transition aria-pressed:bg-rose-500 aria-pressed:border-rose-400 aria-pressed:text-white">${c.label}</button>
    `).join('');
  }
  applyCategoryFilter();
}

function setCategoryFilter(id) {
  state.categoryFilter = id;
  applyCategoryFilter();
}

function applyCategoryFilter() {
  const active = state.categoryFilter;
  document.querySelectorAll('#categoryFilter button').forEach((b) => {
    b.setAttribute('aria-pressed', String(b.dataset.filter === active));
  });
  document.querySelectorAll('#templateList .template-group').forEach((g) => {
    g.style.display = active === 'all' || g.dataset.category === active ? '' : 'none';
  });
}

// ----------------------------------------------------------------------------
// Template switching
// ----------------------------------------------------------------------------
// A template can be multi-page all the time (t.multiPage) or only in some
// states (t.isMultiPage(state) — Daily Mystery at Unhinged).
function templateIsMultiPage(t) {
  return typeof t.isMultiPage === 'function' ? t.isMultiPage(state) : !!t.multiPage;
}

function setTemplate(key, fromUser = false) {
  if (!templates[key]) return;
  state.currentTemplateKey = key;

  const printSheet = document.getElementById('printSheet');
  const contentEl = document.getElementById('templateContent');
  const footerContainer = document.getElementById('globalFooterContainer');
  const t = templates[key];
  const multiPage = templateIsMultiPage(t);

  // Toggle every template's own controls box (only the active one shows).
  templateOrder.forEach((k) => {
    const box = document.getElementById(`controls-${k}`);
    if (box) box.style.display = (k === key) ? 'block' : 'none';
  });

  if (printSheet) {
    printSheet.classList.toggle('multi-page-mode', multiPage);
  }

  if (footerContainer) {
    footerContainer.style.display = multiPage ? 'none' : 'block';
  }

  if (contentEl) {
    contentEl.innerHTML = t.render(state);
  }

  const barEl = document.getElementById('calibrationBar');
  if (barEl) barEl.innerHTML = calibrationBars[t.configType || 'color'];

  updateCustomNote();

  if (fromUser) focusSelection(key);
}

// After a click: center the chosen template (and its now-open controls) in
// the sidebar, and bring the preview back to its top so the new sheet is
// seen from the start rather than wherever the last one was scrolled to.
// Scrolls the sidebar container directly instead of scrollIntoView(), which
// would also drag the window around and fight the preview reset below.
function focusSelection(key) {
  requestAnimationFrame(() => {
    const sidebar = document.getElementById('sidebar');
    const item = document.getElementById(`tpl-${key}`);
    if (sidebar && item) {
      const s = sidebar.getBoundingClientRect();
      const i = item.getBoundingClientRect();
      sidebar.scrollBy({ top: i.top - s.top - (s.height - i.height) / 2, behavior: 'smooth' });
    }

    // Phones: the sheet scrolls inside its own pane.
    const previewScroll = document.getElementById('previewScroll');
    if (previewScroll) previewScroll.scrollTop = 0;

    // Desktop: the page itself scrolls; only move it if the preview's top
    // is hidden under the sticky header.
    const pane = document.getElementById('previewPane');
    const header = document.querySelector('header');
    if (pane && header) {
      const gap = header.offsetHeight + 16;
      const top = pane.getBoundingClientRect().top;
      if (top < gap) window.scrollTo({ top: window.scrollY + top - gap, behavior: 'smooth' });
    }
  });
}

// ----------------------------------------------------------------------------
// Jam Remover 2.0 controls
//
// v2.0 builds its whole SVG (blotch, drips, seeds, splatter, toast shade)
// inside render(), so there are no individual elements to patch the way the
// old version poked at #jamBlotch. Every control just updates state and
// re-renders the sheet. The controls themselves live in the sidebar and are
// rendered once, so re-rendering templateContent leaves them untouched.
// ----------------------------------------------------------------------------
function renderJamIfActive() {
  if (state.currentTemplateKey === 'jamRemover') {
    const contentEl = document.getElementById('templateContent');
    if (contentEl) contentEl.innerHTML = templates.jamRemover.render(state);
  }
}

function handleJamSliderChange(val) {
  state.jamCoverage = parseInt(val, 10) || 0;
  const displayEl = document.getElementById('sliderValDisplay');
  if (displayEl) displayEl.textContent = state.jamCoverage;
  renderJamIfActive();
}

function handleJamFlavorChange(val) {
  state.jamFlavor = val;
  renderJamIfActive();
}

function handleToastinessChange(val) {
  state.toastiness = val;
  renderJamIfActive();
}

function handleSplatterChange(val) {
  state.splatterDensity = parseInt(val, 10) || 0;
  renderJamIfActive();
}

// ----------------------------------------------------------------------------
// Tray Feed count
// ----------------------------------------------------------------------------
function handleTrayFeedChange(val) {
  let num = parseInt(val, 10);
  if (isNaN(num) || num < 2) num = 2;
  if (num > 100) num = 100;

  state.trayFeedCount = num;

  const numInput = document.getElementById('trayFeedNumInput');
  const sliderInput = document.getElementById('trayFeedSliderInput');

  if (numInput && numInput.value != num) numInput.value = num;
  if (sliderInput && sliderInput.value != num) sliderInput.value = num;

  if (state.currentTemplateKey === 'trayfeed') {
    const contentEl = document.getElementById('templateContent');
    if (contentEl) contentEl.innerHTML = templates.trayfeed.render(state);
  }
}

// ----------------------------------------------------------------------------
// Certificate installer name (dedicated control — see certificate.js)
// ----------------------------------------------------------------------------
function handleCertTechNameChange(val) {
  state.certTechName = val;
  const certTechEl = document.getElementById('certTechName');
  if (certTechEl) {
    certTechEl.textContent = (val.trim() !== '') ? val : '[ IT Department Staff ]';
  }
}

// ----------------------------------------------------------------------------
// Mail Order Livestock animal name (dedicated control — see invoice.js)
// Unlike the certificate's installer name (which updates one element), the
// animal name appears throughout the receipt, so the template is re-rendered.
// ----------------------------------------------------------------------------
function renderInvoiceIfActive() {
  if (state.currentTemplateKey === 'invoice') {
    const contentEl = document.getElementById('templateContent');
    if (contentEl) contentEl.innerHTML = templates.invoice.render(state);
  }
}

function handleOrderAnimalChange(val) {
  state.orderAnimal = val;
  renderInvoiceIfActive();
}

function handleOrderRecipientChange(val) {
  state.orderRecipient = val;
  renderInvoiceIfActive();
}

function handleOrderAddressChange(val) {
  state.orderAddress = val;
  renderInvoiceIfActive();
}

// ----------------------------------------------------------------------------
// Custom technician note (shared across the remaining templates)
// ----------------------------------------------------------------------------
function updateCustomNote() {
  const inputVal = document.getElementById('customNote')?.value || '';
  // Kept in state too: templates that print their own copy of the footer
  // (Daily Mystery's Unhinged page 2) read it from here on every render.
  state.customNote = inputVal;
  const footnoteEl = document.getElementById('printedFootnote');
  const ghostTechEl = document.getElementById('ghostTechName');
  const kissTechEl = document.getElementById('kissTechName');

  if (footnoteEl) {
    footnoteEl.innerText = (inputVal.trim() !== '') ? inputVal : 'IT Print Verification Completed. Do not discard unless Chuck Norris says so.';
  }
  if (ghostTechEl) {
    ghostTechEl.innerText = (inputVal.trim() !== '') ? inputVal : 'Tech Dave (Ghost-Buster)';
  }
  if (kissTechEl) {
    kissTechEl.innerText = (inputVal.trim() !== '') ? inputVal : '[ System Default Printer ]';
  }
}

// ----------------------------------------------------------------------------
// Daily Mystery content (fetched once — the server only regenerates it via
// its own Cron Trigger, this just reads whatever's currently cached)
// ----------------------------------------------------------------------------
async function loadDailyTemplate() {
  try {
    const res = await fetch('/api/daily-template');
    if (!res.ok) return; // 404 before the first generation has run — DEFAULT_CONTENT covers it
    const data = await res.json().catch(() => null);
    if (!data) return;
    state.dailyTemplateData = data;
    renderDailyMysteryIfActive();
  } catch (e) {
    // Offline/network failure — the template's own DEFAULT_CONTENT covers this.
  }
}

// The randomness hash/intensity controls both need a full re-render since
// they change border/font/size and (at "Cooked") inject markup, not just
// one text node.
//
// At Unhinged (100%) specifically, dailyMystery.js's render() switches to
// a genuine two-page print structure (blank page 1, real content page 2 —
// so a quick glance at print preview shows nothing) instead of the usual
// single hidden page. setTemplate() sets #printSheet's multi-page-mode
// class when the template is picked, but the intensity slider can cross
// 100 without setTemplate() running again, so it's re-checked here on
// every daily-mystery render too (same templateIsMultiPage() test).
function renderDailyMysteryIfActive() {
  if (state.currentTemplateKey === 'dailyMystery') {
    const contentEl = document.getElementById('templateContent');
    if (contentEl) contentEl.innerHTML = templates.dailyMystery.render(state);

    const multiPage = templateIsMultiPage(templates.dailyMystery);
    const printSheet = document.getElementById('printSheet');
    const footerContainer = document.getElementById('globalFooterContainer');
    if (printSheet) printSheet.classList.toggle('multi-page-mode', multiPage);
    if (footerContainer) footerContainer.style.display = multiPage ? 'none' : 'block';
  }
}

// Duplicated from dailyMystery.js's own copy on purpose — app.js never
// imports a specific template file (see templates/index.js). Same 0-100
// continuous slider, same four named bands at the same thresholds.
const DAILY_INTENSITY_LABELS = ['Rare', 'Medium', 'Well Done', 'Cooked'];
function dailyIntensityBand(pct) {
  if (pct >= 75) return 3;
  if (pct >= 50) return 2;
  if (pct >= 25) return 1;
  return 0;
}
function dailyIntensityStatus(pct) {
  if (pct >= 100) return { text: 'Unhinged', variant: 'unhinged' };
  if (pct >= 85) return { text: 'Warning', variant: 'warning' };
  return { text: DAILY_INTENSITY_LABELS[dailyIntensityBand(pct)], variant: '' };
}

// The sidebar button's starfield is keyed off (hash, intensity) too, so
// both controls need to refresh it, not just the print-sheet re-render.
function refreshDailyStarfield() {
  const el = document.getElementById('starfield-dailyMystery');
  if (el) el.innerHTML = templates.dailyMystery.starfieldHtml(state);
}

function handleDailyHashChange(val) {
  state.dailyHash = val;
  renderDailyMysteryIfActive();
  refreshDailyStarfield();
}

function handleDailyHashRefresh() {
  const newHash = String(Math.floor(Math.random() * 1e9));
  state.dailyHash = newHash;
  const hashInput = document.getElementById('dailyHashInput');
  if (hashInput) hashInput.value = newHash;
  renderDailyMysteryIfActive();
  refreshDailyStarfield();
}

function handleDailyIntensityChange(val) {
  let num = parseInt(val, 10);
  if (isNaN(num) || num < 0) num = 0;
  if (num > 100) num = 100;
  state.dailyIntensity = num;

  const statusEl = document.getElementById('dailyIntensityStatus');
  if (statusEl) {
    const status = dailyIntensityStatus(num);
    statusEl.textContent = status.text;
    statusEl.classList.remove('dm-status-warning', 'dm-status-unhinged');
    if (status.variant) statusEl.classList.add(`dm-status-${status.variant}`);
  }

  renderDailyMysteryIfActive();
  refreshDailyStarfield();
}

// Every 3s, picks one or more random swappable words (see dailyMystery.js's
// applySwaps/state.dailySwapIndex) and bumps each to a DIFFERENT synonym —
// how many at once scales with the intensity slider, so Cooked genuinely
// rewrites multiple words per tick instead of just one. Border/font stay
// hash-only (no flicker); this timer only ever touches wording. Runs
// forever in the background; it's a no-op render whenever some other
// template is active, so nothing needs to start/stop it.
const DAILY_SWAP_INTERVAL_MS = 3000;

function tickDailySwap() {
  const swaps = state.dailyTemplateData && state.dailyTemplateData.swaps;
  if (!swaps) return false;
  const allKeys = Object.keys(swaps);
  if (allKeys.length === 0) return false;

  const wantCount = 1 + Math.floor(state.dailyIntensity / 34);
  const keys = allKeys.sort(() => Math.random() - 0.5).slice(0, wantCount);

  let changedAny = false;
  keys.forEach((key) => {
    const options = swaps[key];
    if (!options || options.length < 2) return;
    const current = state.dailySwapIndex[key] || 0;
    let next = current;
    while (next === current) next = Math.floor(Math.random() * options.length);
    state.dailySwapIndex[key] = next;
    changedAny = true;
  });
  return changedAny;
}

function scheduleDailySwap() {
  setInterval(() => {
    if (state.currentTemplateKey === 'dailyMystery' && tickDailySwap()) {
      renderDailyMysteryIfActive();
    }
  }, DAILY_SWAP_INTERVAL_MS);
}

// ----------------------------------------------------------------------------
// Boot
// ----------------------------------------------------------------------------
function initApp() {
  const siteUrlLabel = document.getElementById('siteUrlLabel');
  if (siteUrlLabel) siteUrlLabel.textContent = `${SITE_URL.toUpperCase()} LOGICAL UNIT`;

  renderSidebar();
  setTemplate(state.currentTemplateKey);
  loadPrintCount();
  loadDailyTemplate();
  scheduleDailySwap();
}

// Expose the handlers referenced by inline HTML attributes (onclick/oninput)
window.setTemplate = setTemplate;
window.setCategoryFilter = setCategoryFilter;
window.handleJamSliderChange = handleJamSliderChange;
window.handleJamFlavorChange = handleJamFlavorChange;
window.handleToastinessChange = handleToastinessChange;
window.handleSplatterChange = handleSplatterChange;
window.handleTrayFeedChange = handleTrayFeedChange;
window.handleCertTechNameChange = handleCertTechNameChange;
window.handleOrderAnimalChange = handleOrderAnimalChange;
window.handleOrderRecipientChange = handleOrderRecipientChange;
window.handleOrderAddressChange = handleOrderAddressChange;
window.handleDailyHashChange = handleDailyHashChange;
window.handleDailyHashRefresh = handleDailyHashRefresh;
window.handleDailyIntensityChange = handleDailyIntensityChange;
window.updateCustomNote = updateCustomNote;
window.handlePrintAction = handlePrintAction;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
