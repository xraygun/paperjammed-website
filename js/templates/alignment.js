export default {
  key: 'alignment',
  label: '"Parallel" Alignment Test',
  description: 'Claim to test straight lines, but lines clearly cross or curve.',
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
        <div class="border-b-2 border-black pb-3 mb-4 text-center">
          <h1 class="text-xl font-bold uppercase tracking-wider">PARALLEL ALIGNMENT & GEOMETRY MATRIX</h1>
          <p class="text-xs text-slate-600">High-Precision Optical Calibration Standard</p>
        </div>
        <p class="mb-3 text-center font-bold text-xs">PLEASE VERIFY THAT THE BELOW PARALLEL LINES DO NOT CROSS OR CURVE</p>
        <div class="my-6 border border-slate-400 p-4 flex flex-col items-center justify-center">
          <svg class="w-full h-40" viewBox="0 0 500 150" fill="none" stroke="black" stroke-width="2">
            <line x1="10" y1="20" x2="490" y2="20" />
            <path d="M 10 60 Q 250 120 490 60" stroke-dasharray="4" />
            <line x1="10" y1="130" x2="490" y2="90" />
          </svg>
        </div>
      </div>
    `;
  }
};
