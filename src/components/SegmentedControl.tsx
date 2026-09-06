type Option<T extends string> = {
  label: string
  value: T
}

type Props<T extends string> = {
  label: string
  value: T
  options: Option<T>[]
  onChange: (value: T) => void
}

export default function SegmentedControl<T extends string>({ label, value, options, onChange }: Props<T>) {
  return (
    <div className="control-group">
      <span className="control-label">{label}</span>
      <div className="segmented-control" role="group" aria-label={label}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={option.value === value ? 'segment-button active' : 'segment-button'}
            aria-pressed={option.value === value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
