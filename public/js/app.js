import { templates, templateOrder } from './templates/index.js';
import { calibrationBars } from './calibrationBars.js';
import { SITE_URL } from './siteConfig.js';

const API_ENDPOINT = '/api/counter';

const state = {
  currentTemplateKey: 'jamRemover',
  jamPercent: 30,
  trayFeedCount: 5,
  certTechName: '',
  orderAnimal: '',
  orderRecipient: '',
  orderAddress: '',
  isPrintIncrementing: false
};

// ----------------------------------------------------------------------------
// Print counter (localStorage cache + best-effort Cloudflare Worker sync)
// ----------------------------------------------------------------------------
function getLocalCount() {
  try {
    const raw = localStorage.getItem('pj_print_count');
    const parsed = parseInt(raw || '0', 10);
    return isNaN(parsed) ? 0 : parsed;
  } catch (e) {
    return 0;
  }
}

function setLocalCount(val) {
  const num = parseInt(val, 10) || 0;
  try {
    localStorage.setItem('pj_print_count', num);
  } catch (e) {
    // Fallback: ignore storage errors (e.g. private browsing)
  }
  const el = document.getElementById('globalPrintCount');
  if (el) el.innerText = num.toLocaleString();
}

function setSyncStatus(isLive) {
  const dot = document.getElementById('syncStatusDot');
  if (dot) {
    if (isLive) {
      dot.className = 'w-2 h-2 rounded-full bg-emerald-400 animate-pulse';
      dot.title = 'Cloud Synced (Cloudflare Worker Proxy)';
    } else {
      dot.className = 'w-2 h-2 rounded-full bg-amber-400';
      dot.title = 'Offline / Local Cache Fallback Mode';
    }
  }
}

async function loadPrintCount() {
  const localVal = getLocalCount();
  setLocalCount(localVal);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`${API_ENDPOINT}?action=get&t=${Date.now()}`, {
      method: 'GET',
      signal: controller.signal
    }).catch(() => null);

    clearTimeout(timeoutId);

    if (res && res.ok) {
      const json = await res.json().catch(() => null);
      if (json) {
        const serverVal = parseInt(
          json?.data?.up_count ?? json?.data?.value ?? json?.up_count ?? json?.value ?? 0,
          10
        );
        if (!isNaN(serverVal)) {
          setLocalCount(serverVal);
        }
        setSyncStatus(true);
      }
    } else {
      setSyncStatus(false);
    }
  } catch (e) {
    setSyncStatus(false);
  }
}

function incrementCounter() {
  if (state.isPrintIncrementing) return;
  state.isPrintIncrementing = true;

  const currentVal = getLocalCount();
  const nextVal = currentVal + 1;
  setLocalCount(nextVal);

  try {
    fetch(`${API_ENDPOINT}?action=up&t=${Date.now()}`, {
      method: 'GET'
    }).then(async (res) => {
      if (res && res.ok) {
        const json = await res.json().catch(() => null);
        if (json) {
          const serverVal = parseInt(
            json?.data?.up_count ?? json?.data?.value ?? json?.up_count ?? json?.value ?? 0,
            10
          );
          if (!isNaN(serverVal) && serverVal > 0) {
            setLocalCount(serverVal);
          }
        }
        setSyncStatus(true);
      } else {
        setSyncStatus(false);
      }
    }).catch(() => setSyncStatus(false));
  } catch (e) {
    setSyncStatus(false);
  }

  setTimeout(() => {
    state.isPrintIncrementing = false;
  }, 1500);
}

function handlePrintAction() {
  incrementCounter();
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
  if (!t || t.multiPage) return; // never scale multi-page templates

  const printSheet = document.getElementById('printSheet');
  const contentEl = document.getElementById('templateContent');
  if (!printSheet || !contentEl) return;

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
function renderSidebar() {
  const container = document.getElementById('templateList');
  if (!container) return;

  container.innerHTML = templateOrder.map((key) => {
    const t = templates[key];
    const badgeHtml = t.badge
      ? `<span class="text-[10px] ${t.badge.className} font-bold px-1.5 py-0.5 rounded whitespace-nowrap shrink-0 uppercase tracking-wider">${t.badge.text}</span>`
      : '';
    const iconHtml = t.icon ? `<i class="fa-solid ${t.icon} text-xs"></i> ` : '';
    const labelSpanClass = t.labelTextClass ? `${t.labelTextClass} font-bold` : '';

    const controlsHtml = typeof t.controlsHtml === 'function'
      ? `<div id="controls-${key}" style="display: none;">${t.controlsHtml(state)}</div>`
      : '';

    return `
      <div>
        <label onclick="setTemplate('${key}')" class="template-btn flex items-start gap-3 p-3 rounded-lg border ${t.borderClasses} cursor-pointer transition">
          <input type="radio" name="template" value="${key}" ${key === state.currentTemplateKey ? 'checked' : ''} class="mt-1 ${t.radioAccent}">
          <div class="w-full">
            <div class="font-medium text-white flex items-center justify-between gap-2">
              <span class="flex items-center gap-1.5 ${labelSpanClass}">${iconHtml}${t.label}</span>
              ${badgeHtml}
            </div>
            <p class="text-xs text-slate-300 mt-0.5">${t.description}</p>
          </div>
        </label>
        ${controlsHtml}
      </div>
    `;
  }).join('');
}

// ----------------------------------------------------------------------------
// Template switching
// ----------------------------------------------------------------------------
function setTemplate(key) {
  if (!templates[key]) return;
  state.currentTemplateKey = key;

  const printSheet = document.getElementById('printSheet');
  const contentEl = document.getElementById('templateContent');
  const footerContainer = document.getElementById('globalFooterContainer');
  const t = templates[key];

  // Toggle every template's own controls box (only the active one shows).
  templateOrder.forEach((k) => {
    const box = document.getElementById(`controls-${k}`);
    if (box) box.style.display = (k === key) ? 'block' : 'none';
  });

  if (printSheet) {
    printSheet.classList.toggle('multi-page-mode', !!t.multiPage);
  }

  if (footerContainer) {
    footerContainer.style.display = t.multiPage ? 'none' : 'block';
  }

  if (contentEl) {
    contentEl.innerHTML = t.render(state);
  }

  const barEl = document.getElementById('calibrationBar');
  if (barEl) barEl.innerHTML = calibrationBars[t.configType || 'color'];

  if (key === 'jamRemover') updateJamGraphic(state.jamPercent);
  updateCustomNote();
}

// ----------------------------------------------------------------------------
// Jam Remover slider
// ----------------------------------------------------------------------------
function updateJamGraphic(val) {
  const jamBlotch = document.getElementById('jamBlotch');
  const reportPercent = document.getElementById('reportPercent');
  const jamFlavor = document.getElementById('jamFlavor');
  const jamConsistency = document.getElementById('jamConsistency');
  const jamRemaining = document.getElementById('jamRemaining');

  if (reportPercent) reportPercent.textContent = val;

  if (jamBlotch) {
    const rX = (val / 100) * 52;
    const rY = (val / 100) * 58;

    if (val == 0) {
      jamBlotch.setAttribute('d', 'M 100 105 Z');
    } else {
      jamBlotch.setAttribute('d',
        `M ${100 - rX},105 ` +
        `C ${100 - rX},${105 - rY * 0.9} ${100 + rX * 1.1},${105 - rY * 0.85} ${100 + rX},105 ` +
        `C ${100 + rX * 1.15},${105 + rY * 1.05} ${100 - rX * 0.85},${105 - rY * 1.15} ${100 - rX},105 Z`
      );
    }
  }

  if (val == 0) {
    if (jamFlavor) jamFlavor.textContent = 'None Detected (Clean Paper Feed)';
    if (jamConsistency) jamConsistency.textContent = 'Dry / Pure Mechanical Friction';
    if (jamRemaining) jamRemaining.textContent = '100% trapped deep inside fuser gears';
  } else if (val <= 35) {
    if (jamFlavor) jamFlavor.textContent = "Smucker's Concord Grape (Industrial)";
    if (jamConsistency) jamConsistency.textContent = 'Sticky & Semi-Viscous Gelatin';
    if (jamRemaining) jamRemaining.textContent = `${100 - val}% remaining in roller mechanisms`;
  } else if (val <= 70) {
    if (jamFlavor) jamFlavor.textContent = 'Artisanal Seeded Raspberry Jam';
    if (jamConsistency) jamConsistency.textContent = 'Grit-Infused Hydraulic Sludge';
    if (jamRemaining) jamRemaining.textContent = `${100 - val}% remaining on rubber feed tires`;
  } else {
    if (jamFlavor) jamFlavor.textContent = 'High-Fructose Synthetic Marmalade';
    if (jamConsistency) jamConsistency.textContent = 'Crystalline Epoxy-Level Tarry Compound';
    if (jamRemaining) jamRemaining.textContent = `${100 - val}% remaining (Hardware virtually cleared!)`;
  }
}

function handleJamSliderChange(val) {
  state.jamPercent = val;
  const displayEl = document.getElementById('sliderValDisplay');
  if (displayEl) displayEl.textContent = val;
  updateJamGraphic(val);
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
// Boot
// ----------------------------------------------------------------------------
function initApp() {
  const siteUrlLabel = document.getElementById('siteUrlLabel');
  if (siteUrlLabel) siteUrlLabel.textContent = `${SITE_URL.toUpperCase()} LOGICAL UNIT`;

  renderSidebar();
  setTemplate(state.currentTemplateKey);
  loadPrintCount();
}

// Expose the handlers referenced by inline HTML attributes (onclick/oninput)
window.setTemplate = setTemplate;
window.handleJamSliderChange = handleJamSliderChange;
window.handleTrayFeedChange = handleTrayFeedChange;
window.handleCertTechNameChange = handleCertTechNameChange;
window.handleOrderAnimalChange = handleOrderAnimalChange;
window.handleOrderRecipientChange = handleOrderRecipientChange;
window.handleOrderAddressChange = handleOrderAddressChange;
window.updateCustomNote = updateCustomNote;
window.handlePrintAction = handlePrintAction;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
