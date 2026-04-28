import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Interfaces for clearer typing later
interface User {
    id: string;
    email: string;
    name?: string;
    onboardingCompleted: boolean;
    monthlyIncome?: number;
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
        // Global Axios Interceptor for 401 Unauthorized
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    delete axios.defaults.headers.common['Authorization'];
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }
        );

        const initAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                await refreshUser();
            } else {
                setLoading(false);
            }
        };
        initAuth();

        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, []);

    const refreshUser = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.get(`${apiUrl}/api/users/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const userData = res.data;
            
            // Map backend profile response to User interface
            const mappedUser: User = {
                id: userData.id,
                email: userData.email || 'user@example.com',
                name: userData.name,
                onboardingCompleted: userData.onboardingCompleted,
                monthlyIncome: userData.monthlyIncome,
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

    const login = (token: string, userData: User) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(userData);
    };

    const signInWithGoogle = async () => {
        console.log('Real OAuth with Google flow initiated');
    };

    const signOut = async () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
        window.location.href = '/login';
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
