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
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectContent,
} from "@/components/ui/select";

import { MultiSelect } from "@/components/multi-select";
import { Cat, Dog, Fish, Rabbit, Turtle } from "lucide-react";

import { type Room, PartialRoom } from "@/types/room";
import { type Amenity, AmenityMultiSelect } from "@/types/amentiy";

// Adjusted the type definition for amenities prop
interface CreateUpdateRoomProps {
  isOpen: boolean;
  onClose: () => void;
  amenities: AmenityMultiSelect[]; 
  roomToUpdate?: Room | null;
}

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

export default function CreateUpdateRoom({
  isOpen,
  onClose,
  amenities,
  roomToUpdate,
}: CreateUpdateRoomProps) {
  const { data, setData, post, reset, errors, processing } = useForm<Partial<PartialRoom>>(initialRoomData);
  const [isActive, setIsActive] = useState(data.is_active === 1);

  const [selectedAmenities, setSelectedAmenities] = useState<any[]>([]);

  useEffect(() => {
    if (roomToUpdate?.id) {
      setSelectedAmenities(roomToUpdate.room_amenities?.map((ra) => ra.amenity_id) || []);

      setData({
        id: roomToUpdate.id,
        room_number: roomToUpdate.room_number || "",
        name: roomToUpdate.name || "",
        type: roomToUpdate.type || "",
        image: "",
        image_path: roomToUpdate.image?.toString() || "",
        status: roomToUpdate.status || "VACANT",
        is_active: roomToUpdate.is_active ? 1 : 0,
        room_amenities: roomToUpdate.room_amenities?.map((ra) => ra.amenity_id).join(",") || ""
      });
      setIsActive(roomToUpdate.is_active ? true : false);
    } else {
      setData(initialRoomData);
    }
  }, [roomToUpdate]);

  useEffect(() => { 
    setData("room_amenities", selectedAmenities.length > 0 ? selectedAmenities.map((a) => String(a)).join(",") : "");
  }, [selectedAmenities]);

  const handleStatusChange = () => {
    setIsActive((prev) => !prev);
    setData("is_active", isActive ? 0 : 1);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setData("image", file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log(data);
    post(
      roomToUpdate?.id ? route("room.update", roomToUpdate.id) : route("room.store"),
      {
        onSuccess: () => {
          toast.success(roomToUpdate?.id ? "Room updated successfully!" : "Room created successfully!");
          setData(initialRoomData);
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
          <DialogTitle>{roomToUpdate?.id ? "Update Room" : "Create Room"}</DialogTitle>
          <DialogDescription>
            {roomToUpdate
              ? "Update the details of the existing room."
              : "Fill in the details to create a new room."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="room_number">Room Number</Label>
            <Input
              id="room_number"
              type="text"
              value={data.room_number}
              onChange={(e) => setData("room_number", e.target.value.toUpperCase())}
              disabled={processing}
            />
            {errors.room_number && <p className="text-red-500 text-sm">{errors.room_number}</p>}
          </div>

          <div>
            <Label htmlFor="name">Room Name</Label>
            <Input
              id="name"
              type="text"
              value={data.name}
              onChange={(e) => setData("name", e.target.value.toUpperCase())}
              disabled={processing}
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>

          <div>
            <Label htmlFor="type">Type</Label>
            <Input
              id="type"
              type="text"
              value={data.type}
              onChange={(e) => setData("type", e.target.value.toUpperCase())}
              disabled={processing}
            />
            {errors.type && <p className="text-red-500 text-sm">{errors.type}</p>}
          </div>

          <div className="max-w-xl">
            <Label htmlFor="ameneties">Ameneties</Label>
            <MultiSelect
              options={amenities}
              onValueChange={setSelectedAmenities}
              defaultValue={selectedAmenities}
              placeholder="Select Amenities"
              variant="inverted"
              animation={2}
              maxCount={5}
            />
            {errors.image && <p className="text-red-500 text-sm">{errors.image}</p>}
          </div>

          <div>
            <Label htmlFor="image">Image</Label>
            <Input id="image" type="file" accept="image/*" onChange={handleImageChange} disabled={processing} />
            {data.image_path && (
              <div className="mt-1">
                <a
                  href={data.image_path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 text-sm underline hover:text-blue-600 transition-all"
                >
                  Image: {data.image_path.split("/").pop()}
                </a>
              </div>
            )}
            {errors.image && <p className="text-red-500 text-sm">{errors.image}</p>}
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={data.status} onValueChange={(value) => setData("status", value)}>
              <SelectTrigger className="w-full border rounded-md">
                <SelectValue placeholder="Select room status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VACANT">Vacant</SelectItem>
                <SelectItem value="OCCUPIED">Occupied</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && <p className="text-red-500 text-sm">{errors.status}</p>}
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
              {processing ? "Saving..." : roomToUpdate?.id ? "Update Room" : "Add Room"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
