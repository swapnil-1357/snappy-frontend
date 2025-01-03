import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from './ui/use-toast';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if(!isAuthenticated){
            toast({
                title: 'Unauthorized',
                description: 'You must have to sign in',
                variant: 'destructive'
            })
            navigate('/sign-in')
        }
    }, [isAuthenticated, navigate]);

    return children;
};

export default ProtectedRoute;
