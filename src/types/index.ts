export interface Action {
  id: string;
  name: string;
  description?: string | null;
  category: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Role {
  id: string;
  name: string;
  description?: string | null;
  actions?: {
    action: Action;
  }[];
  _count?: {
    users: number;
    actions: number;
  };
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface User {
  id: string;
  email: string;
  status: 'ACTIVO' | 'INACTIVO';
  personId?: string | null;
  person?: Person | null;
  roles: {
    role: Role;
  }[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  isMember: boolean;
  status: 'ACTIVO' | 'INACTIVO' | 'VISITANTE';
  barrioId?: string | null;
  barrio?: Barrio | null;
  deletedAt?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Barrio {
  id: string;
  name: string;
  description?: string | null;
  assistantId?: string | null;
  assistant?: Person | null;
  members?: Person[];
  _count?: {
    members: number;
  };
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
