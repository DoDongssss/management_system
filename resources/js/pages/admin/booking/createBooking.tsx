import { useEffect, useState } from "react";
import { useForm } from "@inertiajs/react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

import { type Room } from "@/types/room";


interface Rate {
  id: number;
  durations_hours: number;
  price: number;
}

interface CreateBookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room;
  bookingToUpdate?: any | null;
}

const initialBookingData = {
  name: "",
  contact: "",
  address: "",
  room_id: "",
  rate_id: "",
};

export default function CreateBookingDialog({
  isOpen,
  onClose,
  room,
  bookingToUpdate,
}: CreateBookingDialogProps) {
  const { data, setData, post, reset, errors, processing } = useForm(initialBookingData);

  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (bookingToUpdate?.id) {
      setData({
        name: bookingToUpdate.tenant_name,
        contact: bookingToUpdate.tenant_contact,
        address: bookingToUpdate.tenant_address,
        room_id: bookingToUpdate.room_id,
        total_duration_hrs: ""
      });
    } else {
      setData(initialBookingData);
    }
  }, [bookingToUpdate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    post(
      bookingToUpdate?.id ? route("booking.update", bookingToUpdate.id) : route("booking.store"),
      {
        onSuccess: () => {
          toast.success(bookingToUpdate?.id ? "Booking updated successfully!" : "Booking created successfully!");
          onClose();
        },
        onError: (err) => Object.values(err).forEach((error: any) => toast.error(error)),
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className=" max-w-[700px]!">
        <DialogHeader>
          <DialogTitle>{bookingToUpdate?.id ? "Update Booking" : "Create Booking"}</DialogTitle>
          <DialogDescription>
            {bookingToUpdate
              ? "Update the details of the existing booking."
              : "Fill in the details to create a new booking."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 w-full">
            <div className="flex flex-row gap-5 w-full">
                <div className="flex flex-col w-1/2 gap-2">
                    <div className="w-full">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            disabled={processing}
                        />
                        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                        </div>

                        <div className="w-full">
                        <Label htmlFor="contact">Contact</Label>
                        <Input
                            id="contact"
                            type="text"
                            value={data.contact}
                            onChange={(e) => setData("contact", e.target.value)}
                            disabled={processing}
                        />
                        {errors.contact && <p className="text-red-500 text-sm">{errors.contact}</p>}
                        </div>

                        <div className="w-full">
                        <Label htmlFor="tenant_address">Address</Label>
                        <Input
                            id="tenant_address"
                            type="text"
                            value={data.address}
                            onChange={(e) => setData("address", e.target.value)}
                            disabled={processing}
                        />
                        {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
                    </div>
                </div>
                <div className="flex flex-col w-1/2 gap-2">
                    <div className="w-full">
                        <Label htmlFor="tenant_name">Room #</Label>
                        <Input
                            id="tenant_name"
                            type="text"
                            value={room.room_number}
                            disabled={true}
                        />
                        {/* {errors.room_number && <p className="text-red-500 text-sm">{errors.room_number}</p>} */}
                        </div>

                        <div className="w-full">
                        <Label htmlFor="tenant_contact">Rate</Label>
                        {room.rates && room.rates.length > 0 ? (
                          <Select>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select Rate" />
                            </SelectTrigger>
                            <SelectContent>
                              {room.rates.map((rate: any) => (
                                <SelectItem key={rate.id} value={String(rate.id)}>
                                  {rate.durations_hours} hr — ₱{rate.price}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">No rates available</p>
                        )}

                        {/* {errors.tenant_contact && <p className="text-red-500 text-sm">{errors.tenant_contact}</p>} */}
                        </div>

                        <div className="w-full">
                        <Label htmlFor="tenant_address">Total Hours</Label>
                        <Input
                            id="tenant_name"
                            type="text"
                            value={data.total_duration_hours}
                            onChange={(e) => setData("total_duration_hours", e.target.value)}
                            disabled={processing}
                        />
                        {errors.total_duration_hours && <p className="text-red-500 text-sm">{errors.total_duration_hours}</p>}
                    </div>
                </div>
            </div>
         


          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={processing}>
              Cancel
            </Button>
            <Button type="submit" variant="outline" disabled={processing}>
              {processing ? "Saving..." : bookingToUpdate?.id ? "Update Booking" : "Add Booking"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
