import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import { userApi } from '../services/api';
import { User } from '../types/api';

const ProfilePage: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await userApi.getCurrentUserProfile();
                setUser(data);
            } catch (error) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;
    }

    if (!user) {
        return <Typography color="error">Failed to load profile.</Typography>;
    }

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <Paper sx={{ p: 4, minWidth: 300 }}>
                <Typography variant="h4" gutterBottom>Profile</Typography>
                <Typography variant="body1"><b>Username:</b> {user.username}</Typography>
                <Typography variant="body1"><b>Email:</b> {user.email}</Typography>
                <Typography variant="body1"><b>Role:</b> {user.is_staff ? 'Admin' : 'User'}</Typography>
            </Paper>
        </Box>
    );
};

export default ProfilePage; 