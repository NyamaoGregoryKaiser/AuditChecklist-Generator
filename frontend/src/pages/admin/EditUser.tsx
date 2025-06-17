import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, TextField, Button, CircularProgress, Alert } from '@mui/material';
import { auditApi } from '../../services/api';
import type { User } from '../../types/api';

const EditUser: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await auditApi.getUser(Number(id));
        setUser(data);
        setFormData({
          username: data.username,
          email: data.email,
        });
      } catch (err) {
        setError('Failed to fetch user details');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await auditApi.updateUser(Number(id), formData);
      navigate('/admin');
    } catch (err) {
      setError('Failed to update user');
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (!user) {
    return <Alert severity="error">User not found</Alert>;
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>Edit User</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
          />
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
            Update User
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default EditUser; 