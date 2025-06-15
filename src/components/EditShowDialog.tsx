
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Show } from "@/types/show";

interface EditShowDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingShow: Show | null;
  onEditShow: (show: Show) => void;
  onSave: () => void;
}

export const EditShowDialog = ({ 
  isOpen, 
  onOpenChange, 
  editingShow, 
  onEditShow, 
  onSave 
}: EditShowDialogProps) => {
  if (!editingShow) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-blue-500/30 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Show Template</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="editShowName" className="text-blue-200">Show Name</Label>
              <Input
                id="editShowName"
                value={editingShow.name}
                onChange={(e) => onEditShow({...editingShow, name: e.target.value})}
                className="bg-slate-700 border-blue-500/30 text-white"
                placeholder="e.g. Monday Night Raw"
              />
            </div>
            <div>
              <Label className="text-blue-200">Brand</Label>
              <Select value={editingShow.brand} onValueChange={(value) => onEditShow({...editingShow, brand: value})}>
                <SelectTrigger className="bg-slate-700 border-blue-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-blue-500/30">
                  <SelectItem value="Raw">Raw</SelectItem>
                  <SelectItem value="SmackDown">SmackDown</SelectItem>
                  <SelectItem value="NXT">NXT</SelectItem>
                  <SelectItem value="PPV">Pay-Per-View</SelectItem>
                  <SelectItem value="Special">Special Event</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-blue-200">Show Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-slate-700 border-blue-500/30 text-white",
                      !editingShow.date && "text-slate-400"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {editingShow.date ? format(editingShow.date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={editingShow.date}
                    onSelect={(date) => onEditShow({...editingShow, date})}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label className="text-blue-200">Frequency</Label>
              <Select value={editingShow.frequency} onValueChange={(value) => onEditShow({...editingShow, frequency: value})}>
                <SelectTrigger className="bg-slate-700 border-blue-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-blue-500/30">
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="one-time">One Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="editVenue" className="text-blue-200">Venue</Label>
            <Input
              id="editVenue"
              value={editingShow.venue}
              onChange={(e) => onEditShow({...editingShow, venue: e.target.value})}
              className="bg-slate-700 border-blue-500/30 text-white"
              placeholder="e.g. Madison Square Garden"
            />
          </div>

          <div>
            <Label htmlFor="editDescription" className="text-blue-200">Description</Label>
            <Input
              id="editDescription"
              value={editingShow.description}
              onChange={(e) => onEditShow({...editingShow, description: e.target.value})}
              className="bg-slate-700 border-blue-500/30 text-white"
              placeholder="Special notes or event details"
            />
          </div>

          <div className="flex space-x-2">
            <Button onClick={onSave} className="flex-1 bg-blue-600 hover:bg-blue-700">
              Save Changes
            </Button>
            <Button 
              onClick={() => onOpenChange(false)} 
              variant="outline" 
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
