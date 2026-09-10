export default {
  key: 'technobabble',
  label: 'Technobabble Report',
  description: 'Looks official, filled with absurd futuristic IT jargon.',
  icon: null,
  badge: { text: 'B/W + Color', className: 'bg-slate-700 text-emerald-300' },
  borderClasses: 'border-slate-700 hover:border-slate-500 bg-slate-800/50 hover:bg-slate-700/50',
  radioAccent: 'accent-indigo-500',
  labelTextClass: '',
  configType: 'color',
  multiPage: false,

  render() {
    return `
      <div>
        <div class="border-b-2 border-black pb-3 mb-4 flex justify-between items-start">
          <div>
            <h1 class="text-lg font-extrabold tracking-tight uppercase">ULTRA-DIAGNOSTIC PRINTER CALIBRATION REPORT</h1>
            <p class="text-xs text-slate-600">Sub-system Verification & Quantum Particle Alignment</p>
          </div>
          <div class="text-right">
            <span class="border border-black px-2 py-1 font-bold text-xs uppercase">STATUS: OPTIMAL</span>
          </div>
        </div>
        <p class="text-xs leading-relaxed text-slate-800">Initializing retro-encabulator... The primary waneshaft has successfully aligned with the lunar wane-shafts. Thermal nozzle sweep completed.</p>
      </div>
    `;
  }
};
