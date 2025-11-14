import React, { useState } from 'react'
import { Cell } from './Cell'
import type { Field } from '@/lib/types/grid'
import type { Position } from '@/lib/types/position'

export interface FieldGridProps {
  field: Field
  isPlayerField: boolean
  isInteractive: boolean
  onCellClick?: (position: Position) => void
}

export const FieldGrid: React.FC<FieldGridProps> = ({
  field,
  isPlayerField,
  isInteractive,
  onCellClick,
}) => {
  const [hoveredCell, setHoveredCell] = useState<Position | null>(null)

  const handleCellClick = (position: Position) => {
    if (isInteractive && onCellClick) {
      onCellClick(position)
    }
  }

  const handleCellHover = (position: Position) => {
    if (isInteractive) {
      setHoveredCell(position)
    }
  }

  const handleCellHoverEnd = () => {
    setHoveredCell(null)
  }

  return (
    <div
      className="grid gap-1 bg-[#2C3E50] p-2 rounded-lg"
      style={{
        gridTemplateColumns: `repeat(${field.size.width}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${field.size.height}, minmax(0, 1fr))`,
      }}
    >
      {field.cells.map((row, y) =>
        row.map((cell, x) => (
          <div
            key={`${x}-${y}`}
            className="aspect-square"
            style={{
              minWidth: '30px',
              minHeight: '30px',
            }}
          >
            <Cell
              position={{ x, y }}
              state={cell.state}
              isRevealed={cell.state !== 'unexplored' || isPlayerField}
              isPlayerField={isPlayerField}
              isHovered={
                hoveredCell?.x === x && hoveredCell?.y === y
              }
              onClick={
                isInteractive && !isPlayerField
                  ? () => handleCellClick({ x, y })
                  : undefined
              }
              onHover={() => handleCellHover({ x, y })}
              onHoverEnd={handleCellHoverEnd}
            />
          </div>
        ))
      )}
    </div>
  )
}
