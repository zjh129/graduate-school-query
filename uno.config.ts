import { defineConfig, presetUno, presetAttributify } from 'unocss'

export default defineConfig({
  presets: [presetUno(), presetAttributify()],
  theme: {
    colors: {
      brand: {
        50: '#f0f7ff',
        100: '#e0efff',
        500: '#2b7fff',
        600: '#1e6fe6',
        700: '#1659c2'
      }
    }
  },
  shortcuts: {
    card: 'rounded-lg bg-white shadow-sm',
    'btn-primary':
      'inline-flex items-center justify-center px-4 py-2 rounded-md bg-brand-500 text-white text-sm font-medium active:scale-95 transition'
  }
})