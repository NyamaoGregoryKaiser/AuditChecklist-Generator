import React, { useState, useEffect } from 'react';
import { Box, Container, Grid, Paper, Typography, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Chip, CircularProgress } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { Audit, User } from '../../types/api';
import { auditApi } from '../../services/api';
import { format } from 'date-fns';
import { Visibility, Edit, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const AdminDashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [tabValue, setTabValue] = useState(0);
    const [users, setUsers] = useState<User[]>([]);
    const [audits, setAudits] = useState<Audit[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersResponse, auditsResponse] = await Promise.all([
                    auditApi.getUsers(),
                    auditApi.getAllAudits()
                ]);
                setUsers(Array.isArray(usersResponse) ? usersResponse : []);
                setAudits(Array.isArray(auditsResponse) ? auditsResponse : []);
            } catch (error) {
                console.error('Error fetching data:', error);
                setUsers([]);
                setAudits([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleViewAudit = (auditId: number) => {
        navigate(`/audits/${auditId}`);
    };

    const handleViewUser = (userId: number) => {
        navigate(`/admin/users/${userId}`);
    };

    const handleDeleteUser = async (userId: number) => {
        try {
            await auditApi.deleteUser(userId);
            setUsers(users.filter(user => user.id !== userId));
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}>
                {/* Header */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h4" gutterBottom>
                            Admin Dashboard
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                            Welcome back, {user?.username}
                        </Typography>
                    </Paper>
                </Grid>

                {/* Stats Cards */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
                        <Typography variant="h6" gutterBottom>
                            Total Users
                        </Typography>
                        <Typography variant="h3">
                            {Array.isArray(users) ? users.length : 0}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
                        <Typography variant="h6" gutterBottom>
                            Total Audits
                        </Typography>
                        <Typography variant="h3">
                            {Array.isArray(audits) ? audits.length : 0}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
                        <Typography variant="h6" gutterBottom>
                            Completed Audits
                        </Typography>
                        <Typography variant="h3">
                            {Array.isArray(audits) ? audits.filter(audit => audit.is_completed).length : 0}
                        </Typography>
                    </Paper>
                </Grid>

                {/* Tabs */}
                <Grid item xs={12}>
                    <Paper sx={{ width: '100%' }}>
                        <Tabs
                            value={tabValue}
                            onChange={handleTabChange}
                            indicatorColor="primary"
                            textColor="primary"
                        >
                            <Tab label="Users" />
                            <Tab label="All Audits" />
                        </Tabs>

                        {/* Users Tab */}
                        <TabPanel value={tabValue} index={0}>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Username</TableCell>
                                            <TableCell>Email</TableCell>
                                            <TableCell>Role</TableCell>
                                            <TableCell>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {Array.isArray(users) && users.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell>{user.username}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={user.is_staff ? 'Admin' : 'User'}
                                                        color={user.is_staff ? 'primary' : 'default'}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <IconButton onClick={() => navigate(`/admin/users/${user.id}/edit`)}>
                                                        <Edit />
                                                    </IconButton>
                                                    <IconButton onClick={() => handleDeleteUser(user.id)}>
                                                        <Delete />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </TabPanel>

                        {/* Audits Tab */}
                        <TabPanel value={tabValue} index={1}>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Title</TableCell>
                                            <TableCell>Created By</TableCell>
                                            <TableCell>Created At</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {Array.isArray(audits) && audits.map((audit) => (
                                            <TableRow key={audit.id}>
                                                <TableCell>{audit.title}</TableCell>
                                                <TableCell>{audit.created_by.username}</TableCell>
                                                <TableCell>
                                                    {format(new Date(audit.created_at), 'MMM dd, yyyy')}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={audit.is_completed ? 'Completed' : 'In Progress'}
                                                        color={audit.is_completed ? 'success' : 'warning'}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <IconButton 
                                                        size="small"
                                                        onClick={() => handleViewAudit(audit.id)}
                                                    >
                                                        <Visibility />
                                                    </IconButton>
                                                    <IconButton size="small">
                                                        <Edit />
                                                    </IconButton>
                                                    <IconButton size="small" color="error">
                                                        <Delete />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </TabPanel>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default AdminDashboard; 