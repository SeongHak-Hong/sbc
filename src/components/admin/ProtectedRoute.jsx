import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const ProtectedRoute = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        if (!auth) {
            console.warn('Firebase Auth is not initialized.');
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'Pretendard' }}>로딩 중...</div>;
    }

    if (!user) {
        return <Navigate to="/manager-lounge/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
