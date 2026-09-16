/**
 * Printer Jam Remover 2.0 (Pro Diagnostic Edition)
 * Advanced printer hardware recovery template with dynamic SVG toast graphics,
 * customizable jam flavors, dripping physics, splatter drops, and IT diagnostic metrics.
 */

// Toast shade color configurations based on toastiness selection
const TOAST_PRESETS = {
  white: { label: 'Soft White (Untoasted)', crumb: '#fffbeb', crust: '#fef3c7', stroke: '#d97706', innerStroke: '#fde68a' },
  light: { label: 'Light Golden', crumb: '#fef08a', crust: '#f59e0b', stroke: '#b45309', innerStroke: '#fcd34d' },
  golden: { label: 'Perfect Crisp Golden', crumb: '#fde047', crust: '#d97706', stroke: '#92400e', innerStroke: '#f59e0b' },
  burnt: { label: 'Heavy Burnt Toast', crumb: '#d97706', crust: '#78350f', stroke: '#451a03', innerStroke: '#92400e' },
  cyber: { label: 'Cyber-Charred Slate', crumb: '#334155', crust: '#0f172a', stroke: '#0284c7', innerStroke: '#38bdf8' }
};

// Jam flavor palette configurations with gloss sheen and seed colors
const JAM_FLAVORS = {
  strawberry: {
    name: "Smucker's Strawberry Laser Preserves",
    fill: '#be123c',
    stroke: '#881337',
    glow: '#e11d48',
    highlight: 'rgba(254, 205, 211, 0.65)',
    seed: '#4c0519',
    badgeBg: 'bg-rose-500',
    viscosity: 'Medium-High Viscosity',
    opticalDensity: '1.85 OD'
  },
  grape: {
    name: "Concord Roller Grape Blend",
    fill: '#6b21a8',
    stroke: '#3b0764',
    glow: '#8b5cf6',
    highlight: 'rgba(233, 213, 255, 0.65)',
    seed: '#1e1b4b',
    badgeBg: 'bg-purple-600',
    viscosity: 'Smooth Film',
    opticalDensity: '2.10 OD'
  },
  boysenberry: {
    name: "Thermal-Roll Boysenberry Concentrate",
    fill: '#831843',
    stroke: '#500724',
    glow: '#be185d',
    highlight: 'rgba(251, 207, 232, 0.65)',
    seed: '#2e0a16',
    badgeBg: 'bg-pink-700',
    viscosity: 'Dense Sticky Gelatin',
    opticalDensity: '2.40 OD'
  },
  cyanberry: {
    name: "Cyan-Berry High-Traction Synthetic Gel",
    fill: '#0e7490',
    stroke: '#164e63',
    glow: '#06b6d4',
    highlight: 'rgba(207, 250, 254, 0.70)',
    seed: '#083344',
    badgeBg: 'bg-cyan-600',
    viscosity: 'Industrial Hydrogel',
    opticalDensity: '1.95 OD'
  },
  tonersmear: {
    name: "Toner-Smear Blackberry Sludge (Warning: Messy)",
    fill: '#1e293b',
    stroke: '#0f172a',
    glow: '#475569',
    highlight: 'rgba(148, 163, 184, 0.55)',
    seed: '#020617',
    badgeBg: 'bg-slate-800',
    viscosity: 'Extreme Tar Sludge',
    opticalDensity: '3.50 OD (Maximum)'
  }
};

/**
 * Generates dynamic SVG graphics for the jam blotch, drip trails, seed particles, and gloss sheen.
 * @param {number} coverage - Percent value from 0 to 100
 * @param {string} flavorKey - Selected jam flavor ID
 * @param {number} splatterDensity - Splatter level from 0 to 100
 * @returns {string} SVG graphics markup
 */
function generateJam20Svg(coverage, flavorKey = 'strawberry', splatterDensity = 50) {
  if (coverage <= 0) return '';

  const flavor = JAM_FLAVORS[flavorKey] || JAM_FLAVORS.strawberry;
  const cx = 100;
  const cy = 105;
  const maxR = 58 * (coverage / 100);
  if (maxR < 0.8) return '';

  // 1. Generate main organic blotch contour
  const points = [];
  const numPoints = 14;
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2;
    const wobble = 0.82 + 0.22 * Math.sin(angle * 3 + coverage * 0.12) + 0.14 * Math.cos(angle * 2.5);
    const r = maxR * wobble;
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

    const cp1x = curr.x + (next.x - prev.x) * 0.22;
    const cp1y = curr.y + (next.y - prev.y) * 0.22;
    const cp2x = next.x - (next2.x - curr.x) * 0.22;
    const cp2y = next.y - (next2.y - curr.y) * 0.22;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${next.x.toFixed(1)} ${next.y.toFixed(1)}`;
  }

  // 2. Generate dripping trails down the slice if coverage > 25%
  let dripPaths = '';
  if (coverage > 25) {
    const numDrips = Math.min(4, Math.floor((coverage - 20) / 18));
    for (let i = 0; i < numDrips; i++) {
      const dripX = cx - maxR * 0.5 + (i * maxR * 1.1) / Math.max(1, numDrips - 1);
      const dripYStart = cy + maxR * 0.3;
      const dripLength = 12 + (coverage * 0.28) * (0.8 + 0.4 * Math.sin(i * 2.1));
      const dripWidth = 4 + (coverage * 0.05);

      dripPaths += `<path d="M ${dripX - dripWidth / 2} ${dripYStart} Q ${dripX} ${dripYStart + dripLength} ${dripX + dripWidth / 2} ${dripYStart} Z" fill="${flavor.fill}" stroke="${flavor.stroke}" stroke-width="1" />`;
    }
  }

  // 3. Generate splatter droplets surrounding main blotch
  let splatterElements = '';
  if (splatterDensity > 0 && coverage > 10) {
    const dropCount = Math.round((splatterDensity / 100) * 12);
    for (let i = 0; i < dropCount; i++) {
      const dropAngle = i * (Math.PI * 2 / dropCount) + (coverage * 0.05);
      const dropDist = maxR * (1.2 + 0.35 * Math.sin(i * 3.7));
      const dropX = cx + Math.cos(dropAngle) * dropDist;
      const dropY = cy + Math.sin(dropAngle) * dropDist;
      const dropRadius = 1.2 + (i % 3) * 0.9;

      splatterElements += `<circle cx="${dropX.toFixed(1)}" cy="${dropY.toFixed(1)}" r="${dropRadius.toFixed(1)}" fill="${flavor.fill}" stroke="${flavor.stroke}" stroke-width="0.8" />`;
    }
  }

  // 4. Gloss specular highlights
  let sheenElements = '';
  if (maxR > 12) {
    const sheenX = cx - maxR * 0.3;
    const sheenY = cy - maxR * 0.3;
    const sheenR = maxR * 0.28;
    sheenElements = `
      <ellipse cx="${sheenX.toFixed(1)}" cy="${sheenY.toFixed(1)}" rx="${sheenR.toFixed(1)}" ry="${(sheenR * 0.5).toFixed(1)}" 
               transform="rotate(-25 ${sheenX.toFixed(1)} ${sheenY.toFixed(1)})" 
               fill="${flavor.highlight}" opacity="0.85" />
    `;
  }

  // 5. Embedded jam seeds/particles
  let seedElements = '';
  if (coverage > 15 && flavorKey !== 'tonersmear') {
    const seedCount = Math.min(10, Math.floor(coverage / 10));
    for (let i = 0; i < seedCount; i++) {
      const sAngle = i * 2.39996 + (coverage * 0.1);
      const sR = Math.sqrt((i + 1) / seedCount) * (maxR * 0.62);
      const sx = cx + Math.cos(sAngle) * sR;
      const sy = cy + Math.sin(sAngle) * sR;

      seedElements += `
        <ellipse cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" rx="1.8" ry="1.0" 
                 transform="rotate(${(sAngle * 57.3).toFixed(1)} ${sx.toFixed(1)} ${sy.toFixed(1)})" 
                 fill="${flavor.seed}" opacity="0.9" />
      `;
    }
  }

  return `
    <g id="jam20Layer">
      ${dripPaths}
      <path id="jamMainBlob" d="${d}" fill="${flavor.fill}" stroke="${flavor.stroke}" stroke-width="1.8" 
            style="filter: drop-shadow(0px 3px 6px rgba(0,0,0,0.3)); transition: all 0.2s ease-out;" />
      ${sheenElements}
      ${seedElements}
      ${splatterElements}
    </g>
  `;
}

/**
 * Generates full SVG for the bread slice with configurable toast level.
 * @param {number} coverage - Jam coverage percentage
 * @param {string} toastKey - Toast level key (white, light, golden, burnt, cyber)
 * @param {string} flavorKey - Selected jam flavor key
 * @param {number} splatter - Splatter level
 * @returns {string} Complete SVG string
 */
function renderBreadGraphicSvg(coverage, toastKey = 'golden', flavorKey = 'strawberry', splatter = 50) {
  const toast = TOAST_PRESETS[toastKey] || TOAST_PRESETS.golden;
  const jamGroup = generateJam20Svg(coverage, flavorKey, splatter);

  return `
    <svg id="breadSvg20" viewBox="0 0 200 210" width="230" height="230" class="mx-auto drop-shadow-md">
      <!-- Outer Crust Outer Shadow / Base -->
      <path d="M 35,75 C 20,40 60,18 100,20 C 140,18 180,40 165,75 C 172,120 160,172 145,178 C 120,183 80,183 55,178 C 40,172 28,120 35,75 Z" 
            fill="${toast.crust}" stroke="${toast.stroke}" stroke-width="4.5" stroke-linejoin="round"/>
      
      <!-- Inner Crumb Surface -->
      <path d="M 42,77 C 29,46 64,26 100,28 C 136,26 171,46 158,77 C 164,118 153,165 140,170 C 118,175 82,175 60,170 C 47,165 36,118 42,77 Z" 
            fill="${toast.crumb}" stroke="${toast.innerStroke}" stroke-width="2" stroke-dasharray="4 4"/>
      
      <!-- Crumb Pores Texture -->
      <g fill="${toast.stroke}" opacity="0.15">
        <circle cx="70" cy="80" r="2.5" />
        <circle cx="130" cy="85" r="3" />
        <circle cx="95" cy="140" r="2" />
        <circle cx="140" cy="130" r="2.2" />
        <circle cx="65" cy="135" r="2.8" />
        <circle cx="110" cy="70" r="1.8" />
        <circle cx="80" cy="110" r="2" />
        <circle cx="120" cy="115" r="2.4" />
      </g>

      <!-- Dynamic Jam Layer 2.0 -->
      ${jamGroup}
    </svg>
  `;
}

export default {
  key: 'jamRemover',
  label: 'Printer Jam Remover 2.0 (Pro)',
  description: 'Pro printer jam extraction tool! Customizable toast crispness, viscous jam flavors, drippings & IT metrics.',
  icon: 'fa-bread-slice',
  badge: {
    text: 'v2.0 PRO',
    className: 'bg-gradient-to-r from-rose-500 to-amber-500 text-white font-extrabold shadow-sm'
  },
  borderClasses: 'border-rose-500/50 hover:border-rose-400 bg-rose-950/20 hover:bg-rose-900/30',
  radioAccent: 'accent-rose-500',
  labelTextClass: 'text-rose-300 font-bold',
  configType: 'color',
  multiPage: false,

  controlsHtml(state) {
    const coverage = state?.jamCoverage ?? 35;
    const flavor = state?.jamFlavor ?? 'strawberry';
    const toast = state?.toastiness ?? 'golden';
    const splatter = state?.splatterDensity ?? 50;

    return `
      <div id="jamControlsBox" class="bg-rose-950/40 border border-rose-500/30 rounded-lg p-3.5 space-y-3 shadow-inner">
        
        <!-- Coverage Slider -->
        <div class="space-y-1">
          <div class="flex justify-between items-center">
            <label for="jamSliderInput" class="text-[11px] font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
              <i class="fa-solid fa-sliders text-rose-400"></i>
              <span>Jam Extracted Coverage:</span>
            </label>
            <span class="text-xs font-mono font-bold text-white bg-rose-900/80 border border-rose-500/40 px-2 py-0.5 rounded">
              <span id="sliderValDisplay">${coverage}</span>%
            </span>
          </div>
          <input type="range" id="jamSliderInput" min="0" max="100" value="${coverage}" oninput="handleJamSliderChange(this.value)"
            class="w-full accent-rose-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer">
        </div>

        <!-- Jam Flavor Selector -->
        <div class="space-y-1">
          <label for="jamFlavorSelect" class="text-[11px] font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
            <i class="fa-solid fa-flask text-rose-400"></i>
            <span>Jam Flavor / Gel Type:</span>
          </label>
          <select id="jamFlavorSelect" onchange="handleJamFlavorChange(this.value)" class="w-full bg-slate-900 border border-rose-500/40 text-rose-100 text-xs rounded p-1.5 focus:outline-none focus:border-rose-400 font-mono">
            <option value="strawberry" ${flavor === 'strawberry' ? 'selected' : ''}>🍓 Smucker's Strawberry Laser Preserves</option>
            <option value="grape" ${flavor === 'grape' ? 'selected' : ''}>🍇 Concord Roller Grape Blend</option>
            <option value="boysenberry" ${flavor === 'boysenberry' ? 'selected' : ''}>🫐 Thermal-Roll Boysenberry Concentrate</option>
            <option value="cyanberry" ${flavor === 'cyanberry' ? 'selected' : ''}>🧪 Cyan-Berry Viscous Synthetic Gel</option>
            <option value="tonersmear" ${flavor === 'tonersmear' ? 'selected' : ''}>🖤 Toner-Smear Blackberry Sludge</option>
          </select>
        </div>

        <!-- Toastiness Level Selector -->
        <div class="grid grid-cols-2 gap-2 pt-1">
          <div>
            <label for="toastnessSelect" class="text-[10px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
              🍞 Toast Level:
            </label>
            <select id="toastnessSelect" onchange="handleToastinessChange(this.value)" class="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded p-1 focus:outline-none font-mono">
              <option value="white" ${toast === 'white' ? 'selected' : ''}>Soft White</option>
              <option value="light" ${toast === 'light' ? 'selected' : ''}>Light Toast</option>
              <option value="golden" ${toast === 'golden' ? 'selected' : ''}>Golden Crisp</option>
              <option value="burnt" ${toast === 'burnt' ? 'selected' : ''}>Heavy Burnt</option>
              <option value="cyber" ${toast === 'cyber' ? 'selected' : ''}>Cyber Slate</option>
            </select>
          </div>

          <div>
            <label for="splatterSliderInput" class="text-[10px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
              💦 Splatter Level:
            </label>
            <input type="range" id="splatterSliderInput" min="0" max="100" value="${splatter}" oninput="handleSplatterChange(this.value)"
              class="w-full accent-amber-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer mt-1">
          </div>
        </div>

        <div class="flex items-center justify-between text-[10px] text-slate-300 italic pt-1 border-t border-rose-900/50">
          <span>Jam 2.0 Pro: Cleans hardware rollers with sticky simulations.</span>
        </div>
      </div>
    `;
  },

  render(state) {
    const coverage = state?.jamCoverage ?? 35;
    const flavorKey = state?.jamFlavor ?? 'strawberry';
    const toastKey = state?.toastiness ?? 'golden';
    const splatter = state?.splatterDensity ?? 50;

    const flavorObj = JAM_FLAVORS[flavorKey] || JAM_FLAVORS.strawberry;
    const toastObj = TOAST_PRESETS[toastKey] || TOAST_PRESETS.golden;

    const now = new Date();
    const timestamp = state?.timestamp || (
      now.getFullYear() + '-' + 
      String(now.getMonth() + 1).padStart(2, '0') + '-' + 
      String(now.getDate()).padStart(2, '0') + ' ' + 
      String(now.getHours()).padStart(2, '0') + ':' + 
      String(now.getMinutes()).padStart(2, '0')
    );

    const svgMarkup = renderBreadGraphicSvg(coverage, toastKey, flavorKey, splatter);
    const residual = Math.max(0, 100 - coverage);
    const frictionGain = Math.round(coverage * 1.45);

    return `
      <div id="tplJamRemover" class="text-center relative bg-white text-slate-900 font-mono">
        
        <div class="w-full">
          <!-- Top Banner -->
          <div class="bg-slate-900 text-white p-3 text-center rounded-sm uppercase tracking-widest font-black text-base border-b-4 border-rose-600 mb-3 shadow-sm flex items-center justify-between px-4">
            <span class="flex items-center gap-2">
              <i class="fa-solid fa-triangle-exclamation text-rose-500"></i>
              <span>PRINTER JAM REMOVER v2.0 PRO</span>
            </span>
            <span class="text-xs bg-rose-600 text-white px-2 py-0.5 rounded font-mono font-normal">
              DIAGNOSTIC PASS
            </span>
          </div>

          <p class="text-center text-[10px] sm:text-[11px] text-slate-600 uppercase tracking-wider font-bold mb-2">
            HARDWARE ROLLERS EXTRACTION PROTOCOL • DUAL-SURFACE SPREAD PASS
          </p>

          <!-- Bread Line Drawing SVG Container -->
          <div class="flex justify-center my-1">
            <div class="border-2 border-slate-900 p-3 rounded-lg bg-slate-50 shadow-inner text-center relative">
              
              <!-- Badge overlay -->
              <div class="absolute top-2 right-2 text-[9px] font-bold ${flavorObj.badgeBg} text-white px-2 py-0.5 rounded shadow">
                ${toastObj.label}
              </div>

              ${svgMarkup}

              <span class="text-[9px] text-slate-500 font-mono mt-1 block font-bold uppercase tracking-wider">
                1:1 DIAGNOSTIC RENDER: HIGH-VISCOSITY JAM EXTRACTED TO BREAD SLICE
              </span>
            </div>
          </div>

          <!-- Analysis / Report Section 2.0 -->
          <div class="mt-3 border-2 border-slate-800 p-3 rounded bg-slate-50 space-y-2 text-xs text-left">
            <div class="font-bold border-b border-slate-400 pb-1 uppercase flex justify-between items-center">
              <span class="flex items-center gap-1.5 text-slate-900">
                <i class="fa-solid fa-microchip text-rose-600"></i>
                <span>📋 JAM EXTRACTION HARDWARE ANALYSIS</span>
              </span>
              <span class="text-rose-700 bg-rose-100 px-2 py-0.5 rounded font-mono font-black">
                COVERAGE: <span id="reportPercent">${coverage}</span>%
              </span>
            </div>

            <!-- Metrics Grid -->
            <div class="grid grid-cols-2 gap-2 pt-0.5 text-[11px]">
              <div class="p-1.5 bg-white border border-slate-200 rounded">
                <strong class="text-slate-700">Jam Flavor Profile:</strong>
                <p id="jamFlavor" class="font-bold text-rose-800 truncate">${flavorObj.name}</p>
              </div>

              <div class="p-1.5 bg-white border border-slate-200 rounded">
                <strong class="text-slate-700">Consistency:</strong>
                <p id="jamConsistency" class="font-bold text-slate-900">${flavorObj.viscosity}</p>
              </div>

              <div class="p-1.5 bg-white border border-slate-200 rounded">
                <strong class="text-slate-700">Optical Density:</strong>
                <p class="font-bold text-slate-800 font-mono">${flavorObj.opticalDensity}</p>
              </div>

              <div class="p-1.5 bg-white border border-slate-200 rounded">
                <strong class="text-slate-700">Roller Traction Gain:</strong>
                <p class="font-bold text-emerald-700 font-mono">+${frictionGain}% Grip Improvement</p>
              </div>
            </div>

            <div class="text-[11px] flex justify-between items-center bg-amber-50 p-1.5 border border-amber-200 rounded">
              <span><strong>Residual Roller Jam:</strong> <span id="jamRemaining" class="font-bold text-amber-900">${residual}% remaining in tray feed path</span></span>
              <span class="text-[10px] text-amber-700 font-bold uppercase">STATUS: PASS</span>
            </div>

            <div class="p-2 bg-rose-100 border-l-4 border-rose-600 text-rose-950 font-bold text-[11px] flex items-center gap-2">
              <i class="fa-solid fa-circle-info text-rose-700 text-sm shrink-0"></i>
              <span>INSTRUCTION: If paper tray still feels sticky, re-run this sheet upside down for secondary pass.</span>
            </div>
          </div>
        </div>

        <!-- Footer / Status -->
        <div class="w-full border-t-2 border-slate-900 pt-2.5 mt-3 flex flex-row justify-between items-center gap-2 text-[10px] font-mono text-slate-700 uppercase">
          <div class="text-left">
            <p>Diagnostic Status: <span class="font-bold text-emerald-700">HARDWARE CLEANED VIA TOAST SIMULATION</span></p>
            <p class="text-[9px] text-slate-500">Rollers degreased using fruit-based viscosity adhesion dynamics.</p>
          </div>

          <div class="text-center bg-slate-100 border border-slate-300 px-3 py-1 rounded shadow-xs">
            <p class="font-bold text-slate-900">RETURN TO IT DEPT IF TOAST IS BURNT</p>
          </div>

          <div class="text-right text-[10px] text-slate-500">
            <p>Page 1 of 1 • Jam 2.0 Pro</p>
            <p id="jamTimestampDisplay">${timestamp}</p>
          </div>
        </div>

      </div>
    `;
  }
};