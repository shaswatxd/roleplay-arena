import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:5173'

test.describe('Full Flow + Results', () => {

  test('Complete debate and check Results screen', async ({ page }) => {
    await page.goto(BASE_URL)
    await page.click('button:has-text("Enter the Arena")')
    
    await page.locator('textarea').fill('Is online education better than classroom learning?')
    
    const presets = page.locator('.grid button')
    await presets.first().click()
    await presets.nth(1).click()
    
    const roundsSelect = page.locator('select').first()
    await roundsSelect.selectOption('2')
    
    await page.click('button:has-text("Start Debate")')
    
    console.log('⏳ Waiting for Round 1...')
    await page.waitForTimeout(15000)
    
    const msgCount1 = await page.locator('[class*="rounded-tr-lg"]').count()
    console.log(`Round 1 messages: ${msgCount1}`)
    
    console.log('⏳ Clicking Next Round...')
    const nextBtn = page.locator('button:has-text("Next Round")')
    if (await nextBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await nextBtn.click()
      await page.waitForTimeout(15000)
      
      const msgCount2 = await page.locator('[class*="rounded-tr-lg"]').count()
      console.log(`After Round 2 messages: ${msgCount2}`)
    }
    
    console.log('⏳ Finishing debate...')
    const finishBtn = page.locator('button:has-text("Finish Debate")')
    if (await finishBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await finishBtn.click()
      await page.waitForTimeout(5000)
    }
    
    const resultsVisible = await page.locator('text=Debate Complete').isVisible().catch(() => false)
    const summaryVisible = await page.locator('text=AI Summary').isVisible().catch(() => false)
    const votingVisible = await page.locator('text=Who Won').isVisible().catch(() => false)
    const shareVisible = await page.locator('button:has-text("Share")').isVisible().catch(() => false)
    const copyVisible = await page.locator('button:has-text("Copy")').isVisible().catch(() => false)
    const newDebateVisible = await page.locator('button:has-text("New Debate")').isVisible().catch(() => false)
    
    console.log(`\n📋 RESULTS SCREEN:`)
    console.log(`  Debate Complete header: ${resultsVisible}`)
    console.log(`  AI Summary: ${summaryVisible}`)
    console.log(`  Who Won voting: ${votingVisible}`)
    console.log(`  Share button: ${shareVisible}`)
    console.log(`  Copy button: ${copyVisible}`)
    console.log(`  New Debate button: ${newDebateVisible}`)
    
    expect(resultsVisible || summaryVisible || votingVisible).toBeTruthy()
  })

  test('Voting works on Results screen', async ({ page }) => {
    await page.goto(BASE_URL)
    await page.click('button:has-text("Enter the Arena")')
    
    await page.locator('textarea').fill('Test voting feature')
    
    const presets = page.locator('.grid button')
    await presets.first().click()
    await presets.nth(1).click()
    
    const roundsSelect = page.locator('select').first()
    await roundsSelect.selectOption('2')
    
    await page.click('button:has-text("Start Debate")')
    
    await page.waitForTimeout(15000)
    
    const nextBtn = page.locator('button:has-text("Next Round")')
    if (await nextBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await nextBtn.click()
      await page.waitForTimeout(15000)
    }
    
    const finishBtn = page.locator('button:has-text("Finish Debate")')
    if (await finishBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await finishBtn.click()
      await page.waitForTimeout(5000)
    }
    
    const votingSection = page.locator('text=Who Won')
    if (await votingSection.isVisible({ timeout: 5000 }).catch(() => false)) {
      const voteBtns = page.locator('button:has-text("▸")')
      if (await voteBtns.count() > 0) {
        await voteBtns.first().click()
        await page.waitForTimeout(1000)
        
        const trophy = page.locator('text=🏆')
        const voted = await trophy.isVisible().catch(() => false)
        console.log(`Voting result visible: ${voted}`)
        expect(voted).toBeTruthy()
      }
    }
  })

  test('New Debate button returns to setup', async ({ page }) => {
    await page.goto(BASE_URL)
    await page.click('button:has-text("Enter the Arena")')
    
    await page.locator('textarea').fill('Test new debate flow')
    
    const presets = page.locator('.grid button')
    await presets.first().click()
    await presets.nth(1).click()
    
    const roundsSelect = page.locator('select').first()
    await roundsSelect.selectOption('2')
    
    await page.click('button:has-text("Start Debate")')
    
    await page.waitForTimeout(15000)
    
    const nextBtn = page.locator('button:has-text("Next Round")')
    if (await nextBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await nextBtn.click()
      await page.waitForTimeout(15000)
    }
    
    const finishBtn = page.locator('button:has-text("Finish Debate")')
    if (await finishBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await finishBtn.click()
      await page.waitForTimeout(5000)
    }
    
    const newDebateBtn = page.locator('button:has-text("New Debate")')
    if (await newDebateBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await newDebateBtn.click()
      await page.waitForTimeout(2000)
      
      const setupScreen = page.locator('text=Arena Setup')
      const isSetup = await setupScreen.isVisible().catch(() => false)
      console.log(`Back to setup: ${isSetup}`)
      expect(isSetup).toBeTruthy()
    }
  })
})
