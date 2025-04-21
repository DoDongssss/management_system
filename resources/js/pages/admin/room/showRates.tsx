import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
  } from "@/components/ui/dialog";
  
  import { Button } from "@/components/ui/button";
  import { Label } from "@/components/ui/label";
  import { ScrollArea } from "@/components/ui/scroll-area";
  import { type RoomRate } from "@/types/rate";
  
  interface ShowRateProps {
    isOpen: boolean;
    onClose: () => void;
    rates: RoomRate[] | undefined | null | []; 
  }
  
  export default function ShowRate({ isOpen, onClose, rates }: ShowRateProps) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            {/* <DialogTitle>SAMPLE ROOM NAME</DialogTitle> */}
            <DialogDescription>Room Rates by Duration</DialogDescription>
          </DialogHeader>
  
          <ScrollArea className="h-60 pr-4">
            {rates.length > 0 ? (
              <div className="space-y-3">
                {rates.map((rate) => (
                  <div key={rate.id} className="border rounded-md p-4 bg-gray-50">
                    <div className="flex justify-between">
                      <Label>Duration (hrs):</Label>
                      <span className="font-medium">{rate.durations_hours}</span>
                    </div>
                    <div className="flex justify-between">
                      <Label>Price:</Label>
                      <span className="font-medium">₱{Number(rate.price).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <Label>Status:</Label>
                      <span className={rate.is_active ? "text-green-600" : "text-red-600"}>
                        {rate.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No rates available for this room.</p>
            )}
          </ScrollArea>
  
          <DialogFooter>
            <Button type="button" onClick={onClose} variant="outline">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
  