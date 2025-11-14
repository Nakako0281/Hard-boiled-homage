import { ErrorBoundary } from './components/common/ErrorBoundary'
import { TitleScreen } from './components/screens/TitleScreen'

function App() {
  const handleNewGame = (characterId: string) => {
    // 新しいゲーム開始
    console.log('New game started with character:', characterId)
    // TODO: ゲーム画面への遷移処理を実装
    alert(`キャラクター「${characterId}」で新しいゲームを開始します`)
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#1A1A1D] text-[#ECF0F1]">
        <TitleScreen onNewGame={handleNewGame} />
      </div>
    </ErrorBoundary>
  )
}

export default App
