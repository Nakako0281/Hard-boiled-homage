import { motion } from 'framer-motion'
import React from 'react'

export interface ButtonProps {
  children: React.ReactNode
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
  type?: 'button' | 'submit' | 'reset'
  ariaLabel?: string
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  size = 'md',
  className = '',
  type = 'button',
  ariaLabel,
}) => {
  const variantStyles = {
    primary: `
      bg-[#2980B9] hover:bg-[#3498DB] active:bg-[#1A5276]
      text-white
      disabled:bg-[#7F8C8D]
    `,
    secondary: `
      bg-transparent border-2 border-[#2980B9]
      text-[#2980B9] hover:bg-[#2980B9] hover:text-white
      disabled:border-[#7F8C8D] disabled:text-[#7F8C8D]
    `,
    danger: `
      bg-[#C0392B] hover:bg-[#E74C3C] active:bg-[#A93226]
      text-white
      disabled:bg-[#7F8C8D]
    `,
  }

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      className={`
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        font-semibold rounded-lg
        transition-all duration-200
        disabled:cursor-not-allowed
        ${!disabled ? 'hover:shadow-lg hover:-translate-y-0.5' : ''}
        ${className}
      `}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
    >
      {children}
    </motion.button>
  )
}
