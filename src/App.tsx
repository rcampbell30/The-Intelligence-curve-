import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import SectionPage from './pages/SectionPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="trends" element={<SectionPage eyebrow="THE BIG PICTURE" title="Trends" intro="The strongest long-run signals we can measure, presented with the assumptions and uncertainty that sit behind the headline doubling times." notes={["Combine capability, autonomy, infrastructure and price curves on comparable timelines.", "Add controls for log/linear scale and source methodology.", "Show trend breaks rather than forcing a single exponential fit across every era."]} />} />
        <Route path="benchmarks" element={<SectionPage eyebrow="MEASURED CAPABILITY" title="Benchmarks" intro="A historical record of frontier benchmark performance where model version, evaluation date, cost and harness configuration stay attached to every score." category="Benchmarks" notes={["ARC-AGI, Humanity's Last Exam, SWE-bench, GPQA and other durable frontier evaluations.", "Model-vs-model historical charts rather than isolated leaderboard snapshots.", "Explicit benchmark saturation warnings and version-change annotations."]} />} />
        <Route path="agents" element={<SectionPage eyebrow="AUTONOMOUS WORK" title="Agents" intro="Tracking how long AI systems can operate productively without human rescue — and where reliability still collapses." category="Agents" notes={["METR task-completion time horizons with methodology versions separated.", "Computer-use and long-horizon software engineering evaluations.", "Reliability at multiple thresholds, not just best-case demonstrations."]} />} />
        <Route path="scaling" element={<SectionPage eyebrow="COMPUTE & INFRASTRUCTURE" title="Scaling" intro="The physical curves underneath frontier AI: training compute, chip capacity, data centres, power and efficiency." category="Scaling" notes={["Global compute stock and frontier training compute.", "Data-centre compute and power records.", "Hardware performance-per-dollar and software efficiency trends."]} />} />
        <Route path="timeline" element={<SectionPage eyebrow="THEN VS NOW" title="Timeline" intro="A chronological view connecting model releases to benchmark jumps, agent milestones, compute records and major changes in cost." notes={["Filterable releases and capability milestones on one time axis.", "Then-vs-now cards for the most dramatic short-period changes.", "Link every milestone directly to an original or high-quality primary source."]} />} />
        <Route path="methodology" element={<SectionPage eyebrow="TRUST THE GRAPH" title="Methodology" intro="The site treats measured observations, fitted historical trends and future extrapolations as three different things. They should never be visually interchangeable." notes={["Every metric requires source, date, definition, unit and methodology notes.", "Historical trend fits must disclose the fitted period and uncertainty when available.", "Extrapolations are opt-in, visually labelled and never presented as forecasts.", "When a benchmark or methodology changes, old and new series remain distinguishable."]} />} />
      </Route>
    </Routes>
  )
}
