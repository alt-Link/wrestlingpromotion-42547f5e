
import { Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

interface ShowBookingHeaderProps {
  onAddClick: () => void;
}

export const ShowBookingHeader = ({ onAddClick }: ShowBookingHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <Calendar className="w-6 h-6 text-blue-400" />
        <h2 className="text-2xl font-bold text-white">Show Booking</h2>
      </div>
      <Button onClick={onAddClick} className="bg-blue-600 hover:bg-blue-700">
        <Plus className="w-4 h-4 mr-2" />
        Book New Show
      </Button>
    </div>
  );
};
