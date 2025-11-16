type Props = {
  message?: string
}

export default function FullPageLoader({ message = 'Loading…' }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gray-800 text-white rounded-lg p-6 flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-t-transparent border-white rounded-full animate-spin" />
        <div className="text-sm text-gray-200">{message}</div>
      </div>
    </div>
  )
}