import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    Box,
    Grid,
    Button,
    CircularProgress,
    Alert,
    List,
    ListItem,
    ListItemText,
    Checkbox,
    TextField,
    Divider,
    Chip
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { auditApi } from '../../services/api';
import type { Audit } from '../../types/api';

const AuditDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [audit, setAudit] = useState<Audit | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notes, setNotes] = useState<{ [key: number]: string }>({});

    useEffect(() => {
        fetchAudit();
    }, [id]);

    const fetchAudit = async () => {
        try {
            const data = await auditApi.getAudit(Number(id));
            setAudit(data);
            // Initialize notes for each checklist item
            const initialNotes: { [key: number]: string } = {};
            data.checklists.forEach(item => {
                initialNotes[item.id] = item.notes || '';
            });
            setNotes(initialNotes);
        } catch (err) {
            setError('Failed to fetch audit details');
            console.error('Error fetching audit:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this audit?')) {
            try {
                await auditApi.deleteAudit(Number(id));
                navigate('/audits');
            } catch (err) {
                setError('Failed to delete audit');
                console.error('Error deleting audit:', err);
            }
        }
    };

    const handleChecklistItemChange = async (itemId: number, isCompleted: boolean) => {
        if (!audit) return;

        try {
            await auditApi.updateChecklistItem(itemId, {
                is_completed: isCompleted,
                notes: notes[itemId] || ''
            });

            // Update local state
            setAudit(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    checklists: prev.checklists.map(item =>
                        item.id === itemId ? { ...item, is_completed: isCompleted } : item
                    )
                };
            });
        } catch (err) {
            setError('Failed to update checklist item');
            console.error('Error updating checklist item:', err);
        }
    };

    const handleNotesChange = async (itemId: number, newNotes: string) => {
        setNotes(prev => ({ ...prev, [itemId]: newNotes }));
    };

    const handleNotesBlur = async (itemId: number) => {
        if (!audit) return;

        try {
            await auditApi.updateChecklistItem(itemId, {
                is_completed: audit.checklists.find(item => item.id === itemId)?.is_completed || false,
                notes: notes[itemId] || ''
            });
        } catch (err) {
            setError('Failed to update notes');
            console.error('Error updating notes:', err);
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
    const groupedItems = audit.checklists.reduce((acc, item) => {
        if (item.item.startsWith('Category')) {
            acc[item.item] = [];
        } else if (Object.keys(acc).length > 0) {
            const currentCategory = Object.keys(acc)[Object.keys(acc).length - 1];
            acc[currentCategory].push(item);
        }
        return acc;
    }, {} as { [key: string]: typeof audit.checklists });

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
                    <Box>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<EditIcon />}
                            onClick={() => navigate(`/audits/${id}/edit`)}
                            sx={{ mr: 1 }}
                        >
                            Edit
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={handleDelete}
                        >
                            Delete
                        </Button>
                    </Box>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h5" gutterBottom>
                            Basic Information
                        </Typography>
                        <Typography variant="body1" paragraph>
                            <strong>Title:</strong> {audit.title}
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
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Typography variant="h5" gutterBottom>
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
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="h5" gutterBottom>
                            Checklist Items
                        </Typography>
                        <Typography variant="body1" paragraph>
                            <strong>Total Items:</strong> {audit.checklists.length} items
                        </Typography>
                        <List>
                            {Object.entries(groupedItems).map(([category, items]) => (
                                <React.Fragment key={category}>
                                    <ListItem>
                                        <ListItemText
                                            primary={category}
                                            primaryTypographyProps={{
                                                variant: 'h6',
                                                color: 'primary'
                                            }}
                                        />
                                    </ListItem>
                                    {items.map((item) => (
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
                                                <Checkbox
                                                    checked={item.is_completed}
                                                    onChange={(e) => handleChecklistItemChange(item.id, e.target.checked)}
                                                />
                                                <ListItemText
                                                    primary={item.item}
                                                    sx={{
                                                        textDecoration: item.is_completed ? 'line-through' : 'none',
                                                        color: item.is_completed ? 'text.secondary' : 'text.primary'
                                                    }}
                                                />
                                            </Box>
                                            <TextField
                                                fullWidth
                                                multiline
                                                rows={2}
                                                placeholder="Add notes..."
                                                value={notes[item.id] || ''}
                                                onChange={(e) => handleNotesChange(item.id, e.target.value)}
                                                onBlur={() => handleNotesBlur(item.id)}
                                                sx={{ mt: 1, ml: 4 }}
                                            />
                                        </ListItem>
                                    ))}
                                    <Divider />
                                </React.Fragment>
                            ))}
                        </List>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
};

export default AuditDetails; 