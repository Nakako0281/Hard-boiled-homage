import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { GridOverlay } from '@/components/game/GridOverlay'

describe('GridOverlay', () => {
  const mockHighlightedCells = [
    { x: 0, y: 0 },
    { x: 1, y: 1 },
    { x: 2, y: 2 },
  ]

  const mockGridSize = { width: 5, height: 5 }
  const mockCellSize = 50

  it('GridOverlayがレンダリングされる', () => {
    const { container } = render(
      <GridOverlay
        highlightedCells={mockHighlightedCells}
        gridSize={mockGridSize}
        cellSize={mockCellSize}
      />
    )

    const overlay = container.querySelector('.absolute')
    expect(overlay).toBeInTheDocument()
  })

  it('ハイライトされたセルが正しい数表示される', () => {
    const { container } = render(
      <GridOverlay
        highlightedCells={mockHighlightedCells}
        gridSize={mockGridSize}
        cellSize={mockCellSize}
      />
    )

    const highlightedElements = container.querySelectorAll('[class*="bg-"]')
    expect(highlightedElements.length).toBeGreaterThanOrEqual(3)
  })

  it('overlayType=attackの時に赤いオーバーレイが適用される', () => {
    const { container } = render(
      <GridOverlay
        highlightedCells={mockHighlightedCells}
        gridSize={mockGridSize}
        cellSize={mockCellSize}
        overlayType="attack"
      />
    )

    const highlightedElement = container.querySelector('[class*="bg-red"]')
    expect(highlightedElement).toBeInTheDocument()
  })

  it('overlayType=placementの時に緑のオーバーレイが適用される', () => {
    const { container } = render(
      <GridOverlay
        highlightedCells={mockHighlightedCells}
        gridSize={mockGridSize}
        cellSize={mockCellSize}
        overlayType="placement"
      />
    )

    const highlightedElement = container.querySelector('[class*="bg-green"]')
    expect(highlightedElement).toBeInTheDocument()
  })

  it('overlayType=previewの時に青いオーバーレイが適用される', () => {
    const { container } = render(
      <GridOverlay
        highlightedCells={mockHighlightedCells}
        gridSize={mockGridSize}
        cellSize={mockCellSize}
        overlayType="preview"
      />
    )

    const highlightedElement = container.querySelector('[class*="bg-blue"]')
    expect(highlightedElement).toBeInTheDocument()
  })

  it('空のハイライトセルでもレンダリングされる', () => {
    const { container } = render(
      <GridOverlay
        highlightedCells={[]}
        gridSize={mockGridSize}
        cellSize={mockCellSize}
      />
    )

    const overlay = container.querySelector('.absolute')
    expect(overlay).toBeInTheDocument()
  })
})
