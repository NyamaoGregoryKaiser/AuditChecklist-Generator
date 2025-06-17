import React, { useEffect, useState } from 'react';
import { Box, Button, CircularProgress, Paper, Typography, List, ListItem, ListItemText } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { auditApi } from '../services/api';
import { Audit } from '../types/api';

const AuditsPage: React.FC = () => {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAudits = async () => {
      try {
        const data = await auditApi.getAudits();
        setAudits(data);
      } catch (error) {
        setAudits([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAudits();
  }, []);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">My Audits</Typography>
          <Button variant="contained" color="primary" onClick={() => navigate('/create-audit')}>
            Create Audit
          </Button>
        </Box>
        {audits.length === 0 ? (
          <Typography>No audits found.</Typography>
        ) : (
          <List>
            {audits.map((audit) => (
              <ListItem
                key={audit.id}
                button
                onClick={() => navigate(`/audits/${audit.id}`)}
              >
                <ListItemText
                  primary={audit.title}
                  secondary={audit.description}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default AuditsPage; 