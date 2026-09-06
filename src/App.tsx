import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import {
  AgentsPage,
  BenchmarksPage,
  MethodologyPage,
  ScalingPage,
  TimelinePage,
  TrendsPage,
} from './pages/DataPages'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="trends" element={<TrendsPage />} />
        <Route path="benchmarks" element={<BenchmarksPage />} />
        <Route path="agents" element={<AgentsPage />} />
        <Route path="scaling" element={<ScalingPage />} />
        <Route path="timeline" element={<TimelinePage />} />
        <Route path="methodology" element={<MethodologyPage />} />
      </Route>
    </Routes>
  )
}
