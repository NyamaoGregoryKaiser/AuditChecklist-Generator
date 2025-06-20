import React from 'react';
import { Box, Typography } from '@mui/material';
import {
    PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    BarChart, Bar, ResponsiveContainer, AreaChart, Area, RadarChart, PolarGrid,
    PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import DashboardGrid from './DashboardGrid';

// Mock data - Replace with actual API data
const userActivityData = [
    { date: '2024-01', activeUsers: 120, newUsers: 15 },
    { date: '2024-02', activeUsers: 150, newUsers: 20 },
    { date: '2024-03', activeUsers: 180, newUsers: 25 },
    { date: '2024-04', activeUsers: 200, newUsers: 30 },
];

const complianceData = [
    { department: 'HR', compliance: 95 },
    { department: 'IT', compliance: 88 },
    { department: 'Finance', compliance: 92 },
    { department: 'Operations', compliance: 85 },
];

const auditQualityData = [
    { subject: 'Completeness', A: 90, B: 85, C: 80 },
    { subject: 'Accuracy', A: 85, B: 80, C: 75 },
    { subject: 'Timeliness', A: 95, B: 90, C: 85 },
    { subject: 'Documentation', A: 88, B: 83, C: 78 },
];

const systemMetrics = [
    { time: '00:00', load: 30, users: 50 },
    { time: '04:00', load: 20, users: 30 },
    { time: '08:00', load: 80, users: 150 },
    { time: '12:00', load: 90, users: 200 },
    { time: '16:00', load: 85, users: 180 },
    { time: '20:00', load: 60, users: 100 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AdminDashboard: React.FC = () => {
    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Admin Dashboard
            </Typography>
            <DashboardGrid>
                {/* User Activity Overview */}
                <Box>
                    <Typography variant="h6" gutterBottom>
                        User Activity Overview
                    </Typography>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={userActivityData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="activeUsers" stroke="#8884d8" />
                            <Line type="monotone" dataKey="newUsers" stroke="#82ca9d" />
                        </LineChart>
                    </ResponsiveContainer>
                </Box>

                {/* Compliance Metrics */}
                <Box>
                    <Typography variant="h6" gutterBottom>
                        Compliance Metrics
                    </Typography>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={complianceData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="department" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="compliance" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </Box>

                {/* Audit Quality Metrics */}
                <Box>
                    <Typography variant="h6" gutterBottom>
                        Audit Quality Metrics
                    </Typography>
                    <ResponsiveContainer width="100%" height={250}>
                        <RadarChart data={auditQualityData}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="subject" />
                            <PolarRadiusAxis />
                            <Radar name="Grade A" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                            <Radar name="Grade B" dataKey="B" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                            <Radar name="Grade C" dataKey="C" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
                            <Legend />
                        </RadarChart>
                    </ResponsiveContainer>
                </Box>

                {/* System Performance */}
                <Box>
                    <Typography variant="h6" gutterBottom>
                        System Performance
                    </Typography>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={systemMetrics}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Area type="monotone" dataKey="load" stroke="#8884d8" fill="#8884d8" />
                            <Area type="monotone" dataKey="users" stroke="#82ca9d" fill="#82ca9d" />
                        </AreaChart>
                    </ResponsiveContainer>
                </Box>

                {/* Department Performance */}
                <Box>
                    <Typography variant="h6" gutterBottom>
                        Department Performance
                    </Typography>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={complianceData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="department" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="compliance" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </Box>

                {/* Real-time Monitoring */}
                <Box>
                    <Typography variant="h6" gutterBottom>
                        Real-time Monitoring
                    </Typography>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={systemMetrics}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="load" stroke="#8884d8" />
                            <Line type="monotone" dataKey="users" stroke="#82ca9d" />
                        </LineChart>
                    </ResponsiveContainer>
                </Box>
            </DashboardGrid>
        </Box>
    );
};

export default AdminDashboard; 