import puppeteer from 'puppeteer-core'

const url = process.argv[2] || 'http://localhost:5173/'
const out = process.argv[3] || 'preview.png'

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
  headless: 'new'
})

try {
  const page = await browser.newPage()
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 })

  await page.evaluate(() => {
    const setup = document.querySelector('#app').__vue_app__._instance.setupState
    setup.form.score = 528
    setup.form.subject = '不限'
    setup.form.province = ''              // 院校省份不限 → 全国
    setup.form.userProvince = '北京市'    // 用户 = 北京（数据里只有北京有分数 → 全省内）
    setup.form.limit = 3
    setup.submit()
  })

  await new Promise((r) => setTimeout(r, 800))
  await page.screenshot({ path: out, fullPage: process.env.FULL === '1' })
  console.log('OK ->', out)
} catch (e) {
  console.error('Error:', e.message)
} finally {
  await browser.close()
}