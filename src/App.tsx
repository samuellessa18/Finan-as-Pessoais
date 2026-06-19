import { ThemeProvider } from 'next-themes'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Index from './pages/Index'
import Login from './pages/Login'
import Register from './pages/Register'
import GoogleCallback from './pages/GoogleCallback'
import Goals from './pages/Goals'
import Insights from './pages/Insights'
import Notifications from './pages/Notifications'
import Onboarding from './pages/Onboarding'
import Admin from './pages/Admin'
import Budget from './pages/Budget'
import InsightsFinanceiros from './pages/InsightsFinanceiros'
import Contas from './pages/Contas'
import PrivateRoute from './routes/PrivateRoute'
import MainLayout from './components/MainLayout'
import { Toaster } from 'sonner'

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Toaster richColors position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/callback" element={<GoogleCallback />} />
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
            <Route path="orcamento" element={<Budget />} />
            <Route path="painel" element={<InsightsFinanceiros />} />
            <Route path="contas" element={<Contas />} />
            <Route path="admin" element={<Admin />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
