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

  render() {
    return `
      <!-- PAGE 1: CERTIFICATE -->
      <div class="print-page border-8 border-double border-slate-800 p-6 md:p-8 bg-slate-50 text-slate-900 font-sans h-full flex flex-col justify-between relative">
        <div class="border border-slate-400 p-5 flex-1 flex flex-col justify-between">
          <div class="text-center space-y-1.5">
            <span class="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-600 block">OFFICIAL IT DEPARTMENT CERTIFICATION</span>
            <h1 class="text-xl md:text-2xl font-bold font-serif-header uppercase tracking-wider text-slate-950">
              PRINTER INSTALLATION CERTIFICATE
            </h1>
            <div class="w-28 h-1 bg-slate-900 mx-auto mt-1"></div>
          </div>

          <div class="text-center my-3 space-y-1">
            <p class="text-[11px] text-slate-600 uppercase tracking-widest">THIS DULY CERTIFIES THAT THIS PRINTING UNIT HAS BEEN</p>
            <p class="text-xs font-bold uppercase tracking-wider text-slate-900">PROFESSIONALLY INSTALLED & CALIBRATED BY:</p>
            <p id="certTechName" class="text-lg font-bold italic font-serif-header text-slate-950 underline underline-offset-4 py-0.5">
              [ IT Department Staff ]
            </p>
          </div>

          <div class="my-2 border-t border-b border-slate-300 py-3 font-mono text-xs space-y-1.5">
            <p class="font-bold uppercase tracking-wider text-slate-950 text-center mb-2 text-[11px]">
              OFFICIALLY CERTIFIED HARDWARE CAPABILITIES:
            </p>
            <ul class="space-y-1.5 text-slate-800 text-[10px] max-w-xl mx-auto">
              <li>• Capable of jamming during your most important deadline.</li>
              <li>• Running out of black toner when you need 47 urgent copies.</li>
              <li>• Producing that one mysterious blank page no one can explain.</li>
              <li>• Refusing to print B&W because Yellow Ink is at 2%.</li>
            </ul>
          </div>

          <div class="flex justify-between items-end pt-3 mt-1 border-t border-slate-300 font-mono text-[9px]">
            <div>
              <p class="font-bold text-slate-900">DATE CERTIFIED:</p>
              <p class="text-slate-700">${new Date().toLocaleDateString()}</p>
            </div>
            <div class="text-center">
              <div class="w-32 border-b border-slate-800 mb-1"></div>
              <p class="font-bold text-slate-900 uppercase">OFFICIAL SEAL OF APPROVAL</p>
            </div>
            <div class="text-right">
              <p class="font-bold text-slate-900">SYSTEM STATUS:</p>
              <p class="text-slate-700">100% OPERATIONAL</p>
            </div>
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
