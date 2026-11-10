// Tailwind is built ahead of time into public/css/tailwind.css
// (`npm run build:css`) — the site no longer loads the Tailwind CDN script.
// Only classes that appear as whole strings in these files get a rule, so
// never build a class name out of pieces (`bg-${color}-500`): it would work
// nowhere. Spell out every full class name somewhere in the source.
module.exports = {
  content: ['./public/**/*.html', './public/js/**/*.js', '!./public/js/lib/**'],
  theme: { extend: {} },
  plugins: []
};
