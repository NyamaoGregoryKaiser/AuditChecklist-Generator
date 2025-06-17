import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Paper,
    Typography,
    Button,
    CircularProgress,
    Alert,
    Grid,
    Chip,
    Divider
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { User } from '../../types/api';
import { userApi } from '../../services/api';

const UserDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await userApi.getUser(Number(id));
                setUser(data);
            } catch (err) {
                setError('Failed to load user details');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [id]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error || !user) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Alert severity="error">{error || 'User not found'}</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Paper sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h4">User Details</Typography>
                    <Button
                        variant="outlined"
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/admin')}
                    >
                        Back to Admin Dashboard
                    </Button>
                </Box>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom>Basic Information</Typography>
                        <Box mb={2}>
                            <Typography variant="subtitle2" color="text.secondary">Username</Typography>
                            <Typography variant="body1">{user.username}</Typography>
                        </Box>
                        <Box mb={2}>
                            <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                            <Typography variant="body1">{user.email}</Typography>
                        </Box>
                        <Box mb={2}>
                            <Typography variant="subtitle2" color="text.secondary">Role</Typography>
                            <Chip
                                label={user.is_staff ? 'Admin' : 'User'}
                                color={user.is_staff ? 'primary' : 'default'}
                                size="small"
                            />
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                        <Box display="flex" gap={2}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => navigate(`/admin/users/${id}/edit`)}
                            >
                                Edit User
                            </Button>
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={() => {
                                    // TODO: Implement delete functionality
                                    if (window.confirm('Are you sure you want to delete this user?')) {
                                        // Handle delete
                                    }
                                }}
                            >
                                Delete User
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
};

export default UserDetails; 