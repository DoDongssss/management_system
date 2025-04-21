export interface Tenant {
    id: null | number;
    name: string;
    contact: null | string;
    address: null | string;
    is_active: number; // 1 or 0
    created_at?: string;
    updated_at?: string;
  }
  