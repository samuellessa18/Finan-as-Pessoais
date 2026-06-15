import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api';

// Interfaces for clearer typing later
interface User {
    id: string;
    email: string;
    name?: string;
    onboardingCompleted: boolean;
    monthlyIncome?: number;
    plan?: 'free' | 'pro';
    role?: 'user' | 'admin' | 'super_admin';
    user_metadata?: {
        full_name?: string;
        avatar_url?: string;
        picture?: string;
    };
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    login: (token: string, userData: User) => void;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Listener para logout global (evita loops de redirecionamento físico)
        const handleLogout = () => {
            setUser(null);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        };

        window.addEventListener('logout', handleLogout);

        // Global Axios Interceptor for 401 Unauthorized / 403 Forbidden
        const interceptor = api.interceptors.response.use(
            (response) => response,
            (error) => {
                // [FIX] Não deslogar em 401/403 de endpoints de auth (login/register/
                // exchange): ali o 401 = credencial/code inválido, não sessão expirada.
                const url = error.config?.url || '';
                const isAuthEndpoint =
                    url.includes('/auth/google/exchange') ||
                    url.includes('/auth/login') ||
                    url.includes('/auth/register');
                if (!isAuthEndpoint && (error.response?.status === 401 || error.response?.status === 403)) {
                    window.dispatchEvent(new Event('logout'));
                }
                return Promise.reject(error);
            }
        );

        const initAuth = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    await refreshUser();
                }
            } catch (error) {
                console.error("Auth Initialization Error:", error);
                window.dispatchEvent(new Event('logout'));
            } finally {
                setLoading(false);
            }
        };
        initAuth();

        return () => {
            api.interceptors.response.eject(interceptor);
            window.removeEventListener('logout', handleLogout);
        };
    }, []);

    const refreshUser = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await api.get('/users/profile');
            const userData = res.data;
            
            // Map backend profile response to User interface
            const mappedUser: User = {
                id: userData.id,
                email: userData.email || 'user@example.com',
                name: userData.name,
                onboardingCompleted: userData.onboardingCompleted,
                monthlyIncome: userData.monthlyIncome,
                plan: userData.plan,
                role: userData.role,
                user_metadata: {
                    full_name: userData.name
                }
            };
            
            setUser(mappedUser);
            localStorage.setItem('user', JSON.stringify(mappedUser));
        } catch (error) {
            console.error("Refresh User Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const login = useCallback((token: string, userData: User) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    }, []);

    const signInWithGoogle = async () => {
        // Redireciona o navegador para o fluxo OAuth do backend
        const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';
        window.location.href = `${backendUrl}/auth/google`;
    };

    const signOut = async () => {
        window.dispatchEvent(new Event('logout'));
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <img src="/logo.png" alt="FinMind Logo" className="h-10 w-10 animate-bounce object-contain" />
                    <span className="text-muted-foreground animate-pulse text-sm font-medium">Validando Sessão...</span>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user, loading, signInWithGoogle, login, signOut, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
