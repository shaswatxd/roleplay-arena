import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:5173'

test('Full debug with all logs', async ({ page }) => {
  const topic = 'Is social media toxic for youth?'
  
  const logs: string[] = []
  page.on('console', msg => {
    logs.push(`[${msg.type()}] ${msg.text()}`)
  })
  
  page.on('requestfailed', req => {
    logs.push(`[REQ FAILED] ${req.url()} - ${req.failure()?.errorText}`)
  })
  
  await page.goto(BASE_URL)
  await page.click('button:has-text("Enter the Arena")')
  
  await page.locator('textarea').fill(topic)
  
  const presets = page.locator('.grid button')
  await presets.nth(0).click()
  await presets.nth(4).click()
  
  await page.click('button:has-text("Start Debate")')
  
  await page.waitForTimeout(70000)
  
  console.log('\n=== ALL CONSOLE LOGS ===')
  logs.forEach(l => console.log(l))
  console.log('=== END LOGS ===\n')
  
  const feedHTML = await page.evaluate(() => {
    const feed = document.querySelector('[class*="overflow-y-auto"]')
    return feed ? feed.innerHTML : 'NO FEED'
  })
  
  console.log('\n=== FEED HTML ===')
  console.log(feedHTML.substring(0, 2000))
  console.log('=== END ===\n')
  
  expect(true).toBeTruthy()
})
