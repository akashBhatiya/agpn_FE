import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../helpers/apiClient/apiClient';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);


export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [token, setToken] = useState(null);

    const login = async (values, rememberMe, navigateTo) => {
        try {
            setLoading(true);

            const payload = {
                email: values.email,
                password: values.password,
                remembered: false
            }

            const emails = JSON.parse(localStorage.getItem("rememberedEmail")) || [];
            if (emails.includes(values.email)) {
                payload.remembered = true
            }

            const { data } = await apiClient.post('/users/sendSecurityCode', payload);


            if (data.status === "success") {
                const { token, user } = data;
                if (token && user) {

                    if (emails.includes(values.email)) {
                        if (!rememberMe) {
                            const updatedEmails = emails.filter((email) => email !== values.email);
                            localStorage.setItem("rememberedEmail", JSON.stringify(updatedEmails))
                        }
                    } else {
                        if (rememberMe) {
                            const updatedEmails = [...emails, values.email];
                            localStorage.setItem("rememberedEmail", JSON.stringify(updatedEmails));
                        }
                    }

                    setUser(user);
                    setToken(token);
                    localStorage.setItem('token', token);
                    navigate(navigateTo);
                } else {
                    navigate('/securityCode')
                }
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
    };

    const fetchCurrentUser = async () => {
        setLoading(true);
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
            try {
                const { data } = await apiClient.post('/users/currentUser');
                const { token, user } = data;
                if (data.status === "success" && token && user) {
                    setUser(data.user);
                    setToken(data.token);
                } else {
                    setError(data.message);
                }
            } catch (err) {
                setError(err.message);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchCurrentUser();
    }, []);

    const value = {
        user,
        login,
        logout,
        token,
        loading,
        error,
    };

    return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};