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
    Radio,
    RadioGroup,
    FormControlLabel,
    TextField,
    CircularProgress,
    Alert,
    Divider
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { auditApi } from '../../services/api';
import type { Audit, ChecklistItem } from '../../types/api';

interface ChecklistResponse {
    checklist_item: number;
    response: 'yes' | 'no' | 'na';
    notes: string;
}

const ChecklistView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [audit, setAudit] = useState<Audit | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [responses, setResponses] = useState<{ [key: number]: ChecklistResponse }>({});

    useEffect(() => {
        fetchAudit();
    }, [id]);

    const fetchAudit = async () => {
        try {
            const auditData = await auditApi.getAudit(Number(id));
            setAudit(auditData);

            // Initialize responses for each checklist item
            const initialResponses: { [key: number]: ChecklistResponse } = {};
            auditData.checklists?.forEach((item: ChecklistItem) => {
                initialResponses[item.id] = {
                    checklist_item: item.id,
                    response: 'na',
                    notes: ''
                };
            });
            setResponses(initialResponses);
        } catch (err) {
            setError('Failed to fetch audit details');
            console.error('Error fetching audit:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleResponseChange = (itemId: number, response: 'yes' | 'no' | 'na') => {
        setResponses(prev => ({
            ...prev,
            [itemId]: {
                ...prev[itemId],
                response
            }
        }));
    };

    const handleNotesChange = (itemId: number, notes: string) => {
        setResponses(prev => ({
            ...prev,
            [itemId]: {
                ...prev[itemId],
                notes
            }
        }));
    };

    const handleSubmit = async () => {
        if (!audit) return;

        try {
            // Submit responses
            await Promise.all(
                Object.values(responses).map(response =>
                    auditApi.submitChecklistResponse(audit.id, response)
                )
            );

            // Mark audit as completed
            await auditApi.updateAudit(audit.id, {
                is_completed: true,
                completion_date: new Date().toISOString()
            });

            navigate(`/audits/${audit.id}/results`);
        } catch (err) {
            setError('Failed to submit checklist');
            console.error('Error submitting checklist:', err);
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
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                    >
                        Submit Checklist
                    </Button>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Typography variant="h5" gutterBottom>
                    {audit.title} - Checklist
                </Typography>

                <List>
                    {audit.checklists?.map((item: ChecklistItem, index: number) => (
                        <ListItem key={item.id} divider>
                            <ListItemText
                                primary={
                                    <Typography variant="subtitle1">
                                        {index + 1}. {item.item}
                                    </Typography>
                                }
                                secondary={
                                    <Box sx={{ mt: 2 }}>
                                        <RadioGroup
                                            row
                                            value={responses[item.id]?.response || 'na'}
                                            onChange={(e) => handleResponseChange(item.id, e.target.value as 'yes' | 'no' | 'na')}
                                        >
                                            <FormControlLabel
                                                value="yes"
                                                control={<Radio />}
                                                label="Yes"
                                            />
                                            <FormControlLabel
                                                value="no"
                                                control={<Radio />}
                                                label="No"
                                            />
                                            <FormControlLabel
                                                value="na"
                                                control={<Radio />}
                                                label="N/A"
                                            />
                                        </RadioGroup>
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={2}
                                            placeholder="Add notes..."
                                            value={responses[item.id]?.notes || ''}
                                            onChange={(e) => handleNotesChange(item.id, e.target.value)}
                                            sx={{ mt: 2 }}
                                        />
                                    </Box>
                                }
                            />
                        </ListItem>
                    ))}
                </List>
            </Paper>
        </Container>
    );
};

export default ChecklistView; 