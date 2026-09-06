# Source monitoring

The Intelligence Curve uses Netlify Scheduled Functions + Netlify Blobs to detect changes in selected primary sources without blindly rewriting public evidence.

## Current monitors

The scheduled function is `netlify/functions/source-monitor.mts` and runs daily at 06:15 UTC.

1. Humanity's Last Exam leaderboard — Scale AI
2. METR Time Horizons live page
3. ARC-AGI-3 Astra results — ARC Prize
4. Epoch ECI frontier trend
5. Epoch core AI scaling trends — compute stock, frontier training compute and context windows
6. Epoch frontier data-centre compute
7. Epoch frontier data-centre power
8. Epoch AI-chip performance per dollar
9. Epoch inference-price trend analysis

The monitor fetches sources concurrently so expanding source coverage does not multiply scheduled-function wall-clock time.

## Safety model

1. Fetch the primary source.
2. Parse only a small source-specific snapshot: headline values, methodology/version markers and/or source-data update dates.
3. Compare that candidate with the currently approved baseline stored in Netlify Blobs, falling back to the code baseline for a source that has never been reviewed.
4. If it matches, store a healthy check result.
5. If it differs, store the candidate in Netlify Blobs as `pending-review`.
6. Never treat a parser failure as evidence that the source changed.
7. Never expose unreviewed candidate values through the public monitor-status API.

The public `/api/monitor-status` endpoint exposes monitor health and the number of pending reviews, but intentionally does not expose candidate values before review.

## Private review workflow

The private `/review` page uses the production-only `TIC_REVIEW_KEY` Netlify secret.

- **Approve & publish** is available only for source types with a narrowly defined safe runtime override (currently HLE and ARC-AGI-3).
- **Approve baseline** accepts a reviewed source state without inventing a public metric value. This is used when a changed page can signal that human interpretation is required, such as methodology or infrastructure-source changes.
- **Reject** stores that exact candidate as ignored. A genuinely different future source state will still trigger another review.
- Every decision is retained in the Blob-backed audit trail.

Approved runtime metric overrides are served by `/api/metric-overrides` and loaded before the React app renders. Static source-backed data remains the fallback if the runtime API is unavailable.

## When adding a new monitor

1. Prefer a primary source.
2. Parse stable semantic markers rather than hashing the entire page; cosmetic copy changes should not become evidence changes.
3. Include a source-data update/version marker when available so revised datasets can be caught even if the headline fit stays unchanged.
4. Add the monitor to both `source-monitor.mts` and `monitor-status.mts`.
5. If approval can safely map the source snapshot to a public metric, explicitly implement that mapping in `review-action.mts`; otherwise leave it as baseline-only review.
6. Verify the production deploy still registers `source-monitor` on the daily schedule and that the new monitor reaches either `healthy` or `awaiting-first-run`, not a parser error.
