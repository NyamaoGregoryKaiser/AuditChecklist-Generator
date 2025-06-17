import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    MenuItem,
    Grid,
    Alert,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    DialogContentText
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { auditApi } from '../../services/api';

const industries = [
    'Manufacturing',
    'Healthcare',
    'Retail',
    'Technology',
    'Finance',
    'Education',
    'Construction',
    'Transportation',
    'Energy',
    'Agriculture',
    'Other'
];

const auditTypes = [
    'compliance',
    'financial',
    'operational',
    'IT',
    'security',
    'quality',
    'environmental',
    'health_safety',
    'internal',
    'external'
];

const complexityLevels = [
    'basic',
    'intermediate',
    'advanced'
];

const CreateAudit: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        audit_type: '',
        organization: '',
        industry: '',
        specific_requirements: '',
        complexity_level: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [generatingChecklist, setGeneratingChecklist] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Show the checklist generation dialog
            setGeneratingChecklist(true);
            
            // Create the audit and generate the checklist
            const response = await auditApi.createAudit(formData);
            
            // Navigate to the audit details page with the new audit ID
            navigate(`/audits/${response.id}`);
        } catch (err) {
            setError('Failed to create audit. Please try again.');
            console.error('Error creating audit:', err);
            setGeneratingChecklist(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Paper sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h4">Create New Audit</Typography>
                    <Button
                        variant="outlined"
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

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                label="Title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Enter audit title"
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                required
                                fullWidth
                                select
                                label="Audit Type"
                                name="audit_type"
                                value={formData.audit_type}
                                onChange={handleChange}
                            >
                                {auditTypes.map((type) => (
                                    <MenuItem key={type} value={type}>
                                        {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                required
                                fullWidth
                                label="Organization"
                                name="organization"
                                value={formData.organization}
                                onChange={handleChange}
                                placeholder="Enter organization name"
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                required
                                fullWidth
                                select
                                label="Industry"
                                name="industry"
                                value={formData.industry}
                                onChange={handleChange}
                            >
                                {industries.map((option) => (
                                    <MenuItem key={option} value={option}>
                                        {option}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                required
                                fullWidth
                                select
                                label="Complexity Level"
                                name="complexity_level"
                                value={formData.complexity_level}
                                onChange={handleChange}
                            >
                                {complexityLevels.map((level) => (
                                    <MenuItem key={level} value={level}>
                                        {level.charAt(0).toUpperCase() + level.slice(1)}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                multiline
                                rows={4}
                                label="Specific Requirements"
                                name="specific_requirements"
                                value={formData.specific_requirements}
                                onChange={handleChange}
                                placeholder="Enter specific requirements or standards to audit against"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Box display="flex" justifyContent="flex-end" gap={2}>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate('/audits')}
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    disabled={loading}
                                    startIcon={loading ? <CircularProgress size={20} /> : null}
                                >
                                    {loading ? 'Creating...' : 'Create Audit'}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Paper>

            {/* Checklist Generation Dialog */}
            <Dialog
                open={generatingChecklist}
                aria-labelledby="checklist-generation-dialog-title"
                aria-describedby="checklist-generation-dialog-description"
            >
                <DialogTitle id="checklist-generation-dialog-title">
                    Generating Audit Checklist
                </DialogTitle>
                <DialogContent>
                    <Box display="flex" flexDirection="column" alignItems="center" py={2}>
                        <CircularProgress size={60} />
                        <DialogContentText id="checklist-generation-dialog-description" sx={{ mt: 2 }}>
                            Please wait while we generate your customized audit checklist...
                        </DialogContentText>
                    </Box>
                </DialogContent>
            </Dialog>
        </Container>
    );
};

export default CreateAudit; 