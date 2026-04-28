import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link, Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export default function Register() {
  const navigate = useNavigate()
  const { login, user } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Basic Security Validation
    if (password.length < 6) {
        setError('A senha deve ter no mínimo 6 caracteres.');
        return;
    }

    setIsSubmitting(true)

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.post(`${apiUrl}/api/auth/register`, {
        name,
        email,
        password
      })
      
      if (res.data.token) {
        const { user: userData, token } = res.data;
        login(token, {
            ...userData,
            user_metadata: { full_name: userData.name }
        })
        navigate('/')
      } else {
        navigate('/login')
      }
    } catch (err: any) {
      console.error(err);
      setError('Erro ao criar conta. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (user) {
    return <Navigate to="/" />
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      <div className="md:w-1/2 tech-surface flex flex-col justify-center items-center p-8 pt-12 md:p-16 border-b md:border-b-0 md:border-r border-border/50 text-center">
        <div className="flex items-center gap-3 mb-8 justify-center">
            <img src="/logo.png" alt="FinMind Logo" className="h-10 w-10 object-contain" />
            <h1 className="text-2xl font-bold tracking-tight">FinMind</h1>
        </div>
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight mb-4">
          Comece agora.
        </h2>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          Crie sua conta gratuitamente e experimente um controle financeiro absoluto e descomplicado.
        </p>
      </div>

      <div className="md:w-1/2 flex items-center justify-center p-8 bg-background relative finance-grid">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-sm space-y-6 glass-card p-8 sm:p-10 rounded-2xl border border-border/50">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold tracking-tight">Criar Conta</h2>
            <p className="text-sm text-muted-foreground">
              Preencha os dados abaixo para se cadastrar
            </p>
          </div>

          <div className="space-y-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-3">
                <input
                  type="text"
                  required
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border/50 bg-background/50 focus:bg-background focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                />
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
                  placeholder="Sua senha secreta"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border/50 bg-background/50 focus:bg-background focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                />
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
                {isSubmitting ? 'Registrando...' : 'Finalizar Cadastro'}
              </Button>
            </form>

            <p className="text-center text-sm font-medium pt-2">
              <span className="text-muted-foreground">Já possui uma conta?</span>{' '}
              <Link to="/login" className="text-primary hover:underline hover:text-primary/90 transition-colors">
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
