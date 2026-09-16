export default {
  key: 'invoice',
  label: 'Mail Order Livestock Receipt',
  description: 'A shipping confirmation for one (1) live animal the recipient never ordered. Animal is customizable.',
  icon: 'fa-box-open',
  badge: { text: 'B/W + Color', className: 'bg-slate-700 text-emerald-300' },
  borderClasses: 'border-slate-700 hover:border-slate-500 bg-slate-800/50 hover:bg-slate-700/50',
  radioAccent: 'accent-indigo-500',
  labelTextClass: '',
  configType: 'color',
  multiPage: false,

  // Animal name — dedicated field under this template's sidebar entry,
  // same pattern as the certificate's installer-name control.
  controlsHtml(state) {
    const animal = state.orderAnimal || '';
    return `
      <div class="mt-2 bg-slate-800/60 border border-slate-600/40 rounded-lg p-3 space-y-1.5">
        <label for="orderAnimalInput" class="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <i class="fa-solid fa-paw text-slate-400"></i>
          <span>Animal Ordered:</span>
        </label>
        <input type="text" id="orderAnimalInput" value="${animal}" oninput="handleOrderAnimalChange(this.value)"
          placeholder="Goat"
          class="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500">
        <p class="text-[10px] text-slate-400 italic">Try: Llama, Emu, Alpaca, Peacock, Miniature Donkey...</p>

        <label for="orderRecipientInput" class="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 pt-1">
          <i class="fa-solid fa-user text-slate-400"></i>
          <span>Recipient Name:</span>
        </label>
        <input type="text" id="orderRecipientInput" value="${state.orderRecipient || ''}" oninput="handleOrderRecipientChange(this.value)"
          placeholder="Current Occupant"
          class="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500">

        <label for="orderAddressInput" class="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 pt-1">
          <i class="fa-solid fa-location-dot text-slate-400"></i>
          <span>Delivery Location:</span>
        </label>
        <textarea id="orderAddressInput" rows="3" oninput="handleOrderAddressChange(this.value)"
          placeholder="Main Office&#10;223 Hwy 17&#10;Albuquerque, NM"
          class="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-y">${state.orderAddress || ''}</textarea>
        <p class="text-[10px] text-slate-400 italic">One line per row — appears on the shipping block.</p>
      </div>
    `;
  },

  render(state) {
    const animal = (state.orderAnimal && state.orderAnimal.trim() !== '')
      ? state.orderAnimal.trim()
      : 'Goat';

    const recipient = (state.orderRecipient && state.orderRecipient.trim() !== '')
      ? state.orderRecipient.trim()
      : 'Current Occupant';

    // Address is free-form multi-line user input, so escape it before
    // injecting, then convert newlines to <br> so each line renders.
    const escapeHtml = (s) => s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

    const addressLines = (state.orderAddress && state.orderAddress.trim() !== '')
      ? escapeHtml(state.orderAddress.trim()).replace(/\n/g, '<br>')
      : 'This Workstation<br>Beside The Printer<br>Second Floor';

    const orderNo = 'LIV-' + String(new Date().getFullYear()) + '-88431';
    const arrival = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString();

    return `
      <div class="space-y-3">
        <!-- Header -->
        <div class="flex justify-between items-start border-b-4 border-black pb-2">
          <div>
            <h1 class="text-base font-black tracking-tight uppercase leading-tight">BLEATWORTH &amp; SONS</h1>
            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-600">Novelty Livestock &amp; Exotic Fulfillment</p>
            <p class="text-[9px] text-slate-500 font-mono mt-0.5">Dispatch Barn 14 · Route 6 · orders@bleatworth-fulfillment.example</p>
          </div>
          <div class="text-right shrink-0 ml-3">
            <span class="border-2 border-black px-2 py-1 font-black text-[11px] uppercase block">SHIPPED</span>
            <p class="text-[9px] font-mono text-slate-600 mt-1">ORDER ${orderNo}</p>
          </div>
        </div>

        <!-- Thank-you banner -->
        <div class="border-2 border-black">
          <div class="bg-slate-100 text-center py-1 border-b-2 border-black">
            <p class="text-[10px] font-black uppercase tracking-[0.2em]">THANK YOU FOR ORDERING THE</p>
          </div>
          <div class="bg-black text-white text-center py-3 px-2">
            <p class="text-2xl md:text-3xl font-black uppercase tracking-tight leading-none">MAIL ORDER</p>
            <p class="text-3xl md:text-4xl font-black uppercase tracking-tight leading-none mt-0.5">${animal}</p>
          </div>
          <div class="bg-slate-100 text-center py-1 border-t-2 border-black">
            <p class="text-[11px] font-black uppercase tracking-wider">${recipient}, YOUR ${animal} WILL ARRIVE ${arrival}</p>
          </div>
        </div>

        <!-- Ship-to + details -->
        <div class="grid grid-cols-2 gap-3">
          <div class="border-2 border-black p-2.5">
            <p class="text-[9px] font-black uppercase tracking-widest border-b border-slate-400 pb-1 mb-1.5">SHIP TO</p>
            <p class="text-[11px] font-bold leading-snug uppercase">${recipient}</p>
            <p class="text-[10px] text-slate-700 leading-snug">${addressLines}</p>
          </div>
          <div class="border-2 border-black p-2.5 font-mono text-[9px] space-y-0.5">
            <p class="text-[9px] font-black uppercase tracking-widest border-b border-slate-400 pb-1 mb-1.5 font-sans">CONSIGNMENT DETAILS</p>
            <p><strong>CARRIER:</strong> Overland Hoof Freight</p>
            <p><strong>CRATE:</strong> Ventilated, Reinforced</p>
            <p><strong>LIVE ANIMAL:</strong> YES — DO NOT STACK</p>
            <p><strong>SIGNATURE:</strong> REQUIRED</p>
          </div>
        </div>

        <!-- Kit contents -->
        <div class="border-2 border-black">
          <div class="bg-slate-100 border-b-2 border-black px-2.5 py-1">
            <p class="text-[10px] font-black uppercase tracking-wider">THIS KIT INCLUDES:</p>
          </div>
          <div class="grid grid-cols-2 gap-x-4 gap-y-0.5 p-2.5 text-[10px]">
            <p>• Grooming &amp; Brushing Tips</p>
            <p>• Bathing Instructions</p>
            <p>• Daily Feeding Schedule</p>
            <p>• ${animal} Translator Phrasebook</p>
            <p>• Temperament &amp; Mood Guide</p>
            <p>• Hoof / Claw Maintenance</p>
            <p>• Approved Treat Directory</p>
            <p>• Indoor Containment Advice</p>
            <p>• Noise Complaint Templates</p>
            <p>• Emergency Veterinary Contacts</p>
          </div>
        </div>

        <!-- Itemized charges -->
        <div>
          <table class="w-full text-[10px] font-mono border-collapse">
            <thead>
              <tr class="bg-slate-100 border-y-2 border-black">
                <th class="text-left py-1 px-1.5 font-black">ITEM</th>
                <th class="text-center py-1 px-1.5 font-black">QTY</th>
                <th class="text-right py-1 px-1.5 font-black">AMOUNT</th>
              </tr>
            </thead>
            <tbody class="text-slate-800">
              <tr class="border-b border-slate-300">
                <td class="py-0.5 px-1.5">Live ${animal}, adult, opinionated</td>
                <td class="text-center py-0.5 px-1.5">1</td>
                <td class="text-right py-0.5 px-1.5">$0.00</td>
              </tr>
              <tr class="border-b border-slate-300">
                <td class="py-0.5 px-1.5">Starter Care Kit (see above)</td>
                <td class="text-center py-0.5 px-1.5">1</td>
                <td class="text-right py-0.5 px-1.5">$0.00</td>
              </tr>
              <tr class="border-b border-slate-300">
                <td class="py-0.5 px-1.5">Ventilated crate &amp; bedding</td>
                <td class="text-center py-0.5 px-1.5">1</td>
                <td class="text-right py-0.5 px-1.5">$0.00</td>
              </tr>
              <tr class="border-b border-slate-300">
                <td class="py-0.5 px-1.5">Perpetual Sarcasm License (renewal)</td>
                <td class="text-center py-0.5 px-1.5">1</td>
                <td class="text-right py-0.5 px-1.5">$0.00</td>
              </tr>
              <tr class="border-b-2 border-black">
                <td class="py-0.5 px-1.5">Emotional support surcharge</td>
                <td class="text-center py-0.5 px-1.5">1</td>
                <td class="text-right py-0.5 px-1.5">$0.00</td>
              </tr>
              <tr>
                <td class="py-1 px-1.5 font-black uppercase" colspan="2">Total Due</td>
                <td class="text-right py-1 px-1.5 font-black">$0.00</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Footer notice -->
        <div class="border-2 border-black bg-slate-50 p-2.5 text-center">
          <p class="text-[11px] font-black uppercase tracking-wider">GET READY!</p>
          <p class="text-[9px] text-slate-700 mt-0.5 leading-snug">
            No refunds once the ${animal} has bonded with you. Returns accepted only in the original crate,
            with the original ${animal}. Bleatworth &amp; Sons is not liable for chewed cabling, upended
            waste bins, or any documents the ${animal} elects to eat.
          </p>
        </div>
      </div>
    `;
  }
};
