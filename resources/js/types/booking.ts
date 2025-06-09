import { Room } from "./room";
import { type Tenant } from "./tenant";

export interface Booking {
    id: null | number;
    tenant_id: number | string | null;
    room_id: number | string | null ;
    total_duration_hours: number | string;
    total_amount: number | string;
    check_in?: any;
    check_out?: any;
    status: string;
    is_active?: number; // 1 or 0
    created_at?: string;
    updated_at?: string;
    name?: null | string;
    contact?: null | string;
    address?: null | string;
    room?: Room 
    tenant?: Tenant;
  }

export interface BookingPaginatedResponse {
    data: Booking[];
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}


export interface PartialBooking {
    id: null | number;
    room_id: number | string | null ;
    total_duration_hours: number | string;
    total_amount: number | string;
    name?: null | string;
    contact?: null | string;
    address?: null | string;
  }
  