type Props = {
  children: React.ReactNode
  onClick?: () => void
  active?: boolean
  className?: string
  ariaLabel?: string
}

export default function SmallButton({ children, onClick, active = false, className = '', ariaLabel }: Props) {
  const base = 'px-3 py-1 rounded text-sm'
  const activeCls = active ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
  return (
    <button aria-label={ariaLabel} onClick={onClick} className={`${base} ${activeCls} ${className}`}>
      {children}
    </button>
  )
}