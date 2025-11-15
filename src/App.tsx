import { ErrorBoundary } from './components/common/ErrorBoundary'
import { TitleScreen } from './components/screens/TitleScreen'
import { EnemySelect, type Enemy } from './components/screens/EnemySelect'
import { PlacementScreen } from './components/screens/PlacementScreen'
import { BattleScreen } from './components/screens/BattleScreen'
import { ResultScreen, type BattleResult } from './components/screens/ResultScreen'
import type { SpecialAttack } from './components/ui/SpecialAttackPanel'
import { createEmptyGrid } from './lib/utils/grid'
import { Turn, CellState } from './lib/types/enums'
import { useState, useEffect, useMemo } from 'react'
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
  const [_selectedCharacter, setSelectedCharacter] = useState<string | null>(null)
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
      at: 10,
      df: 5,
      unitsRemaining: 3,
    },
    enemyStats: {
      name: '運び屋A',
      hp: 150,
      maxHp: 150,
      sp: 80,
      maxSp: 80,
      at: 12,
      df: 8,
      unitsRemaining: 3,
    },
  })

  // 利用可能な特殊攻撃（useMemoで動的に計算）
  const availableSpecialAttacks: SpecialAttack[] = useMemo(
    () => [
      {
        unitId: 'wide-attack',
        name: '💥 広範囲攻撃',
        description: '3x3範囲に攻撃',
        spCost: 30,
        canUse: battleState.playerStats.sp >= 30,
      },
      {
        unitId: 'power-shot',
        name: '🎯 強力な一撃',
        description: '大ダメージ（30HP）',
        spCost: 25,
        canUse: battleState.playerStats.sp >= 25,
      },
      {
        unitId: 'scan',
        name: '🔍 索敵',
        description: '5x5範囲を明らかにする',
        spCost: 20,
        canUse: battleState.playerStats.sp >= 20,
      },
    ],
    [battleState.playerStats.sp]
  )

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

    // 敵の配置をランダムに生成
    const enemyGrid = createEmptyGrid({ width: 10, height: 10 })
    const enemyUnits = ['enemy1', 'enemy2', 'enemy3']

    enemyUnits.forEach((unitId) => {
      let placed = false
      while (!placed) {
        const x = Math.floor(Math.random() * 10)
        const y = Math.floor(Math.random() * 10)
        if (!enemyGrid[y][x].unitId) {
          enemyGrid[y][x] = {
            ...enemyGrid[y][x],
            unitId,
          }
          placed = true
        }
      }
    })

    // 配置フィールドを戦闘フィールドにコピー
    setBattleState((prev) => ({
      ...prev,
      playerField: placementField,
      enemyField: {
        size: { width: 10, height: 10 },
        cells: enemyGrid,
        placedUnits: [],
      },
    }))

    setGamePhase('battle')
  }

  const handleAttack = (position: Position) => {
    if (battleState.currentTurn !== Turn.PLAYER) return

    const cell = battleState.enemyField.cells[position.y][position.x]

    // 既に攻撃済みの場合はスキップ
    if (cell.state !== CellState.UNEXPLORED) return

    // ヒット判定
    const isHit = !!cell.unitId

    // 攻撃処理
    const newCells = battleState.enemyField.cells.map((row, y) =>
      row.map((c, x) => {
        if (x === position.x && y === position.y) {
          return {
            ...c,
            state: isHit ? CellState.HIT : CellState.MISS,
          }
        }
        return c
      })
    )

    // ダメージ計算（MISSの場合のみ）
    let damage = 0
    if (!isHit) {
      // 直接ダメージ計算: AT - DF（最低1ダメージ保証）
      damage = Math.max(1, battleState.playerStats.at - battleState.enemyStats.df)
    }

    const newEnemyStats = {
      ...battleState.enemyStats,
      hp: Math.max(0, battleState.enemyStats.hp - damage),
    }

    setBattleState((prev) => ({
      ...prev,
      enemyField: {
        ...prev.enemyField,
        cells: newCells,
      },
      enemyStats: newEnemyStats,
    }))

    // 勝敗判定
    if (newEnemyStats.hp <= 0) {
      setTimeout(() => setGamePhase('result'), 500)
      return
    }

    // HITの場合は連続攻撃可能（ターン終了しない）
    // MISSの場合はターン終了
    if (!isHit) {
      setTimeout(() => handleEndTurn(), 500)
    }
  }

  const handleSpecialAttack = (attackId: string, position: Position) => {
    if (battleState.currentTurn !== Turn.PLAYER) return

    const attack = availableSpecialAttacks.find((a) => a.unitId === attackId)
    if (!attack) return

    // SP不足チェック
    if (battleState.playerStats.sp < attack.spCost) return

    let newCells = [...battleState.enemyField.cells.map((row) => [...row])]
    let missCount = 0 // MISSの数をカウント

    // 特殊攻撃の種類に応じて処理
    switch (attackId) {
      case 'wide-attack': {
        // 3x3範囲攻撃
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const targetY = position.y + dy
            const targetX = position.x + dx
            if (
              targetY >= 0 &&
              targetY < 10 &&
              targetX >= 0 &&
              targetX < 10 &&
              newCells[targetY][targetX].state === CellState.UNEXPLORED
            ) {
              const isHit = !!newCells[targetY][targetX].unitId
              newCells[targetY][targetX] = {
                ...newCells[targetY][targetX],
                state: isHit ? CellState.HIT : CellState.MISS,
              }
              // MISSの場合のみカウント
              if (!isHit) missCount++
            }
          }
        }
        break
      }
      case 'power-shot': {
        // 強力な一撃
        const cell = newCells[position.y][position.x]
        if (cell.state === CellState.UNEXPLORED) {
          const isHit = !!cell.unitId
          newCells[position.y][position.x] = {
            ...cell,
            state: isHit ? CellState.HIT : CellState.MISS,
          }
          // MISSの場合のみカウント（強力な一撃は3倍ダメージ）
          if (!isHit) missCount = 3
        }
        break
      }
      case 'scan': {
        // 5x5範囲索敵（ダメージなし）
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            const targetY = position.y + dy
            const targetX = position.x + dx
            if (
              targetY >= 0 &&
              targetY < 10 &&
              targetX >= 0 &&
              targetX < 10 &&
              newCells[targetY][targetX].state === CellState.UNEXPLORED
            ) {
              const isHit = !!newCells[targetY][targetX].unitId
              newCells[targetY][targetX] = {
                ...newCells[targetY][targetX],
                state: isHit ? CellState.HIT : CellState.MISS,
              }
            }
          }
        }
        break
      }
    }

    // ダメージ計算（MISSの場合のみ、基本ダメージ × MISS回数）
    const baseDamage = Math.max(1, battleState.playerStats.at - battleState.enemyStats.df)
    const totalDamage = baseDamage * missCount

    // ステータス更新（SP消費とダメージ）
    const newEnemyStats = {
      ...battleState.enemyStats,
      hp: Math.max(0, battleState.enemyStats.hp - totalDamage),
    }

    const newPlayerStats = {
      ...battleState.playerStats,
      sp: battleState.playerStats.sp - attack.spCost,
    }

    setBattleState((prev) => ({
      ...prev,
      enemyField: {
        ...prev.enemyField,
        cells: newCells,
      },
      enemyStats: newEnemyStats,
      playerStats: newPlayerStats,
    }))

    // 勝敗判定
    if (newEnemyStats.hp <= 0) {
      setTimeout(() => setGamePhase('result'), 500)
      return
    }

    // 特殊攻撃は必ずターン終了（HITしても連続攻撃不可）
    setTimeout(() => handleEndTurn(), 500)
  }

  const handleEndTurn = () => {
    console.log('End turn')
    setBattleState((prev) => ({
      ...prev,
      currentTurn: prev.currentTurn === Turn.PLAYER ? Turn.ENEMY : Turn.PLAYER,
      turnNumber: prev.currentTurn === Turn.ENEMY ? prev.turnNumber + 1 : prev.turnNumber,
    }))
  }

  // CPUターンの自動攻撃
  useEffect(() => {
    if (battleState.currentTurn === Turn.ENEMY && gamePhase === 'battle') {
      setTimeout(() => {
        // ランダムな位置に攻撃
        const unexploredCells: Position[] = []
        battleState.playerField.cells.forEach((row, y) => {
          row.forEach((cell, x) => {
            if (cell.state === CellState.UNEXPLORED) {
              unexploredCells.push({ x, y })
            }
          })
        })

        if (unexploredCells.length === 0) {
          setGamePhase('result')
          return
        }

        const randomIndex = Math.floor(Math.random() * unexploredCells.length)
        const targetPos = unexploredCells[randomIndex]

        const cell = battleState.playerField.cells[targetPos.y][targetPos.x]
        const isHit = !!cell.unitId

        const newCells = battleState.playerField.cells.map((row, y) =>
          row.map((c, x) => {
            if (x === targetPos.x && y === targetPos.y) {
              return {
                ...c,
                state: isHit ? CellState.HIT : CellState.MISS,
              }
            }
            return c
          })
        )

        // ダメージ計算（MISSの場合のみ）
        let damage = 0
        if (!isHit) {
          // 直接ダメージ計算: AT - DF（最低1ダメージ保証）
          damage = Math.max(1, battleState.enemyStats.at - battleState.playerStats.df)
        }

        const newPlayerStats = {
          ...battleState.playerStats,
          hp: Math.max(0, battleState.playerStats.hp - damage),
        }

        setBattleState((prev) => ({
          ...prev,
          playerField: {
            ...prev.playerField,
            cells: newCells,
          },
          playerStats: newPlayerStats,
        }))

        // 勝敗判定
        if (newPlayerStats.hp <= 0) {
          setTimeout(() => setGamePhase('result'), 500)
          return
        }

        // プレイヤーターンに戻す
        setTimeout(() => handleEndTurn(), 1000)
      }, 1000)
    }
  }, [battleState.currentTurn, gamePhase])

  const handleBackToTitle = () => {
    setGamePhase('title')
    setSelectedCharacter(null)
    setSelectedEnemy(null)
  }

  const handleBackToEnemySelect = () => {
    setGamePhase('enemySelect')
  }

  // 戦闘結果を計算
  const calculateBattleResult = (): BattleResult => {
    const isVictory = battleState.enemyStats.hp <= 0
    const damageDealt = battleState.enemyStats.maxHp - battleState.enemyStats.hp
    const damageTaken = battleState.playerStats.maxHp - battleState.playerStats.hp

    // ユニット喪失数を計算（破壊されたセルの数）
    let unitsLost = 0
    battleState.playerField.cells.forEach((row) => {
      row.forEach((cell) => {
        if (cell.state === CellState.DESTROYED || cell.state === CellState.HIT) {
          if (cell.unitId) unitsLost++
        }
      })
    })

    // 敵情報を取得
    const enemy = ENEMIES.find((e) => e.id === selectedEnemy)
    const baseReward = enemy?.reward || 1000

    return {
      isVictory,
      reward: {
        money: isVictory ? baseReward : 0,
        experience: isVictory ? battleState.turnNumber * 10 : battleState.turnNumber * 5,
        bonus: isVictory && damageTaken === 0
          ? [{ name: '無傷クリア', amount: 500 }]
          : undefined,
      },
      stats: {
        turnsElapsed: battleState.turnNumber,
        damageDealt,
        damageTaken,
        unitsLost,
      },
    }
  }

  const handleResultContinue = () => {
    // 勝利時は敵選択画面に戻る（次の敵を選択可能に）
    setGamePhase('enemySelect')
  }

  const handleResultRetry = () => {
    // 配置画面に戻る
    setGamePhase('placement')
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
            availableSpecialAttacks={availableSpecialAttacks}
            onAttack={handleAttack}
            onSpecialAttack={handleSpecialAttack}
            onEndTurn={handleEndTurn}
          />
        )}
        {gamePhase === 'result' && (
          <ResultScreen
            result={calculateBattleResult()}
            onContinue={handleResultContinue}
            onRetry={handleResultRetry}
            onBackToTitle={handleBackToTitle}
          />
        )}
      </div>
    </ErrorBoundary>
  )
}

export default App
