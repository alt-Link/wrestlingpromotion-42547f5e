
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Show } from "@/types/showBooking";

interface ShowFormProps {
  show: Show;
  setShow: (show: Show) => void;
  isEdit?: boolean;
}

export const ShowForm = ({ show, setShow, isEdit = false }: ShowFormProps) => {
  const idPrefix = isEdit ? "edit" : "";

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor={`${idPrefix}ShowName`} className="text-orange-200">Show Name</Label>
        <Input
          id={`${idPrefix}ShowName`}
          value={show.name}
          onChange={(e) => setShow({...show, name: e.target.value})}
          className="bg-slate-700 border-orange-500/30 text-white"
          placeholder="e.g. Monday Night Raw, SmackDown Live"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-orange-200">Brand</Label>
          <Select value={show.brand} onValueChange={(value) => setShow({...show, brand: value})}>
            <SelectTrigger className="bg-slate-700 border-orange-500/30 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-orange-500/30">
              <SelectItem value="Raw">Raw</SelectItem>
              <SelectItem value="SmackDown">SmackDown</SelectItem>
              <SelectItem value="NXT">NXT</SelectItem>
              <SelectItem value="PPV">PPV</SelectItem>
              <SelectItem value="Special">Special Event</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-orange-200">Frequency</Label>
          <Select value={show.frequency} onValueChange={(value) => setShow({...show, frequency: value})}>
            <SelectTrigger className="bg-slate-700 border-orange-500/30 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-orange-500/30">
              <SelectItem value="one-time">One-time Event</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {!isEdit && (
        <div>
          <Label htmlFor={`${idPrefix}ShowDate`} className="text-orange-200">
            {show.frequency === "one-time" ? "Event Date" : "Start Date"}
          </Label>
          <Input
            id={`${idPrefix}ShowDate`}
            type="datetime-local"
            value={show.date?.slice(0, 16) || ""}
            onChange={(e) => setShow({...show, date: e.target.value ? new Date(e.target.value).toISOString() : ""})}
            className="bg-slate-700 border-orange-500/30 text-white"
          />
        </div>
      )}

      <div>
        <Label htmlFor={`${idPrefix}Venue`} className="text-orange-200">Venue</Label>
        <Input
          id={`${idPrefix}Venue`}
          value={show.venue}
          onChange={(e) => setShow({...show, venue: e.target.value})}
          className="bg-slate-700 border-orange-500/30 text-white"
          placeholder="e.g. Madison Square Garden"
        />
      </div>

      <div>
        <Label htmlFor={`${idPrefix}Description`} className="text-orange-200">Description</Label>
        <Textarea
          id={`${idPrefix}Description`}
          value={show.description}
          onChange={(e) => setShow({...show, description: e.target.value})}
          className="bg-slate-700 border-orange-500/30 text-white"
          placeholder="Show description and special notes"
          rows={3}
        />
      </div>
    </div>
  );
};
