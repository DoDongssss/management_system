
export interface Room {
    id: number | null;
    room_number: string;
    name: string;
    type: string;
    image: null | File | string;
    image_path?: string | null | undefined;
    status: string;
    is_active: number | boolean;
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
