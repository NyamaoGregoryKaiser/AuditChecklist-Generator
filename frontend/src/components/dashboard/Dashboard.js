import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { auditService } from '../../services/audit';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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
      <Grid container spacing={3}>
        {/* Welcome Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                Welcome, {user?.username}!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage your audits and track compliance
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate('/create-audit')}
            >
              Create New Audit
            </Button>
          </Paper>
        </Grid>

        {/* Statistics Cards */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Total Audits
            </Typography>
            <Typography component="p" variant="h4">
              {audits.length}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Completed Audits
            </Typography>
            <Typography component="p" variant="h4">
              {audits.filter(audit => audit.status === 'completed').length}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              In Progress
            </Typography>
            <Typography component="p" variant="h4">
              {audits.filter(audit => audit.status === 'in_progress').length}
            </Typography>
          </Paper>
        </Grid>

        {/* Recent Audits */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Audits
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Grid container spacing={2}>
              {audits.slice(0, 6).map((audit) => (
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
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 