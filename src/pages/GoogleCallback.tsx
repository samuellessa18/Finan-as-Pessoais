import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { toast } from 'sonner';

export default function GoogleCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();
    const [status, setStatus] = useState('Processando autenticação...');
    const didExchange = useRef(false);

    useEffect(() => {
        // [FIX] O code OAuth é de uso único (backend deleta no 1º exchange). StrictMode
        // (double-invoke em dev) e o re-render por `login` instável re-disparavam o
        // exchange → 2º POST = 401 → logout. Esta guarda garante UMA troca por callback.
        if (didExchange.current) return;
        didExchange.current = true;

        const exchangeCode = async () => {
            const code = searchParams.get('code');
            
            if (!code) {
                toast.error('Código de autenticação não encontrado.');
                navigate('/login');
                return;
            }

            try {
                setStatus('Validando sua conta...');
                // Troca o código temporário pelo JWT real (Fluxo Seguro Option A)
                const res = await api.post('/auth/google/exchange', { code });
                const { user, token } = res.data;

                // Remove o code da URL para impedir reprocessamento (refresh/voltar)
                window.history.replaceState({}, document.title, window.location.pathname);

                login(token, {
                    ...user,
                    user_metadata: { full_name: user.name }
                });

                toast.success(`Bem-vindo de volta, ${user.name}!`);
                navigate('/');
            } catch (error: any) {
                console.error('[GOOGLE_CALLBACK_ERROR]', error);
                const errorMsg = error.response?.data?.error || 'Falha na autenticação social.';
                toast.error(errorMsg);
                navigate('/login');
            }
        };

        exchangeCode();
    }, [searchParams, login, navigate]);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="flex flex-col items-center gap-6 glass-card p-12 rounded-3xl border border-border/50 shadow-2xl">
                <div className="relative">
                    <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                    <img src="/logo.png" alt="FinMind" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 object-contain" />
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-xl font-bold tracking-tight">{status}</h2>
                    <p className="text-sm text-muted-foreground animate-pulse">Quase lá! Estamos preparando seu dashboard...</p>
                </div>
            </div>
        </div>
    );
}
