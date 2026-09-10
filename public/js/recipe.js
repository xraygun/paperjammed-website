export default {
  key: 'recipe',
  label: 'Toner Soup Recipe',
  description: 'An official-looking recipe card with chaotic ingredients.',
  icon: null,
  badge: { text: 'B/W', className: 'bg-slate-700 text-slate-300' },
  borderClasses: 'border-slate-700 hover:border-slate-500 bg-slate-800/50 hover:bg-slate-700/50',
  radioAccent: 'accent-indigo-500',
  labelTextClass: '',
  configType: 'bw',
  multiPage: false,

  render() {
    return `
      <div>
        <div class="border-b-4 border-black pb-3 mb-4 text-center">
          <span class="text-xs font-bold uppercase tracking-widest text-slate-500">GRANDMA'S SECRET IT KITCHEN</span>
          <h1 class="text-2xl font-black uppercase tracking-tight">EMERGENCY TONER SOUP</h1>
          <p class="text-xs italic">Serves 1 Stressed System Administrator • Prep Time: 5 mins</p>
        </div>
        <div class="grid grid-cols-12 gap-6">
          <div class="col-span-5 border-r border-slate-300 pr-4">
            <h3 class="font-bold border-b border-black text-xs uppercase mb-2">Ingredients</h3>
            <ul class="space-y-2 text-xs">
              <li>• 1 Cup Cyan Pigment Powder</li>
              <li>• 2 Tbsp Mechanical Friction</li>
              <li>• Pinch of Compressed Air</li>
              <li>• 3 Sheets Crumpled Paper</li>
            </ul>
          </div>
          <div class="col-span-7">
            <h3 class="font-bold border-b border-black text-xs uppercase mb-2">Instructions</h3>
            <ol class="space-y-2 text-xs list-decimal pl-4">
              <li>Open printer front door while making eye contact with error light.</li>
              <li>Shake cartridge until it yields 50 extra pages.</li>
              <li>Fold paper and simmer over fuser roller at 180°C.</li>
            </ol>
          </div>
        </div>
      </div>
    `;
  }
};
