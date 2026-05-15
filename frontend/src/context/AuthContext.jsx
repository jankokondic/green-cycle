import { createContext, useContext, useState, useEffect } from 'react';
import { getSessionUser, logoutUser } from '../api/api'; // dodali logoutUser

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const login = (userData) => setUser(userData);

    const logout = async () => {
        try {
            await logoutUser();
            setUser(null);
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    useEffect(() => {
        const checkSession = async () => {
            try {
                const userData = await getSessionUser();
                if (userData) setUser(userData);
            } catch (err) {
                console.log('No active session');
            } finally {
                setLoading(false);
            }
        };

        checkSession();
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);