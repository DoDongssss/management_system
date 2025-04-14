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

import { type Amenity } from "@/types/amentiy";

interface CreateUpdateAmenityProps {
  isOpen: boolean;
  onClose: () => void;
  amenityToUpdate?: Amenity | null;
}

const initialAmenityData: Partial<Amenity> = {
  id: null,
  name: "",
  icon: "",
  is_active: 1,
};

export default function CreateUpdateAmenity({ isOpen, onClose, amenityToUpdate }: CreateUpdateAmenityProps) {
  const { data, setData, post, reset, errors, processing } = useForm<Partial<Amenity>>(initialAmenityData);
  const [isActive, setIsActive] = useState(data.is_active === 1);

  useEffect(() => {
    if (amenityToUpdate?.id) {
      setData({
        id: amenityToUpdate.id,
        name: amenityToUpdate.name || "",
        icon: amenityToUpdate.icon || "",
        is_active: amenityToUpdate.is_active ? 1 : 0,
      });
      setIsActive(amenityToUpdate.is_active === 1);
    } else {
      setData(initialAmenityData);
    }
  }, [amenityToUpdate]);

  const handleStatusChange = () => {
    setIsActive((prev) => !prev);
    setData("is_active", isActive ? 0 : 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    post(
      amenityToUpdate?.id ? route("amenity.update", amenityToUpdate.id) : route("amenity.store"),
      {
        onSuccess: () => {
          toast.success(amenityToUpdate?.id ? "Amenity updated successfully!" : "Amenity created successfully!");
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
          <DialogTitle>{amenityToUpdate?.id ? "Update Amenity" : "Create Amenity"}</DialogTitle>
          <DialogDescription>
            {amenityToUpdate
              ? "Update the details of the existing amenity."
              : "Fill in the details to create a new amenity."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Amenity Name</Label>
            <Input
              id="name"
              type="text"
              value={data.name}
              onChange={(e) => setData("name", e.target.value)}
              disabled={processing}
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>

          <div>
            <Label htmlFor="icon">Icon</Label>
            <Input
              id="icon"
              type="text"
              value={data.icon}
              onChange={(e) => setData("icon", e.target.value)}
              placeholder="&lt;Icon name=&quot;Plus&quot; className=&quot;text-green-500&quot; size={24} /&gt;"
              disabled={processing}
            />
            <span className="text-xs text-gray-600"> Ex. Format: &quot;&lt;Icon name=&quot;Plus&quot; className=&quot;text-green-500&quot; size={24} /&gt;&quot; </span>

            {errors.icon && <p className="text-red-500 text-sm">{errors.icon}</p>}
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
              {processing ? "Saving..." : amenityToUpdate?.id ? "Update Amenity" : "Add Amenity"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
