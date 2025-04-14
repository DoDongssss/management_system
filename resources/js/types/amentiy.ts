export interface Amenity {
    id: number | null;
    name: string;
    icon: string;
    is_active: number;
}

export interface AmenityPaginatedResponse {
    data: Amenity[];
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}
