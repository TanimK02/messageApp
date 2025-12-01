import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Helper function to decode JWT and check expiration
const isTokenExpired = (token) => {
    if (!token) return true;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expirationTime = payload.exp * 1000; // Convert to milliseconds
        return Date.now() >= expirationTime;
    } catch (error) {
        return true; // If we can't decode, consider it expired
    }
};

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => {
        const storedToken = localStorage.getItem('token');
        // Check if token is expired on initial load
        if (storedToken && isTokenExpired(storedToken)) {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            return null;
        }
        return storedToken;
    });
    const [userId, setUserId] = useState(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken && isTokenExpired(storedToken)) {
            return null;
        }
        return localStorage.getItem('userId');
    });

    useEffect(() => {
        if (token) {
            // Check if token is expired
            if (isTokenExpired(token)) {
                setToken(null);
                setUserId(null);
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
            } else {
                localStorage.setItem('token', token);
            }
        } else {
            localStorage.removeItem('token');
        }
    }, [token]);

    useEffect(() => {
        if (userId) {
            localStorage.setItem('userId', userId);
        } else {
            localStorage.removeItem('userId');
        }
    }, [userId]);

    // Check token expiration periodically
    useEffect(() => {
        if (!token) return;

        const interval = setInterval(() => {
            if (isTokenExpired(token)) {
                setToken(null);
                setUserId(null);
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
            }
        }, 60000); // Check every minute

        return () => clearInterval(interval);
    }, [token]);

    const login = (newToken, newUserId) => {
        setToken(newToken);
        setUserId(newUserId);
    };

    const logout = () => {
        setToken(null);
        setUserId(null);
    };

    return (
        <AuthContext.Provider value={{ token, userId, login, logout }}>
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
