import { test, expect } from '@playwright/test'

test.describe('Hard-Boiled Homage E2E Tests', () => {
  test('homepage has title', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Hard-Boiled Homage/)
  })

  test('homepage shows game title', async ({ page }) => {
    await page.goto('/')
    const title = page.getByRole('heading', { name: /Hard-Boiled/i })
    await expect(title).toBeVisible()
  })

  test('new game button is visible', async ({ page }) => {
    await page.goto('/')
    const newGameButton = page.getByRole('button', { name: /新規ゲーム/i })
    await expect(newGameButton).toBeVisible()
  })

  test('clicking new game button opens character select', async ({ page }) => {
    await page.goto('/')
    const newGameButton = page.getByRole('button', { name: /新規ゲーム/i })
    await newGameButton.click()

    // キャラクター選択モーダルが表示される
    const characterSelectTitle = page.getByText(/キャラクター選択/i)
    await expect(characterSelectTitle).toBeVisible({ timeout: 5000 })
  })

  test('character selection displays available characters', async ({ page }) => {
    await page.goto('/')
    const newGameButton = page.getByRole('button', { name: /新規ゲーム/i })
    await newGameButton.click()

    // キャラクターが表示される
    const jackCharacter = page.getByText(/ジャック刑事/i)
    const gapurinoCharacter = page.getByText(/ガプリーノ警部/i)

    await expect(jackCharacter).toBeVisible({ timeout: 5000 })
    await expect(gapurinoCharacter).toBeVisible({ timeout: 5000 })
  })

  test('selecting character and clicking confirm button triggers alert', async ({ page }) => {
    await page.goto('/')

    // アラートダイアログのハンドラを設定
    let alertMessage = ''
    page.on('dialog', async (dialog) => {
      alertMessage = dialog.message()
      await dialog.accept()
    })

    // 新規ゲームボタンをクリック
    const newGameButton = page.getByRole('button', { name: /新規ゲーム/i })
    await newGameButton.click()

    // キャラクター選択モーダルが表示されるまで待つ
    await page.waitForSelector('text=/キャラクター選択/i', { timeout: 5000 })

    // ジャック刑事を選択
    const jackCard = page.locator('text=/ジャック刑事/i').first()
    await jackCard.click()

    // 決定ボタンをクリック
    const confirmButton = page.getByRole('button', { name: /決定/i })
    await confirmButton.click()

    // アラートが表示されたか確認（少し待つ）
    await page.waitForTimeout(1000)

    // アラートメッセージが正しいか確認
    expect(alertMessage).toContain('キャラクター')
    expect(alertMessage).toContain('jack')
  })
})
