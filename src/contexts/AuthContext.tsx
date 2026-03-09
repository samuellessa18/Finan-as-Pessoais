import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>({
        user_metadata: {
            full_name: 'Usuário Teste'
        },
        email: 'teste@exemplo.com'
    });

    const signOut = () => console.log('Signing out...');

    return (
        <AuthContext.Provider value={{ user, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
