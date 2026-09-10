// Printer Jam Remover template
// The SVG blotch + report fields get updated live by updateJamGraphic() in app.js
// whenever the slider moves — this render() just draws the initial (30%) state.
export default {
  key: 'jamRemover',
  label: 'Printer Jam Remover',
  description: 'Extract printer "jam" onto a line-art slice of bread with a customizable slider blotch!',
  icon: 'fa-bread-slice',
  badge: { text: 'POPULAR', className: 'bg-rose-500 text-white' },
  borderClasses: 'border-rose-500/50 hover:border-rose-400 bg-rose-950/20 hover:bg-rose-900/30',
  radioAccent: 'accent-rose-500',
  labelTextClass: 'text-rose-300',
  configType: 'color',
  multiPage: false,

  controlsHtml() {
    return `
      <div class="mt-2 bg-rose-950/40 border border-rose-500/30 rounded-lg p-3.5 space-y-2.5 shadow-inner">
        <div class="flex justify-between items-center">
          <label for="jamSliderInput" class="text-[11px] font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
            <i class="fa-solid fa-sliders text-rose-400"></i>
            <span>Extracted Jam Coverage:</span>
          </label>
          <span class="text-xs font-mono font-bold text-white bg-rose-900/80 border border-rose-500/40 px-2 py-0.5 rounded">
            <span id="sliderValDisplay">30</span>%
          </span>
        </div>

        <input type="range" id="jamSliderInput" min="0" max="100" value="30" oninput="handleJamSliderChange(this.value)"
          class="w-full accent-rose-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer">

        <p class="text-[10px] text-slate-300 italic">
          Slide to adjust the amount of fruit jam printed on the bread!
        </p>
      </div>
    `;
  },

  render() {
    return `
      <div>
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

              <path id="jamBlotch"
                    d="M 100 100 Z"
                    fill="#be123c" opacity="0.88" stroke="#881337" stroke-width="1.5"
                    style="transition: all 0.15s ease-out; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.25));" />
            </svg>

            <span class="text-[9px] text-slate-500 font-mono mt-1 block font-bold">
              DIAGNOSTIC VISUAL: BREAD SLICE (1:1 SCALE)
            </span>
          </div>
        </div>

        <!-- Analysis / Report Section -->
        <div class="mt-4 border-2 border-slate-800 p-3 rounded bg-slate-50 space-y-1.5 text-xs">
          <div class="font-bold border-b border-slate-400 pb-1 uppercase flex justify-between">
            <span>📋 JAM EXTRACTION ANALYSIS REPORT</span>
            <span class="text-rose-700">VAL: <span id="reportPercent">30</span>%</span>
          </div>

          <div class="grid grid-cols-2 gap-2 pt-0.5 text-[11px]">
            <div><strong>Extracted Flavor:</strong> <span id="jamFlavor">Smucker's Concord Grape</span></div>
            <div><strong>Consistency:</strong> <span id="jamConsistency">Viscous Gelatinous Sludge</span></div>
          </div>

          <div class="text-[11px]">
            <strong>Residual Roller Jam:</strong> <span id="jamRemaining">70% remaining in paper tray</span>
          </div>

          <div class="p-2 bg-rose-100 border-l-4 border-rose-600 text-rose-900 font-bold mt-2 text-[11px]">
            💡 INSTRUCTION: Reprint page to continue removing jam from printer mechanisms.
          </div>
        </div>
      </div>
    `;
  }
};
