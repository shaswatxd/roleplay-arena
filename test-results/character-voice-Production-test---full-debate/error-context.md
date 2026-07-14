# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: character-voice.spec.ts >> Production test - full debate
- Location: tests\character-voice.spec.ts:5:1

# Error details

```
Error: expect(received).toBeGreaterThan(expected)

Expected: > 50
Received:   25
```

# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e5]:
    - button "Exit" [ref=e6] [cursor=pointer]:
      - img [ref=e7]
    - generic [ref=e9]:
      - generic [ref=e10]: Topic
      - generic [ref=e11]: Is social media toxic for youth?
    - generic [ref=e12]: R1/3
  - generic [ref=e14]:
    - generic [ref=e15] [cursor=pointer]:
      - img "Elon Musk" [ref=e17]
      - generic [ref=e18]: Elon
    - generic [ref=e19] [cursor=pointer]:
      - img "Mahatma Gandhi" [ref=e21]
      - generic [ref=e22]: Mahatma
  - generic [ref=e23]:
    - generic [ref=e24]: ⚔️ Round 1 of 3
    - generic [ref=e25]:
      - img "Elon Musk" [ref=e27]
      - generic [ref=e30]: Elon Musk
  - generic [ref=e37]:
    - button "Pause" [ref=e38] [cursor=pointer]:
      - img [ref=e39]
      - text: Pause
    - button "Next Round" [disabled] [ref=e42]:
      - text: Next Round
      - img [ref=e43]
    - button "Share" [ref=e45] [cursor=pointer]:
      - img [ref=e46]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | const PROD_URL = 'https://abhogidebate.vercel.app'
  4  | 
  5  | test('Production test - full debate', async ({ page }) => {
  6  |   const topic = 'Is social media toxic for youth?'
  7  |   
  8  |   const logs: string[] = []
  9  |   page.on('console', msg => {
  10 |     logs.push(`[${msg.type()}] ${msg.text()}`)
  11 |   })
  12 |   
  13 |   await page.goto(PROD_URL)
  14 |   await page.waitForTimeout(2000)
  15 |   
  16 |   await page.click('button:has-text("Enter the Arena")')
  17 |   await page.waitForTimeout(1000)
  18 |   
  19 |   await page.locator('textarea').fill(topic)
  20 |   
  21 |   const presets = page.locator('.grid button')
  22 |   await presets.nth(0).click()
  23 |   await presets.nth(1).click()
  24 |   
  25 |   await page.click('button:has-text("Start Debate")')
  26 |   
  27 |   console.log('⏳ Waiting for AI responses on production...')
  28 |   await page.waitForTimeout(45000)
  29 |   
  30 |   const feedText = await page.evaluate(() => {
  31 |     const feed = document.querySelector('[class*="overflow-y-auto"]')
  32 |     return feed ? feed.innerText : 'NO FEED'
  33 |   })
  34 |   
  35 |   console.log('\n=== PROD FEED TEXT ===')
  36 |   console.log(feedText)
  37 |   console.log('=== END ===\n')
  38 |   
  39 |   console.log('\n=== CONSOLE LOGS ===')
  40 |   logs.filter(l => l.includes('[Arena]') || l.includes('[Config]') || l.includes('Error') || l.includes('error')).forEach(l => console.log(l))
  41 |   console.log('=== END ===\n')
  42 |   
> 43 |   expect(feedText.length).toBeGreaterThan(50)
     |                           ^ Error: expect(received).toBeGreaterThan(expected)
  44 | })
  45 | 
```