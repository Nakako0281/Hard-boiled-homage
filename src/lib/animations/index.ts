/**
 * Framer Motion アニメーション定義
 */

import type { Variants, Transition } from 'framer-motion'

/**
 * イージング関数
 */
export const easing = {
  smooth: [0.43, 0.13, 0.23, 0.96],
  bounce: [0.68, -0.55, 0.265, 1.55],
  snappy: [0.6, -0.28, 0.735, 0.045],
  gentle: [0.25, 0.1, 0.25, 1],
} as const

/**
 * トランジション設定
 */
export const transition = {
  fast: { duration: 0.2, ease: easing.smooth },
  normal: { duration: 0.3, ease: easing.smooth },
  slow: { duration: 0.5, ease: easing.smooth },
  bounce: { duration: 0.5, ease: easing.bounce },
  spring: { type: 'spring', stiffness: 300, damping: 30 },
} as const

/**
 * フェードインアニメーション
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: transition.normal,
  },
}

/**
 * フェードアップアニメーション（下から上へ）
 */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transition.normal,
  },
}

/**
 * フェードダウンアニメーション（上から下へ）
 */
export const fadeDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transition.normal,
  },
}

/**
 * スケールアニメーション
 */
export const scale: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: transition.spring,
  },
  exit: {
    scale: 0.8,
    opacity: 0,
    transition: transition.fast,
  },
}

/**
 * スライドインアニメーション（左から）
 */
export const slideInLeft: Variants = {
  hidden: { x: -100, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: transition.normal,
  },
}

/**
 * スライドインアニメーション（右から）
 */
export const slideInRight: Variants = {
  hidden: { x: 100, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: transition.normal,
  },
}

/**
 * 攻撃エフェクトアニメーション
 */
export const attackEffect: Variants = {
  idle: { scale: 1, opacity: 0 },
  attacking: {
    scale: [1, 1.5, 1.8],
    opacity: [1, 0.8, 0],
    transition: { duration: 0.6, times: [0, 0.5, 1] },
  },
}

/**
 * ダメージ表示アニメーション
 */
export const damageNumber: Variants = {
  hidden: { y: 0, opacity: 0, scale: 0.5 },
  visible: {
    y: -50,
    opacity: [0, 1, 1, 0],
    scale: [0.5, 1.2, 1, 1],
    transition: { duration: 1.5, times: [0, 0.2, 0.8, 1] },
  },
}

/**
 * ユニット破壊アニメーション
 */
export const destroyEffect: Variants = {
  idle: { scale: 1, opacity: 1 },
  destroyed: {
    scale: [1, 1.2, 0],
    opacity: [1, 0.5, 0],
    rotate: [0, 10, -10, 0],
    transition: { duration: 0.8 },
  },
}

/**
 * パルスアニメーション（繰り返し）
 */
export const pulse: Transition = {
  scale: [1, 1.05, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: easing.gentle,
  },
}

/**
 * グローアニメーション（光る効果）
 */
export const glow: Transition = {
  boxShadow: [
    '0 0 0px rgba(52, 152, 219, 0)',
    '0 0 20px rgba(52, 152, 219, 0.8)',
    '0 0 0px rgba(52, 152, 219, 0)',
  ],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: easing.gentle,
  },
}

/**
 * シェイクアニメーション（揺れる効果）
 */
export const shake: Transition = {
  x: [0, -10, 10, -10, 10, 0],
  transition: {
    duration: 0.5,
    ease: easing.snappy,
  },
}

/**
 * リストアイテムのスタッガーアニメーション
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transition.normal,
  },
}

/**
 * モーダル用アニメーション
 */
export const modalBackdrop: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: transition.fast,
  },
  exit: {
    opacity: 0,
    transition: transition.fast,
  },
}

export const modalContent: Variants = {
  hidden: { scale: 0.9, opacity: 0, y: -50 },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: transition.spring,
  },
  exit: {
    scale: 0.9,
    opacity: 0,
    y: -50,
    transition: transition.fast,
  },
}

/**
 * ページ遷移用アニメーション
 */
export const pageTransition: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: transition.normal,
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: transition.fast,
  },
}
