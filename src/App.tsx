import { ErrorBoundary } from './components/common/ErrorBoundary'
import { TitleScreen } from './components/screens/TitleScreen'
import { EnemySelect, type Enemy } from './components/screens/EnemySelect'
import { useState } from 'react'

type GamePhase = 'title' | 'enemySelect' | 'placement' | 'battle' | 'result'

const ENEMIES: Enemy[] = [
  {
    id: 'carrier-a',
    name: '運び屋A',
    description: '入門用の敵。全体的にステータス低め。',
    difficulty: 'easy',
    reward: 1000,
    isDefeated: false,
  },
  {
    id: 'madman-b',
    name: '狂人B',
    description: '高攻撃力・低防御の攻撃型。HPダメージ重視。',
    difficulty: 'normal',
    reward: 1500,
    isDefeated: false,
  },
  {
    id: 'colonel-z',
    name: 'Z大佐',
    description: '全特殊攻撃所持、高ステータスの強敵。',
    difficulty: 'hard',
    reward: 3000,
    isDefeated: false,
  },
  {
    id: 'bomber-j',
    name: '爆弾魔J',
    description: '最強の敵。全部隊・全特殊攻撃を所持。',
    difficulty: 'expert',
    reward: 5000,
    isDefeated: false,
  },
]

function App() {
  const [gamePhase, setGamePhase] = useState<GamePhase>('title')
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null)
  const [selectedEnemy, setSelectedEnemy] = useState<string | null>(null)

  const handleNewGame = (characterId: string) => {
    console.log('New game started with character:', characterId)
    setSelectedCharacter(characterId)
    setGamePhase('enemySelect')
  }

  const handleEnemySelect = (enemyId: string) => {
    console.log('Enemy selected:', enemyId)
    setSelectedEnemy(enemyId)
    // TODO: 次は部隊配置画面に遷移
    alert(`敵「${enemyId}」を選択しました。次は部隊配置画面に進みます（未実装）`)
  }

  const handleBackToTitle = () => {
    setGamePhase('title')
    setSelectedCharacter(null)
    setSelectedEnemy(null)
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#1A1A1D] text-[#ECF0F1]">
        {gamePhase === 'title' && (
          <TitleScreen onNewGame={handleNewGame} />
        )}
        {gamePhase === 'enemySelect' && (
          <EnemySelect
            enemies={ENEMIES}
            onSelectEnemy={handleEnemySelect}
            onBack={handleBackToTitle}
          />
        )}
      </div>
    </ErrorBoundary>
  )
}

export default App
