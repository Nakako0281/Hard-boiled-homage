import { motion } from 'framer-motion'
import React from 'react'
import { Turn } from '@/lib/types/enums'

export interface TurnIndicatorProps {
  currentTurn: Turn
  turnNumber?: number
}

export const TurnIndicator: React.FC<TurnIndicatorProps> = ({
  currentTurn,
  turnNumber = 1,
}) => {
  const isPlayerTurn = currentTurn === Turn.PLAYER

  return (
    <motion.div
      className="flex items-center justify-center gap-4 px-6 py-3 rounded-lg bg-[#34495E]"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* ターン数表示 */}
      <div className="text-white font-bold text-lg">
        TURN {turnNumber}
      </div>

      {/* 現在のターン表示 */}
      <motion.div
        className={`px-4 py-2 rounded-md font-bold ${
          isPlayerTurn
            ? 'bg-[#2980B9] text-white'
            : 'bg-[#C0392B] text-white'
        }`}
        animate={{
          scale: [1, 1.05, 1],
          boxShadow: [
            '0 0 0px rgba(0,0,0,0)',
            '0 0 15px rgba(41,128,185,0.5)',
            '0 0 0px rgba(0,0,0,0)',
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {isPlayerTurn ? 'あなたのターン' : '敵のターン'}
      </motion.div>

      {/* ターンインジケーター */}
      <div className="flex gap-2">
        <div
          className={`w-3 h-3 rounded-full ${
            isPlayerTurn ? 'bg-[#3498DB]' : 'bg-[#5D6D7E]'
          }`}
          aria-label="プレイヤーターン"
        />
        <div
          className={`w-3 h-3 rounded-full ${
            !isPlayerTurn ? 'bg-[#E74C3C]' : 'bg-[#5D6D7E]'
          }`}
          aria-label="敵ターン"
        />
      </div>
    </motion.div>
  )
}
