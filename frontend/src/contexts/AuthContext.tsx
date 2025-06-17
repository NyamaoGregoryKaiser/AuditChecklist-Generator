import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LoginResponse } from '../types/api';
import { authApi } from '../services/api';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    register: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            authApi.getCurrentUser()
                .then(userData => {
                    setUser(userData);
                })
                .catch(err => {
                    console.error('Error fetching user:', err);
                    localStorage.removeItem('token');
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email: string, password: string) => {
        try {
            setError(null);
            const response = await authApi.login(email, password);
            localStorage.setItem('token', response.token);
            localStorage.setItem('refresh_token', response.refresh);
            setUser(response.user);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
            throw err;
        }
    };

    const logout = () => {
        authApi.logout();
        setUser(null);
    };

    const register = async (email: string, password: string) => {
        try {
            setError(null);
            const response = await authApi.register(email, password);
            localStorage.setItem('token', response.token);
            localStorage.setItem('refresh_token', response.refresh);
            setUser(response.user);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Registration failed');
            throw err;
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, error, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 