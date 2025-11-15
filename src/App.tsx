import { ErrorBoundary } from './components/common/ErrorBoundary'
import { TitleScreen } from './components/screens/TitleScreen'
import { EnemySelect, type Enemy } from './components/screens/EnemySelect'
import { PlacementScreen } from './components/screens/PlacementScreen'
import { BattleScreen } from './components/screens/BattleScreen'
import { createEmptyGrid } from './lib/utils/grid'
import { Turn } from './lib/types/enums'
import { useState } from 'react'
import type { Position } from './lib/types/position'

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

  const [placementField, setPlacementField] = useState(() => ({
    size: { width: 10, height: 10 },
    cells: createEmptyGrid({ width: 10, height: 10 }),
    placedUnits: [],
  }))

  const [availableUnits, setAvailableUnits] = useState([
    { id: 'unit1', name: '歩兵部隊', placed: false },
    { id: 'unit2', name: '装甲車', placed: false },
    { id: 'unit3', name: '狙撃手', placed: false },
  ])

  // 戦闘状態
  const [battleState, setBattleState] = useState({
    playerField: {
      size: { width: 10, height: 10 },
      cells: createEmptyGrid({ width: 10, height: 10 }),
      placedUnits: [],
    },
    enemyField: {
      size: { width: 10, height: 10 },
      cells: createEmptyGrid({ width: 10, height: 10 }),
      placedUnits: [],
    },
    currentTurn: Turn.PLAYER,
    turnNumber: 1,
    playerStats: {
      name: 'ジャック刑事',
      hp: 100,
      maxHp: 100,
      sp: 100,
      maxSp: 100,
      unitsRemaining: 3,
    },
    enemyStats: {
      name: '運び屋A',
      hp: 80,
      maxHp: 80,
      sp: 50,
      maxSp: 50,
      unitsRemaining: 3,
    },
  })

  const handleNewGame = (characterId: string) => {
    console.log('New game started with character:', characterId)
    setSelectedCharacter(characterId)

    // 配置フィールドとユニットをリセット
    setPlacementField({
      size: { width: 10, height: 10 },
      cells: createEmptyGrid({ width: 10, height: 10 }),
      placedUnits: [],
    })
    setAvailableUnits([
      { id: 'unit1', name: '歩兵部隊', placed: false },
      { id: 'unit2', name: '装甲車', placed: false },
      { id: 'unit3', name: '狙撃手', placed: false },
    ])

    setGamePhase('enemySelect')
  }

  const handleEnemySelect = (enemyId: string) => {
    console.log('Enemy selected:', enemyId)
    setSelectedEnemy(enemyId)
    setGamePhase('placement')
  }

  const handlePlaceUnit = (unitId: string, position: Position): boolean => {
    // 指定された位置が既に使用されているかチェック
    const cell = placementField.cells[position.y]?.[position.x]
    if (!cell || cell.unitId) {
      return false
    }

    // グリッドを更新
    const newCells = placementField.cells.map((row, y) =>
      row.map((cell, x) => {
        if (x === position.x && y === position.y) {
          return { ...cell, unitId }
        }
        return cell
      })
    )

    setPlacementField({
      ...placementField,
      cells: newCells,
    })

    // ユニットの配置状態を更新
    setAvailableUnits((units) =>
      units.map((unit) =>
        unit.id === unitId ? { ...unit, placed: true } : unit
      )
    )

    return true
  }

  const handleStartBattle = () => {
    console.log('Start battle')

    // 配置フィールドを戦闘フィールドにコピー
    setBattleState((prev) => ({
      ...prev,
      playerField: placementField,
      enemyField: {
        size: { width: 10, height: 10 },
        cells: createEmptyGrid({ width: 10, height: 10 }),
        placedUnits: [],
      },
    }))

    setGamePhase('battle')
  }

  const handleAttack = (position: Position) => {
    console.log('Attack at', position)
    // TODO: 攻撃処理を実装
  }

  const handleEndTurn = () => {
    console.log('End turn')
    setBattleState((prev) => ({
      ...prev,
      currentTurn: prev.currentTurn === Turn.PLAYER ? Turn.ENEMY : Turn.PLAYER,
      turnNumber: prev.currentTurn === Turn.ENEMY ? prev.turnNumber + 1 : prev.turnNumber,
    }))
  }

  const handleBackToTitle = () => {
    setGamePhase('title')
    setSelectedCharacter(null)
    setSelectedEnemy(null)
  }

  const handleBackToEnemySelect = () => {
    setGamePhase('enemySelect')
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
        {gamePhase === 'placement' && (
          <PlacementScreen
            field={placementField}
            availableUnits={availableUnits}
            onPlaceUnit={handlePlaceUnit}
            onStartBattle={handleStartBattle}
            onBack={handleBackToEnemySelect}
          />
        )}
        {gamePhase === 'battle' && (
          <BattleScreen
            playerField={battleState.playerField}
            enemyField={battleState.enemyField}
            currentTurn={battleState.currentTurn}
            turnNumber={battleState.turnNumber}
            playerStats={battleState.playerStats}
            enemyStats={battleState.enemyStats}
            onAttack={handleAttack}
            onEndTurn={handleEndTurn}
          />
        )}
      </div>
    </ErrorBoundary>
  )
}

export default App
