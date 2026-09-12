# Future feature ideas (noted, not scheduled)

Parked here deliberately — considered and worth keeping, but not built. See
`LLM_README.md` for the conventions any of these would have to follow.

## On This Day / entry resurfacing (2026-08-22)

Decided against building for now ("I just don't think I'll use it"). If revisited:

- **Lookback card**: on load, "1 week / 1 month / 3 months ago today" with a
  snippet from each day's document, click to open. Grows a "1 year ago" slot
  for free once the archive is old enough.
- **Memorable-day resurfacing**: pull a random "most memorable experience"
  answer (night survey, often with a photo) from 30+ days ago. The selection
  work is already done nightly, which is what would make this version unusually
  good here — no AI guessing which days mattered.
- Best placement if built: a read-only panel inside the morning survey (like
  the embedded day calendar), so rereading attaches to a ritual with a 100%
  hit rate.

## Off-site backup (2026-08-22)

Everything — entries, sidecars, `backups/` — lives on one laptop disk. The
backup system is excellent against bad writes and does nothing against theft,
loss, or a dead drive. The useful shape is a scheduled copy of `entries/`,
`exports/` and the sidecar JSON files to a cloud-synced folder (Google Drive /
OneDrive), not an in-app export button (the archive is already plain files on
disk). OAuth credential files should stay out of it, same rule as
`DATA_FILE_POLICY`'s backup exclusion.
