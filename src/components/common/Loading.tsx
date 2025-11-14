import { motion } from 'framer-motion'
import React from 'react'

export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  message?: string
  fullScreen?: boolean
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  message,
  fullScreen = false,
}) => {
  const sizeStyles = {
    sm: 'w-8 h-8 border-2',
    md: 'w-12 h-12 border-4',
    lg: 'w-16 h-16 border-4',
  }

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      <motion.div
        className={`
          ${sizeStyles[size]}
          border-[#3498DB]
          border-t-transparent
          rounded-full
        `}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      {message && <p className="text-white text-lg">{message}</p>}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-[#2C3E50] bg-opacity-95 z-50 flex items-center justify-center">
        {spinner}
      </div>
    )
  }

  return spinner
}
