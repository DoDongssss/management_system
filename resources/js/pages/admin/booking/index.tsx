import { useState, useMemo, useEffect, useRef } from "react";
import { Head, router } from "@inertiajs/react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import clsx from "clsx";

import AppLayout from "@/layouts/app-layout";
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectItem, SelectContent } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Pencil, Trash, Upload, ClockAlert, CalendarCheck, CalendarX, User, DoorOpen } from "lucide-react";

import { type BreadcrumbItem } from "@/types";
import { type Room, PartialRoom } from "@/types/room";
import CreateBookingDialog from "./createBooking";

dayjs.extend(duration);

const breadcrumbs: BreadcrumbItem[] = [{ title: "Room", href: "/room" }];
const statuses = [
  { value: "all", label: "All" },
  { value: "1", label: "Active" },
  { value: "0", label: "Inactive" },
];

const initialRoomData: Partial<PartialRoom> = {
  id: null,
  room_number: "",
  name: "",
  type: "",
  image: "",
  image_path: "",
  status: "VACANT",
  is_active: 1,
  room_amenities: null,
};

interface Props {
  rooms: Room[];
  search?: string;
  activeStatus?: string | boolean | number;
}

export default function Index({ rooms, search = "", activeStatus }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(search);
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [status, setStatus] = useState("all");
  const [selectedRoom, setSelectedRoom] = useState<any>(initialRoomData);
  const isFirstRender = useRef(true);
  const [now, setNow] = useState(dayjs());
  const triggeredRoomsRef = useRef(new Set<number | null>());
  const [dialogRoom, setDialogRoom] = useState<Room | null>(null);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    // router.get("/booking", { search: debouncedSearch, status }, { preserveState: true, replace: true });
  }, [debouncedSearch, status]);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newNow = dayjs();
      setNow(newNow);

      rooms.forEach((room) => {
        const activeBooking = room.booking?.find((b) => b.status === "active");
        if (!activeBooking || !activeBooking.check_out) return;

        const checkOut = dayjs(activeBooking.check_out);
        const diff = checkOut.diff(newNow);

        if (diff <= 0 && !triggeredRoomsRef.current.has(room.id)) {
          triggeredRoomsRef.current.add(room.id);
          handleTimeUp(room);
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [rooms]);

  const handleTimeUp = (room: Room) => {
    toast.warning(`Booking for ${room.room_number} is overdue!`);
  };

  const handleCheckout = (room: Room) => {
    const bookingId = room.booking?.[0]?.id;

    if (!bookingId) {
      toast.warning("No active booking found.");
      return;
    }

    router.post(
      `/booking/${bookingId}/checkout`,
      {},
      {
        onSuccess: () => toast.success(`Successfully checked out room ${room.room_number}`),
        onError: () => toast.error("Something went wrong during checkout."),
      }
    );
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
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="w-full flex flex-wrap gap-4">
          {rooms.map((room, index) => {
            const activeBooking = room.booking?.find((booking) => booking.status === "active");
            const hasActiveBooking = !!activeBooking;

            const checkIn = hasActiveBooking ? dayjs(activeBooking.check_in) : null;
            const checkOut = hasActiveBooking ? dayjs(activeBooking.check_out) : null;

            let durationText = null;
            let isOverdue = false;
            if (hasActiveBooking && checkOut) {
              const diff = checkOut.diff(now);
              isOverdue = diff <= 0;
              durationText = diff > 0 ? dayjs.duration(diff).format("HH:mm:ss") : "00:00:00 (Overdue)";
            }

            return (
              <div
                key={room.id || index}
                className={`min-h-[160px] min-w-[calc(100%/5-13px)] bg-white border rounded-2xl p-4 shadow-md transition-all duration-200 
                  ${isOverdue ? "shadow-orange-200 border-orange-400 animate-pulse" : hasActiveBooking ? "shadow-green-200 border-green-400" : "shadow-red-200 border-red-300"}`}
                onClick={() => {
                  const bookingId = room.booking?.[0]?.id;
                  if (bookingId) {
                    setDialogRoom(room);
                  } else {
                    setSelectedRoom(room)
                    setIsModalOpen(true);
                  }
                }}
              >
                <div className="w-full flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-400">{room.name}</span>
                  <div className={clsx("text-xs px-3 py-0.5 rounded-full font-semibold", room.is_active ? "bg-green-100 text-green-600" : "bg-gray-200 text-gray-500")}>
                    {room.is_active ? "Active" : "Inactive"}
                  </div>
                </div>

                <div className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-1">
                  <DoorOpen size={18} />
                  {room.room_number}
                </div>

                <div className="flex flex-col gap-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <User size={16} />
                    <span>{hasActiveBooking ? activeBooking.tenant?.name : "Vacant"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarCheck size={16} />
                    <span>{checkIn ? checkIn.format("MMM D, YYYY h:mm A") : "--"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarX size={16} />
                    <span>{checkOut ? checkOut.format("MMM D, YYYY h:mm A") : "--"}</span>
                  </div>
                  {hasActiveBooking && (
                    <div className="flex items-center gap-2 text-sm text-blue-600 font-semibold mt-1">
                      <ClockAlert size={16} />
                      <span>{durationText}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {dialogRoom && (
        <AlertDialog open={!!dialogRoom} onOpenChange={(isOpen) => !isOpen && setDialogRoom(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Booking Overdue</AlertDialogTitle>
              <AlertDialogDescription>
                The booking for <strong>{dialogRoom.name}</strong> has passed its check-out time.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDialogRoom(null)}>Ignore</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  handleCheckout(dialogRoom);
                  setDialogRoom(null);
                }}
              >
                Acknowledge
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <CreateBookingDialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} room={selectedRoom} />
    </AppLayout>
  );
}
