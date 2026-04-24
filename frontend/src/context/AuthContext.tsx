import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import api from '../services/api';

interface User {
    id_usuario: string;
    codigo?: string;
    role?: string;
    correo?: string;
    nombre: string;
    dni?: string;
    celular?: number;
    isGuest?: boolean;
}

interface AuthContextData {
    user: User | null;
    token: string | null;
    isGuest: boolean;
    login: (user: User, token: string) => Promise<void>;
    logout: () => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadStorageData() {
            const storagedUser = await AsyncStorage.getItem('@SATMovil:user');
            const storagedToken = await AsyncStorage.getItem('@SATMovil:token');

            if (storagedUser && storagedToken) {
                setUser(JSON.parse(storagedUser));
                setToken(storagedToken);
            }
            setIsLoading(false);
        }

        loadStorageData();
    }, []);

    const logout = async () => {
        await AsyncStorage.removeItem('@SATMovil:token');
        await AsyncStorage.removeItem('@SATMovil:user');
        setUser(null);
        setToken(null);
    };

    // Global Interceptor for 401 errors
    useEffect(() => {
        const interceptor = api.interceptors.response.use(
            response => response,
            async (error) => {
                if (error.response?.status === 401) {
                    // Alert the user about inactivity
                    Alert.alert(
                        'Sesión Expirada',
                        'Su sesión ha finalizado por inactividad. Por favor, identifíquese de nuevo para continuar.',
                        [{ 
                            text: 'Aceptar', 
                            onPress: async () => {
                                // Try to let the server know (it might fail if already expired, which is fine)
                                try {
                                    if (token) {
                                        const { authService } = await import('../services/api');
                                        await authService.logout(token);
                                    }
                                } catch (e) {
                                    // Silent fail on backend logout during 401
                                }
                                await logout();
                            }
                        }]
                    );
                }
                return Promise.reject(error);
            }
        );

        return () => api.interceptors.response.eject(interceptor);
    }, []);

    const login = async (userData: User, userToken: string) => {
        setUser(userData);
        setToken(userToken);

        await AsyncStorage.setItem('@SATMovil:user', JSON.stringify(userData));
        await AsyncStorage.setItem('@SATMovil:token', userToken);
    };

    return (
        <AuthContext.Provider value={{ user, token, isGuest: !!user?.isGuest, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    return useContext(AuthContext);
}
