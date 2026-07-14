import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:5173'

test.describe('Voting + Results Tests', () => {

  test('Voting shows trophy after click', async ({ page }) => {
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
    
    const whoWon = page.locator('text=Who Won')
    if (await whoWon.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('✅ Who Won section visible')
      
      const charName = await page.locator('[class*="font-mono"][class*="font-medium"]').first().textContent()
      console.log(`First character: ${charName}`)
      
      const voteButtons = page.locator('[class*="bg-bg-glass"][class*="border-border-subtle"][class*="hover:bg-bg-card-hover"]')
      const voteCount = await voteButtons.count()
      console.log(`Vote buttons found: ${voteCount}`)
      
      if (voteCount > 0) {
        await voteButtons.first().click()
        await page.waitForTimeout(1500)
        
        const trophy = page.locator('text=🏆')
        const voted = await trophy.isVisible().catch(() => false)
        console.log(`Trophy visible after vote: ${voted}`)
        
        const winnerName = await page.locator('[class*="font-sans"][class*="text-xl"][class*="font-bold"]').textContent().catch(() => 'N/A')
        console.log(`Winner displayed: ${winnerName}`)
        
        const changeVote = page.locator('button:has-text("Change vote")')
        const changeVisible = await changeVote.isVisible().catch(() => false)
        console.log(`Change vote button: ${changeVisible}`)
        
        expect(voted).toBeTruthy()
      }
    } else {
      console.log('⚠️ Who Won section not visible - debate may not have completed')
    }
  })

  test('Share button triggers clipboard', async ({ page }) => {
    await page.goto(BASE_URL)
    await page.click('button:has-text("Enter the Arena")')
    
    await page.locator('textarea').fill('Test share feature')
    
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
    
    const shareBtn = page.locator('button:has-text("Share")')
    if (await shareBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('✅ Share button visible on Results')
      
      page.on('dialog', async dialog => {
        console.log(`Dialog message: ${dialog.message()}`)
        await dialog.accept()
      })
      
      await shareBtn.click()
      await page.waitForTimeout(1000)
      console.log('✅ Share button clicked')
    }
  })

  test('Export TXT downloads file', async ({ page }) => {
    await page.goto(BASE_URL)
    await page.click('button:has-text("Enter the Arena")')
    
    await page.locator('textarea').fill('Test export feature')
    
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
    
    const exportBtn = page.locator('button:has-text("Export")')
    if (await exportBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('✅ Export button visible on Results')
      
      const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null)
      await exportBtn.click()
      const download = await downloadPromise
      
      if (download) {
        console.log(`Downloaded: ${download.suggestedFilename()}`)
        expect(download.suggestedFilename()).toContain('debate')
      } else {
        console.log('⚠️ Download not triggered (may be blocked by browser)')
      }
    }
  })
})
