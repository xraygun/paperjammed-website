export default {
  key: 'pcloadletter',
  label: 'PC LOAD LETTER',
  description: 'Large dot-matrix error screen throwback inspired by Office Space (1999).',
  icon: 'fa-terminal',
  badge: null,
  borderClasses: 'border-slate-700 hover:border-slate-500 bg-slate-800/50 hover:bg-slate-700/50',
  radioAccent: 'accent-amber-500',
  labelTextClass: 'text-amber-300',
  configType: 'bw',
  multiPage: false,

  render() {
    return `
      <div class="flex flex-col justify-between h-full py-2 font-mono">
        <div class="border-b-4 border-black pb-2 flex justify-between items-center">
          <div>
            <span class="text-xs font-black uppercase tracking-widest text-slate-500 block">SYSTEM ERROR DIAGNOSTIC</span>
            <span class="text-sm font-bold text-slate-900">LASERJET III - PORT LPT1:</span>
          </div>
          <div class="text-right">
            <span class="border-2 border-black text-slate-900 text-xs px-2 py-1 font-bold uppercase">CODE: 21</span>
          </div>
        </div>

        <div class="my-6 border-4 border-black border-double bg-slate-50 p-6 rounded-sm text-center">
          <p class="text-slate-700 font-dotmatrix text-xl md:text-2xl tracking-widest mb-1 font-bold uppercase">
            ** PRINTER STATUS ERROR **
          </p>
          <h1 class="text-slate-950 font-dotmatrix text-5xl md:text-7xl font-black tracking-widest my-3 py-1">
            PC LOAD LETTER
          </h1>
          <p class="text-slate-800 font-dotmatrix text-lg md:text-xl tracking-widest mt-1 font-bold uppercase">
            [ PAPER CASSETTE EMPTY: LOAD LETTER ]
          </p>
        </div>

        <div class="border-2 border-black p-4 bg-slate-50 space-y-2 text-xs">
          <div class="border-b border-black pb-1 font-bold uppercase tracking-wider text-xs flex justify-between items-center">
            <span>RECOMMENDED USER ACTION</span>
            <span class="text-[10px] text-slate-500">REF: INITECH-8832</span>
          </div>
          <ol class="list-decimal pl-5 space-y-1 text-slate-800 text-[11px]">
            <li><strong>Do not panic.</strong> Repeat slowly: <em>"What the f*** does PC Load Letter mean?"</em></li>
            <li>Refrain from retrieving a baseball bat and carrying printer to an open grassy field.</li>
            <li>Load standard Letter size paper (8.5" x 11") into Cassette 2.</li>
          </ol>
        </div>
      </div>
    `;
  }
};
