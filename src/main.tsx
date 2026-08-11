import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.warn('離線快取註冊失敗；目前仍可連線使用。', error)
    })
  })
} else {
  console.warn('此瀏覽器不支援離線快取；目前仍可連線使用。')
}
