import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Grid,
    Paper,
    Typography,
    Button,
    Card,
    CardContent,
    CardActions,
    Chip,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Alert
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { Audit } from '../../types/api';
import { auditApi } from '../../services/api';

const AuditDashboard: React.FC = () => {
    const [audits, setAudits] = useState<Audit[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchAudits();
    }, []);

    const fetchAudits = async () => {
        try {
            const data = await auditApi.getAudits();
            setAudits(data);
        } catch (err) {
            setError('Failed to fetch audits');
            console.error('Error fetching audits:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (isCompleted: boolean, hasChecklists: boolean) => {
        if (isCompleted) return 'success';
        if (hasChecklists) return 'warning';
        return 'default';
    };

    const getStatusLabel = (isCompleted: boolean, hasChecklists: boolean) => {
        if (isCompleted) return 'COMPLETED';
        if (hasChecklists) return 'IN PROGRESS';
        return 'NOT STARTED';
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography variant="h4">Audit Dashboard</Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={() => navigate('/audits/create')}
                        >
                            Create New Audit
                        </Button>
                    </Box>
                </Grid>

                {error && (
                    <Grid item xs={12}>
                        <Alert severity="error">{error}</Alert>
                    </Grid>
                )}

                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Audit Summary
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            Total Audits: {audits.length}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            Completed: {audits.filter(a => a.is_completed).length}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            In Progress: {audits.filter(a => !a.is_completed && a.checklists?.length > 0).length}
                        </Typography>
                        <Typography variant="body1">
                            Not Started: {audits.filter(a => !a.is_completed && (!a.checklists || a.checklists.length === 0)).length}
                        </Typography>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Recent Audits
                        </Typography>
                        <List>
                            {audits.slice(0, 5).map((audit) => (
                                <ListItem key={audit.id} button onClick={() => navigate(`/audits/${audit.id}`)}>
                                    <ListItemText
                                        primary={audit.title}
                                        secondary={
                                            <React.Fragment>
                                                <Typography component="span" variant="body2" color="text.primary">
                                                    Status: {audit.is_completed ? 'Completed' : (audit.checklists?.length > 0 ? 'In Progress' : 'Not Started')}
                                                </Typography>
                                                <br />
                                                <Typography component="span" variant="body2" color="text.secondary">
                                                    Created: {new Date(audit.created_at).toLocaleDateString()}
                                                </Typography>
                                            </React.Fragment>
                                        }
                                    />
                                    <ListItemSecondaryAction>
                                        <Chip
                                            label={getStatusLabel(audit.is_completed, audit.checklists?.length > 0)}
                                            color={getStatusColor(audit.is_completed, audit.checklists?.length > 0)}
                                            size="small"
                                        />
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default AuditDashboard; 