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
