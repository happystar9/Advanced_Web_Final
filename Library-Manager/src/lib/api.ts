import toast from 'react-hot-toast'

export class ApiError extends Error {
  status: number
  data?: unknown
  constructor(status: number, message: string, data?: unknown) {
    super(message)
    this.status = status
    this.data = data
  }
}

export async function apiFetch(input: RequestInfo, init?: RequestInit) {
  const res = await fetch(input, init)
  let data: unknown = null
  const ct = res.headers.get('content-type') || ''
  if (ct.includes('application/json')) {
    data = await res.json()
  } else {
    data = await res.text()
  }

  if (!res.ok) {
    let msg = res.statusText || 'API error'
    if (data && typeof data === 'object') {
      const d = data as Record<string, unknown>
      if (typeof d.error === 'string') msg = d.error
      else if (typeof d.message === 'string') msg = d.message
    } else if (typeof data === 'string' && data.length > 0) {
      msg = data
    }

    toast.error(String(msg))
    throw new ApiError(res.status, String(msg), data)
  }

  return data
}