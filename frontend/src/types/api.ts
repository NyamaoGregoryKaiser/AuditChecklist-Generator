export interface User {
    id: number;
    username: string;
    email: string;
    is_staff: boolean;
}

export interface LoginResponse {
    token: string;
    refresh: string;
    user: User;
}

export interface ChecklistItem {
    id: number;
    audit: number;
    item: string;
    is_completed: boolean;
    notes: string;
    order: number;
}

export interface Checklist {
    id: number;
    audit: number;
    item: string;
    is_completed: boolean;
    notes: string;
    order: number;
}

export interface Audit {
    id: number;
    title: string;
    description: string;
    audit_type: string;
    organization: string;
    industry: string;
    specific_requirements: string;
    complexity_level: string;
    created_at: string;
    updated_at: string;
    created_by: User;
    is_completed: boolean;
    completion_date: string | null;
    checklists: ChecklistItem[];
}

export interface AuditResponse {
    id: number;
    audit: number;
    checklist_item: number;
    response: 'yes' | 'no' | 'na';
    notes: string;
    evidence: string;
    created_at: string;
    updated_at: string;
}

export interface AuditResult {
    id: number;
    audit: number;
    total_items: number;
    completed_items: number;
    yes_responses: number;
    no_responses: number;
    na_responses: number;
    created_at: string;
    updated_at: string;
}

export interface AdminInvitation {
    id: number;
    email: string;
    token: string;
    created_at: string;
    expires_at: string;
    is_used: boolean;
    invited_by: User;
    status: 'valid' | 'used' | 'expired';
}

export interface ApiError {
    error: string;
    detail?: string;
} 