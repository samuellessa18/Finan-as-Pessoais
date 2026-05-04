import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ThemeToggle'
import { ShieldCheck, LineChart, Wallet, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, Link, Navigate } from 'react-router-dom'
import { api } from '@/services/api'
import { motion } from 'framer-motion'

export default function Login() {
  const { login, user } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
      setError('Credenciais inválidas. Verifique seu email e senha.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (user) {
    return <Navigate to="/" />
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-50 flex overflow-hidden font-sans">
      {/* Left Side: Premium Visuals */}
      <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden bg-slate-950 items-center justify-center border-r border-white/5">
        <div className="absolute inset-0 animate-mesh opacity-40"></div>
        <div className="absolute inset-0 finance-grid-overlay"></div>
        
        <div className="relative z-10 px-20 space-y-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-4"
          >
            <div className="p-3 glass-panel rounded-2xl">
              <img src="/logo.png" alt="FinMind" className="h-10 w-10 object-contain" />
            </div>
            <h1 className="text-3xl font-bold tracking-tighter">FinMind</h1>
          </motion.div>

          <div className="space-y-6">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-6xl font-extrabold tracking-tight leading-[1.1]"
            >
              Domine suas <br />
              <span className="text-gradient-primary">Finanças</span> com <br />
              Inteligência.
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl text-slate-400 max-w-lg leading-relaxed"
            >
              A plataforma definitiva para quem busca controle total, insights preditivos e liberdade financeira através de tecnologia de ponta.
            </motion.p>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-8">
            {[
              { icon: LineChart, label: 'Analytics Pro', color: 'text-blue-400' },
              { icon: ShieldCheck, label: 'Segurança OAuth', color: 'text-emerald-400' },
              { icon: Wallet, label: 'Fluxo Inteligente', color: 'text-purple-400' },
              { icon: ArrowRight, label: 'Pronto para Escalar', color: 'text-orange-400' }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + (i * 0.1) }}
                className="flex items-center gap-3"
              >
                <div className={`p-2 rounded-lg bg-white/5 border border-white/10 ${item.color}`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <span className="font-medium text-slate-300">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Floating Decorative Elements */}
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full"></div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-2/5 flex flex-col justify-center items-center p-6 sm:p-12 bg-slate-950/50 relative">
        <div className="absolute top-8 right-8">
          <ThemeToggle />
        </div>
        
        <div className="lg:hidden absolute top-8 left-8 flex items-center gap-3">
            <img src="/logo.png" alt="FinMind" className="h-8 w-8 object-contain" />
            <span className="font-bold text-xl">FinMind</span>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-8 glass-card-premium p-10 rounded-[2.5rem] relative"
        >
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Bem-vindo</h2>
            <p className="text-slate-400">Acesse sua conta para continuar</p>
          </div>

          <div className="space-y-6">
            <Button
              type="button"
              variant="outline"
              className="w-full h-14 text-base font-medium rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-3 group"
              onClick={() => {
                const baseUrl = import.meta.env.VITE_API_URL || 'https://finmind-api-y31d.onrender.com/api/v1';
                window.location.href = `${baseUrl}/auth/google`;
              }}
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Entrar com Google</span>
              <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/5" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-950 px-4 text-slate-500 font-medium tracking-widest">OU</span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 ml-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="exemplo@finmind.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl border border-white/10 bg-white/5 focus:bg-white/10 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-sm placeholder:text-slate-600"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 ml-1">Senha</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl border border-white/10 bg-white/5 focus:bg-white/10 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all text-sm placeholder:text-slate-600"
                  />
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-rose-400 text-sm font-medium bg-rose-400/10 p-4 rounded-2xl border border-rose-400/20"
                >
                  {error}
                </motion.div>
              )}

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full h-14 text-base font-bold rounded-2xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {isSubmitting ? 'Validando...' : 'Entrar na Plataforma'}
              </Button>
            </form>

            <p className="text-center text-sm text-slate-400 pt-2 font-medium">
              Ainda não tem conta?{' '}
              <Link to="/register" className="text-blue-400 hover:text-blue-300 transition-colors underline-offset-4 hover:underline">
                Criar conta gratuita
              </Link>
            </p>
          </div>
        </motion.div>
        
        <div className="mt-12 text-sm text-slate-600 font-medium">
          &copy; {new Date().getFullYear()} FinMind Technologies. Absolute Control.
        </div>
      </div>
    </div>
  )
}
