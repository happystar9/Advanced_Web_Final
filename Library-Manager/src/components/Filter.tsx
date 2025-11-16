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

import SmallButton from './SmallButton'

export default function Filter({ label, options, value, onChange, variant = 'buttons' }: Props) {
  if (variant === 'select') {
    return (
      <label className="flex items-center gap-3">
        {label && <span className="text-m text-gray-300">{label}</span>}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="rounded text-m ml-2 bg-blue-600 text-white : bg-gray-700 text-gray-200 px-3 py-1 hover:bg-gray-600"
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
      {label && <span className="text-m text-gray-300 mr-2">{label}</span>}
      {options.map((o) => (
        <SmallButton 
            key={o.key} 
            onClick={() => onChange(o.key)} 
            active={value === o.key} 
            ariaLabel={o.label}>
            {o.label}
        </SmallButton>
      ))}
    </div>
  )
}
