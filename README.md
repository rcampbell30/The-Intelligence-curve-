# The Intelligence Curve

A visual, source-first dashboard tracking the pace of progress in artificial intelligence.

## What this project tracks

- Frontier benchmark performance
- Agent autonomy and task horizon
- Training and inference compute
- Cost and efficiency trends
- Major capability milestones
- Clearly labelled trend extrapolations

## Stack

- React + TypeScript
- Vite
- Recharts
- Static data modules for easy updates
- Netlify-ready deployment

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

Netlify is configured via `netlify.toml` to publish the `dist` directory.

## Data standard

Every public metric should include a source, date, unit, and enough methodology context to distinguish measured data from extrapolation. The site should never present a projection as an observed result.
