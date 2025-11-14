import { motion } from 'framer-motion'
import React from 'react'
import type { Position } from '@/lib/types/position'
import { CellState } from '@/lib/types/enums'

export interface CellProps {
  position: Position
  state: CellState
  isRevealed: boolean
  isPlayerField: boolean
  isHovered?: boolean
  onClick?: () => void
  onHover?: () => void
  onHoverEnd?: () => void
}

export const Cell: React.FC<CellProps> = ({
  position,
  state,
  isRevealed,
  isPlayerField,
  isHovered = false,
  onClick,
  onHover,
  onHoverEnd,
}) => {
  const getCellStyles = () => {
    // プレイヤーフィールドの場合
    if (isPlayerField) {
      if (state === CellState.HIT) {
        return 'bg-[#E74C3C] animate-pulse'
      }
      if (state === CellState.MISS) {
        return 'bg-[#3498DB]'
      }
      // 未探索（部隊がある場合は表示）
      return 'bg-[#34495E]'
    }

    // 敵フィールドの場合
    if (!isRevealed) {
      // 未探索
      return 'bg-[#2C3E50]'
    }

    if (state === CellState.HIT) {
      return 'bg-[#E74C3C] animate-pulse'
    }
    if (state === CellState.MISS) {
      return 'bg-[#3498DB]'
    }

    return 'bg-[#2C3E50]'
  }

  const isClickable = !isPlayerField && onClick

  return (
    <motion.div
      className={`
        ${getCellStyles()}
        ${isHovered && isClickable ? 'ring-2 ring-[#3498DB]' : ''}
        ${isClickable ? 'cursor-pointer' : 'cursor-default'}
        w-full h-full
        border border-[#5D6D7E]
        flex items-center justify-center
        transition-colors duration-150
      `}
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onHoverEnd}
      whileHover={isClickable ? { scale: 1.05 } : {}}
      whileTap={isClickable ? { scale: 0.95 } : {}}
      aria-label={`座標 ${position.x}, ${position.y}. 状態: ${state}`}
      role={isClickable ? 'button' : 'cell'}
      tabIndex={isClickable ? 0 : undefined}
    >
      {/* HIT時のマーク */}
      {state === CellState.HIT && (
        <span className="text-white font-bold text-xl">×</span>
      )}
      {/* MISS時のマーク */}
      {state === CellState.MISS && (
        <span className="text-white font-bold text-xl">•</span>
      )}
    </motion.div>
  )
}
