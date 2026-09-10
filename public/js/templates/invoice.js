export default {
  key: 'invoice',
  label: 'Wacky Order Receipt',
  description: "A fake receipt for bizarre items like 'Perpetual Sarcasm License'.",
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
        <div class="flex justify-between items-start border-b-2 border-black pb-3 mb-4">
          <div>
            <h1 class="text-xl font-black tracking-tight uppercase">ACME ABSURDITY SERVICES</h1>
            <p class="text-xs">Email: billing@dev-null.void</p>
          </div>
          <div class="text-right">
            <h2 class="text-lg font-bold text-slate-800">INVOICE</h2>
            <p class="text-xs">Date: ${new Date().toLocaleDateString()}</p>
          </div>
        </div>
        <div class="p-3 border border-black text-center font-bold bg-slate-50 text-xs">
          PAYMENT STATUS: AUTO-DEBITED FROM YOUR GOOD MOOD
        </div>
      </div>
    `;
  }
};
