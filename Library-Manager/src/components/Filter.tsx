type Option = {
  key: string
  label: string
}

type Props = {
  label?: string
  options: Option[]
  value: string
  onChange: (key: string) => void
  variant?: 'buttons' | 'select'
}

export default function Filter({ label, options, value, onChange, variant = 'buttons' }: Props) {
  if (variant === 'select') {
    return (
      <label className="flex items-center gap-3">
        {label && <span className="text-sm text-gray-300">{label}</span>}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="ml-2 bg-gray-800 text-white px-2 py-1 rounded"
        >
          {options.map((o) => (
            <option key={o.key} value={o.key} className="bg-gray-900">
              {o.label}
            </option>
          ))}
        </select>
      </label>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-sm text-gray-300 mr-2">{label}</span>}
      {options.map((o) => (
        <button
          key={o.key}
          onClick={() => onChange(o.key)}
          className={`px-3 py-1 rounded text-sm ${value === o.key ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
