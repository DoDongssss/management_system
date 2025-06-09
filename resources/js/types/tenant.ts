import { type Booking } from "./booking";

export interface Tenant {
    id: null | number;
    name: string;
    contact: null | string;
    address: null | string;
    is_active: number; // 1 or 0
    created_at?: string;
    updated_at?: string;
    booking?: Booking[];
  }
  
  export interface TenantPaginatedResponse {
    data: Tenant[];
    links: {
      url: string | null;
      label: string;
      active: boolean;
    }[];
  }