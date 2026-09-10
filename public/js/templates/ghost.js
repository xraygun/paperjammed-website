export default {
  key: 'ghost',
  label: 'Ghost-Buffer Exorcism',
  description: 'Purge demonic printer ghosts with pseudo-Latin technobabble chants and warding sigils.',
  icon: 'fa-ghost',
  badge: { text: 'B/W', className: 'bg-slate-700 text-slate-300' },
  borderClasses: 'border-purple-500/50 hover:border-purple-400 bg-purple-950/20 hover:bg-purple-900/30',
  radioAccent: 'accent-purple-500',
  labelTextClass: 'text-purple-300',
  configType: 'bw',
  multiPage: false,

  render() {
    return `
      <div class="border-4 border-black p-5 bg-slate-50 font-mono text-slate-900 h-full flex flex-col justify-between">
        <div>
          <div class="border-b-4 border-black pb-2 mb-3 text-center">
            <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600 block">PARANORMAL HARDWARE PURGE PROTOCOL v4.1</span>
            <h1 class="text-xl font-black uppercase tracking-widest text-slate-950 my-1">
              👻 GHOST-BUSTER SPECTRAL EXORCISM
            </h1>
            <p class="text-xs italic text-slate-700">Official Certificate of Ectoplasmic Buffer Flush & Poltergeist Removal</p>
          </div>

          <div class="grid grid-cols-2 gap-3 mb-3 p-2.5 border border-slate-400 bg-white text-[10px]">
            <div>
              <p><strong>EXORCIST:</strong> <span id="ghostTechName">Tech Dave (Ghost-Buster)</span></p>
              <p><strong>PORT PURGED:</strong> LPT1 / TCP:9100</p>
            </div>
            <div>
              <p><strong>ECTOPLASM DENSITY:</strong> 0.00 PPM (CLEARED)</p>
              <p><strong>SPIRITUAL QUEUE:</strong> EMPTY</p>
            </div>
          </div>

          <div class="text-center my-3">
            <div class="inline-block border-2 border-black p-3 bg-white rounded-full shadow-md">
              <svg viewBox="0 0 120 120" width="90" height="90" class="mx-auto">
                <circle cx="60" cy="60" r="54" fill="none" stroke="#000" stroke-width="2" stroke-dasharray="6 3"/>
                <circle cx="60" cy="60" r="46" fill="none" stroke="#000" stroke-width="1.5"/>
                <path d="M 60 14 L 100 90 L 20 38 L 100 38 L 20 90 Z" fill="none" stroke="#000" stroke-width="1.5"/>
                <path d="M 60 38 C 50 38 44 46 44 56 L 44 76 C 44 78 48 74 52 76 C 56 78 60 74 64 76 C 68 78 72 74 76 76 L 76 56 C 76 46 70 38 60 38 Z" fill="none" stroke="#000" stroke-width="2"/>
                <circle cx="54" cy="52" r="2" fill="#000"/>
                <circle cx="66" cy="52" r="2" fill="#000"/>
              </svg>
            </div>
            <span class="text-[9px] text-slate-500 block mt-1 font-bold">FIG 1.1: HARDWARE WARDING SIGIL</span>
          </div>

          <div class="my-3 border-2 border-black p-3 bg-white space-y-1.5">
            <p class="font-bold uppercase text-[10px] tracking-wider text-center border-b border-black pb-1">
              📜 INCANTATIO EXORCISMUS PRINTERIS (RECITE ALOUD):
            </p>
            <p class="italic text-slate-900 text-[11px] text-center leading-relaxed font-serif">
              "Exorcizo te, creatura spooleri, in nomine TCP/IP et Spiritus Driveris!<br>
              Abscede, demone jammius, ab hoc fuser assembly!<br>
              Requiescat in pace, O paper tray. Amen."
            </p>
          </div>
        </div>

        <div class="border-t-2 border-black pt-2 text-[10px] text-slate-800">
          <p><strong>PURGE SUMMARY:</strong> Phantom print jobs and rogue spooler demons permanently banished.</p>
        </div>
      </div>
    `;
  }
};
