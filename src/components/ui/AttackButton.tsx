import { motion } from 'framer-motion'
import React from 'react'

export interface AttackButtonProps {
  onClick: () => void
  disabled?: boolean
  isActive?: boolean
}

export const AttackButton: React.FC<AttackButtonProps> = ({
  onClick,
  disabled = false,
  isActive = false,
}) => {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative px-6 py-3 rounded-lg font-bold text-lg
        flex items-center justify-center gap-2
        transition-all duration-200
        ${
          disabled
            ? 'bg-[#5D6D7E] text-[#95A5A6] cursor-not-allowed'
            : isActive
            ? 'bg-[#E74C3C] text-white ring-2 ring-[#E74C3C] shadow-lg'
            : 'bg-[#C0392B] text-white hover:bg-[#E74C3C]'
        }
      `}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      aria-label="通常攻撃"
      aria-disabled={disabled}
    >
      {/* アイコン */}
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>

      {/* テキスト */}
      <span>攻撃</span>

      {/* アクティブ時のパルスエフェクト */}
      {isActive && !disabled && (
        <motion.div
          className="absolute inset-0 rounded-lg bg-[#E74C3C]"
          animate={{
            opacity: [0.5, 0, 0.5],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </motion.button>
  )
}
