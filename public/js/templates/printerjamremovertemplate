/**
 * Generates dynamic SVG path for the jam blotch on top of the line-art bread slice.
 * @param {number} coverage - Percent value from 0 to 100
 * @returns {string} SVG path string or empty string
 */
function generateBlotchPath(coverage) {
  if (coverage <= 0) return '';
  const cx = 100;
  const cy = 100;
  const maxR = 52 * (coverage / 100);
  if (maxR < 1) return '';

  const points = [];
  const numPoints = 12;
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2;
    const r = maxR * (0.8 + 0.25 * Math.sin(angle * 3 + coverage * 0.1) + 0.15 * Math.cos(angle * 2));
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    points.push({ x, y });
  }

  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < numPoints; i++) {
    const curr = points[i];
    const next = points[(i + 1) % numPoints];
    const prev = points[(i - 1 + numPoints) % numPoints];
    const next2 = points[(i + 2) % numPoints];

    const cp1x = curr.x + (next.x - prev.x) * 0.2;
    const cp1y = curr.y + (next.y - prev.y) * 0.2;
    const cp2x = next.x - (next2.x - curr.x) * 0.2;
    const cp2y = next.y - (next2.y - curr.y) * 0.2;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${next.x.toFixed(1)} ${next.y.toFixed(1)}`;
  }

  return `<path id="jamBlotch" d="${d}" fill="#be123c" opacity="0.88" stroke="#881337" stroke-width="1.5" style="transition: all 0.15s ease-out; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.25));" />`;
}

function getJamFlavor(coverage) {
  if (coverage <= 25) return "Smucker's Concord Grape";
  if (coverage <= 50) return "Smucker's Strawberry Preserves";
  if (coverage <= 75) return "Boysenberry / Roller Lubricant Blend";
  return "Triple Berry High-Viscosity Gel";
}

function getJamConsistency(coverage) {
  if (coverage <= 25) return "Light Fruity Film";
  if (coverage <= 50) return "Viscous Gelatinous Sludge";
  if (coverage <= 75) return "Dense Concentrated Preserve";
  return "Industrial Grade Sticky Goo";
}

export default {
  key: 'jamRemover',
  label: 'Printer Jam Remover',
  description: 'Extract printer "jam" onto a line-art slice of bread with a customizable slider blotch!',
  icon: 'bread-slice',
  badge: {
    text: 'POPULAR',
    className: 'bg-rose-500 text-white font-bold'
  },
  borderClasses: 'border-rose-500/50 hover:border-rose-400 bg-rose-950/20 hover:bg-rose-900/30',
  radioAccent: 'accent-rose-500',
  labelTextClass: 'text-rose-300 font-bold',
  configType: 'color',
  multiPage: false,

  controlsHtml(state) {
    const coverage = state?.jamCoverage ?? 30;
    return `
      <div id="jamControlsBox" class="bg-rose-950/40 border border-rose-500/30 rounded-lg p-3.5 space-y-2.5 shadow-inner">
        <div class="flex justify-between items-center">
          <label for="jamSliderInput" class="text-[11px] font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
            <i class="fa-solid fa-sliders text-rose-400"></i>
            <span>Extracted Jam Coverage:</span>
          </label>
          <span class="text-xs font-mono font-bold text-white bg-rose-900/80 border border-rose-500/40 px-2 py-0.5 rounded">
            <span id="sliderValDisplay">${coverage}</span>%
          </span>
        </div>

        <input type="range" id="jamSliderInput" min="0" max="100" value="${coverage}"
          class="w-full accent-rose-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer">

        <div class="flex items-center justify-between text-[10px] text-slate-300 italic">
          <span>Slide to adjust the amount of fruit jam printed on the bread!</span>
        </div>
      </div>
    `;
  },

  render(state) {
    const coverage = state?.jamCoverage ?? 30;
    const now = new Date();
    const timestamp = state?.timestamp || (
      now.getFullYear() + '-' + 
      String(now.getMonth() + 1).padStart(2, '0') + '-' + 
      String(now.getDate()).padStart(2, '0') + ' ' + 
      String(now.getHours()).padStart(2, '0') + ':' + 
      String(now.getMinutes()).padStart(2, '0')
    );

    const blotchSvg = generateBlotchPath(coverage);
    const flavor = getJamFlavor(coverage);
    const consistency = getJamConsistency(coverage);
    const remaining = Math.max(0, 100 - coverage);

    return `
      <div id="tplJamRemover" class="print-page flex flex-col justify-between items-center text-center h-full min-h-[600px] sm:min-h-[720px] relative bg-white text-slate-900 p-4 sm:p-6 font-mono">
        
        <div class="w-full">
          <!-- Banner -->
          <div class="bg-slate-900 text-white p-2.5 text-center rounded-sm uppercase tracking-widest font-black text-base border-b-4 border-rose-600 mb-4 shadow-sm">
            ⚠️ PRINTER JAM REMOVER
          </div>

          <p class="text-center text-[11px] text-slate-600 uppercase tracking-wider font-bold mb-3">
            EXTRACTING RESIDUAL JAM FROM HARDWARE FEED ROLLERS
          </p>

          <!-- Bread Line Drawing SVG Container -->
          <div class="flex justify-center my-2">
            <div class="border-2 border-slate-900 p-4 rounded-lg bg-slate-50 shadow-inner text-center">
              <svg id="breadSvg" viewBox="0 0 200 200" width="220" height="220" class="mx-auto">
                <path d="M 35,75 C 20,40 60,18 100,20 C 140,18 180,40 165,75 C 172,120 160,172 145,178 C 120,183 80,183 55,178 C 40,172 28,120 35,75 Z" 
                      fill="#fde047" stroke="#1e293b" stroke-width="4.5" stroke-linejoin="round"/>
                
                <path d="M 42,77 C 29,46 64,26 100,28 C 136,26 171,46 158,77 C 164,118 153,165 140,170 C 118,175 82,175 60,170 C 47,165 36,118 42,77 Z" 
                      fill="#fef9c3" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="4 4"/>
                
                ${blotchSvg}
              </svg>

              <span class="text-[9px] text-slate-500 font-mono mt-1 block font-bold">
                DIAGNOSTIC VISUAL: BREAD SLICE (1:1 SCALE)
              </span>
            </div>
          </div>

          <!-- Analysis / Report Section -->
          <div class="mt-4 border-2 border-slate-800 p-3 rounded bg-slate-50 space-y-1.5 text-xs text-left">
            <div class="font-bold border-b border-slate-400 pb-1 uppercase flex justify-between">
              <span>📋 JAM EXTRACTION ANALYSIS REPORT</span>
              <span class="text-rose-700">VAL: <span id="reportPercent">${coverage}</span>%</span>
            </div>

            <div class="grid grid-cols-2 gap-2 pt-0.5 text-[11px]">
              <div><strong>Extracted Flavor:</strong> <span id="jamFlavor">${flavor}</span></div>
              <div><strong>Consistency:</strong> <span id="jamConsistency">${consistency}</span></div>
            </div>

            <div class="text-[11px]">
              <strong>Residual Roller Jam:</strong> <span id="jamRemaining">${remaining}% remaining in paper tray</span>
            </div>

            <div class="p-2 bg-rose-100 border-l-4 border-rose-600 text-rose-900 font-bold mt-2 text-[11px]">
              💡 INSTRUCTION: Reprint page to continue removing jam from printer mechanisms.
            </div>
          </div>
        </div>

        <!-- Footer / Status -->
        <div class="w-full border-t-2 border-slate-900 pt-3 mt-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px] font-mono text-slate-700 uppercase">
          <div class="text-center sm:text-left">
            <p>Diagnostic Status: <span class="font-bold text-emerald-700">STUCK JAM EXTRACTED TO TOAST</span></p>
            <p class="text-[10px] text-slate-500">Rollers cleaned via sticky fruit-spread simulation pass.</p>
          </div>
          <div class="text-center bg-slate-100 border border-slate-300 px-3 py-1 rounded">
            <p class="font-bold text-slate-900">PLEASE RETURN SHEET TO IT DEPT IF TASTE IS SOUR</p>
          </div>
          <div class="text-center sm:text-right text-[10px] text-slate-500">
            <p>Page 1 of 1</p>
            <p id="jamTimestampDisplay">${timestamp}</p>
          </div>
        </div>

      </div>
    `;
  }
};
