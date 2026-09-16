export default {
  key: 'technobabble',
  label: 'Technobabble Report',
  description: 'Looks official, filled with absurd futuristic IT jargon.',
  icon: null,
  badge: { text: 'B/W + Color', className: 'bg-slate-700 text-emerald-300' },
  borderClasses: 'border-slate-700 hover:border-slate-500 bg-slate-800/50 hover:bg-slate-700/50',
  radioAccent: 'accent-indigo-500',
  labelTextClass: '',
  configType: 'color',
  multiPage: false,

  render() {
    return `
      <div class="space-y-3">
        <!-- Header -->
        <div class="border-b-2 border-black pb-3 flex justify-between items-start">
          <div>
            <h1 class="text-lg font-extrabold tracking-tight uppercase">ULTRA-DIAGNOSTIC PRINTER CALIBRATION REPORT</h1>
            <p class="text-xs text-slate-600">Sub-system Verification &amp; Quantum Particle Alignment</p>
          </div>
          <div class="text-right shrink-0 ml-3">
            <span class="border border-black px-2 py-1 font-bold text-xs uppercase block">STATUS: OPTIMAL</span>
            <span class="text-[9px] text-slate-500 font-mono block mt-1">REF: RTX-ENCAB-4471-B</span>
          </div>
        </div>

        <!-- Metadata strip -->
        <div class="grid grid-cols-4 gap-2 border border-slate-400 bg-slate-50 p-2 text-[9px] font-mono">
          <div><strong class="block text-slate-900">FIRMWARE:</strong> <span class="text-slate-700">v11.4.2-bodge</span></div>
          <div><strong class="block text-slate-900">CYCLE:</strong> <span class="text-slate-700">Full Spectrum</span></div>
          <div><strong class="block text-slate-900">DURATION:</strong> <span class="text-slate-700">00:04:17.338</span></div>
          <div><strong class="block text-slate-900">OPERATOR:</strong> <span class="text-slate-700">AUTOMATED</span></div>
        </div>

        <!-- Narrative section -->
        <div>
          <p class="font-bold text-[10px] uppercase tracking-wider border-b border-slate-400 pb-1 mb-1.5">§1 — INITIALIZATION SEQUENCE</p>
          <p class="text-[10px] leading-relaxed text-slate-800">
            Initializing retro-encabulator... The primary waneshaft has successfully aligned with the lunar wane-shafts
            along a differential girdle-spring axis. Thermal nozzle sweep completed at nominal duty cycle. Ambient
            hydrocoptic marzlevane tolerance measured within the prescribed ±0.0031 grommet band, requiring no
            supplementary panametric refibulation at this time.
          </p>
        </div>

        <div>
          <p class="font-bold text-[10px] uppercase tracking-wider border-b border-slate-400 pb-1 mb-1.5">§2 — SUB-SYSTEM VERIFICATION</p>
          <p class="text-[10px] leading-relaxed text-slate-800">
            The fuser's ambifacient lunar slip-ring was
            de-gaussed, re-gaussed, and then — out of an abundance of caution — gaussed once more.
          </p>
        </div>

        <!-- Measurement table -->
        <div>
          <p class="font-bold text-[10px] uppercase tracking-wider border-b border-slate-400 pb-1 mb-1.5">§3 — CALIBRATION MEASUREMENTS</p>
          <table class="w-full text-[9px] font-mono border-collapse">
            <thead>
              <tr class="bg-slate-100 border-y border-slate-400">
                <th class="text-left py-1 px-1.5 font-bold">SUB-ASSEMBLY</th>
                <th class="text-left py-1 px-1.5 font-bold">MEASURED</th>
                <th class="text-left py-1 px-1.5 font-bold">NOMINAL</th>
                <th class="text-left py-1 px-1.5 font-bold">VERDICT</th>
              </tr>
            </thead>
            <tbody class="text-slate-800">
              <tr class="border-b border-slate-200">
                <td class="py-0.5 px-1.5">Hydrocoptic Marzlevane</td>
                <td class="py-0.5 px-1.5">6.022 mG</td>
                <td class="py-0.5 px-1.5">6.020 mG</td>
                <td class="py-0.5 px-1.5 font-bold">PASS</td>
              </tr>
              <tr class="border-b border-slate-200">
                <td class="py-0.5 px-1.5">Prefabulated Amulite Core</td>
                <td class="py-0.5 px-1.5">0.884 Ω</td>
                <td class="py-0.5 px-1.5">0.880 Ω</td>
                <td class="py-0.5 px-1.5 font-bold">PASS</td>
              </tr>
              <tr class="border-b border-slate-200">
                <td class="py-0.5 px-1.5">Spurving Bearing (Upper)</td>
                <td class="py-0.5 px-1.5">1,142 RPM</td>
                <td class="py-0.5 px-1.5">1,140 RPM</td>
                <td class="py-0.5 px-1.5 font-bold">PASS</td>
              </tr>
              <tr>
                <td class="py-0.5 px-1.5">Girdle-Spring Nurnie (Aft)</td>
                <td class="py-0.5 px-1.5">WOBBLING</td>
                <td class="py-0.5 px-1.5">NOT WOBBLING</td>
                <td class="py-0.5 px-1.5 font-bold">TOLERATED</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Notes / advisory -->
        <div>
          <p class="font-bold text-[10px] uppercase tracking-wider border-b border-slate-400 pb-1 mb-1.5">§4 — ADVISORY NOTES</p>
          <ul class="text-[10px] leading-relaxed text-slate-800 space-y-0.5 pl-4 list-disc">
            <li>Aft girdle-spring nurnie exhibits non-critical wobble. Wobble has been reclassified as a feature.</li>
            <li>Residual quantum indeterminacy may cause the page counter to disagree with itself. This is expected.</li>
            <li>Recalibration is advised every 90 days, or immediately following any unexplained humming.</li>
          </ul>
        </div>

        <!-- Sign-off -->
        <div class="border-2 border-black bg-slate-50 p-2.5 text-[10px]">
          <p class="font-bold uppercase tracking-wider mb-0.5">CERTIFICATION SUMMARY</p>
          <p class="text-slate-800 leading-relaxed">
            All sub-assemblies operate within the manufacturer's stated tolerances. This unit is hereby cleared for
            unsupervised production printing. No further panametric intervention is required until the next scheduled
            encabulation window.
          </p>
        </div>
      </div>
    `;
  }
};
