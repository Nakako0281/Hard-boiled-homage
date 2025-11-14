import { ErrorBoundary } from './components/common/ErrorBoundary'
import { TitleScreen } from './components/screens/TitleScreen'

function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#1A1A1D] text-[#ECF0F1]">
        <TitleScreen
          onNewGame={() => {
            // 新しいゲーム開始
            console.log('New game started')
          }}
        />
      </div>
    </ErrorBoundary>
  )
}

export default App
