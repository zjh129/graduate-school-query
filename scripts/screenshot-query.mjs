import puppeteer from 'puppeteer-core'

const url = process.argv[2] || 'http://localhost:5173/'
const out = process.argv[3] || 'preview.png'
const score = Number(process.argv[4] || 528)
const subject = process.argv[5] || '不限'
const province = process.argv[6] || ''

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
  headless: 'new'
})

try {
  const page = await browser.newPage()
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 })

  await page.evaluate(({ score, subject, province }) => {
    const setup = document.querySelector('#app').__vue_app__._instance.setupState
    setup.form.score = score
    setup.form.subject = subject
    if (province) setup.form.province = province
    setup.submit()
  }, { score, subject, province })

  await new Promise((r) => setTimeout(r, 800))
  await page.screenshot({ path: out, fullPage: process.env.FULL === '1' })
  console.log('OK ->', out)
} catch (e) {
  console.error('Error:', e.message)
} finally {
  await browser.close()
}
