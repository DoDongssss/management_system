import { useState, useMemo, useEffect, useRef } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import clsx from "clsx";

import AppLayout from "@/layouts/app-layout";
import {
    Table, TableHead, TableHeader, TableBody, TableRow, TableCell,
} from "@/components/ui/table";
import {
    Select, SelectTrigger, SelectValue, SelectItem, SelectContent,
} from "@/components/ui/select";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Pencil, Trash, Upload, ClockAlert } from "lucide-react";

import { type BreadcrumbItem } from "@/types";
import { type Room, RoomPaginatedResponse } from "@/types/room";
import { type Amenity, AmenityMultiSelect, AmenityPaginatedResponse } from "@/types/amentiy";
import { type RoomRate } from "@/types/rate";

import CreateUpdate from "./createUpdate";
import CreateUpdateRate from "../room/createUpdateRates";
import ShowRate from "./showRates";

const breadcrumbs: BreadcrumbItem[] = [{ title: "Room", href: "/room" }];
const statuses = [
    { value: "all", label: "All" },
    { value: "1", label: "Active" },
    { value: "0", label: "Inactive" },
];

const emptyRoom: Room = { id: null, room_number: "", name: "", type: "", image: "", status: "", is_active: 1 };
const emptyRate: RoomRate = { id: null, room_id: "", durations_hours: "", price: "", is_active: 1 };

interface Props {
    activeRooms: Room[];
    rooms: RoomPaginatedResponse;
    amenities: AmenityMultiSelect[];
    sort?: string;
    direction?: "asc" | "desc";
    search?: string;
    activeStatus?: string | boolean | number;
}

export default function Index({ activeRooms, rooms, amenities, sort = "id", direction = "desc", search = "", activeStatus }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRateModalOpen, setIsRateModalOpen] = useState(false);
    const [isShowRateModalOpen, setIsShowRateModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(search);
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    const [shopId, setShopId] = useState<string>("all");
    const [status, setStatus] = useState("all");
    const [roomToupdate, setRoomToupdate] = useState<Room>(emptyRoom);
    const [rateToUpdate, setRateToUpdate] = useState<RoomRate>(emptyRate);
    const [roomRates, setRoomRates] = useState<RoomRate[] | null | undefined | []>([]);
    const isFirstRender = useRef<boolean>(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        console.log(rooms);

        router.get("/room", { search: debouncedSearch, sort, direction, shopId, status }, { preserveState: true, replace: true });
    }, [debouncedSearch, sort, direction, shopId, status]);

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedSearch(searchQuery), 500);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    const filteredRooms = useMemo(() => {
        const lowerCaseSearch = search.toLowerCase();
        const items = Array.isArray(rooms?.data) ? rooms.data : [];

        return items.filter(({ name }) =>
            typeof name === "string" && name.toLowerCase().includes(lowerCaseSearch)
        );
    }, [search, rooms]);

    const handleSort = (column: string) => {
        const newDirection = sort === column && direction === "asc" ? "desc" : "asc";
        router.get("/room", { sort: column, direction: newDirection }, { preserveState: true });
    };

    const handleDelete = (id: any) => {
        router.delete(`/room/${id}`, {
            onSuccess: () => toast.success("Room deleted successfully!"),
            onError: (error) => {
                console.error("Error deleting room:", error);
                toast.error("Failed to delete room. Please try again.");
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Room" />
            <div className="flex flex-1 flex-col gap-3 p-6 items-center">
                <div className="flex justify-between items-center mb-3 w-full">
                    <div className="flex items-center gap-2 min-w-[420px]">
                        <Input
                            type="text"
                            placeholder="Search room..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full"
                        />
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                            <SelectContent>
                                {statuses.map(({ value, label }) => (
                                    <SelectItem key={value} value={value}>{label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => { setIsRateModalOpen(true); setRateToUpdate(emptyRate); }} variant="outline">
                            <span className="text-blue-500">Add Room Rate</span>
                        </Button>
                        <Button onClick={() => { setIsModalOpen(true); setRoomToupdate(emptyRoom); }} variant="default">
                            Create Room
                        </Button>
                    </div>
                </div>

                {filteredRooms.length > 0 ? (
                    <div className="overflow-hidden border border-blue-500 rounded-lg w-full">
                        <Table className="w-full">
                            <TableHeader className="border-b bg-blue-600 group">
                                <TableRow>
                                    <TableHead className="px-4 py-1 text-center text-white text-xs uppercase">ID</TableHead>
                                    <TableHead className="px-4 py-1 text-left text-white text-xs uppercase">Room Number</TableHead>
                                    <TableHead className="px-4 py-1 text-left text-white text-xs uppercase">Name</TableHead>
                                    <TableHead className="px-4 py-1 text-left text-white text-xs uppercase">Type</TableHead>
                                    <TableHead className="px-4 py-1 text-left text-white text-xs uppercase">Amenities</TableHead>
                                    <TableHead className="px-4 py-1 text-center text-white text-xs uppercase">Image</TableHead>
                                    <TableHead className="px-4 py-1 text-center text-white text-xs uppercase">Status</TableHead>
                                    <TableHead className="px-4 py-1 text-center text-white text-xs uppercase">Is Active</TableHead>
                                    <TableHead className="px-4 py-1 text-center text-white text-xs uppercase">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRooms.map((room) => (
                                    <TableRow key={room.id}>
                                        <TableCell className="px-4 py-1 text-center min-w-[80px] w-[80px] max-w-[80px]">{room.id}</TableCell>
                                        <TableCell className="px-4 py-1 text-left min-w-[150px] w-[150px] max-w-[150px]">{room.room_number}</TableCell>
                                        <TableCell className="px-4 py-1 text-left w-full min-w-[100px]">{room.name}</TableCell>
                                        <TableCell className="px-4 py-1 text-left min-w-[150px] w-[150px] max-w-[150px]">{room.type}</TableCell>
                                        <TableCell className="px-4 py-1 text-left min-w-[200px] w-[200px] max-w-[200px] flex gap-1 overflow-x-auto">{room.room_amenities?.map(a => (
                                            <span key={a.id} className="text-[10px] px-2 py-1 bg-gray-50 border rounded">
                                            {a.amenity?.name}
                                            </span>
                                             ))}
                                        </TableCell>
                                        <TableCell className="px-4 py-1 text-center min-w-[100px] w-[100px] max-w-[100px]">
                                            {typeof room.image === "string" && room.image ? (
                                                <a
                                                    href={`/storage/${room.image}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-1"
                                                >
                                                    <Upload size={16} />
                                                    <span className="sr-only">View Image</span>
                                                </a>
                                            ) : (
                                                <span className="text-gray-400 italic">No Image</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-4 py-1 text-center min-w-[120PX] w-[120PX] max-w-[120PX]">
                                            <span className={clsx("px-2 py-1 rounded text-xs font-medium", room.status == "VACANT" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                                                { room.status }
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-4 py-1 text-center min-w-[120PX] w-[120PX] max-w-[120PX]">
                                            <span className={clsx("px-2 py-1 rounded text-xs font-medium", room.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                                                {room.is_active ? "ACTIVE" : "INACTIVE"}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-4 py-1 flex justify-end gap-2 min-w-[150px] w-[150px] max-w-[150px]">
                                            {room?.rates?.length > 0 && (
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => {
                                                setRoomRates(room.rates);
                                                setIsShowRateModalOpen(true);
                                                }}
                                            >
                                                <ClockAlert size={14} className="text-orange-500" />
                                            </Button>
                                            )}

                                            <Button variant="outline" size="icon" onClick={() => { setRoomToupdate(room); setIsModalOpen(true); }}>
                                                <Pencil size={14} className="text-blue-500"/>
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="outline" size="icon">
                                                        <Trash size={14} className="text-red-500" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Confirm Room Delete</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to delete <strong>{room.name} (ID: {room.id})</strong>? This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(room.id)}>Confirm</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <p className="text-center text-gray-500">No rooms found.</p>
                )}

                <div className="flex justify-end w-full">
                    {(rooms?.links?.length || 0) > 0 && (
                        <div className="flex justify-end mt-3 space-x-2">
                            {rooms.links.map(({ url, label, active }, index) =>
                                url && (
                                    <Button key={index} variant={active ? "default" : "outline"} className="px-4 rounded-md text-xs" onClick={() => router.get(url)}>
                                        {label?.replace("&laquo;", "«").replace("&raquo;", "»")}
                                    </Button>
                                )
                            )}
                        </div>
                    )}
                </div>
            </div>

            <CreateUpdate isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} amenities={amenities} roomToUpdate={roomToupdate} />
            <CreateUpdateRate isOpen={isRateModalOpen} onClose={() => setIsRateModalOpen(false)} activeRooms={activeRooms} rateToUpdate={rateToUpdate} />
            <ShowRate isOpen={isShowRateModalOpen} onClose={() => setIsShowRateModalOpen(false)} rates={roomRates} />
        </AppLayout>
    );
}
