// Color/grayscale calibration swatches shown at the bottom of single-page templates.
// A template picks one via its `configType: 'color' | 'bw'` field.
export const calibrationBars = {
  color: `
    <div class="bg-cyan-500 flex items-center justify-center text-[7px] text-white font-bold">C</div>
    <div class="bg-fuchsia-600 flex items-center justify-center text-[7px] text-white font-bold">M</div>
    <div class="bg-yellow-400 flex items-center justify-center text-[7px] text-black font-bold">Y</div>
    <div class="bg-black flex items-center justify-center text-[7px] text-white font-bold">K</div>
    <div class="bg-slate-400 flex items-center justify-center text-[7px] text-white font-bold">50%</div>
    <div class="bg-slate-200 flex items-center justify-center text-[7px] text-slate-700 font-bold">10%</div>
  `,
  bw: `
    <div class="bg-black flex items-center justify-center text-[7px] text-white font-bold">100%</div>
    <div class="bg-slate-800 flex items-center justify-center text-[7px] text-white font-bold">80%</div>
    <div class="bg-slate-600 flex items-center justify-center text-[7px] text-white font-bold">60%</div>
    <div class="bg-slate-400 flex items-center justify-center text-[7px] text-white font-bold">40%</div>
    <div class="bg-slate-200 flex items-center justify-center text-[7px] text-slate-800 font-bold">20%</div>
    <div class="bg-slate-100 flex items-center justify-center text-[7px] text-slate-600 font-bold">10%</div>
  `
};
