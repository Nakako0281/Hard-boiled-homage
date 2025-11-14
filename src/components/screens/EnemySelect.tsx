import { motion } from 'framer-motion'
import React, { useState } from 'react'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'

export interface Enemy {
  id: string
  name: string
  description: string
  difficulty: 'easy' | 'normal' | 'hard' | 'expert'
  reward: number
  isDefeated?: boolean
}

export interface EnemySelectProps {
  enemies: Enemy[]
  onSelectEnemy: (enemyId: string) => void
  onBack?: () => void
}

export const EnemySelect: React.FC<EnemySelectProps> = ({
  enemies,
  onSelectEnemy,
  onBack,
}) => {
  const [selectedEnemy, setSelectedEnemy] = useState<string | null>(null)

  const getDifficultyColor = (difficulty: Enemy['difficulty']) => {
    switch (difficulty) {
      case 'easy':
        return 'text-[#27AE60]'
      case 'normal':
        return 'text-[#3498DB]'
      case 'hard':
        return 'text-[#F39C12]'
      case 'expert':
        return 'text-[#E74C3C]'
    }
  }

  const getDifficultyLabel = (difficulty: Enemy['difficulty']) => {
    switch (difficulty) {
      case 'easy':
        return '簡単'
      case 'normal':
        return '普通'
      case 'hard':
        return '難しい'
      case 'expert':
        return '超難'
    }
  }

  const handleConfirm = () => {
    if (selectedEnemy) {
      onSelectEnemy(selectedEnemy)
    }
  }

  const defeatedCount = enemies.filter((e) => e.isDefeated).length
  const totalCount = enemies.length

  return (
    <div className="min-h-screen bg-[#2C3E50] p-6">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-white font-bold text-3xl mb-2">敵選択</h1>
          <p className="text-[#95A5A6]">
            撃破した敵: {defeatedCount} / {totalCount}
          </p>
        </motion.div>

        {/* 敵一覧 */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {enemies.map((enemy, index) => (
            <motion.div
              key={enemy.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                isHoverable={!enemy.isDefeated}
                isSelected={selectedEnemy === enemy.id}
                onClick={
                  !enemy.isDefeated
                    ? () => setSelectedEnemy(enemy.id)
                    : undefined
                }
                className={`h-full ${
                  enemy.isDefeated
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer'
                }`}
              >
                {/* 撃破済みマーク */}
                {enemy.isDefeated && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-[#27AE60] text-white text-xs font-bold px-2 py-1 rounded">
                      撃破済み
                    </span>
                  </div>
                )}

                <h3 className="text-white font-bold text-xl mb-2">
                  {enemy.name}
                </h3>
                <p className="text-[#95A5A6] text-sm mb-4">
                  {enemy.description}
                </p>

                {/* 難易度 */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#95A5A6] text-sm">難易度</span>
                  <span
                    className={`font-bold ${getDifficultyColor(
                      enemy.difficulty
                    )}`}
                  >
                    {getDifficultyLabel(enemy.difficulty)}
                  </span>
                </div>

                {/* 報酬 */}
                <div className="flex items-center justify-between">
                  <span className="text-[#95A5A6] text-sm">報酬</span>
                  <span className="text-[#F39C12] font-bold">
                    ${enemy.reward}
                  </span>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* フッターボタン */}
        <motion.div
          className="flex gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {onBack && (
            <Button onClick={onBack} variant="secondary" className="flex-1">
              戻る
            </Button>
          )}
          <Button
            onClick={handleConfirm}
            variant="primary"
            disabled={!selectedEnemy}
            className="flex-1"
          >
            戦闘開始
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
