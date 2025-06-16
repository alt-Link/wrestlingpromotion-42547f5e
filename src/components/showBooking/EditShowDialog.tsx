
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ShowForm } from "./ShowForm";
import { MatchForm } from "./MatchForm";
import { MatchesList } from "./MatchesList";
import type { Show, Match } from "@/types/showBooking";

interface EditShowDialogProps {
  isOpen: boolean;
  onClose: () => void;
  show: Show | null;
  onSaveShow: (show: Show) => Promise<{ error?: any }>;
  wrestlers: any[];
  championships: any[];
}

export const EditShowDialog = ({ 
  isOpen, 
  onClose, 
  show, 
  onSaveShow, 
  wrestlers, 
  championships 
}: EditShowDialogProps) => {
  const { toast } = useToast();
  const [editingShow, setEditingShow] = useState<Show | null>(show);
  const [newMatch, setNewMatch] = useState({
    type: "Singles Match",
    participants: [] as string[],
    championship: "",
    stipulation: "",
    notes: ""
  });

  const saveEditedShow = async () => {
    if (!editingShow) return;

    if (!editingShow.name.trim() || !editingShow.venue.trim()) {
      toast({
        title: "Error",
        description: "Show name and venue are required",
        variant: "destructive"
      });
      return;
    }

    const { error } = await onSaveShow(editingShow);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to update show. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    onClose();
    
    toast({
      title: "Show Updated",
      description: "Show has been successfully updated."
    });
  };

  const addMatchToShow = () => {
    if (!editingShow) return;
    
    if (newMatch.participants.length < 1) {
      toast({
        title: "Error",
        description: "At least one participant is required",
        variant: "destructive"
      });
      return;
    }

    const match: Match = {
      id: Date.now().toString(),
      type: newMatch.type,
      participants: [...newMatch.participants],
      championship: newMatch.championship || undefined,
      stipulation: newMatch.stipulation || undefined,
      notes: newMatch.notes || undefined
    };

    setEditingShow({
      ...editingShow,
      matches: [...editingShow.matches, match]
    });

    setNewMatch({
      type: "Singles Match",
      participants: [],
      championship: "",
      stipulation: "",
      notes: ""
    });

    toast({
      title: "Match Added",
      description: "Match has been added to the show."
    });
  };

  const removeMatchFromShow = (matchId: string) => {
    if (!editingShow) return;
    
    setEditingShow({
      ...editingShow,
      matches: editingShow.matches.filter(match => match.id !== matchId)
    });

    toast({
      title: "Match Removed",
      description: "Match has been removed from the show."
    });
  };

  const toggleWrestlerInMatch = (wrestlerName: string, participants: string[], setParticipants: (participants: string[]) => void) => {
    if (participants.includes(wrestlerName)) {
      setParticipants(participants.filter(p => p !== wrestlerName));
    } else {
      setParticipants([...participants, wrestlerName]);
    }
  };

  if (!editingShow) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-orange-500/30 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Show</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ShowForm show={editingShow} setShow={setEditingShow} isEdit />
          
          <div className="space-y-4">
            <MatchForm
              newMatch={newMatch}
              setNewMatch={setNewMatch}
              wrestlers={wrestlers}
              championships={championships}
              onAddMatch={addMatchToShow}
              toggleWrestlerInMatch={toggleWrestlerInMatch}
            />
            
            <MatchesList 
              matches={editingShow.matches} 
              onRemoveMatch={removeMatchFromShow} 
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-600">
          <Button 
            onClick={onClose} 
            variant="outline"
            className="border-slate-500 text-slate-300 hover:bg-slate-700"
          >
            Cancel
          </Button>
          <Button onClick={saveEditedShow} className="bg-orange-600 hover:bg-orange-700">
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
