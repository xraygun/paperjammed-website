export default {
  key: 'kiss',
  label: 'K-I-S-S IT Checkbox',
  description: 'Keep It Simple, Stupid. Minimal top header with check box to return to IT Dept.',
  icon: 'fa-check-square',
  badge: { text: 'INK SAVER', className: 'bg-emerald-500 text-slate-950' },
  borderClasses: 'border-emerald-500/50 hover:border-emerald-400 bg-emerald-950/20 hover:bg-emerald-900/30',
  radioAccent: 'accent-emerald-500',
  labelTextClass: 'text-emerald-300',
  configType: 'bw',
  multiPage: false,

  render() {
    return `
      <div class="font-mono text-slate-900 h-full flex flex-col justify-between py-2">
        <div>
          <div class="border-b-2 border-slate-900 pb-2 flex justify-between items-center text-xs">
            <span class="font-bold uppercase tracking-wider">IT DEPT. QUICK TEST PAGE</span>
            <span class="text-[10px] text-slate-500">REF: K-I-S-S PROTOCOL</span>
          </div>

          <div class="my-8 p-5 border-2 border-slate-900 rounded bg-slate-50 flex items-start gap-4">
            <div class="w-7 h-7 border-2 border-slate-900 rounded-sm shrink-0 mt-0.5 bg-white"></div>
            <div>
              <p class="text-sm font-bold text-slate-900 leading-snug">
                Please check box and return sheet to IT Department if test print is successful.
              </p>
              <p class="text-xs text-slate-600 mt-1">
                Printer: <span id="kissTechName">[ System Default Printer ]</span> • Tested: ${new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>

        <div class="text-[10px] text-slate-400 text-center uppercase tracking-widest border-t border-dashed border-slate-300 pt-3">
          [ MINIMAL INK CONSUMPTION TEST • KEEP IT SIMPLE, STUPID ]
        </div>
      </div>
    `;
  }
};
