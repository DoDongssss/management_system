import { type Tenant } from "./tenant";

export interface Booking {
    id: null | number;
    tenant_id: number | string;
    room_id: number | string;
    total_durations_hours: number | string;
    total_amount: number | string;
    check_in: any;
    check_out: any;
    status: string;
    is_active: number; // 1 or 0
    created_at?: string;
    updated_at?: string;
    tenant?: Tenant;
  }
  