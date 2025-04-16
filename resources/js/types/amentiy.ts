export interface Amenity {
    id: number | null;
    name: string;
    icon?: string;
    is_active?: number;
}

export interface RoomAmenities {
    id: number | null;
    room_id: number;
    amenity_id: number;
    amenity: Amenity;
    is_active?: number;
}

export interface AmenityMultiSelect {
    id: string;
    name: string;
    icon?: string;
    is_active?: number;
}

export interface AmenityPaginatedResponse {
    data: Amenity[];
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}
