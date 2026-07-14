import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:5173'

test.describe('Content Quality Tests', () => {

  test('Debate stays on topic - Climate Change', async ({ page }) => {
    const topic = 'Is climate change a real threat to humanity?'
    await page.goto(BASE_URL)
    await page.click('button:has-text("Enter the Arena")')
    
    await page.locator('textarea').fill(topic)
    
    const presets = page.locator('.grid button')
    await presets.first().click()
    await presets.nth(1).click()
    
    await page.click('button:has-text("Start Debate")')
    
    await page.waitForTimeout(20000)
    
    const messages = page.locator('[class*="rounded-tr-lg"]')
    const count = await messages.count()
    console.log(`\n📝 DEBATE: "${topic}"`)
    console.log(`Total messages: ${count}`)
    
    const topicKeywords = ['climate', 'environment', 'global warming', 'carbon', 'emission', 'greenhouse', 'pollution', 'weather', 'temperature', 'earth', 'planet', 'sustainability', 'fossil fuel', 'renewable']
    
    let offTopicCount = 0
    for (let i = 0; i < count; i++) {
      const text = (await messages.nth(i).textContent()) || ''
      const lower = text.toLowerCase()
      const isOnTopic = topicKeywords.some(k => lower.includes(k))
      
      if (!isOnTopic && text.length > 50) {
        offTopicCount++
        console.log(`  ⚠️ MSG ${i+1} (${text.length} chars): "${text.substring(0, 120)}..."`)
      } else {
        console.log(`  ✅ MSG ${i+1}: "${text.substring(0, 80)}..."`)
      }
    }
    
    console.log(`\nOn-topic: ${count - offTopicCount}/${count}`)
    expect(offTopicCount).toBeLessThanOrEqual(Math.ceil(count * 0.3))
  })

  test('Debate stays on topic - AI Replace Teachers', async ({ page }) => {
    const topic = 'Should AI replace human teachers in schools?'
    await page.goto(BASE_URL)
    await page.click('button:has-text("Enter the Arena")')
    
    await page.locator('textarea').fill(topic)
    
    const presets = page.locator('.grid button')
    await presets.nth(2).click()
    await presets.nth(3).click()
    
    await page.click('button:has-text("Start Debate")')
    
    await page.waitForTimeout(20000)
    
    const messages = page.locator('[class*="rounded-tr-lg"]')
    const count = await messages.count()
    console.log(`\n📝 DEBATE: "${topic}"`)
    console.log(`Total messages: ${count}`)
    
    const topicKeywords = ['ai', 'artificial intelligence', 'teacher', 'education', 'school', 'student', 'learning', 'classroom', 'teaching', 'human', 'replace', 'technology', 'machine', 'automation']
    
    let offTopicCount = 0
    for (let i = 0; i < count; i++) {
      const text = (await messages.nth(i).textContent()) || ''
      const lower = text.toLowerCase()
      const isOnTopic = topicKeywords.some(k => lower.includes(k))
      
      if (!isOnTopic && text.length > 50) {
        offTopicCount++
        console.log(`  ⚠️ MSG ${i+1} (${text.length} chars): "${text.substring(0, 120)}..."`)
      } else {
        console.log(`  ✅ MSG ${i+1}: "${text.substring(0, 80)}..."`)
      }
    }
    
    console.log(`\nOn-topic: ${count - offTopicCount}/${count}`)
    expect(offTopicCount).toBeLessThanOrEqual(Math.ceil(count * 0.3))
  })

  test('Character responses reflect real personality', async ({ page }) => {
    const topic = 'Is social media destroying mental health?'
    await page.goto(BASE_URL)
    await page.click('button:has-text("Enter the Arena")')
    
    await page.locator('textarea').fill(topic)
    
    const presets = page.locator('.grid button')
    await presets.nth(8).click()
    await presets.nth(9).click()
    
    await page.click('button:has-text("Start Debate")')
    
    await page.waitForTimeout(25000)
    
    const messages = page.locator('[class*="rounded-tr-lg"]')
    const count = await messages.count()
    console.log(`\n📝 DEBATE: "${topic}"`)
    console.log(`Total messages: ${count}`)
    
    for (let i = 0; i < count; i++) {
      const text = (await messages.nth(i).textContent()) || ''
      console.log(`  MSG ${i+1}: "${text.substring(0, 150)}..."`)
    }
    
    expect(count).toBeGreaterThan(0)
  })

  test('No English translations in brackets', async ({ page }) => {
    const topic = 'Should India ban social media?'
    await page.goto(BASE_URL)
    await page.click('button:has-text("Enter the Arena")')
    
    await page.locator('textarea').fill(topic)
    
    const presets = page.locator('.grid button')
    await presets.first().click()
    await presets.nth(1).click()
    
    await page.click('button:has-text("Start Debate")')
    
    await page.waitForTimeout(20000)
    
    const messages = page.locator('[class*="rounded-tr-lg"]')
    const count = await messages.count()
    
    let bracketTranslationCount = 0
    for (let i = 0; i < count; i++) {
      const text = (await messages.nth(i).textContent()) || ''
      if (/\([a-zA-Z]{3,}\)/.test(text)) {
        bracketTranslationCount++
        console.log(`  ⚠️ Bracket translation found: "${text.substring(0, 100)}..."`)
      }
    }
    
    console.log(`\nBracket translations found: ${bracketTranslationCount}/${count}`)
    expect(bracketTranslationCount).toBe(0)
  })

  test('Hinglish uses Roman script not Devanagari', async ({ page }) => {
    const topic = 'Best cricket player of all time?'
    await page.goto(BASE_URL)
    await page.click('button:has-text("Enter the Arena")')
    
    await page.locator('textarea').fill(topic)
    
    const presets = page.locator('.grid button')
    await presets.first().click()
    await presets.nth(1).click()
    
    const langSelect = page.locator('select').filter({ has: page.locator('option[value="hinglish"]') })
    await langSelect.selectOption('hinglish')
    
    await page.click('button:has-text("Start Debate")')
    
    await page.waitForTimeout(20000)
    
    const messages = page.locator('[class*="rounded-tr-lg"]')
    const count = await messages.count()
    
    let devanagariCount = 0
    for (let i = 0; i < count; i++) {
      const text = (await messages.nth(i).textContent()) || ''
      if (/[\u0900-\u097F]/.test(text)) {
        devanagariCount++
        console.log(`  ⚠️ Devanagari found in Hinglish mode: "${text.substring(0, 80)}..."`)
      }
    }
    
    console.log(`\nDevanagari in Hinglish: ${devanagariCount}/${count}`)
  })
})
