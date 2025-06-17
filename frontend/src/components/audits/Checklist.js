import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auditService } from '../../services/audit';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Divider,
  Card,
  CardContent,
  CardActions
} from '@mui/material';

const steps = ['Information Gathering', 'Assessment', 'Review'];

const Checklist = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [audit, setAudit] = useState(null);
  const [checklist, setChecklist] = useState(null);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAudit();
  }, [id]);

  const fetchAudit = async () => {
    try {
      const [auditData, checklistData] = await Promise.all([
        auditService.getAudit(id),
        auditService.getChecklist(id)
      ]);
      setAudit(auditData);
      setChecklist(checklistData);
      // Initialize responses
      const initialResponses = {};
      checklistData.categories.forEach(category => {
        category.questions.forEach(question => {
          initialResponses[question.id] = {
            answer: '',
            notes: ''
          };
        });
      });
      setResponses(initialResponses);
    } catch (err) {
      setError('Failed to fetch audit data');
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (questionId, field, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [field]: value
      }
    }));
  };

  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await auditService.submitResponses(id, responses);
      navigate(`/audits/${id}/results`);
    } catch (err) {
      setError('Failed to submit responses');
    } finally {
      setSubmitting(false);
    }
  };

  const isStepComplete = (step) => {
    if (step === 0) {
      // Check if all required information is filled
      return true;
    }
    if (step === 1) {
      // Check if all questions have been answered
      return Object.values(responses).every(response => response.answer !== '');
    }
    return true;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!audit || !checklist) {
    return (
      <Container>
        <Alert severity="error">Audit not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {audit.title}
        </Typography>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {activeStep === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Information Gathering
            </Typography>
            <Typography variant="body1" paragraph>
              Review the audit scope and objectives before proceeding with the assessment.
            </Typography>
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Scope
                </Typography>
                <Typography variant="body1" paragraph>
                  {audit.scope}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  Objectives
                </Typography>
                <Typography variant="body1">
                  {audit.objectives}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        )}

        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Assessment
            </Typography>
            {checklist.categories.map((category) => (
              <Box key={category.id} sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  {category.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {category.description}
                </Typography>
                {category.questions.map((question) => (
                  <Card key={question.id} variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        {question.text}
                      </Typography>
                      <FormControl component="fieldset" sx={{ mb: 2 }}>
                        <RadioGroup
                          value={responses[question.id]?.answer || ''}
                          onChange={(e) => handleResponseChange(question.id, 'answer', e.target.value)}
                        >
                          <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                          <FormControlLabel value="no" control={<Radio />} label="No" />
                          <FormControlLabel value="na" control={<Radio />} label="Not Applicable" />
                        </RadioGroup>
                      </FormControl>
                      <TextField
                        fullWidth
                        label="Notes"
                        multiline
                        rows={2}
                        value={responses[question.id]?.notes || ''}
                        onChange={(e) => handleResponseChange(question.id, 'notes', e.target.value)}
                      />
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ))}
          </Box>
        )}

        {activeStep === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review
            </Typography>
            <Typography variant="body1" paragraph>
              Please review your responses before submitting the audit. You can go back to make changes if needed.
            </Typography>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Summary
                </Typography>
                <Typography variant="body2" paragraph>
                  Total Questions: {Object.keys(responses).length}
                </Typography>
                <Typography variant="body2" paragraph>
                  Answered Questions: {Object.values(responses).filter(r => r.answer !== '').length}
                </Typography>
                <Typography variant="body2">
                  Unanswered Questions: {Object.values(responses).filter(r => r.answer === '').length}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>
          <Box>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={submitting || !isStepComplete(activeStep)}
              >
                {submitting ? (
                  <>
                    <CircularProgress size={24} sx={{ mr: 1 }} />
                    Submitting...
                  </>
                ) : (
                  'Submit Audit'
                )}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!isStepComplete(activeStep)}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Checklist; 