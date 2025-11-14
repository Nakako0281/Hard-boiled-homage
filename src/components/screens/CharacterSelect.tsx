import { motion, AnimatePresence } from 'framer-motion'
import React, { useState } from 'react'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'

export interface Character {
  id: string
  name: string
  description: string
  stats: {
    hp: number
    sp: number
    attack: number
    defense: number
    attackRange: number
  }
}

export interface CharacterSelectProps {
  isOpen: boolean
  onSelect: (characterId: string) => void
  onClose: () => void
}

const CHARACTERS: Character[] = [
  {
    id: 'jack',
    name: 'ジャック刑事',
    description:
      '歴戦のベテラン刑事。高い攻撃力と広い攻撃範囲を持つが、防御力はやや低い。',
    stats: {
      hp: 100,
      sp: 100,
      attack: 12,
      defense: 8,
      attackRange: 4,
    },
  },
  {
    id: 'gapurino',
    name: 'ガプリーノ警部',
    description:
      '冷静沈着な警部。バランスの取れたステータスで安定した戦いができる。',
    stats: {
      hp: 120,
      sp: 80,
      attack: 10,
      defense: 10,
      attackRange: 3,
    },
  },
]

export const CharacterSelect: React.FC<CharacterSelectProps> = ({
  isOpen,
  onSelect,
  onClose,
}) => {
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(
    null
  )

  const handleSelect = () => {
    if (selectedCharacter) {
      onSelect(selectedCharacter)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* オーバーレイ */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-75 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* モーダル */}
          <motion.div
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-4xl bg-[#34495E] rounded-xl p-6 shadow-2xl z-50 overflow-y-auto max-h-screen"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.3 }}
          >
            {/* ヘッダー */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-bold text-2xl">
                キャラクター選択
              </h2>
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

            {/* キャラクター一覧 */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {CHARACTERS.map((character) => (
                <Card
                  key={character.id}
                  isHoverable
                  isSelected={selectedCharacter === character.id}
                  onClick={() => setSelectedCharacter(character.id)}
                  className="cursor-pointer"
                >
                  <h3 className="text-white font-bold text-xl mb-2">
                    {character.name}
                  </h3>
                  <p className="text-[#95A5A6] text-sm mb-4">
                    {character.description}
                  </p>

                  {/* ステータス */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#95A5A6]">HP</span>
                      <span className="text-white font-bold">
                        {character.stats.hp}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#95A5A6]">SP</span>
                      <span className="text-white font-bold">
                        {character.stats.sp}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#95A5A6]">攻撃力</span>
                      <span className="text-white font-bold">
                        {character.stats.attack}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#95A5A6]">防御力</span>
                      <span className="text-white font-bold">
                        {character.stats.defense}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#95A5A6]">攻撃範囲</span>
                      <span className="text-white font-bold">
                        {character.stats.attackRange}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* フッター */}
            <div className="flex gap-4">
              <Button
                onClick={onClose}
                variant="secondary"
                className="flex-1"
              >
                キャンセル
              </Button>
              <Button
                onClick={handleSelect}
                variant="primary"
                disabled={!selectedCharacter}
                className="flex-1"
              >
                決定
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
