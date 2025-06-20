import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import AuditsList from '../../components/audit/AuditsList';

const ClientsPage: React.FC = () => {
    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Client View
            </Typography>
            <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Audits
                </Typography>
                <AuditsList />
            </Paper>
        </Box>
    );
};

export default ClientsPage; 