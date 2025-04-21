export interface RoomRate {
    id: null | number;
    room_id: number | string;
    durations_hours: number | string;
    price: number | string;
    is_active: number; // 1 or 0
    created_at?: string;
    updated_at?: string;
  }
  