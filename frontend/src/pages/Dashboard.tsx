import React from 'react';
import { Container } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import UserDashboard from '../components/dashboard/UserDashboard';
import AdminDashboard from '../components/dashboard/AdminDashboard';

const Dashboard: React.FC = () => {
    const { user, isViewingAsUser } = useAuth();

    return (
        <Container maxWidth="xl">
            {user?.is_staff && !isViewingAsUser ? (
                <AdminDashboard />
            ) : (
                <UserDashboard />
            )}
        </Container>
    );
};

export default Dashboard; 