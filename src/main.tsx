import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { router } from './router'
import './index.css'

async function enableMocking() {
  if (import.meta.env.MODE !== 'production' || import.meta.env.VITE_ENABLE_MSW === 'true') {
    // MSW will be initialized here in Phase 2
  }
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  )
})
