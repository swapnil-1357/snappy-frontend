import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ToastProvider } from './components/ui/toast.jsx'
import { Toaster } from './components/ui/toaster.jsx'
import { ThemeProvider } from './components/ThemeProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <ThemeProvider>
        <App />
        <Toaster />
      </ThemeProvider>
    </ToastProvider>
  </StrictMode>,
)
