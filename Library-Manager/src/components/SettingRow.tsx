import React from 'react'

type Props = {
  label?: React.ReactNode
  children?: React.ReactNode
  labelClassName?: string
}

const SettingRow: React.FC<Props> = ({ label, children, labelClassName }) => {
  return (
    <div className="setting-row">
      {label ? <div className={`setting-label ${labelClassName || ''}`}>{label}</div> : null}
      <div className="setting-control">{children}</div>
    </div>
  )
}

export default SettingRow
