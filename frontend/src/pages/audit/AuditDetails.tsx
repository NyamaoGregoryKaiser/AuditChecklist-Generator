import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    Box,
    Button,
    List,
    ListItem,
    ListItemText,
    CircularProgress,
    Alert,
    Divider,
    Chip
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { auditApi } from '../../services/api';
import type { Audit, ChecklistItem } from '../../types/api';

const AuditDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [audit, setAudit] = useState<Audit | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAudit();
    }, [id]);

    const fetchAudit = async () => {
        try {
            const data = await auditApi.getAudit(Number(id));
            setAudit(data);
        } catch (err) {
            setError('Failed to fetch audit details');
            console.error('Error fetching audit:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    if (!audit) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Alert severity="error">Audit not found</Alert>
            </Container>
        );
    }

    // Group checklist items by category
    const groupedItems = audit.checklists?.reduce((acc: { [key: string]: ChecklistItem[] }, item: ChecklistItem) => {
        if (item.item.startsWith('Category')) {
            acc[item.item] = [];
        } else if (Object.keys(acc).length > 0) {
            const currentCategory = Object.keys(acc)[Object.keys(acc).length - 1];
            acc[currentCategory].push(item);
        }
        return acc;
    }, {}) || {};

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/audits')}
                    >
                        Back to Audits
                    </Button>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Typography variant="h5" gutterBottom>
                    {audit.title}
                </Typography>

                <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Basic Information
                    </Typography>
                    <Typography variant="body1" paragraph>
                        <strong>Description:</strong> {audit.description}
                    </Typography>
                    <Typography variant="body1" paragraph>
                        <strong>Status:</strong>{' '}
                        <Chip
                            label={audit.is_completed ? 'Completed' : 'In Progress'}
                            color={audit.is_completed ? 'success' : 'warning'}
                            size="small"
                        />
                    </Typography>
                    <Typography variant="body1" paragraph>
                        <strong>Created At:</strong>{' '}
                        {new Date(audit.created_at).toLocaleDateString()}
                    </Typography>

                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 4 }}>
                        Creator Information
                    </Typography>
                    <Typography variant="body1" paragraph>
                        <strong>Created By:</strong> {audit.created_by.username}
                    </Typography>
                    <Typography variant="body1" paragraph>
                        <strong>Email:</strong> {audit.created_by.email}
                    </Typography>
                    <Typography variant="body1" paragraph>
                        <strong>Role:</strong> {audit.created_by.is_staff ? 'Admin' : 'User'}
                    </Typography>

                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 4 }}>
                        Checklist Items
                    </Typography>
                    <Typography variant="body1" paragraph>
                        <strong>Total Items:</strong> {audit.checklists?.length || 0} items
                    </Typography>

                    <List>
                        {Object.entries(groupedItems).map(([category, items]) => (
                            <React.Fragment key={category}>
                                <ListItem>
                                    <ListItemText
                                        primary={
                                            <Typography variant="h6" color="primary">
                                                {category}
                                            </Typography>
                                        }
                                    />
                                </ListItem>
                                {items.map((item: ChecklistItem) => (
                                    <ListItem
                                        key={item.id}
                                        sx={{
                                            pl: 4,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'flex-start'
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                            <ListItemText
                                                primary={item.item}
                                                secondary={
                                                    <Box mt={1}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Notes: {item.notes || 'No notes'}
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                        </Box>
                                    </ListItem>
                                ))}
                                <Divider />
                            </React.Fragment>
                        ))}
                    </List>

                    <Box sx={{ mt: 3 }}>
                        {!audit.is_completed && (
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => navigate(`/audits/${audit.id}/checklist`)}
                            >
                                {audit.checklists?.length ? 'Continue Checklist' : 'Start Checklist'}
                            </Button>
                        )}
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => navigate(`/audits/${audit.id}/results`)}
                            sx={{ ml: 2 }}
                        >
                            View Results
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default AuditDetails; 