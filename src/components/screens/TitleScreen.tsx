import { motion } from 'framer-motion'
import React, { useState } from 'react'
import { Button } from '@/components/common/Button'
import { CharacterSelect } from './CharacterSelect'

export interface TitleScreenProps {
  onNewGame: (character: string) => void
  onContinue?: () => void
  hasSaveData?: boolean
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onNewGame,
  onContinue,
  hasSaveData = false,
}) => {
  const [showCharacterSelect, setShowCharacterSelect] = useState(false)

  const handleNewGame = () => {
    setShowCharacterSelect(true)
  }

  const handleCharacterSelect = (character: string) => {
    setShowCharacterSelect(false)
    onNewGame(character)
  }

  return (
    <div className="min-h-screen bg-[#2C3E50] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* タイトル */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl font-bold text-white mb-4">
            <span className="text-[#3498DB]">HARD</span>
            <span className="text-white">-</span>
            <span className="text-[#E74C3C]">BOILED</span>
          </h1>
          <p className="text-[#95A5A6] text-xl">ハードボイルド刑事風ゲーム</p>
        </motion.div>

        {/* メニューボタン */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {/* 新規ゲーム */}
          <Button
            onClick={handleNewGame}
            variant="primary"
            size="lg"
            className="w-full text-xl py-4"
          >
            新規ゲーム
          </Button>

          {/* コンティニュー */}
          {hasSaveData && onContinue && (
            <Button
              onClick={onContinue}
              variant="secondary"
              size="lg"
              className="w-full text-xl py-4"
            >
              コンティニュー
            </Button>
          )}
        </motion.div>

        {/* フッター */}
        <motion.div
          className="mt-12 text-center text-[#5D6D7E] text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <p>© 2025 Hard-Boiled Homage</p>
        </motion.div>
      </div>

      {/* キャラクター選択モーダル */}
      {showCharacterSelect && (
        <CharacterSelect
          isOpen={showCharacterSelect}
          onSelect={handleCharacterSelect}
          onClose={() => setShowCharacterSelect(false)}
        />
      )}
    </div>
  )
}
