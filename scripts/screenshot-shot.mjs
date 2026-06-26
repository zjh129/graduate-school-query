import puppeteer from 'puppeteer-core'

const url = process.argv[2] || 'http://localhost:5173/'
const out = process.argv[3] || 'preview.png'
const viewport = process.argv[4] || 'mobile'  // 'mobile' | 'desktop'
const userProvince = process.argv[5] || ''

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
  headless: 'new'
})

try {
  const page = await browser.newPage()
  if (viewport === 'desktop') {
    await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 })
  } else {
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  }
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 })

  await page.evaluate((userProvince) => {
    const setup = document.querySelector('#app').__vue_app__._instance.setupState
    setup.form.score = 528
    setup.form.subject = '不限'
    setup.form.userProvince = userProvince
    setup.form.limit = 3
    setup.submit()
  }, userProvince)

  await new Promise((r) => setTimeout(r, 800))
  await page.screenshot({ path: out, fullPage: process.env.FULL === '1' })
  console.log(`OK ${viewport} -> ${out}`)
} catch (e) {
  console.error('Error:', e.message)
} finally {
  await browser.close()
}