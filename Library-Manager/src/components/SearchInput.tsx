import { useEffect, useRef, useState } from 'react'

type Props = {
  value: string
  onChange: (s: string) => void
  placeholder?: string
  debounceMs?: number
  className?: string
}

export default function SearchInput({ value, onChange, placeholder = 'Search...', debounceMs = 250, className = '' }: Props) {
  const [local, setLocal] = useState<string>(value)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setLocal(value)
  }, [value])

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value
    setLocal(v)
    if (!debounceMs || debounceMs <= 0) {
      onChange(v)
      return
    }
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => onChange(v), debounceMs)
  }

  return (
    <input
      type="search"
      value={local}
      onChange={handleChange}
      placeholder={placeholder}
      className={`bg-gray-700 text-white rounded px-3 py-1 w-40 sm:w-64 max-w-full ${className}`}
    />
  )
}