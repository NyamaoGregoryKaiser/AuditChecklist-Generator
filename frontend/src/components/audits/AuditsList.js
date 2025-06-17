import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auditService } from '../../services/audit';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

const AuditsList = () => {
  const navigate = useNavigate();
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAudits();
  }, []);

  const fetchAudits = async () => {
    try {
      const data = await auditService.getAudits();
      setAudits(data);
    } catch (err) {
      setError('Failed to fetch audits');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success.main';
      case 'in_progress':
        return 'warning.main';
      default:
        return 'error.main';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon />;
      case 'in_progress':
        return <WarningIcon />;
      default:
        return <AssessmentIcon />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Audits
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Grid container spacing={2}>
          {audits.length === 0 ? (
            <Grid item xs={12}>
              <Typography variant="body1" color="text.secondary">
                No audits found. Create a new audit to get started.
              </Typography>
            </Grid>
          ) : (
            audits.map((audit) => (
              <Grid item xs={12} md={6} key={audit.id}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Box
                        sx={{
                          color: getStatusColor(audit.status),
                          mr: 1
                        }}
                      >
                        {getStatusIcon(audit.status)}
                      </Box>
                      <Typography variant="h6" component="div">
                        {audit.title}
                      </Typography>
                    </Box>
                    <Typography color="text.secondary" gutterBottom>
                      {audit.description}
                    </Typography>
                    <Typography variant="body2">
                      Created: {new Date(audit.created_at).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      onClick={() => navigate(`/audits/${audit.id}`)}
                    >
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Paper>
    </Container>
  );
};

export default AuditsList; 