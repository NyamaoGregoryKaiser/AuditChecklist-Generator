import React from 'react';
import { Box, Typography } from '@mui/material';
import {
    PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    BarChart, Bar, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import DashboardGrid from './DashboardGrid';

// Mock data - Replace with actual API data
const auditStatusData = [
    { name: 'Not Started', value: 30 },
    { name: 'In Progress', value: 45 },
    { name: 'Completed', value: 25 },
];

const activityData = [
    { date: '2024-01', audits: 4, checklists: 12 },
    { date: '2024-02', audits: 6, checklists: 18 },
    { date: '2024-03', audits: 8, checklists: 24 },
    { date: '2024-04', audits: 5, checklists: 15 },
];

const checklistStats = [
    { category: 'Safety', completed: 85, total: 100 },
    { category: 'Quality', completed: 70, total: 100 },
    { category: 'Compliance', completed: 90, total: 100 },
    { category: 'Operations', completed: 75, total: 100 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const UserDashboard: React.FC = () => {
    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                User Dashboard
            </Typography>
            <DashboardGrid>
                {/* Audit Progress Overview */}
                <Box>
                    <Typography variant="h6" gutterBottom>
                        Audit Progress Overview
                    </Typography>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={auditStatusData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {auditStatusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </Box>

                {/* Recent Activity */}
                <Box>
                    <Typography variant="h6" gutterBottom>
                        Recent Activity
                    </Typography>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={activityData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="audits" stroke="#8884d8" />
                            <Line type="monotone" dataKey="checklists" stroke="#82ca9d" />
                        </LineChart>
                    </ResponsiveContainer>
                </Box>

                {/* Checklist Statistics */}
                <Box>
                    <Typography variant="h6" gutterBottom>
                        Checklist Statistics
                    </Typography>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={checklistStats}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="category" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="completed" fill="#8884d8" name="Completed" />
                            <Bar dataKey="total" fill="#82ca9d" name="Total" />
                        </BarChart>
                    </ResponsiveContainer>
                </Box>

                {/* Performance Metrics */}
                <Box>
                    <Typography variant="h6" gutterBottom>
                        Performance Metrics
                    </Typography>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={activityData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Area type="monotone" dataKey="audits" stroke="#8884d8" fill="#8884d8" />
                            <Area type="monotone" dataKey="checklists" stroke="#82ca9d" fill="#82ca9d" />
                        </AreaChart>
                    </ResponsiveContainer>
                </Box>
            </DashboardGrid>
        </Box>
    );
};

export default UserDashboard; 