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

interface ChecklistResponse {
    checklist_item: number;
    response: 'yes' | 'no' | 'na';
    notes: string;
}

const ResultsView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [audit, setAudit] = useState<Audit | null>(null);
    const [responses, setResponses] = useState<ChecklistResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAudit();
    }, [id]);

    const fetchAudit = async () => {
        try {
            const data = await auditApi.getAudit(Number(id));
            setAudit(data);
            // Fetch responses
            const responseData = await auditApi.getAuditResponses(Number(id));
            setResponses(responseData);
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

    const getResponseColor = (response: string) => {
        switch (response) {
            case 'yes':
                return 'success';
            case 'no':
                return 'error';
            default:
                return 'default';
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate(`/audits/${audit.id}`)}
                    >
                        Back to Audit
                    </Button>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Typography variant="h5" gutterBottom>
                    {audit.title} - Results
                </Typography>

                <Box sx={{ mt: 3 }}>
                    <List>
                        {audit.checklists?.map((item: ChecklistItem, index: number) => {
                            const response = responses.find(r => r.checklist_item === item.id);
                            return (
                                <React.Fragment key={item.id}>
                                    <ListItem>
                                        <ListItemText
                                            primary={
                                                <Typography variant="subtitle1">
                                                    {index + 1}. {item.item}
                                                </Typography>
                                            }
                                            secondary={
                                                <Box sx={{ mt: 1 }}>
                                                    <Chip
                                                        label={response?.response.toUpperCase() || 'N/A'}
                                                        color={getResponseColor(response?.response || 'na')}
                                                        size="small"
                                                        sx={{ mr: 1 }}
                                                    />
                                                    {response?.notes && (
                                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                            Notes: {response.notes}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                    {index < (audit.checklists?.length || 0) - 1 && <Divider />}
                                </React.Fragment>
                            );
                        })}
                    </List>
                </Box>
            </Paper>
        </Container>
    );
};

export default ResultsView; 