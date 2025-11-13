import { test, expect } from '@playwright/test'

test('homepage has title', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Hard-Boiled Homage/)
})

test('homepage shows game title', async ({ page }) => {
  await page.goto('/')
  const title = page.getByRole('heading', { name: /Hard-Boiled Homage/i })
  await expect(title).toBeVisible()
})
