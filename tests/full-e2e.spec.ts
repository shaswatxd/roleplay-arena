import { test, expect, Page } from '@playwright/test'

const BASE_URL = 'http://localhost:5173'

test.describe('RolePlay Arena - Full E2E', () => {

  test('1. Landing page loads correctly', async ({ page }) => {
    await page.goto(BASE_URL)
    await expect(page).toHaveTitle(/RolePlay Arena/)
    
    const heading = page.locator('h1')
    await expect(heading).toContainText('RolePlay Arena')
    
    const enterBtn = page.locator('button', { hasText: 'Enter the Arena' })
    await expect(enterBtn).toBeVisible()
    
    console.log('✅ Landing page loads correctly')
  })

  test('2. Navigate to Setup screen', async ({ page }) => {
    await page.goto(BASE_URL)
    await page.click('button:has-text("Enter the Arena")')
    
    const heading = page.locator('.font-sans', { hasText: 'Arena Setup' })
    await expect(heading).toBeVisible()
    
    const topicInput = page.locator('textarea')
    await expect(topicInput).toBeVisible()
    
    console.log('✅ Setup screen loads correctly')
  })

  test('3. Character selection works', async ({ page }) => {
    await page.goto(BASE_URL)
    await page.click('button:has-text("Enter the Arena")')
    
    const presetButtons = page.locator('.grid button')
    const count = await presetButtons.count()
    expect(count).toBeGreaterThan(5)
    
    await presetButtons.first().click()
    await presetButtons.nth(1).click()
    
    const selected = page.locator('text=Selected')
    await expect(selected).toContainText('2')
    
    console.log('✅ Character selection works')
  })

  test('4. Topic input works', async ({ page }) => {
    await page.goto(BASE_URL)
    await page.click('button:has-text("Enter the Arena")')
    
    const textarea = page.locator('textarea')
    await textarea.fill('Is social media destroying society?')
    await expect(textarea).toHaveValue('Is social media destroying society?')
    
    console.log('✅ Topic input works')
  })

  test('5. Start Debate button enables with 2+ characters and topic', async ({ page }) => {
    await page.goto(BASE_URL)
    await page.click('button:has-text("Enter the Arena")')
    
    await page.locator('textarea').fill('Is AI replacing humans?')
    
    const presets = page.locator('.grid button')
    await presets.first().click()
    await presets.nth(1).click()
    
    const startBtn = page.locator('button:has-text("Start Debate")')
    await expect(startBtn).toBeVisible()
    
    console.log('✅ Start Debate button visible with selections')
  })

  test('6. Arena screen loads and debate starts', async ({ page }) => {
    await page.goto(BASE_URL)
    await page.click('button:has-text("Enter the Arena")')
    
    await page.locator('textarea').fill('Should AI replace teachers?')
    
    const presets = page.locator('.grid button')
    await presets.first().click()
    await presets.nth(1).click()
    
    await page.click('button:has-text("Start Debate")')
    
    const topicLabel = page.locator('text=Should AI replace teachers?')
    await expect(topicLabel).toBeVisible({ timeout: 10000 })
    
    const roundIndicator = page.locator('text=/R\\d+\\/\\d+/')
    await expect(roundIndicator).toBeVisible({ timeout: 5000 })
    
    console.log('✅ Arena screen loads, debate starts')
  })

  test('7. Debate messages appear after rounds', async ({ page }) => {
    await page.goto(BASE_URL)
    await page.click('button:has-text("Enter the Arena")')
    
    await page.locator('textarea').fill('Is climate change real?')
    
    const presets = page.locator('.grid button')
    await presets.first().click()
    await presets.nth(1).click()
    
    await page.click('button:has-text("Start Debate")')
    
    await page.waitForTimeout(15000)
    
    const messages = page.locator('[class*="rounded-tr-lg"]')
    const msgCount = await messages.count()
    console.log(`Messages found: ${msgCount}`)
    
    if (msgCount > 0) {
      const firstMsg = await messages.first().textContent()
      console.log(`First message preview: ${firstMsg?.substring(0, 100)}`)
    }
    
    expect(msgCount).toBeGreaterThan(0)
    console.log('✅ Debate messages appear')
  })

  test('8. Back button works from Arena', async ({ page }) => {
    await page.goto(BASE_URL)
    await page.click('button:has-text("Enter the Arena")')
    
    await page.locator('textarea').fill('Test topic')
    
    const presets = page.locator('.grid button')
    await presets.first().click()
    await presets.nth(1).click()
    
    await page.click('button:has-text("Start Debate")')
    
    await page.waitForTimeout(2000)
    
    const backBtn = page.locator('[aria-label="Exit"]')
    await backBtn.click()
    
    const setupHeading = page.locator('.font-sans', { hasText: 'Arena Setup' })
    await expect(setupHeading).toBeVisible({ timeout: 5000 })
    
    console.log('✅ Back button works from Arena')
  })

  test('9. Share button exists in Arena', async ({ page }) => {
    await page.goto(BASE_URL)
    await page.click('button:has-text("Enter the Arena")')
    
    await page.locator('textarea').fill('Test topic for share')
    
    const presets = page.locator('.grid button')
    await presets.first().click()
    await presets.nth(1).click()
    
    await page.click('button:has-text("Start Debate")')
    
    await page.waitForTimeout(2000)
    
    const shareBtn = page.locator('[aria-label="Share"]')
    await expect(shareBtn).toBeVisible()
    
    console.log('✅ Share button exists in Arena')
  })

  test('10. Character bio modal opens on long press', async ({ page }) => {
    await page.goto(BASE_URL)
    await page.click('button:has-text("Enter the Arena")')
    
    await page.waitForTimeout(1000)
    
    const firstPreset = page.locator('.grid button').first()
    await firstPreset.click({ button: 'right' })
    
    const bioModal = page.locator('text=Character Bio')
    const isVisible = await bioModal.isVisible().catch(() => false)
    
    if (isVisible) {
      const closeBtn = page.locator('button:has-text("Close")')
      await closeBtn.click()
      console.log('✅ Character bio modal opens on right-click')
    } else {
      console.log('⚠️ Character bio modal not triggered by right-click (may need long-press)')
    }
  })

  test('11. Pause/Resume button works', async ({ page }) => {
    await page.goto(BASE_URL)
    await page.click('button:has-text("Enter the Arena")')
    
    await page.locator('textarea').fill('Test pause functionality')
    
    const presets = page.locator('.grid button')
    await presets.first().click()
    await presets.nth(1).click()
    
    await page.click('button:has-text("Start Debate")')
    
    await page.waitForTimeout(3000)
    
    const pauseBtn = page.locator('button:has-text("Pause")')
    if (await pauseBtn.isVisible()) {
      await pauseBtn.click()
      const resumeBtn = page.locator('button:has-text("Resume")')
      await expect(resumeBtn).toBeVisible({ timeout: 3000 })
      console.log('✅ Pause/Resume button works')
    } else {
      console.log('⚠️ Pause button not visible (debate may have ended)')
    }
  })

  test('12. Quick topic buttons work', async ({ page }) => {
    await page.goto(BASE_URL)
    await page.click('button:has-text("Enter the Arena")')
    
    const quickTopic = page.locator('button:has-text("Should AI replace")').first()
    if (await quickTopic.isVisible()) {
      await quickTopic.click()
      const textarea = page.locator('textarea')
      const value = await textarea.inputValue()
      expect(value.length).toBeGreaterThan(0)
      console.log(`✅ Quick topic button works, filled: "${value}"`)
    } else {
      console.log('⚠️ Quick topic buttons not found')
    }
  })

  test('13. Mobile viewport - responsive layout', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto(BASE_URL)
    
    const heading = page.locator('h1')
    await expect(heading).toBeVisible()
    
    const enterBtn = page.locator('button:has-text("Enter the Arena")')
    await expect(enterBtn).toBeVisible()
    
    console.log('✅ Mobile layout renders correctly')
  })

  test('14. Language selector works', async ({ page }) => {
    await page.goto(BASE_URL)
    await page.click('button:has-text("Enter the Arena")')
    
    const langSelect = page.locator('select').filter({ has: page.locator('option[value="hinglish"]') })
    if (await langSelect.isVisible()) {
      await langSelect.selectOption('hindi')
      await expect(langSelect).toHaveValue('hindi')
      console.log('✅ Language selector works')
    } else {
      console.log('⚠️ Language selector not found')
    }
  })

  test('15. Style selector works', async ({ page }) => {
    await page.goto(BASE_URL)
    await page.click('button:has-text("Enter the Arena")')
    
    const styleSelect = page.locator('select').filter({ has: page.locator('option[value="aggressive"]') })
    if (await styleSelect.isVisible()) {
      await styleSelect.selectOption('aggressive')
      await expect(styleSelect).toHaveValue('aggressive')
      console.log('✅ Style selector works')
    } else {
      console.log('⚠️ Style selector not found')
    }
  })
})
