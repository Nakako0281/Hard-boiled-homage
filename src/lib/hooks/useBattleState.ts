import { useBattleStore } from '@/stores/battleStore'
import { BattlePhase, Turn } from '@/lib/types/enums'
import type { Position } from '@/lib/types/position'
import { useCallback, useMemo } from 'react'

/**
 * 戦闘状態管理フック
 */
export interface UseBattleStateReturn {
  // 状態
  phase: BattlePhase
  turn: Turn
  canAttack: boolean
  canContinueAttack: boolean
  consecutiveHits: number
  isPlayerTurn: boolean
  isEnemyTurn: boolean
  isAnimating: boolean

  // アクション
  attack: (position: Position) => void
  switchTurn: () => void
  checkVictory: () => 'player' | 'enemy' | null

  // HP情報
  playerHP: number
  playerMaxHP: number
  enemyHP: number
  enemyMaxHP: number

  // SP情報
  playerSP: number
  playerMaxSP: number
}

/**
 * 戦闘状態管理を提供するカスタムフック
 */
export function useBattleState(): UseBattleStateReturn {
  const phase = useBattleStore((state) => state.phase)
  const turn = useBattleStore((state) => state.turn)
  const canContinueAttack = useBattleStore((state) => state.canContinueAttack)
  const consecutiveHits = useBattleStore((state) => state.consecutiveHits)
  const isAnimating = useBattleStore((state) => state.isAnimating)
  const playerStats = useBattleStore((state) => state.playerStats)
  const enemyStats = useBattleStore((state) => state.enemyStats)

  const attack = useBattleStore((state) => state.attack)
  const switchTurn = useBattleStore((state) => state.switchTurn)
  const checkVictory = useBattleStore((state) => state.checkVictory)

  const isPlayerTurn = useMemo(() => turn === Turn.PLAYER, [turn])
  const isEnemyTurn = useMemo(() => turn === Turn.ENEMY, [turn])

  const canAttack = useMemo(() => {
    return (
      turn === Turn.PLAYER &&
      !isAnimating &&
      phase === BattlePhase.BATTLE
    )
  }, [turn, isAnimating, phase])

  const handleAttack = useCallback(
    (position: Position) => {
      if (!canAttack) return
      attack(position)
    },
    [canAttack, attack]
  )

  return {
    // 状態
    phase,
    turn,
    canAttack,
    canContinueAttack,
    consecutiveHits,
    isPlayerTurn,
    isEnemyTurn,
    isAnimating,

    // アクション
    attack: handleAttack,
    switchTurn,
    checkVictory,

    // HP情報
    playerHP: playerStats.HP,
    playerMaxHP: playerStats.maxHP,
    enemyHP: enemyStats.HP,
    enemyMaxHP: enemyStats.maxHP,

    // SP情報
    playerSP: playerStats.SP,
    playerMaxSP: playerStats.maxSP,
  }
}
