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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { type Room } from "@/types/room";
import { type RoomRate } from "@/types/rate";

interface CreateUpdateRateProps {
  isOpen: boolean;
  onClose: () => void;
  activeRooms: Room[];
  rateToUpdate?: RoomRate | null;
}

const initialRateData: Partial<RoomRate> = {
  id: null,
  room_id: "",
  durations_hours: "",
  price: "",
  is_active: 1,
};

export default function CreateUpdateRate({ isOpen, onClose, activeRooms, rateToUpdate }: CreateUpdateRateProps) {
  const { data, setData, post, reset, errors, processing } = useForm<Partial<RoomRate>>(initialRateData);
  const [isActive, setIsActive] = useState(data.is_active === 1);

  useEffect(() => {
    if (rateToUpdate?.id) {
      setData({
        id: rateToUpdate.id,
        room_id: rateToUpdate.room_id,
        durations_hours: rateToUpdate.durations_hours,
        price: rateToUpdate.price,
        is_active: rateToUpdate.is_active ? 1 : 0,
      });
      setIsActive(rateToUpdate.is_active === 1);
    } else {
      setData(initialRateData);
    }
  }, [rateToUpdate]);

  const handleStatusChange = () => {
    setIsActive((prev) => !prev);
    setData("is_active", isActive ? 0 : 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    post(
      rateToUpdate?.id ? route("roomRate.update", rateToUpdate.id) : route("roomRate.store"),
      {
        onSuccess: () => {
          toast.success(rateToUpdate?.id ? "Room rate updated successfully!" : "Room rate created successfully!");
          onClose();
        },
        onError: (err) => Object.values(err).forEach((error: any) => toast.error(error)),
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{rateToUpdate?.id ? "Update Room Rate" : "Create Room Rate"}</DialogTitle>
          <DialogDescription>
            {rateToUpdate
              ? "Update the details of the existing room rate."
              : "Fill in the details to create a new room rate."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="room_id">Room ID</Label>
            <Input
              id="room_id"
              type="text"
              value={data.room_id}
              onChange={(e) => setData("room_id", e.target.value)}
              disabled={true}
            />
            {errors.room_id && <p className="text-red-500 text-sm">{errors.room_id}</p>}
          </div>
          <div>
            <Label htmlFor="room_id">Room Number</Label>
            <Select
              value={String(data.room_id)}
              onValueChange={(value) => setData("room_id", parseInt(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Room" />
              </SelectTrigger>
              <SelectContent>
                {activeRooms.map((room) => (
                  <SelectItem key={room.id} value={String(room.id)}>
                    {room.room_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.room_id && <p className="text-red-500 text-sm">{errors.room_id}</p>}
          </div>


          <div>
            <Label htmlFor="durations_hours">Duration (in hours)</Label>
            <Input
              id="durations_hours"
              type="number"
              value={data.durations_hours}
              onChange={(e) => setData("durations_hours", e.target.value)}
              disabled={processing}
            />
            {errors.durations_hours && <p className="text-red-500 text-sm">{errors.durations_hours}</p>}
          </div>

          <div>
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              value={data.price}
              onChange={(e) => setData("price", e.target.value)}
              disabled={processing}
            />
            {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
          </div>

          <div className="flex gap-2 items-center mt-3">
            <Checkbox id="is_active" checked={isActive} onCheckedChange={handleStatusChange} />
            <label htmlFor="is_active" className="text-sm font-medium">Active</label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={processing}>
              Cancel
            </Button>
            <Button type="submit" variant="outline" disabled={processing}>
              {processing ? "Saving..." : rateToUpdate?.id ? "Update Rate" : "Add Rate"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
