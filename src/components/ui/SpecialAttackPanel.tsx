import { motion, AnimatePresence } from 'framer-motion'
import React from 'react'

export interface SpecialAttack {
  unitId: string
  name: string
  spCost: number
  canUse: boolean
  description?: string
}

export interface SpecialAttackPanelProps {
  isOpen: boolean
  availableAttacks: SpecialAttack[]
  currentSp: number
  onSelectAttack: (unitId: string) => void
  onClose: () => void
}

export const SpecialAttackPanel: React.FC<SpecialAttackPanelProps> = ({
  isOpen,
  availableAttacks,
  currentSp,
  onSelectAttack,
  onClose,
}) => {
  const handleSelectAttack = (attack: SpecialAttack) => {
    if (attack.canUse) {
      onSelectAttack(attack.unitId)
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* オーバーレイ */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* パネル */}
          <motion.div
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 bg-[#34495E] rounded-xl p-6 shadow-2xl z-50 max-w-md mx-auto"
            initial={{ scale: 0.9, opacity: 0, y: '-50%' }}
            animate={{ scale: 1, opacity: 1, y: '-50%' }}
            exit={{ scale: 0.9, opacity: 0, y: '-50%' }}
            transition={{ type: 'spring', duration: 0.3 }}
          >
            {/* ヘッダー */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-xl">特殊攻撃選択</h3>
              <button
                onClick={onClose}
                className="text-[#95A5A6] hover:text-white transition-colors"
                aria-label="閉じる"
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* 現在のSP */}
            <div className="mb-4 px-4 py-2 bg-[#2C3E50] rounded-lg">
              <span className="text-[#95A5A6] text-sm">現在のSP: </span>
              <span className="text-[#3498DB] font-bold text-lg">{currentSp}</span>
            </div>

            {/* 特殊攻撃一覧 */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {availableAttacks.length === 0 ? (
                <div className="text-center py-8 text-[#95A5A6]">
                  使用可能な特殊攻撃がありません
                </div>
              ) : (
                availableAttacks.map((attack) => (
                  <motion.button
                    key={attack.unitId}
                    onClick={() => handleSelectAttack(attack)}
                    disabled={!attack.canUse}
                    className={`
                      w-full p-4 rounded-lg text-left
                      transition-all duration-200
                      ${
                        attack.canUse
                          ? 'bg-[#2C3E50] hover:bg-[#3498DB] cursor-pointer'
                          : 'bg-[#2C3E50] opacity-50 cursor-not-allowed'
                      }
                    `}
                    whileHover={attack.canUse ? { scale: 1.02 } : {}}
                    whileTap={attack.canUse ? { scale: 0.98 } : {}}
                  >
                    {/* 攻撃名とSPコスト */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-bold text-lg">
                        {attack.name}
                      </span>
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-bold ${
                          attack.canUse
                            ? 'bg-[#3498DB] text-white'
                            : 'bg-[#5D6D7E] text-[#95A5A6]'
                        }`}
                      >
                        SP {attack.spCost}
                      </div>
                    </div>

                    {/* 説明 */}
                    {attack.description && (
                      <p className="text-[#95A5A6] text-sm">
                        {attack.description}
                      </p>
                    )}

                    {/* SP不足の警告 */}
                    {!attack.canUse && attack.spCost > currentSp && (
                      <p className="text-[#E74C3C] text-xs mt-2">
                        ⚠ SP不足（残り{currentSp}/{attack.spCost}必要）
                      </p>
                    )}
                  </motion.button>
                ))
              )}
            </div>

            {/* フッター */}
            <div className="mt-4 pt-4 border-t border-[#5D6D7E]">
              <button
                onClick={onClose}
                className="w-full py-2 bg-[#5D6D7E] hover:bg-[#7F8C8D] text-white rounded-lg transition-colors"
              >
                キャンセル
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
