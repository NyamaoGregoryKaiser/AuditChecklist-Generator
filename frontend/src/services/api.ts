import axios, { AxiosError } from 'axios';
import type { LoginResponse, User, Audit, AdminInvitation, AuditResponse, AuditResult, Checklist, ChecklistItem } from '../types/api';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

console.log('API URL:', API_URL);

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Request config:', config);
    return config;
});

// Handle response errors
api.interceptors.response.use(
    (response) => {
        console.log('Response:', response);
        return response;
    },
    (error: AxiosError) => {
        console.error('Response error:', error);
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authApi = {
    login: async (email: string, password: string): Promise<LoginResponse> => {
        try {
            console.log('Attempting login with:', { email });
            // Check if the input is a valid email
            const isEmail = email.includes('@');
            const data = isEmail 
                ? { email, password }  // Send as email if it's a valid email
                : { username: email, password };  // Send as username if it's not an email
            
            const response = await api.post('/auth/login/', data);
            console.log('Login response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Login error details:', error);
            if (axios.isAxiosError(error)) {
                console.error('Response data:', error.response?.data);
                console.error('Response status:', error.response?.status);
                if (error.response?.data?.non_field_errors) {
                    throw new Error(error.response.data.non_field_errors[0]);
                }
                throw new Error(error.response?.data?.detail || 'Login failed');
            }
            throw error;
        }
    },

    register: async (email: string, password: string): Promise<LoginResponse> => {
        try {
            // Generate a username from the email (remove @ and everything after it)
            const username = email.split('@')[0];
            const response = await api.post('/auth/register/', { 
                username,
                email,
                password
            });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorData = error.response?.data;
                if (errorData?.non_field_errors) {
                    throw new Error(errorData.non_field_errors[0]);
                }
                if (errorData) {
                    const errorMessages = Object.entries(errorData)
                        .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
                        .join('\n');
                    throw new Error(errorMessages);
                }
            }
            throw new Error('Registration failed. Please try again.');
        }
    },

    refreshToken: async (refresh: string): Promise<{ token: string }> => {
        const response = await api.post('/auth/token/refresh/', { refresh });
        return response.data;
    },

    getCurrentUser: async (): Promise<User> => {
        const response = await api.get('/users/me/');
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
    },
};

// User API
export const userApi = {
    getProfile: async (): Promise<User> => {
        const response = await api.get('/users/me/');
        return response.data;
    },

    getUsers: async (): Promise<User[]> => {
        try {
            const response = await api.get('/users/');
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            console.error('Error fetching users:', error);
            return [];
        }
    },

    getUser: async (userId: number): Promise<User> => {
        const response = await api.get(`/users/list/${userId}/`);
        return response.data;
    },

    updateUser: async (userId: number, data: Partial<User>): Promise<User> => {
        const response = await api.patch(`/users/list/${userId}/`, data);
        return response.data;
    },

    deleteUser: async (userId: number): Promise<void> => {
        await api.delete(`/users/list/${userId}/`);
    },

    getCurrentUserProfile: async (): Promise<User> => {
        const response = await api.get('/users/me/');
        return response.data;
    },
};

// Audit API
export const auditApi = {
    getAudits: async (): Promise<Audit[]> => {
        const response = await api.get('/audits/list/');
        return response.data;
    },

    getAudit: async (id: number): Promise<Audit> => {
        const response = await api.get(`/audits/list/${id}/`);
        return response.data;
    },

    createAudit: async (data: Partial<Audit>): Promise<Audit> => {
        const response = await api.post('/audits/create/', data);
        return response.data;
    },

    updateAudit: async (id: number, data: Partial<Audit>): Promise<Audit> => {
        const response = await api.patch(`/audits/list/${id}/`, data);
        return response.data;
    },

    deleteAudit: async (id: number): Promise<void> => {
        await api.delete(`/audits/list/${id}/`);
    },

    submitChecklist: async (auditId: number, responses: Record<number, { response: 'yes' | 'no' | 'na'; notes: string }>): Promise<AuditResponse[]> => {
        const response = await api.post<AuditResponse[]>(`/audits/list/${auditId}/responses/`, {
            responses: Object.entries(responses).map(([itemId, data]) => ({
                checklist_item: Number(itemId),
                ...data
            }))
        });
        return response.data;
    },

    getAuditResponses: async (auditId: number): Promise<AuditResponse[]> => {
        const response = await api.get<AuditResponse[]>(`/audits/list/${auditId}/responses/`);
        return response.data;
    },

    completeAudit: async (auditId: number): Promise<Audit> => {
        const response = await api.post<Audit>(`/audits/list/${auditId}/complete/`);
        return response.data;
    },

    getAuditResult: async (auditId: number): Promise<AuditResult> => {
        const response = await api.get(`/audits/audits/${auditId}/result/`);
        return response.data;
    },

    // Admin methods
    getUsers: async (): Promise<User[]> => {
        try {
            const response = await api.get('/users/list/');
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            console.error('Error fetching users:', error);
            return [];
        }
    },

    getAllAudits: async (): Promise<Audit[]> => {
        try {
            const response = await api.get('/audits/list/');
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            console.error('Error fetching audits:', error);
            return [];
        }
    },

    updateUser: async (userId: number, data: Partial<User>): Promise<User> => {
        const response = await api.patch(`/users/users/${userId}/`, data);
        return response.data;
    },

    deleteUser: async (userId: number): Promise<void> => {
        await api.delete(`/users/users/${userId}/`);
    },

    updateChecklistItem: async (itemId: number, data: { is_completed: boolean; notes: string }): Promise<ChecklistItem> => {
        const response = await api.patch(`/checklist-items/${itemId}/`, data);
        return response.data;
    },

    submitChecklistResponse: async (auditId: number, data: { checklist_item: number; response: 'yes' | 'no' | 'na'; notes: string }): Promise<any> => {
        const response = await api.post(`/audits/${auditId}/responses/`, data);
        return response.data;
    },

    getUser: async (userId: number): Promise<User> => {
        const response = await api.get(`/users/list/${userId}/`);
        return response.data;
    },
};

// Checklist API
export const checklistApi = {
    getChecklists: async (auditId: number): Promise<Checklist[]> => {
        const response = await api.get(`/audits/${auditId}/checklists/`);
        return response.data;
    },

    createChecklist: async (auditId: number, data: Partial<Checklist>): Promise<Checklist> => {
        const response = await api.post(`/audits/${auditId}/checklists/`, data);
        return response.data;
    },

    updateChecklist: async (id: number, data: Partial<Checklist>): Promise<Checklist> => {
        const response = await api.patch(`/audits/checklists/${id}/`, data);
        return response.data;
    },

    deleteChecklist: async (id: number): Promise<void> => {
        await api.delete(`/audits/checklists/${id}/`);
    },
};

// Admin API
export const adminApi = {
    getInvitations: async (): Promise<AdminInvitation[]> => {
        const response = await api.get('/admin/admin-invitations/');
        return response.data;
    },

    createInvitation: async (email: string): Promise<AdminInvitation> => {
        const response = await api.post('/admin/admin-invitations/', { email });
        return response.data;
    },

    validateToken: async (token: string): Promise<{ email: string }> => {
        const response = await api.get(`/admin/admin-invitations/validate_token/?token=${token}`);
        return response.data;
    },
}; 