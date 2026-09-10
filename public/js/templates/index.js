// ============================================================================
// TEMPLATE REGISTRY
// ============================================================================
// To add a new prank template:
//   1. Copy an existing file in js/templates/ (e.g. recipe.js) as a starting point.
//   2. Fill in its label, description, icon, badge, colors, and render() function.
//   3. Import it below and add it to the `templateOrder` array wherever you want
//      it to appear in the sidebar list.
// That's it — the sidebar, print preview, and calibration bar all update
// automatically. You never need to touch app.js or index.html.
// ============================================================================

import jamRemover from './jamRemover.js';
import trayfeed from './trayfeed.js';
import kiss from './kiss.js';
import ghost from './ghost.js';
import certificate from './certificate.js';
import pcloadletter from './pcloadletter.js';
import recipe from './recipe.js';
import technobabble from './technobabble.js';
import alignment from './alignment.js';
import invoice from './invoice.js';
import spaceball from './spaceball.js';
import allyourbase from './allyourbase.js';
import jamRemover from './printerjamRemovertemplate.js';

// Order controls the order they appear in the sidebar.
export const templateOrder = [
  'jamRemover',
  'trayfeed',
  'kiss',
  'ghost',
  'certificate',
  'pcloadletter',
  'recipe',
  'technobabble',
  'allyourbase' ,
  'alignment',
  'invoice',
  'spaceball'
  'printerjamRemovertemplate'
];

export const templates = {
  jamRemover,
  trayfeed,
  kiss,
  ghost,
  certificate,
  pcloadletter,
  recipe,
  technobabble,
  allyourbase,
  alignment,
  invoice,
  spaceball
  printerjamremovertemplate
};
