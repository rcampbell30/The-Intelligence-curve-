import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { loadMetricOverrides } from './data/runtimeMetrics'
import { loadReportSnapshots } from './data/runtimeReports'
import { loadRuntimeUpdates } from './data/runtimeUpdates'
import './styles.css'
import './evidence.css'
import './responsive.css'
import './data-pages.css'
import './interactive.css'
import './then-vs-now.css'
import './metric-detail.css'
import './velocity.css'
import './updates.css'
import './monitoring.css'
import './review.css'
import './ai-pulse.css'
import './reports.css'
import './share-report.css'
import './benchmark-lifecycle.css'

async function bootstrap() {
  await Promise.all([loadMetricOverrides(), loadReportSnapshots(), loadRuntimeUpdates()])

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>,
  )
}

void bootstrap()
