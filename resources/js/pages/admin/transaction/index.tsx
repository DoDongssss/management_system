import { useState, useMemo, useEffect, useRef } from "react";
import { Head, router } from "@inertiajs/react";
import { usePage } from "@inertiajs/react";
import clsx from "clsx";
import dayjs from "dayjs";

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

import { type BreadcrumbItem } from "@/types";
import { type Booking, BookingPaginatedResponse } from "@/types/booking";
import { Ban } from "lucide-react";

const breadcrumbs: BreadcrumbItem[] = [{ title: "Transactions", href: "/transaction" }];
const statuses = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "void", label: "Void" },
];

interface Props {
  bookings: BookingPaginatedResponse;
  sort?: string;
  direction?: "asc" | "desc";
  search?: string;
  status?: string;
}

export default function Index({ bookings, sort = "id", direction = "desc", search = "", status = "all" }: Props) {
  const [searchQuery, setSearchQuery] = useState(search);
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [statusFilter, setStatusFilter] = useState(status);
  const [pinInput, setPinInput] = useState("");
  const [voidTargetId, setVoidTargetId] = useState<number | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    router.get("/transaction", {
      search: debouncedSearch,
      sort,
      direction,
      status: statusFilter,
    }, { preserveState: true, replace: true });
  }, [debouncedSearch, sort, direction, statusFilter]);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const filteredBookings = useMemo(() => {
    const lowerSearch = search.toLowerCase();
    const items = Array.isArray(bookings?.data) ? bookings.data : [];

    return items.filter(({ id, tenant }) =>
      [String(id), tenant?.name].some(
        (field) => typeof field === "string" && field.toLowerCase().includes(lowerSearch)
      )
    );
  }, [search, bookings]);

  const handleVoid = (id: number | null) => {
    if (!id) return toast.error("Something went wrong");

    const voidPin = import.meta.env.VITE_VOID_PIN;
    if (pinInput !== voidPin) return toast.error("Incorrect PIN");

    router.post(
      `/transaction/${id}/void`,
      {},
      {
        onSuccess: () => toast.success(`Successfully void booking ID: ${id}`),
        onError: () => toast.error("Something went wrong during void."),
      }
    );
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Transactions" />
      <div className="flex flex-1 flex-col gap-3 p-6 items-center">
        <div className="flex justify-between items-center mb-3 w-full">
          <div className="flex items-center gap-2 min-w-[420px]">
            <Input
              type="text"
              placeholder="Search transaction..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
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
        </div>

        {filteredBookings.length > 0 ? (
          <div className="overflow-hidden border border-blue-700 rounded-lg w-full">
            <Table className="w-full">
              <TableHeader className="border-b bg-blue-700 group">
                <TableRow>
                  <TableHead className="px-4 py-1 text-center text-white text-xs uppercase">ID</TableHead>
                  <TableHead className="px-4 py-1 text-left text-white text-xs uppercase">Tenant</TableHead>
                  <TableHead className="px-4 py-1 text-left text-white text-xs uppercase">Contact</TableHead>
                  <TableHead className="px-4 py-1 text-left text-white text-xs uppercase">Room #</TableHead>
                  <TableHead className="px-4 py-1 text-left text-white text-xs uppercase">Check-In</TableHead>
                  <TableHead className="px-4 py-1 text-left text-white text-xs uppercase">Check-Out</TableHead>
                  <TableHead className="px-4 py-1 text-left text-white text-xs uppercase">Amount</TableHead>
                  <TableHead className="px-4 py-1 text-left text-white text-xs uppercase">Status</TableHead>
                  <TableHead className="px-4 py-1 text-center text-white text-xs uppercase">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="px-4 py-1 text-center">{booking.id}</TableCell>
                    <TableCell className="px-4 py-1">{booking.tenant?.name ?? '-'}</TableCell>
                    <TableCell className="px-4 py-1">{booking.room?.room_number ?? '-'}</TableCell>
                    <TableCell className="px-4 py-1">{booking.tenant?.contact ?? '-'}</TableCell>
                    <TableCell className="px-4 py-1">{dayjs(booking.check_out).format("MMMM D, YYYY h:mm A")}</TableCell>
                    <TableCell className="px-4 py-1">{dayjs(booking.check_out).format("MMMM D, YYYY h:mm A") ?? '-'}</TableCell>
                    <TableCell className="px-4 py-1">{booking.total_amount ?? '-'}</TableCell>
                    <TableCell className="px-4 py-1">
                      <span className={clsx("px-2 py-1 rounded text-xs font-medium", {
                        "bg-green-100 text-green-700": booking.status === "active",
                        "bg-gray-100 text-gray-700": booking.status === "completed",
                        "bg-red-100 text-red-700": booking.status === "void",
                      })}>
                        {booking.status?.toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-1 flex justify-center gap-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            disabled={booking.status === "void"}
                            className={booking.status === "void" ? "cursor-not-allowed opacity-50" : ""}
                            onClick={() => {
                              setVoidTargetId(booking.id);
                              setPinInput("");
                            }}
                          >
                            <Ban size={14} className="text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        {booking.status !== "void" && (
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Enter 6-digit PIN</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action is protected. Enter the 6-digit PIN to void booking <strong>{booking.id}</strong>.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <Input
                              type="password"
                              placeholder="Enter PIN"
                              value={pinInput}
                              onChange={(e) => setPinInput(e.target.value)}
                              maxLength={6}
                              className="mt-2"
                            />
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleVoid(voidTargetId)}>Confirm</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        )}
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-center text-gray-500">No transactions found.</p>
        )}

        <div className="flex justify-end w-full">
          {(bookings?.links?.length || 0) > 0 && (
            <div className="flex justify-end mt-3 space-x-2">
              {bookings.links.map(({ url, label, active }, index) =>
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
    </AppLayout>
  );
}