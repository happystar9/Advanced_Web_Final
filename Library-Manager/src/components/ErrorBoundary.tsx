import React from 'react'
import toast from 'react-hot-toast'

type Props = { children: React.ReactNode }
type State = { hasError: boolean; error?: Error | null }

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught render error', error, info)
    toast.error('An unexpected error occurred.');
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24 }}>
          <h2>Something went wrong</h2>
          <p>We're sorry — an unexpected error occurred while rendering this page.</p>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && String(this.state.error.stack)}
          </details>
        </div>
      )
    }
    return this.props.children
  }
}