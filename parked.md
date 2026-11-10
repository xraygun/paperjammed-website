# Parked ideas

Things we've decided to come back to later — not in progress, not forgotten.

## A properly Friends-themed template

The daily-changing template (`dailyMystery`, sidebar label "Temple of Unhinged
Testpages") started life as a riff on Friends episode titles ("the one that's
always different"). We kept the joke loose for that template's name, but the
idea of a template that actually leans into the "The One Where ___" format —
titles, structure, maybe a laugh-track joke in the footer — is worth doing
properly as its own thing later.

No design decided yet — just parking the idea.

## A dedicated "Cooked" content source

Right now every intensity level renders the same daily AI-generated text —
"Cooked" only pushes it harder visually (font/border/spacing jitter, more
words swapping at once). The idea: give Cooked genuinely different *content*,
either (a) a separate, more unhinged system prompt variant the cron job
generates alongside the normal one, or (b) KV keeping a short rolling
history of the last few days' content (instead of just "latest") and
Cooked mashing 2-3 of them together into something incoherent.

(b) is the bigger lift — `src/index.js`'s KV write is currently a single
`latest` key; a rolling history means a new read/write shape and picking
how many days to keep. Worth doing once the current version has been live
a while and we know it's actually wanted.

## Growth and income ideas (from the November 2026 site audit)

Shipped from that audit: a page per template (`/t/<key>`), the sitemap, the
share button, the "you've been pranked" QR page and the built stylesheet.
Still waiting, roughly in the order worth doing:

**More visitors**

- **Daily template archive.** Keep each day's page at its own address, so
  there is a new indexable page every day, and auto-post it to
  Bluesky/Mastodon. Needs the rolling-history KV shape described under
  "A dedicated Cooked content source" above.
- **Seasonal templates** for the two dates this site was made for: April
  Fools and SysAdmin Day (last Friday of July). An office holiday party one
  for December.
- **Launch posts** once the pages above are indexed: Show HN,
  r/iiiiiiitttttttttttt, r/msp, r/sysadmin (read each sub's self-promotion
  rules first). Making the repo public with "add a template by pull
  request" gives those posts something extra.
- **The phone banner.** "Best viewed on a computer" greets the visitors
  social links send. Better: let them send the link to themselves.
- **Self-host the fonts and icons.** Drops Google Fonts and cdnjs, the last
  two third parties on the main page besides the tip button.
- **Tip jar after printing.** Offer it at the moment someone has just
  printed, not only in the footer. Also: the Buy Me a Coffee name is
  `printerjammed` but the site is PaperJammed.

**Income** (none of this is worth much until traffic grows; the counters
showed 16 prints and 18 scans in total when the audit was done)

- **Branded test pages for MSPs and IT shops.** Their logo, helpdesk number
  and a QR code to their ticket portal on a funny test page. Real business
  value; could be a one-time fee. The strongest idea on this list.
- **Things made in-house.** Laser-cut "Days since last paper jam" desk
  signs and 3D-printed desk toys, sold on eBay or Etsy. Better margins than
  print-on-demand.
- **Print-on-demand merch** linked from the pranked page (the QR lands
  there now, and `qr-redirects` can still point scans elsewhere). Use
  original slogans: the Spaceballs, Office Space and All Your Base designs
  are an IP risk on paid goods.
- **Affiliate page**, "Printers IT people don't hate". Check Amazon
  Associates' current rates and minimum-sales rule first, and update the
  privacy page before it goes live.
- **Pay-what-you-want PDF prank pack** ahead of April 1.
- **Ads: not yet.** They would earn pennies at this traffic and cheapen the
  joke.
