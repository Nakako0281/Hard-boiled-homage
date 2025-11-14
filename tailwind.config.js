/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // ハードボイルドテーマのカラーパレット
      colors: {
        'noir-dark': '#1A1A1D',
        'noir-gray': '#2C3E50',
        'noir-light': '#34495E',
        'noir-accent': '#5D6D7E',
        'detective-blue': '#2980B9',
        'detective-light': '#3498DB',
        'danger-red': '#C0392B',
        'danger-light': '#E74C3C',
        'success-green': '#27AE60',
        'warning-orange': '#F39C12',
        'text-muted': '#95A5A6',
        'text-primary': '#ECF0F1',
        noir: {
          darkest: '#0a0a0a',
          darker: '#1a1a1a',
          dark: '#2a2a2a',
          DEFAULT: '#3a3a3a',
          light: '#4a4a4a',
        },
        detective: {
          gold: '#d4af37',
          amber: '#ffbf00',
          crimson: '#990000',
        },
      },
      // タイポグラフィ
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
        detective: ['"Courier New"', 'monospace'],
      },
      // スペーシング
      spacing: {
        18: '4.5rem',
        88: '22rem',
        128: '32rem',
      },
      // ブレークポイント
      screens: {
        xs: '375px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
      // アニメーション
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'fade-up': 'fadeUp 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-in-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        glow: 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 0px rgba(52, 152, 219, 0)' },
          '50%': { boxShadow: '0 0 20px rgba(52, 152, 219, 0.8)' },
        },
      },
      // ボックスシャドウ
      boxShadow: {
        noir: '0 10px 30px rgba(0, 0, 0, 0.5)',
        detective: '0 4px 12px rgba(41, 128, 185, 0.3)',
        'glow-blue': '0 0 20px rgba(52, 152, 219, 0.6)',
        'glow-red': '0 0 20px rgba(231, 76, 60, 0.6)',
      },
      // ボーダー
      borderRadius: {
        noir: '0.75rem',
      },
    },
  },
  plugins: [],
}
