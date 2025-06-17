import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import theme from './theme';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserDetails from './pages/admin/UserDetails';
import Layout from './components/Layout';
import AuditDashboard from './components/audit/AuditDashboard';
import CreateAudit from './components/audit/CreateAudit';
import AuditDetails from './pages/audit/AuditDetails';
import ChecklistView from './components/audit/ChecklistView';
import ReviewView from './components/audit/ReviewView';
import ResultsView from './components/audit/ResultsView';
import ProfilePage from './pages/ProfilePage';
import AuditsList from './components/audit/AuditsList';
import EditUser from './pages/admin/EditUser';

const AppRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/" element={
                <ProtectedRoute>
                    <Layout />
                </ProtectedRoute>
            }>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="admin" element={
                    <ProtectedRoute requireAdmin>
                        <Outlet />
                    </ProtectedRoute>
                }>
                    <Route index element={<AdminDashboard />} />
                    <Route path="users/:id" element={<UserDetails />} />
                    <Route path="users/:id/edit" element={<EditUser />} />
                </Route>
                <Route path="audits" element={
                    <ProtectedRoute>
                        <Outlet />
                    </ProtectedRoute>
                }>
                    <Route index element={<AuditsList />} />
                    <Route path="create" element={<CreateAudit />} />
                    <Route path=":id" element={<AuditDetails />} />
                    <Route path=":id/checklist" element={<ChecklistView />} />
                    <Route path=":id/review" element={<ReviewView />} />
                    <Route path=":id/results" element={<ResultsView />} />
                </Route>
                <Route path="profile" element={<ProfilePage />} />
            </Route>
        </Routes>
    );
};

const App: React.FC = () => {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
                <Router>
                    <AppRoutes />
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
};

export default App; 