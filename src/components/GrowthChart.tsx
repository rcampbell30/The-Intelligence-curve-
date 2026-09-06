import { useMemo, useState } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import SegmentedControl from './SegmentedControl'

type ScaleMode = 'linear' | 'log'

export default function GrowthChart() {
  const [doublingMonths, setDoublingMonths] = useState(7)
  const [horizonMonths, setHorizonMonths] = useState(48)
  const [scaleMode, setScaleMode] = useState<ScaleMode>('log')

  const data = useMemo(() => {
    const step = horizonMonths <= 24 ? 3 : 6
    const points = []
    for (let month = 0; month <= horizonMonths; month += step) {
      points.push({
        month,
        multiple: Number(Math.pow(2, month / doublingMonths).toFixed(2)),
      })
    }
    if (points.at(-1)?.month !== horizonMonths) {
      points.push({
        month: horizonMonths,
        multiple: Number(Math.pow(2, horizonMonths / doublingMonths).toFixed(2)),
      })
    }
    return points
  }, [doublingMonths, horizonMonths])

  const endpoint = data.at(-1)?.multiple ?? 1
  const yDomain: [number, number | 'auto'] = scaleMode === 'log' ? [1, 'auto'] : [0, 'auto']

  return (
    <div className="chart-panel interactive-lab">
      <div className="chart-heading">
        <div>
          <span className="eyebrow">EXTRAPOLATION LAB</span>
          <h2>What happens if a doubling rate continues?</h2>
        </div>
        <span className="projection-pill">Illustrative projection</span>
      </div>

      <p className="chart-copy">Change the doubling time and projection window yourself. This is deliberately separated from observed data: it shows the mathematics of exponential growth, not a forecast of future AI capability.</p>

      <div className="interactive-controls lab-controls">
        <label className="range-control">
          <span className="control-label">Doubling time</span>
          <strong>{doublingMonths} months</strong>
          <input
            type="range"
            min="2"
            max="24"
            step="1"
            value={doublingMonths}
            onChange={(event) => setDoublingMonths(Number(event.target.value))}
          />
        </label>

        <label className="range-control">
          <span className="control-label">Projection window</span>
          <strong>{horizonMonths} months</strong>
          <input
            type="range"
            min="12"
            max="60"
            step="6"
            value={horizonMonths}
            onChange={(event) => setHorizonMonths(Number(event.target.value))}
          />
        </label>

        <SegmentedControl
          label="Chart scale"
          value={scaleMode}
          options={[{ label: 'Log', value: 'log' }, { label: 'Linear', value: 'linear' }]}
          onChange={setScaleMode}
        />
      </div>

      <div className="projection-result">
        <span>Relative scale after {horizonMonths} months</span>
        <strong>{endpoint.toLocaleString()}×</strong>
        <small>Starting from 1× with an uninterrupted {doublingMonths}-month doubling rate.</small>
      </div>

      <div className="chart-wrap" aria-label={`Illustrative ${doublingMonths}-month doubling curve`}>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data} margin={{ top: 20, right: 18, bottom: 8, left: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="4 8" opacity={0.2} />
            <XAxis dataKey="month" tickFormatter={(value) => `${value}m`} />
            <YAxis
              scale={scaleMode === 'log' ? 'log' : 'auto'}
              domain={yDomain}
              allowDataOverflow={scaleMode === 'log'}
              tickFormatter={(value) => `${Number(value).toLocaleString()}×`}
              width={74}
            />
            <Tooltip formatter={(value) => [`${Number(value).toLocaleString()}×`, 'Relative scale']} labelFormatter={(value) => `${value} months`} />
            <Line type="monotone" dataKey="multiple" stroke="currentColor" strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-footnote">Assumption: uninterrupted exponential growth at a fixed doubling time. Real-world trends can slow, accelerate, saturate or break entirely. The control changes mathematics, not our forecast.</div>
    </div>
  )
}
