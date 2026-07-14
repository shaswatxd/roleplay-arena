import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:5173'

test('Debug debate content', async ({ page }) => {
  const topic = 'Is social media toxic for youth?'
  await page.goto(BASE_URL)
  await page.click('button:has-text("Enter the Arena")')
  
  await page.locator('textarea').fill(topic)
  
  const presets = page.locator('.grid button')
  await presets.nth(0).click()
  await presets.nth(3).click()
  
  await page.click('button:has-text("Start Debate")')
  
  await page.waitForTimeout(30000)
  
  const fullHTML = await page.evaluate(() => {
    const feed = document.querySelector('[class*="overflow-y-auto"]')
    return feed ? feed.innerHTML.substring(0, 5000) : 'NO FEED'
  })
  
  console.log('\n--- FEED HTML ---')
  console.log(fullHTML)
  console.log('--- END ---\n')
  
  const allDivs = await page.evaluate(() => {
    const divs = document.querySelectorAll('div')
    const texts: string[] = []
    divs.forEach(d => {
      const t = d.textContent?.trim() || ''
      if (t.length > 50 && t.length < 500) {
        texts.push(t)
      }
    })
    return texts
  })
  
  console.log('\n--- ALL DIV TEXTS ---')
  allDivs.forEach((t, i) => console.log(`[${i}]: ${t}`))
  console.log('--- END ---\n')
  
  expect(true).toBeTruthy()
})
