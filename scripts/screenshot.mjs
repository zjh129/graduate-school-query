import puppeteer from 'puppeteer-core'

const url = process.argv[2] || 'http://localhost:5173/'
const out = process.argv[3] || 'd:/frond-end/graduate_school_query/preview.png'
const scenario = process.argv[4] || 'initial'

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
  headless: 'new'
})

try {
  const page = await browser.newPage()

  await page.setViewport({
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  })

  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 })

  if (scenario === 'query') {
    // 通过 Vue 暴露的 root 组件调用
    await page.evaluate(() => {
      const app = document.querySelector('#app').__vue_app__
      const rootComponent = app._instance
      // 直接修改表单数据并调用 submit
      const setup = rootComponent.setupState
      setup.form.province = '北京'
      setup.form.subject = '文科'
      setup.form.score = 528
      setup.submit()
    })
    await new Promise((r) => setTimeout(r, 500))
  }

  await page.screenshot({ path: out, fullPage: process.env.FULL === '1' })
  console.log('Screenshot saved to', out)
} catch (e) {
  console.error('Error:', e.message)
} finally {
  await browser.close()
}