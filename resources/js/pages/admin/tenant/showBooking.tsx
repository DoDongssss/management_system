import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck, CalendarDays, CalendarX, Clock, DollarSign } from "lucide-react";
import dayjs from "dayjs";

import { type Tenant } from "@/types/tenant";

interface ShowBookingProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant | null;
}

export default function ShowBooking({ isOpen, onClose, tenant }: ShowBookingProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-6">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl font-bold tracking-tight">Tenant Bookings</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            A complete list of this client's booking history
          </DialogDescription>
        </DialogHeader>

        {(tenant?.booking?.length ?? 0) > 0 ? (
          <ScrollArea className="h-[400px] pr-4 space-y-4">
            {tenant?.booking?.map((booking, index) => {
              const getStatusColor = (status: string) => {
                switch (status) {
                  case "active":
                    return "bg-blue-100 text-blue-700";
                  case "complete":
                    return "bg-green-100 text-green-700";
                  case "void":
                    return "bg-red-100 text-red-700";
                  default:
                    return "bg-gray-100 text-gray-700";
                }
              };

              return (
                <div
                  key={index}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-semibold text-gray-800">
                      # {booking.room?.room_number}
                    </span>
                    <div className="flex gap-2 items-center">
                      <Badge variant="outline" className="text-sm">
                        Booking #{booking.id}
                      </Badge>
                      <Badge className={`${getStatusColor(booking.status)} text-xs px-2 py-0.5 rounded-full`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-2">
                      <CalendarCheck size={16} className="text-gray-500" />
                      <span className="flex flex-col">
                        <span className="font-medium">Check-in:</span>{" "}
                        {dayjs(booking.check_in).format("MMMM D, YYYY h:mm A")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarX size={16} className="text-gray-500" />
                      <span className="flex flex-col">
                        <span className="font-medium">Check-out:</span>{" "}
                        {dayjs(booking.check_out).format("MMMM D, YYYY h:mm A")}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-6 text-sm text-gray-700">
                    <div className="flex items-center gap-1">
                      <Clock size={14} className="text-gray-500" />
                      <span className="font-medium">{booking.total_duration_hours} hr(s)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {/* <DollarSign size={14} className="text-green-600" /> */}
                      <span className="font-bold text-green-700">
                        ₱{Number(booking.total_amount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </ScrollArea>
        ) : (
          <p className="text-center text-gray-400 italic">No bookings found for this Tenant.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
