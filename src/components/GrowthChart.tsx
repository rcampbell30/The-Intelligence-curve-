import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const data = Array.from({ length: 9 }, (_, index) => {
  const months = index * 6
  return {
    month: months,
    multiple: Number(Math.pow(2, months / 7).toFixed(2)),
  }
})

export default function GrowthChart() {
  return (
    <div className="chart-panel">
      <div className="chart-heading">
        <div>
          <span className="eyebrow">EXTRAPOLATION LAB</span>
          <h2>What a 7-month doubling looks like</h2>
        </div>
        <span className="projection-pill">Illustrative projection</span>
      </div>
      <p className="chart-copy">Start at 1× and extend a constant seven-month doubling rate. This is deliberately separated from observed data: it shows the mathematics of the trend, not a prediction of future AI capability.</p>
      <div className="chart-wrap" aria-label="Illustrative seven-month doubling curve">
        <ResponsiveContainer width="100%" height={330}>
          <LineChart data={data} margin={{ top: 20, right: 18, bottom: 8, left: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="4 8" opacity={0.2} />
            <XAxis dataKey="month" tickFormatter={(value) => `${value}m`} />
            <YAxis tickFormatter={(value) => `${value}×`} width={66} />
            <Tooltip formatter={(value) => [`${Number(value).toLocaleString()}×`, 'Relative scale']} labelFormatter={(value) => `${value} months`} />
            <Line type="monotone" dataKey="multiple" stroke="currentColor" strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="chart-footnote">Assumption: uninterrupted exponential growth at a fixed doubling time. Real-world trends can slow, accelerate or break entirely.</div>
    </div>
  )
}
