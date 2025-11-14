import { motion } from 'framer-motion'
import React from 'react'

export interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  isHoverable?: boolean
  isSelected?: boolean
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  isHoverable = false,
  isSelected = false,
}) => {
  return (
    <motion.div
      onClick={onClick}
      className={`
        bg-[#34495E] rounded-xl p-6 shadow-lg
        ${isHoverable ? 'cursor-pointer transition-shadow duration-300 hover:shadow-xl' : ''}
        ${isSelected ? 'ring-2 ring-[#3498DB]' : ''}
        ${className}
      `}
      whileHover={isHoverable ? { scale: 1.05 } : {}}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  )
}
