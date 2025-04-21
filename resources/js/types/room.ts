import { type Amenity, RoomAmenities } from "./amentiy";
import { type RoomRate } from "./rate";
import { Booking } from "./booking";

export interface Room {
    id: number | null;
    room_number: string;
    name: string;
    type: string;
    image: null | File | string;
    image_path?: string | null | undefined;
    status: string;
    is_active: number | boolean;
    room_amenities?: RoomAmenities[] | null;
    rates?: RoomRate[] | null;
    booking?: Booking[] | null;
}

export interface PartialRoom {
    id: number | null;
    room_number: string;
    name: string;
    type: string;
    image: null | File | string;
    image_path?: string | null | undefined;
    status: string;
    is_active: number | boolean;
    room_amenities?: string | null;
}

export interface RoomPaginatedResponse {
    data: Room[];
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    current_page: number;
    last_page: number;
    total: number;
}
