import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Paper,
    Typography,
    Button,
    CircularProgress,
    Alert,
    List,
    ListItem,
    ListItemText,
    Chip,
    Divider,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { Audit, AuditResponse, ChecklistItem } from '../../types/api';
import { auditApi } from '../../services/api';
import Layout from '../common/Layout';

const ReviewView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [audit, setAudit] = useState<Audit | null>(null);
    const [responses, setResponses] = useState<AuditResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [auditData, responsesData] = await Promise.all([
                    auditApi.getAudit(Number(id)),
                    auditApi.getAuditResponses(Number(id))
                ]);
                setAudit(auditData);
                setResponses(responsesData);
            } catch (err) {
                setError('Failed to load audit review data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleComplete = async () => {
        try {
            setLoading(true);
            await auditApi.completeAudit(Number(id));
            navigate(`/audits/${id}/results`);
        } catch (err) {
            setError('Failed to complete audit');
            setLoading(false);
        }
    };

    if (loading && !audit) {
        return (
            <Layout>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                    <CircularProgress />
                </Box>
            </Layout>
        );
    }

    if (error || !audit) {
        return (
            <Layout>
                <Box maxWidth="800px" mx="auto">
                    <Alert severity="error">{error || 'Audit not found'}</Alert>
                </Box>
            </Layout>
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
        <Layout>
            <Box maxWidth="800px" mx="auto">
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h5" gutterBottom>
                        {audit.title} - Review
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

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

                    <Box display="flex" gap={2} mt={4}>
                        <Button
                            variant="outlined"
                            onClick={() => navigate(`/audits/${id}/checklist`)}
                        >
                            Back to Checklist
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleComplete}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Complete Audit'}
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Layout>
    );
};

export default ReviewView; 