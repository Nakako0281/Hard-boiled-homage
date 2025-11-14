import { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from './Button'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * エラーバウンダリコンポーネント
 * 子コンポーネントのエラーをキャッチして、フォールバックUIを表示する
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // カスタムエラーハンドラーを呼び出す
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // カスタムフォールバックUIがあればそれを使用
      if (this.props.fallback) {
        return this.props.fallback
      }

      // デフォルトのエラーUI
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#1A1A1D] p-4">
          <div className="max-w-md w-full bg-[#34495E] rounded-lg p-8 text-center">
            <div className="mb-6">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-[#E74C3C] mb-2">
                エラーが発生しました
              </h1>
              <p className="text-[#ECF0F1] mb-4">
                申し訳ございません。予期しないエラーが発生しました。
              </p>
            </div>

            {this.state.error && (
              <div className="mb-6 p-4 bg-[#2C3E50] rounded text-left">
                <p className="text-sm text-[#95A5A6] font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <Button onClick={this.handleReset} className="w-full">
                再試行
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="secondary"
                className="w-full"
              >
                ページを再読み込み
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
