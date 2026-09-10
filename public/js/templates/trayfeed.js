// Tray Feed Stress Test template
// This one is dynamic: it draws `state.trayFeedCount` printable pages, where
// page 1 has instructions and every page after that is intentionally blank.
export default {
  key: 'trayfeed',
  label: 'Tray Feed Stress Test',
  description: 'Feeds 2–100 sheets. Page 1 prints instructions; all subsequent pages are 100% blank.',
  icon: 'fa-copy',
  badge: { text: 'NEW!', className: 'bg-cyan-500 text-slate-950' },
  borderClasses: 'border-cyan-500/50 hover:border-cyan-400 bg-cyan-950/20 hover:bg-cyan-900/30',
  radioAccent: 'accent-cyan-500',
  labelTextClass: 'text-cyan-300',
  configType: 'bw',
  multiPage: true,

  controlsHtml(state) {
    const count = state.trayFeedCount;
    return `
      <div class="mt-2 bg-cyan-950/40 border border-cyan-500/30 rounded-lg p-3.5 space-y-2.5 shadow-inner">
        <div class="flex justify-between items-center">
          <label for="trayFeedNumInput" class="text-[11px] font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
            <i class="fa-solid fa-scroll text-cyan-400"></i>
            <span>Paper Feed Count:</span>
          </label>
          <div class="flex items-center gap-1">
            <input type="number" id="trayFeedNumInput" min="2" max="100" value="${count}" oninput="handleTrayFeedChange(this.value)"
              class="w-16 bg-slate-900 border border-cyan-500/50 text-cyan-200 text-center text-xs font-mono font-bold rounded py-1 focus:outline-none">
            <span class="text-xs font-mono text-cyan-300">Sheets</span>
          </div>
        </div>

        <input type="range" id="trayFeedSliderInput" min="2" max="100" value="${count}" oninput="handleTrayFeedChange(this.value)"
          class="w-full accent-cyan-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer">

        <p class="text-[10px] text-slate-300 italic">
          Tests pickup rollers cleanly without wasting ink on subsequent pages!
        </p>
      </div>
    `;
  },

  render(state) {
    const totalPages = parseInt(state.trayFeedCount, 10) || 2;
    let pagesHtml = '';

    for (let i = 1; i <= totalPages; i++) {
      const isFirst = i === 1;
      pagesHtml += `
        <div class="print-page bg-white p-6 border border-slate-200 rounded-sm min-h-[980px] flex flex-col justify-between ${i < totalPages ? 'border-b-4 border-b-dashed border-slate-400 mb-8' : ''}">
          ${isFirst ? `
            <div class="border-b border-slate-900 pb-2 flex justify-between items-center text-xs font-mono">
              <span class="font-bold uppercase tracking-wider">📑 TRAY FEED STRESS TEST</span>
              <span class="font-bold bg-slate-900 text-white px-2 py-0.5 rounded text-[10px]">PAGE 1 OF ${totalPages}</span>
            </div>

            <div class="my-auto text-center font-mono space-y-3 py-12">
              <div class="p-6 border-2 border-slate-900 bg-slate-50 inline-block rounded max-w-md shadow-sm text-left">
                <h2 class="font-bold text-base mb-1 text-slate-950">PAGE 1 OF ${totalPages} (FEED START)</h2>
                <p class="text-xs text-slate-600 leading-relaxed">
                  Tray feed cycle initialized. All ${totalPages - 1} subsequent page(s) feed blank paper to stress-test paper pickup rollers with ZERO ink usage.
                </p>
              </div>
            </div>

            <div class="border-t border-slate-300 pt-2 text-[10px] text-slate-500 font-mono flex justify-between">
              <span>PAPERJAMMED.NET TRAY TEST</span>
              <span>TOTAL FEED: ${totalPages} SHEETS</span>
            </div>
          ` : `
            <div class="no-print opacity-40 text-slate-400 text-xs uppercase tracking-widest font-mono text-center my-auto">
              [ PAGE ${i} OF ${totalPages} IS 100% BLANK ON PRINT ]
            </div>
          `}
        </div>
      `;
    }

    return pagesHtml;
  }
};
