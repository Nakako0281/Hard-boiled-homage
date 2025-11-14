import { motion } from 'framer-motion'
import React, { useState } from 'react'
import { GameBoard } from '@/components/game/GameBoard'
import { TurnIndicator } from '@/components/ui/TurnIndicator'
import { StatusPanel } from '@/components/ui/StatusPanel'
import { AttackButton } from '@/components/ui/AttackButton'
import { SpecialAttackPanel, SpecialAttack } from '@/components/ui/SpecialAttackPanel'
import type { Field } from '@/lib/types/grid'
import { Turn } from '@/lib/types/enums'
import type { Position } from '@/lib/types/position'

export interface BattleScreenProps {
  playerField: Field
  enemyField: Field
  currentTurn: Turn
  turnNumber: number
  playerStats: {
    name: string
    hp: number
    maxHp: number
    sp: number
    maxSp: number
    unitsRemaining: number
  }
  enemyStats: {
    name: string
    hp: number
    maxHp: number
    sp: number
    maxSp: number
    unitsRemaining: number
  }
  availableSpecialAttacks?: SpecialAttack[]
  onAttack: (position: Position) => void
  onSpecialAttack?: (unitId: string, position: Position) => void
  onEndTurn?: () => void
}

export const BattleScreen: React.FC<BattleScreenProps> = ({
  playerField,
  enemyField,
  currentTurn,
  turnNumber,
  playerStats,
  enemyStats,
  availableSpecialAttacks = [],
  onAttack,
  onSpecialAttack,
  onEndTurn,
}) => {
  const [attackMode, setAttackMode] = useState<'normal' | 'special'>('normal')
  const [showSpecialPanel, setShowSpecialPanel] = useState(false)

  const isPlayerTurn = currentTurn === Turn.PLAYER

  const handleAttackButtonClick = () => {
    setAttackMode('normal')
    setShowSpecialPanel(false)
  }

  const handleSpecialButtonClick = () => {
    setAttackMode('special')
    setShowSpecialPanel(true)
  }

  const handleSelectSpecialAttack = (_unitId: string) => {
    if (onSpecialAttack) {
      // 特殊攻撃選択後、攻撃対象を選ぶモードに
      setShowSpecialPanel(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#2C3E50] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* ターンインジケーター */}
        <motion.div
          className="mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <TurnIndicator currentTurn={currentTurn} turnNumber={turnNumber} />
        </motion.div>

        {/* ステータスパネル */}
        <motion.div
          className="grid md:grid-cols-2 gap-4 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <StatusPanel
            {...playerStats}
            isCurrentTurn={isPlayerTurn}
            isPlayer={true}
          />
          <StatusPanel
            {...enemyStats}
            isCurrentTurn={!isPlayerTurn}
            isPlayer={false}
          />
        </motion.div>

        {/* ゲームボード */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <GameBoard
            playerField={playerField}
            enemyField={enemyField}
            currentTurn={currentTurn}
            onAttack={onAttack}
          />
        </motion.div>

        {/* アクションバー */}
        {isPlayerTurn && (
          <motion.div
            className="flex flex-wrap gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {/* 通常攻撃ボタン */}
            <AttackButton
              onClick={handleAttackButtonClick}
              isActive={attackMode === 'normal'}
            />

            {/* 特殊攻撃ボタン */}
            {availableSpecialAttacks.length > 0 && (
              <motion.button
                onClick={handleSpecialButtonClick}
                className={`
                  px-6 py-3 rounded-lg font-bold text-lg
                  transition-all duration-200
                  ${
                    attackMode === 'special'
                      ? 'bg-[#9B59B6] ring-2 ring-[#9B59B6] text-white'
                      : 'bg-[#8E44AD] hover:bg-[#9B59B6] text-white'
                  }
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                特殊攻撃
              </motion.button>
            )}

            {/* ターン終了ボタン */}
            {onEndTurn && (
              <motion.button
                onClick={onEndTurn}
                className="px-6 py-3 rounded-lg font-bold text-lg bg-[#5D6D7E] hover:bg-[#7F8C8D] text-white transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ターン終了
              </motion.button>
            )}
          </motion.div>
        )}

        {/* 特殊攻撃パネル */}
        <SpecialAttackPanel
          isOpen={showSpecialPanel}
          availableAttacks={availableSpecialAttacks}
          currentSp={playerStats.sp}
          onSelectAttack={handleSelectSpecialAttack}
          onClose={() => setShowSpecialPanel(false)}
        />
      </div>
    </div>
  )
}
