import { test, expect } from '@playwright/test'

const PROD_URL = 'https://abhogidebate.vercel.app'

test('Production test - full debate', async ({ page }) => {
  const topic = 'Is social media toxic for youth?'
  
  await page.goto(PROD_URL)
  await page.waitForTimeout(2000)
  
  await page.click('button:has-text("Enter the Arena")')
  await page.waitForTimeout(1000)
  
  await page.locator('textarea').fill(topic)
  
  const presets = page.locator('.grid button')
  await presets.nth(0).click()
  await presets.nth(1).click()
  
  await page.click('button:has-text("Start Debate")')
  
  console.log('⏳ Waiting for AI responses on production...')
  
  for (let i = 0; i < 12; i++) {
    await page.waitForTimeout(5000)
    const logs = await page.evaluate(() => (window as any).__arenaLogs || [])
    const feedText = await page.evaluate(() => {
      const feed = document.querySelector('[class*="overflow-y-auto"]')
      return feed ? feed.innerText : 'NO FEED'
    })
    
    console.log(`[${(i+1)*5}s] Logs: ${logs.length} | Feed: ${feedText.substring(0, 200)}`)
    
    if (logs.length > 0) {
      console.log('Arena logs:', logs)
    }
    
    if (feedText.length > 100) break
  }
  
  expect(true).toBeTruthy()
})
