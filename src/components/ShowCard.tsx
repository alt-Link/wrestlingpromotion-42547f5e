
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Users, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Show } from "@/types/show";

interface ShowCardProps {
  show: Show;
  instancesCount: number;
  totalMatches: number;
  onEdit: (show: Show) => void;
  onDelete: (id: string) => void;
  getBrandColor: (brand: string) => string;
}

export const ShowCard = ({ 
  show, 
  instancesCount, 
  totalMatches, 
  onEdit, 
  onDelete, 
  getBrandColor 
}: ShowCardProps) => {
  return (
    <Card className="bg-slate-800/50 border-blue-500/30 hover:border-blue-400/50 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-white text-lg">{show.name}</CardTitle>
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-blue-400 hover:bg-blue-500/20"
              onClick={() => onEdit(show)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-red-400 hover:bg-red-500/20"
              onClick={() => onDelete(show.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-xs text-white ${getBrandColor(show.brand)}`}>
            {show.brand}
          </span>
          <span className="px-2 py-1 rounded text-xs bg-slate-600 text-white">
            {show.frequency}
          </span>
          {show.isTemplate && (
            <span className="px-2 py-1 rounded text-xs bg-purple-600 text-white">
              Template
            </span>
          )}
        </div>
        
        {show.date && (
          <p className="text-sm text-blue-200">
            <Clock className="w-4 h-4 inline mr-1" />
            Starts: {format(show.date, "PPP")}
          </p>
        )}
        
        {show.venue && (
          <p className="text-sm text-blue-200">
            <span className="font-medium">Venue:</span> {show.venue}
          </p>
        )}
        
        {show.description && (
          <p className="text-sm text-slate-400">{show.description}</p>
        )}
        
        <div className="flex items-center text-sm text-blue-200 mt-3">
          <Users className="w-4 h-4 mr-1" />
          {instancesCount} shows booked, {totalMatches} total matches
        </div>
      </CardContent>
    </Card>
  );
};
