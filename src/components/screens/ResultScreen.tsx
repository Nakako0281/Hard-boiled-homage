import { motion } from 'framer-motion'
import React from 'react'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'

export interface BattleResult {
  isVictory: boolean
  reward: {
    money: number
    experience: number
    bonus?: {
      name: string
      amount: number
    }[]
  }
  stats: {
    turnsElapsed: number
    damageDealt: number
    damageTaken: number
    unitsLost: number
  }
}

export interface ResultScreenProps {
  result: BattleResult
  onContinue: () => void
  onRetry?: () => void
  onBackToTitle?: () => void
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  result,
  onContinue,
  onRetry,
  onBackToTitle,
}) => {
  const { isVictory, reward, stats } = result

  return (
    <div className="min-h-screen bg-[#2C3E50] flex items-center justify-center p-4">
      <motion.div
        className="max-w-2xl w-full"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* 勝敗タイトル */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1
            className={`text-6xl font-bold mb-4 ${
              isVictory ? 'text-[#27AE60]' : 'text-[#E74C3C]'
            }`}
          >
            {isVictory ? 'VICTORY' : 'DEFEAT'}
          </h1>
          <p className="text-white text-xl">
            {isVictory ? '任務完了！' : '任務失敗...'}
          </p>
        </motion.div>

        {/* 報酬（勝利時のみ） */}
        {isVictory && (
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <h2 className="text-white font-bold text-2xl mb-4">獲得報酬</h2>

              <div className="space-y-3">
                {/* 賞金 */}
                <div className="flex items-center justify-between bg-[#2C3E50] p-4 rounded-lg">
                  <span className="text-[#95A5A6] font-semibold">賞金</span>
                  <span className="text-[#F39C12] font-bold text-xl">
                    ${reward.money}
                  </span>
                </div>

                {/* 経験値 */}
                <div className="flex items-center justify-between bg-[#2C3E50] p-4 rounded-lg">
                  <span className="text-[#95A5A6] font-semibold">経験値</span>
                  <span className="text-[#3498DB] font-bold text-xl">
                    {reward.experience} EXP
                  </span>
                </div>

                {/* ボーナス */}
                {reward.bonus && reward.bonus.length > 0 && (
                  <div className="bg-[#2C3E50] p-4 rounded-lg">
                    <h3 className="text-white font-bold mb-2">ボーナス</h3>
                    <div className="space-y-2">
                      {reward.bonus.map((bonus, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <span className="text-[#95A5A6] text-sm">
                            {bonus.name}
                          </span>
                          <span className="text-[#27AE60] font-bold">
                            +${bonus.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {/* 戦闘統計 */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <h2 className="text-white font-bold text-2xl mb-4">戦闘統計</h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[#95A5A6]">経過ターン</span>
                <span className="text-white font-bold">
                  {stats.turnsElapsed}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#95A5A6]">与えたダメージ</span>
                <span className="text-[#3498DB] font-bold">
                  {stats.damageDealt}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#95A5A6]">受けたダメージ</span>
                <span className="text-[#E74C3C] font-bold">
                  {stats.damageTaken}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#95A5A6]">失った部隊</span>
                <span className="text-white font-bold">{stats.unitsLost}</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* アクションボタン */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          {/* 勝利時は次へ、敗北時は再挑戦 */}
          {isVictory ? (
            <Button onClick={onContinue} variant="primary" size="lg" className="w-full">
              次へ進む
            </Button>
          ) : (
            onRetry && (
              <Button onClick={onRetry} variant="primary" size="lg" className="w-full">
                再挑戦
              </Button>
            )
          )}

          {/* タイトルに戻る */}
          {onBackToTitle && (
            <Button
              onClick={onBackToTitle}
              variant="secondary"
              size="lg"
              className="w-full"
            >
              タイトルに戻る
            </Button>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}
