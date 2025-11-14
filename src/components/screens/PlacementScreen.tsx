import { motion } from 'framer-motion'
import React, { useState } from 'react'
import { Button } from '@/components/common/Button'
import type { Position } from '@/lib/types/position'
import type { Field } from '@/lib/types/grid'

export interface PlacementUnit {
  id: string
  name: string
  placed: boolean
}

export interface PlacementScreenProps {
  field: Field
  availableUnits: PlacementUnit[]
  onPlaceUnit: (unitId: string, position: Position) => boolean
  onStartBattle: () => void
  onBack?: () => void
}

export const PlacementScreen: React.FC<PlacementScreenProps> = ({
  field,
  availableUnits,
  onPlaceUnit,
  onStartBattle,
  onBack,
}) => {
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null)

  const placedUnitsCount = availableUnits.filter((u) => u.placed).length
  const canStartBattle = placedUnitsCount > 0

  const handleCellClick = (position: Position) => {
    if (selectedUnitId) {
      const success = onPlaceUnit(selectedUnitId, position)
      if (success) {
        setSelectedUnitId(null)
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#2C3E50] p-6">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-white font-bold text-3xl mb-2">部隊配置</h1>
          <p className="text-[#95A5A6]">
            配置済み: {placedUnitsCount} / {availableUnits.length}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* フィールド */}
          <div className="lg:col-span-2">
            <motion.div
              className="bg-[#34495E] rounded-xl p-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-white font-bold text-xl mb-4">
                配置フィールド
              </h3>

              {/* グリッド */}
              <div
                className="grid gap-1 bg-[#2C3E50] p-2 rounded-lg"
                style={{
                  gridTemplateColumns: `repeat(${field.size.width}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${field.size.height}, minmax(0, 1fr))`,
                }}
              >
                {field.cells.map((row, y) =>
                  row.map((cell, x) => (
                    <button
                      key={`${x}-${y}`}
                      onClick={() => handleCellClick({ x, y })}
                      className={`
                        aspect-square border border-[#5D6D7E]
                        rounded transition-all duration-150
                        ${
                          cell.unitId
                            ? 'bg-[#3498DB] hover:bg-[#2980B9]'
                            : selectedUnitId
                            ? 'bg-[#27AE60] hover:bg-[#229954] cursor-pointer'
                            : 'bg-[#34495E] hover:bg-[#2C3E50] cursor-not-allowed'
                        }
                      `}
                      aria-label={`座標 ${x}, ${y}`}
                    />
                  ))
                )}
              </div>
            </motion.div>
          </div>

          {/* ユニット一覧 */}
          <div className="lg:col-span-1">
            <motion.div
              className="bg-[#34495E] rounded-xl p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-white font-bold text-xl mb-4">
                所持ユニット
              </h3>

              <div className="space-y-2 mb-6">
                {availableUnits.map((unit) => (
                  <button
                    key={unit.id}
                    onClick={() =>
                      !unit.placed && setSelectedUnitId(unit.id)
                    }
                    disabled={unit.placed}
                    className={`
                      w-full p-3 rounded-lg text-left transition-all
                      ${
                        selectedUnitId === unit.id
                          ? 'bg-[#3498DB] text-white ring-2 ring-[#3498DB]'
                          : unit.placed
                          ? 'bg-[#2C3E50] text-[#5D6D7E] cursor-not-allowed'
                          : 'bg-[#2C3E50] text-white hover:bg-[#34495E] cursor-pointer'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold">{unit.name}</span>
                      {unit.placed && (
                        <span className="text-xs bg-[#27AE60] px-2 py-1 rounded">
                          配置済み
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* 操作説明 */}
              <div className="bg-[#2C3E50] p-4 rounded-lg mb-4">
                <p className="text-[#95A5A6] text-sm">
                  {selectedUnitId
                    ? 'フィールドをクリックして配置'
                    : 'ユニットを選択してください'}
                </p>
              </div>

              {/* ボタン */}
              <div className="space-y-2">
                {onBack && (
                  <Button
                    onClick={onBack}
                    variant="secondary"
                    className="w-full"
                  >
                    戻る
                  </Button>
                )}
                <Button
                  onClick={onStartBattle}
                  variant="primary"
                  disabled={!canStartBattle}
                  className="w-full"
                >
                  戦闘開始
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
