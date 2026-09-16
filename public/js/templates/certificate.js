import { SITE_URL } from '../siteConfig.js';

export default {
  key: 'certificate',
  label: 'Installation Certificate',
  description: 'Official certificate of hardware quirks + 1 extra completely blank page.',
  icon: 'fa-award text-amber-400',
  badge: { text: '2 PAGES', className: 'bg-slate-700 text-slate-300' },
  borderClasses: 'border-slate-600 hover:border-slate-400 bg-slate-800/80 hover:bg-slate-700/80',
  radioAccent: 'accent-indigo-500',
  labelTextClass: 'text-slate-200',
  configType: 'bw',
  multiPage: true,

  // Installer name — its own dedicated field under this template's sidebar
  // entry, independent of the shared "Optional Customization" note.
  controlsHtml(state) {
    const name = state.certTechName || '';
    return `
      <div class="mt-2 bg-slate-800/60 border border-slate-600/40 rounded-lg p-3 space-y-1.5">
        <label for="certTechNameInput" class="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <i class="fa-solid fa-signature text-slate-400"></i>
          <span>Installer Name:</span>
        </label>
        <input type="text" id="certTechNameInput" value="${name}" oninput="handleCertTechNameChange(this.value)"
          placeholder="e.g., Tech Dave (IT Dept)"
          class="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500">
      </div>
    `;
  },

  render(state) {
    const techName = (state.certTechName && state.certTechName.trim() !== '')
      ? state.certTechName
      : '[ IT Department Staff ]';

    return `
      <!-- PAGE 1: CERTIFICATE
           The decorative double border lives on the INNER wrapper, not on
           .print-page. .print-page is forced to a full page height in print
           CSS, so a border on it always stretched edge-to-edge and left a
           large empty band under the content. On the inner wrapper it
           shrink-wraps to the certificate's own height instead, and
           justify-center on the page then centers that whole block
           vertically. The site-URL line is rendered inline here (rather
           than via siteFooterLine(), which pins itself to the page bottom)
           so it stays tucked inside the border with the rest of the block. -->
      <div class="print-page bg-white relative flex flex-col justify-center items-center">
        <div class="w-full border-4 border-double border-slate-800 p-4 md:p-5 bg-slate-50 text-slate-900 font-sans">
          <div class="border border-slate-400 p-3.5">
            <div class="text-center space-y-1">
              <span class="text-[9px] font-bold tracking-[0.25em] uppercase text-slate-600 block">OFFICIAL IT DEPARTMENT CERTIFICATION</span>
              <h1 class="text-lg md:text-xl font-bold font-serif-header uppercase tracking-wider text-slate-950">
                PRINTER INSTALLATION CERTIFICATE
              </h1>
              <div class="w-24 h-1 bg-slate-900 mx-auto mt-1"></div>
            </div>

            <div class="text-center mt-2.5 mb-2 space-y-0.5">
              <p class="text-[10px] text-slate-600 uppercase tracking-widest">THIS DULY CERTIFIES THAT THIS PRINTING UNIT HAS BEEN</p>
              <p class="text-[11px] font-bold uppercase tracking-wider text-slate-900">PROFESSIONALLY INSTALLED &amp; CALIBRATED BY:</p>
              <p id="certTechName" class="text-base font-bold italic font-serif-header text-slate-950 underline underline-offset-4 py-0.5">
                ${techName}
              </p>
            </div>

            <div class="my-2 border-t border-b border-slate-300 py-2 font-mono text-xs space-y-1">
              <p class="font-bold uppercase tracking-wider text-slate-950 text-center mb-1.5 text-[10px]">
                OFFICIALLY CERTIFIED HARDWARE CAPABILITIES:
              </p>
              <ul class="space-y-1 text-slate-800 text-[9px] max-w-xl mx-auto">
                <li>• Capable of jamming during your most important deadline.</li>
                <li>• Running out of black toner when you need 47 urgent copies.</li>
                <li>• Producing that one mysterious blank page no one can explain.</li>
                <li>• Refusing to print B&amp;W because Yellow Ink is at 2%.</li>
              </ul>
            </div>

            <div class="flex justify-between items-end pt-2 mt-1 border-t border-slate-300 font-mono text-[9px]">
              <div>
                <p class="font-bold text-slate-900">DATE CERTIFIED:</p>
                <p class="text-slate-700">${new Date().toLocaleDateString()}</p>
              </div>
              <div class="text-center">
                <div class="w-28 border-b border-slate-800 mb-1"></div>
                <p class="font-bold text-slate-900 uppercase">OFFICIAL SEAL OF APPROVAL</p>
              </div>
              <div class="text-right">
                <p class="font-bold text-slate-900">SYSTEM STATUS:</p>
                <p class="text-slate-700">100% OPERATIONAL</p>
              </div>
            </div>
          </div>

          <div class="text-center mt-2 text-[9px] text-slate-400 font-sans font-bold uppercase tracking-wider">
            ${SITE_URL} — CERTIFICATION UNIT
          </div>
        </div>
      </div>

      <!-- PAGE 2: 100% BLANK PAGE -->
      <div class="print-page bg-white p-6 border border-slate-200 rounded-sm min-h-[980px] flex flex-col justify-between mt-8">
        <div class="no-print opacity-40 text-slate-400 text-xs uppercase tracking-widest font-mono text-center my-auto">
          [ PAGE 2 IS 100% BLANK ON PRINT ]
        </div>
      </div>
    `;
  }
};
