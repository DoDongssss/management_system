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
import { Pencil, Trash } from "lucide-react";

import { type BreadcrumbItem } from "@/types";
import { type Amenity, AmenityPaginatedResponse } from "@/types/amentiy";

import CreateUpdate from "./createUpdate";

const breadcrumbs: BreadcrumbItem[] = [{ title: "Amenity", href: "/amenity" }];
const statuses = [
    { value: "all", label: "All" },
    { value: "1", label: "Active" },
    { value: "0", label: "Inactive" },
];

const emptyAmenity: Amenity = { id: null, name: "", icon: "", is_active: 1 };

interface Props {
    amenities: AmenityPaginatedResponse;
    sort?: string;
    direction?: "asc" | "desc";
    search?: string;
    activeStatus?: string | boolean | number;
}

export default function Index({ amenities, sort = "id", direction = "desc", search = "", activeStatus }: Props) {
    const { appUrl } = usePage().props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(search);
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    const [status, setStatus] = useState("all");
    const [amenityToUpdate, setAmenityToUpdate] = useState<Amenity>(emptyAmenity);
    const isFirstRender = useRef<boolean>(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        router.get("/amenity", { search: debouncedSearch, sort, direction, status }, { preserveState: true, replace: true });
    }, [debouncedSearch, sort, direction, status]);

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedSearch(searchQuery), 500);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    const filteredAmenities = useMemo(() => {
        const lowerCaseSearch = search.toLowerCase();
        const items = Array.isArray(amenities?.data) ? amenities.data : [];

        return items.filter(({ name }) =>
            typeof name === "string" && name.toLowerCase().includes(lowerCaseSearch)
        );
    }, [search, amenities]);

    const handleSort = (column: string) => {
        const newDirection = sort === column && direction === "asc" ? "desc" : "asc";
        router.get("/amenity", { sort: column, direction: newDirection }, { preserveState: true });
    };

    const handleDelete = (id: any) => {
        router.delete(`/amenity/${id}`, {
            onSuccess: () => toast.success("Amenity deleted successfully!"),
            onError: (error) => {
                console.error("Error deleting amenity:", error);
                toast.error("Failed to delete amenity. Please try again.");
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Amenity" />
            <div className="flex flex-1 flex-col gap-3 p-6 items-center">
                <div className="flex justify-between items-center mb-3 w-full">
                    <div className="flex items-center gap-2 min-w-[420px]">
                        <Input
                            type="text"
                            placeholder="Search amenity..."
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
                    <Button onClick={() => { setIsModalOpen(true); setAmenityToUpdate(emptyAmenity); }} variant="default">
                        Create Amenity
                    </Button>
                </div>

                {filteredAmenities.length > 0 ? (
                    <div className="overflow-hidden border border-blue-500 rounded-lg w-full">
                        <Table className="w-full">
                            <TableHeader className="border-b bg-blue-600 group">
                                <TableRow>
                                    <TableHead className="px-4 py-3 text-center text-white text-xs uppercase">ID</TableHead>
                                    <TableHead className="px-4 py-3 text-left text-white text-xs uppercase">Name</TableHead>
                                    <TableHead className="px-4 py-3 text-center text-white text-xs uppercase">Icon</TableHead>
                                    <TableHead className="px-4 py-3 text-center text-white text-xs uppercase">Is Active</TableHead>
                                    <TableHead className="px-4 py-3 text-center text-white text-xs uppercase">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAmenities.map((amenity) => (
                                    <TableRow key={amenity.id}>
                                        <TableCell className="px-4 py-3 text-center min-w-[80px] w-[80px] max-w-[80px]">{amenity.id}</TableCell>
                                        <TableCell className="px-4 py-3 text-left w-full">{amenity.name}</TableCell>
                                        <TableCell className="px-4 py-3 text-center min-w-[150px] w-[150px] max-w-[100px]">{amenity.icon ?? '-'}</TableCell>
                                        <TableCell className="px-4 py-3 text-center min-w-[100px] w-[100px] max-w-[100px]">
                                            <span className={clsx("px-2 py-1 rounded text-xs font-medium", amenity.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}> 
                                                {amenity.is_active ? "ACTIVE" : "INACTIVE"}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-4 py-3 flex justify-center gap-2  min-w-[120px] w-[120px] max-w-[120px]">
                                            <Button variant="outline" size="icon" onClick={() => { setAmenityToUpdate(amenity); setIsModalOpen(true); }}>
                                                <Pencil size={14} />
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="outline" size="icon">
                                                        <Trash size={14} className="text-red-500" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Confirm Amenity Delete</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to delete <strong>{amenity.name} (ID: {amenity.id})</strong>? This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(amenity.id)}>Confirm</AlertDialogAction>
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
                    <p className="text-center text-gray-500">No amenities found.</p>
                )}

                <div className="flex justify-end w-full">
                    {(amenities?.links?.length || 0) > 0 && (
                        <div className="flex justify-end mt-3 space-x-2">
                            {amenities.links.map(({ url, label, active }, index) =>
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

            <CreateUpdate isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} amenityToUpdate={amenityToUpdate} />
        </AppLayout>
    );
}