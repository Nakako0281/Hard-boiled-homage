import { motion } from 'framer-motion'
import React from 'react'

export interface StatusPanelProps {
  name: string
  hp: number
  maxHp: number
  sp: number
  maxSp: number
  unitsRemaining: number
  isCurrentTurn: boolean
  isPlayer?: boolean
}

export const StatusPanel: React.FC<StatusPanelProps> = ({
  name,
  hp,
  maxHp,
  sp,
  maxSp,
  unitsRemaining,
  isCurrentTurn,
  isPlayer = true,
}) => {
  const hpPercentage = (hp / maxHp) * 100
  const spPercentage = (sp / maxSp) * 100

  const getHpColor = () => {
    if (hpPercentage > 50) return 'bg-[#27AE60]'
    if (hpPercentage > 25) return 'bg-[#F39C12]'
    return 'bg-[#C0392B]'
  }

  return (
    <motion.div
      className={`
        p-4 rounded-lg
        ${isCurrentTurn ? 'bg-[#34495E] ring-2 ring-[#3498DB]' : 'bg-[#2C3E50]'}
        transition-all duration-300
      `}
      animate={isCurrentTurn ? { scale: [1, 1.02, 1] } : { scale: 1 }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      {/* 名前 */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-bold text-lg">{name}</h3>
        {isCurrentTurn && (
          <span className="text-[#3498DB] text-sm font-bold animate-pulse">
            ● ACTIVE
          </span>
        )}
      </div>

      {/* HPバー */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-white text-sm font-semibold">HP</span>
          <span className="text-white text-sm">
            {hp} / {maxHp}
          </span>
        </div>
        <div className="w-full h-3 bg-[#2C3E50] rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${getHpColor()}`}
            initial={{ width: 0 }}
            animate={{ width: `${hpPercentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* SPバー */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-white text-sm font-semibold">SP</span>
          <span className="text-white text-sm">
            {sp} / {maxSp}
          </span>
        </div>
        <div className="w-full h-3 bg-[#2C3E50] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#3498DB]"
            initial={{ width: 0 }}
            animate={{ width: `${spPercentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* 部隊残数 */}
      <div className="flex items-center justify-between">
        <span className="text-white text-sm font-semibold">部隊残数</span>
        <div className="flex items-center gap-2">
          <span className="text-[#3498DB] font-bold text-lg">
            {unitsRemaining}
          </span>
          <span className="text-[#5D6D7E] text-sm">ユニット</span>
        </div>
      </div>
    </motion.div>
  )
}
