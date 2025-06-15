
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Plus } from "lucide-react";

interface EmptyShowsStateProps {
  onAddClick: () => void;
}

export const EmptyShowsState = ({ onAddClick }: EmptyShowsStateProps) => {
  return (
    <Card className="bg-slate-800/50 border-blue-500/30">
      <CardContent className="text-center py-12">
        <Calendar className="w-12 h-12 text-blue-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Shows Booked</h3>
        <p className="text-blue-200 mb-4">
          Start planning your wrestling events by booking your first show.
        </p>
        <Button onClick={onAddClick} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Book Your First Show
        </Button>
      </CardContent>
    </Card>
  );
};
