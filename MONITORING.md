# Source monitoring

The Intelligence Curve uses Netlify Scheduled Functions + Netlify Blobs to detect changes in selected primary sources without automatically rewriting public evidence.

## Current monitors

- Humanity's Last Exam leaderboard — Scale AI
- METR Time Horizons live page
- ARC-AGI-3 Astra results — ARC Prize

The scheduled function is `netlify/functions/source-monitor.mts` and runs daily at 06:15 UTC.

## Safety model

1. Fetch the primary source.
2. Parse only the small source-specific snapshot we care about.
3. Compare it with the `publishedSnapshot` in the monitor registry.
4. If it matches, store a healthy check result.
5. If it differs, store the candidate in Netlify Blobs as `pending-review`.
6. Do **not** modify `src/data/metrics.ts`, the update feed, or any public headline automatically.

The public `/api/monitor-status` endpoint exposes monitor health and the number of pending reviews, but intentionally does not expose candidate values before review.

## Approving a detected change

After checking the original source and deciding the change is valid:

1. Update the relevant public metric/data series.
2. Add an update-feed event when the change is meaningful.
3. Update the metric freshness/source-version metadata.
4. Update the corresponding `publishedSnapshot` in `netlify/functions/source-monitor.mts` in the same change.
5. Deploy. The next successful monitor run should clear the pending-review state when the source matches the new baseline.

If a parser fails, fix the parser without changing the public metric. A parsing error is not evidence that the underlying metric changed.
