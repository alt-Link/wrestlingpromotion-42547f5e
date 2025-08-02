
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Show } from "@/types/show";
import { useAutoSave } from "@/hooks/useAutoSave";

interface AddShowDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddShow: (show: Partial<Show>) => void;
}

export const AddShowDialog = ({ isOpen, onOpenChange, onAddShow }: AddShowDialogProps) => {
  const [newShow, setNewShow] = useState<Partial<Show>>({
    name: "",
    brand: "",
    frequency: "weekly",
    venue: "",
    description: "",
    matches: []
  });

  // Auto-save draft to localStorage
  const autoSaveDraft = () => {
    if (newShow.name?.trim()) {
      localStorage.setItem("draftShow", JSON.stringify(newShow));
    }
  };

  const debouncedAutoSave = useAutoSave({
    onSave: autoSaveDraft,
    delay: 500,
    showToast: false
  });

  // Load draft on open
  useEffect(() => {
    if (isOpen) {
      const savedDraft = localStorage.getItem("draftShow");
      if (savedDraft) {
        try {
          const parsedDraft = JSON.parse(savedDraft);
          setNewShow(parsedDraft);
        } catch (error) {
          console.error("Failed to load draft:", error);
        }
      }
    }
  }, [isOpen]);

  // Trigger auto-save when show data changes
  useEffect(() => {
    if (isOpen && newShow.name?.trim()) {
      debouncedAutoSave();
    }
  }, [newShow, isOpen, debouncedAutoSave]);

  const handleAddShow = () => {
    onAddShow(newShow);
    localStorage.removeItem("draftShow"); // Clear draft after successful creation
    setNewShow({
      name: "",
      brand: "",
      frequency: "weekly",
      venue: "",
      description: "",
      matches: []
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-blue-500/30 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white">Book New Show</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="showName" className="text-blue-200">Show Name</Label>
              <Input
                id="showName"
                value={newShow.name || ""}
                onChange={(e) => setNewShow({...newShow, name: e.target.value})}
                className="bg-slate-700 border-blue-500/30 text-white"
                placeholder="e.g. Monday Night Raw"
              />
            </div>
            <div>
              <Label className="text-blue-200">Brand</Label>
              <Input
                value={newShow.brand || ""}
                onChange={(e) => setNewShow({...newShow, brand: e.target.value})}
                className="bg-slate-700 border-blue-500/30 text-white"
                placeholder="Enter brand name (e.g. Raw, SmackDown, NXT)"
              />
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
                      !newShow.date && "text-slate-400"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newShow.date ? format(newShow.date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white border border-gray-200 shadow-lg z-50" align="start">
                  <Calendar
                    mode="single"
                    selected={newShow.date}
                    onSelect={(date) => setNewShow({...newShow, date})}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label className="text-blue-200">Frequency</Label>
              <Select value={newShow.frequency} onValueChange={(value) => setNewShow({...newShow, frequency: value})}>
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
            <Label htmlFor="venue" className="text-blue-200">Venue</Label>
            <Input
              id="venue"
              value={newShow.venue || ""}
              onChange={(e) => setNewShow({...newShow, venue: e.target.value})}
              className="bg-slate-700 border-blue-500/30 text-white"
              placeholder="e.g. Madison Square Garden"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-blue-200">Description</Label>
            <Input
              id="description"
              value={newShow.description || ""}
              onChange={(e) => setNewShow({...newShow, description: e.target.value})}
              className="bg-slate-700 border-blue-500/30 text-white"
              placeholder="Special notes or event details"
            />
          </div>

          <Button onClick={handleAddShow} className="w-full bg-blue-600 hover:bg-blue-700">
            Create Show
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
