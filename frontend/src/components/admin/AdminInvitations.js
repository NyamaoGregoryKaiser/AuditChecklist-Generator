import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import { Delete as DeleteIcon, Email as EmailIcon } from '@mui/icons-material';
import { authService } from '../../services/auth';

const AdminInvitations = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      const response = await authService.getAdminInvitations();
      setInvitations(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch invitations');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setEmail('');
    setError(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEmail('');
    setError(null);
  };

  const handleSendInvitation = async () => {
    if (!email) {
      setError('Email is required');
      return;
    }

    setSending(true);
    try {
      await authService.sendAdminInvitation(email);
      setSuccess('Invitation sent successfully');
      handleCloseDialog();
      fetchInvitations();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send invitation');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteInvitation = async (id) => {
    try {
      await authService.deleteAdminInvitation(id);
      setSuccess('Invitation deleted successfully');
      fetchInvitations();
    } catch (err) {
      setError('Failed to delete invitation');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Admin Invitations</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<EmailIcon />}
          onClick={handleOpenDialog}
        >
          Send Invitation
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Expires At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invitations.map((invitation) => (
              <TableRow key={invitation.id}>
                <TableCell>{invitation.email}</TableCell>
                <TableCell>
                  <Typography
                    color={
                      invitation.status === 'active'
                        ? 'success.main'
                        : invitation.status === 'expired'
                        ? 'error.main'
                        : 'text.secondary'
                    }
                  >
                    {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                  </Typography>
                </TableCell>
                <TableCell>
                  {new Date(invitation.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {new Date(invitation.expires_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteInvitation(invitation.id)}
                    disabled={invitation.status !== 'active'}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Send Admin Invitation</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!error}
            helperText={error}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSendInvitation}
            color="primary"
            disabled={sending}
          >
            {sending ? <CircularProgress size={24} /> : 'Send Invitation'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminInvitations; 