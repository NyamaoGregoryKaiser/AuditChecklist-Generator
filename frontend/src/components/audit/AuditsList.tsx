import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    Button,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon
} from '@mui/icons-material';
import { auditApi } from '../../services/api';
import type { Audit } from '../../types/api';

const AuditsList: React.FC = () => {
    const navigate = useNavigate();
    const [audits, setAudits] = useState<Audit[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this audit?')) {
            try {
                await auditApi.deleteAudit(id);
                setAudits(audits.filter(audit => audit.id !== id));
            } catch (err) {
                setError('Failed to delete audit');
                console.error('Error deleting audit:', err);
            }
        }
    };

    const getStatusColor = (isCompleted: boolean) => {
        return isCompleted ? 'success' : 'warning';
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
            <Paper sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h4">Audits</Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/audits/create')}
                    >
                        Create New Audit
                    </Button>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Title</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Created</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {audits.map((audit: Audit) => (
                                <TableRow key={audit.id}>
                                    <TableCell>{audit.title}</TableCell>
                                    <TableCell>{audit.description}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={audit.is_completed ? 'Completed' : 'In Progress'}
                                            color={getStatusColor(audit.is_completed)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {new Date(audit.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            color="primary"
                                            onClick={() => navigate(`/audits/${audit.id}`)}
                                            title="View"
                                        >
                                            <ViewIcon />
                                        </IconButton>
                                        <IconButton
                                            color="primary"
                                            onClick={() => navigate(`/audits/${audit.id}/edit`)}
                                            title="Edit"
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            color="error"
                                            onClick={() => handleDelete(audit.id)}
                                            title="Delete"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {audits.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        No audits found. Create your first audit to get started.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Container>
    );
};

export default AuditsList; 