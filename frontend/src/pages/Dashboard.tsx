import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
    const { user } = useAuth();

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Welcome, {user?.username}!
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    This is your personal dashboard where you can manage your audits.
                </Typography>
            </Box>
        </Container>
    );
};

export default Dashboard; 