import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ThemeToggle'
import { ShieldCheck, LineChart, Wallet } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, Link, Navigate } from 'react-router-dom'
import { api } from '@/services/api'

export default function Login() {
  const { login, user } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await api.post('/analytics/track-public', { type: 'auth_started', metadata: { provider: 'local', type: 'login' } })
      const res = await api.post('/auth/login', {
        email,
        password
      })
      
      const { user: userData, token } = res.data;
      login(token, {
        ...userData,
        user_metadata: { full_name: userData.name }
      })
      navigate('/')
    } catch (err: any) {
      console.error(err);
      setError('Credenciais inválidas. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (user) {
    return <Navigate to="/" />
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      <div className="md:w-1/2 tech-surface flex flex-col justify-between p-8 pt-12 md:p-16 border-b md:border-b-0 md:border-r border-border/50">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="FinMind Logo" className="h-10 w-10 object-contain" />
            <h1 className="text-2xl font-bold tracking-tight">FinMind</h1>
          </div>
          <div className="max-w-md space-y-4 mt-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
              Sua vida financeira, <br />
              <span className="text-primary">sob controle absoluto.</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Acesse seu dashboard SaaS de finanças e tenha insights em tempo real sobre seu dinheiro de forma tecnológica e segura.
            </p>
          </div>
          
          <div className="space-y-6 pt-8 hidden md:block">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <LineChart className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Análise Avançada</p>
                <p className="text-sm text-muted-foreground">Métricas e gráficos precisos</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10 text-success">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Gestão de Fluxo de Caixa</p>
                <p className="text-sm text-muted-foreground">Acompanhe entradas e saídas</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent-foreground">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Segurança Bancária</p>
                <p className="text-sm text-muted-foreground">Autenticação com Google OAuth</p>
              </div>
            </div>
          </div>
        </div>
        <div className="text-sm text-muted-foreground hidden md:block">
          &copy; {new Date().getFullYear()} FinMind Inc. All rights reserved.
        </div>
      </div>

      <div className="md:w-1/2 flex items-center justify-center p-8 bg-background relative finance-grid">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-sm space-y-6 glass-card p-8 sm:p-10 rounded-2xl border border-border/50">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold tracking-tight">Bem-vindo(a)</h2>
            <p className="text-sm text-muted-foreground">
              Acesse sua conta para continuar
            </p>
          </div>

          <div className="space-y-4">
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 text-base font-medium shadow-sm border-border/50 hover:bg-muted/50"
              onClick={() => {
                console.log("🚀 Google Login Clicked");
                const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';
                const redirectUrl = `${backendUrl}/auth/google`;
                console.log("🔗 Redirecting to:", redirectUrl);
                
                // Track event without blocking the redirect
                api.post('/analytics/track-public', { 
                  type: 'auth_started', 
                  metadata: { provider: 'google', type: 'oauth' } 
                }).catch(err => console.error("Telemetry failed:", err));

                window.location.href = redirectUrl;
              }}
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              Entrar com Google
            </Button>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground opacity-70">
                  ou entrar com email
                </span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-3">
                <input
                  type="email"
                  required
                  placeholder="Seu email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border/50 bg-background/50 focus:bg-background focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                />
                <input
                  type="password"
                  required
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border/50 bg-background/50 focus:bg-background focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                />
              </div>

              <div className="flex items-center justify-between mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-border/50 text-primary focus:ring-primary bg-background w-4 h-4"
                  />
                  <span className="text-sm text-muted-foreground">Lembrar minha sessão</span>
                </label>
                <a href="#" className="text-sm text-primary hover:underline hover:text-primary/90 transition-colors">
                  Esqueceu a senha?
                </a>
              </div>

              {error && (
                <div className="text-destructive text-sm font-medium bg-destructive/10 p-3 rounded-lg">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full h-12 text-base font-semibold shadow-sm transition-all hover:scale-[1.02] bg-primary text-primary-foreground"
              >
                {isSubmitting ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            <p className="text-center text-sm font-medium pt-2">
              <span className="text-muted-foreground">Não tem uma conta?</span>{' '}
              <Link to="/register" className="text-primary hover:underline hover:text-primary/90 transition-colors">
                Criar conta
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
