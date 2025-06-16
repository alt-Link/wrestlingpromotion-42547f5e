
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Edit, Trash2, Trophy, Users, Clock, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUniverseData } from "@/hooks/useUniverseData";
import { AddShowDialog } from "./showBooking/AddShowDialog";
import { EditShowDialog } from "./showBooking/EditShowDialog";
import { getBrandColor, getFrequencyIcon } from "./showBooking/ShowBookingUtils";
import type { Show } from "@/types/showBooking";

export const ShowBooking = () => {
  const { data, loading, saveShow, deleteRecord } = useUniverseData();
  const { toast } = useToast();
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingShow, setEditingShow] = useState<Show | null>(null);

  const shows = data.shows || [];
  const wrestlers = data.wrestlers || [];
  const championships = data.championships || [];

  const startEditShow = (show: any) => {
    setEditingShow({
      ...show,
      matches: show.matches || []
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteShow = async (id: string) => {
    const { error } = await deleteRecord('shows', id);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete show. Please try again.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Show Deleted",
      description: "Show has been removed from your schedule."
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Calendar className="w-6 h-6 text-orange-400" />
          <h2 className="text-2xl font-bold text-white">Show Booking</h2>
        </div>
        <AddShowDialog 
          onSaveShow={saveShow} 
          wrestlers={wrestlers} 
          championships={championships} 
        />
      </div>

      <EditShowDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        show={editingShow}
        onSaveShow={saveShow}
        wrestlers={wrestlers}
        championships={championships}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shows.map((show: any) => (
          <Card key={show.id} className="bg-slate-800/50 border-orange-500/30 hover:border-orange-400/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-white text-lg">{show.name}</CardTitle>
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-orange-400 hover:bg-orange-500/20"
                    onClick={() => startEditShow(show)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-red-400 hover:bg-red-500/20"
                    onClick={() => handleDeleteShow(show.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge className={getBrandColor(show.brand)}>
                  {show.brand}
                </Badge>
                <Badge className="bg-slate-600 text-white">
                  {getFrequencyIcon(show.frequency)} {show.frequency}
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-orange-200">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{show.venue}</span>
                </div>
                {(show.date || show.instance_date) && (
                  <div className="flex items-center text-orange-200">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{new Date(show.date || show.instance_date).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex items-center text-orange-200">
                  <Users className="w-4 h-4 mr-1" />
                  <span>{show.matches?.length || 0} matches</span>
                </div>
              </div>
              
              {show.description && (
                <p className="text-sm text-slate-400">{show.description}</p>
              )}

              {show.matches && show.matches.length > 0 && (
                <div className="bg-slate-700/50 p-3 rounded">
                  <h4 className="text-sm font-medium text-orange-200 mb-2">Matches</h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {show.matches.slice(0, 3).map((match: any, index: number) => (
                      <div key={match.id || index} className="text-xs text-slate-300">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{match.type}</span>
                          {match.championship && (
                            <Badge className="bg-yellow-600 text-white text-xs">
                              <Trophy className="w-2 h-2 mr-1" />
                              Title
                            </Badge>
                          )}
                        </div>
                        <div className="text-slate-400">
                          {match.participants?.join(" vs ") || "TBD"}
                        </div>
                      </div>
                    ))}
                    {show.matches.length > 3 && (
                      <p className="text-xs text-slate-400">+{show.matches.length - 3} more matches</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {shows.length === 0 && (
        <Card className="bg-slate-800/50 border-orange-500/30">
          <CardContent className="text-center py-12">
            <Calendar className="w-12 h-12 text-orange-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Shows Scheduled</h3>
            <p className="text-orange-200 mb-4">
              Start booking your first show to schedule matches and events.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
