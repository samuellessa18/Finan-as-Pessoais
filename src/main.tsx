import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { NotificationProvider } from './contexts/NotificationContext.tsx'

import { GamificationProvider } from './contexts/GamificationContext.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
        <NotificationProvider>
            <GamificationProvider>
                <App />
            </GamificationProvider>
        </NotificationProvider>
    </AuthProvider>

  </React.StrictMode>,
)
