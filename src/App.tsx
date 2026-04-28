import { ThemeProvider } from 'next-themes'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Index from './pages/Index'
import Login from './pages/Login'
import Register from './pages/Register'
import Goals from './pages/Goals'
import Insights from './pages/Insights'
import Notifications from './pages/Notifications'
import Onboarding from './pages/Onboarding'
import PrivateRoute from './routes/PrivateRoute'
import MainLayout from './components/MainLayout'

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/onboarding" 
            element={
              <PrivateRoute>
                <Onboarding />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            } 
          >
            <Route index element={<Index />} />
            <Route path="goals" element={<Goals />} />
            <Route path="insights" element={<Insights />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
