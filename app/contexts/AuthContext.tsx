import React, { useState, useEffect, createContext, ReactNode } from "react";

import AsyncStorage from '@react-native-async-storage/async-storage';

import { api } from "../services/api";

type AuthContextData = {
    user: UserProps;
    isAuthenticated: boolean;
    signIn: (credentials: SignInProps) => Promise<void>;
    loadingAuth: boolean;
    loading: boolean;
    signOut: () => Promise<void>;
}

type UserProps = {
    id: string;
    name: string;
    email: string;
    token: string;
}

type AuthProviderProps = {
    children: ReactNode;
}

type SignInProps = {
    email: string;
    password: string;
}

export const AuthContext = createContext({} as AuthContextData);

export default function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<UserProps>({
        id: '',
        name: '',
        email: '',
        token: ''
    });

    const [loadingAuth, setLoadingAuth] = useState(false);
    const [loading, setLoading] = useState(true);

    // Os dois !! converte a variável para boolean, ou seja, se tiver name setado, retorna true, senão false
    const isAuthenticated = !!user.name;

    useEffect(() => {
        async function getUser() {
            // Pegar dados salvos do user
            const userInfo = await AsyncStorage.getItem('@sujeitopizzaria');
            let hasUser: UserProps = JSON.parse(userInfo || '{}');

            // Verificar se recebemos as informações do user
            if(Object.keys(hasUser).length > 0) {
                api.defaults.headers.common['Authorization'] = `Bearer ${hasUser.token}`;

                setUser({
                    id: hasUser.id,
                    name: hasUser.name,
                    email: hasUser.email,
                    token: hasUser.token
                });

                setLoading(false);
            }
        }

        getUser();
    }, [])

    async function signIn({ email, password }: SignInProps) {
        setLoadingAuth(true);

        try {
            const response = await api.post('/session', {
                email, password
            });

            const { id, name, token } = response.data;

            const data = {
                ...response.data
            }

            // como se fosse o localstorage do navegador
            await AsyncStorage.setItem('@sujeitopizzaria', JSON.stringify(data));

            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            setUser({ id, name, email, token });
            setLoadingAuth(false);

        } catch (error) {
            console.log('erro ao acessar', error);
            setLoadingAuth(false);
        }
    }

    async function signOut() {
        await AsyncStorage.clear().then(() => {
            setUser({
                id: '',
                name: '',
                email: '',
                token: ''
            });
        });
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                signIn,
                loadingAuth,
                loading,
                signOut
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}