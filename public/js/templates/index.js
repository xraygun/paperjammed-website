// ============================================================================
// TEMPLATE REGISTRY
// ============================================================================
// To add a new prank template:
//   1. Copy an existing file in js/templates/ (e.g. recipe.js) as a starting point.
//   2. Fill in its label, description, icon, badge, colors, and render() function.
//   3. Import it below, add it to `templates`, and add its key to the
//      `templateOrder` array in order.js wherever you want it in the sidebar.
//      (Once a key has been printed in a QR code, never rename it.)
//   4. Add its key to one of the `categories` at the bottom of this file
//      (anything left out still shows, under "Other").
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
import dailyMystery from './dailyMystery.js';

// Order controls the order they appear in the sidebar. It lives in
// order.js (the Worker reads it too, to know which QR/print keys are real).
import { templateOrder } from './order.js';
export { templateOrder };

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
  spaceball,
  dailyMystery
};

// Sidebar groups and filter chips, in display order. Within a group,
// templates keep their templateOrder order.
export const categories = [
  { id: 'legit', label: 'Looks Legit', keys: ['kiss', 'alignment', 'technobabble', 'trayfeed', 'certificate'] },
  { id: 'absurd', label: 'Absurd', keys: ['jamRemover', 'ghost', 'recipe', 'invoice'] },
  { id: 'popculture', label: 'Pop Culture', keys: ['pcloadletter', 'spaceball', 'allyourbase'] },
  { id: 'daily', label: 'Daily', keys: ['dailyMystery'] }
];
