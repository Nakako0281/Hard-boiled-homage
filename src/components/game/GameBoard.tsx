import React from 'react'
import { FieldGrid } from './FieldGrid'
import type { Field } from '@/lib/types/grid'
import type { Position } from '@/lib/types/position'
import { Turn } from '@/lib/types/enums'

export interface GameBoardProps {
  playerField: Field
  enemyField: Field
  currentTurn: Turn
  onAttack: (position: Position) => void
}

export const GameBoard: React.FC<GameBoardProps> = ({
  playerField,
  enemyField,
  currentTurn,
  onAttack,
}) => {
  const isPlayerTurn = currentTurn === Turn.PLAYER

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-center justify-center w-full">
      {/* プレイヤーフィールド */}
      <div className="flex flex-col gap-2">
        <h3 className="text-white text-xl font-bold text-center">
          プレイヤーフィールド
        </h3>
        <FieldGrid
          field={playerField}
          isPlayerField={true}
          isInteractive={false}
        />
      </div>

      {/* 敵フィールド */}
      <div className="flex flex-col gap-2">
        <h3 className="text-white text-xl font-bold text-center">
          敵フィールド
        </h3>
        <FieldGrid
          field={enemyField}
          isPlayerField={false}
          isInteractive={isPlayerTurn}
          onCellClick={onAttack}
        />
      </div>
    </div>
  )
}
