// Sidebar order of the templates, kept in its own file so the Worker
// (src/index.js) can import it too: it only counts QR scans and prints for
// keys listed here. It has no imports of its own on purpose — the Worker
// must never load the template files themselves.
export const templateOrder = [
  'jamRemover',
  'trayfeed',
  'kiss',
  'ghost',
  'certificate',
  'pcloadletter',
  'recipe',
  'technobabble',
  'allyourbase',
  'alignment',
  'invoice',
  'spaceball',
  'dailyMystery'
];
