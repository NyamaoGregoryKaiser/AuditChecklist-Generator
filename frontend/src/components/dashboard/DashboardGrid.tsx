import React from 'react';
import { Grid, Paper, Box } from '@mui/material';

interface DashboardGridProps {
    children: React.ReactNode;
}

const DashboardGrid: React.FC<DashboardGridProps> = ({ children }) => {
    return (
        <Grid container spacing={3}>
            {React.Children.map(children, (child) => (
                <Grid item xs={12} md={6} lg={4}>
                    <Paper
                        sx={{
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                            minHeight: 300,
                        }}
                    >
                        {child}
                    </Paper>
                </Grid>
            ))}
        </Grid>
    );
};

export default DashboardGrid; 