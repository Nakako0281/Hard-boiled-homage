import { motion, AnimatePresence } from 'framer-motion'
import React from 'react'
import type { Position } from '@/lib/types/position'

export interface GridOverlayProps {
  highlightedCells: Position[]
  gridSize: { width: number; height: number }
  cellSize: number
  overlayType?: 'attack' | 'placement' | 'preview'
}

export const GridOverlay: React.FC<GridOverlayProps> = ({
  highlightedCells,
  gridSize,
  cellSize,
  overlayType = 'attack',
}) => {
  const getOverlayColor = () => {
    switch (overlayType) {
      case 'attack':
        return 'bg-red-500 bg-opacity-30'
      case 'placement':
        return 'bg-green-500 bg-opacity-30'
      case 'preview':
        return 'bg-blue-500 bg-opacity-30'
      default:
        return 'bg-gray-500 bg-opacity-30'
    }
  }

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gridSize.width}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${gridSize.height}, ${cellSize}px)`,
        gap: '4px',
      }}
    >
      <AnimatePresence>
        {highlightedCells.map((cell) => (
          <motion.div
            key={`overlay-${cell.x}-${cell.y}`}
            className={`${getOverlayColor()} rounded`}
            style={{
              gridColumn: cell.x + 1,
              gridRow: cell.y + 1,
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
