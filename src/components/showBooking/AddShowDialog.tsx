
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ShowForm } from "./ShowForm";
import { MatchForm } from "./MatchForm";
import { MatchesList } from "./MatchesList";
import type { Show, Match } from "@/types/showBooking";

interface AddShowDialogProps {
  onSaveShow: (show: Show) => Promise<{ error?: any }>;
  wrestlers: any[];
  championships: any[];
}

export const AddShowDialog = ({ onSaveShow, wrestlers, championships }: AddShowDialogProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [newMatch, setNewMatch] = useState({
    type: "Singles Match",
    participants: [] as string[],
    championship: "",
    stipulation: "",
    notes: ""
  });

  const [newShow, setNewShow] = useState<Show>({
    name: "",
    brand: "Raw",
    frequency: "one-time",
    venue: "",
    description: "",
    matches: [],
    is_template: false
  });

  const createShow = async () => {
    if (!newShow.name.trim() || !newShow.venue.trim()) {
      toast({
        title: "Error",
        description: "Show name and venue are required",
        variant: "destructive"
      });
      return;
    }

    const showData: Show = {
      name: newShow.name.trim(),
      brand: newShow.brand,
      frequency: newShow.frequency,
      venue: newShow.venue.trim(),
      description: newShow.description.trim(),
      matches: newShow.matches,
      is_template: newShow.frequency !== "one-time",
      date: newShow.date || new Date().toISOString()
    };

    if (newShow.frequency === "one-time") {
      showData.instance_date = newShow.date || new Date().toISOString();
      showData.is_template = false;
    }

    const { error } = await onSaveShow(showData);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to create show. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    setNewShow({
      name: "",
      brand: "Raw",
      frequency: "one-time",
      venue: "",
      description: "",
      matches: [],
      is_template: false
    });
    setIsOpen(false);
    
    toast({
      title: "Show Created",
      description: `${showData.name} has been successfully scheduled.`
    });
  };

  const addMatchToShow = () => {
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

    setNewShow({
      ...newShow,
      matches: [...newShow.matches, match]
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
    setNewShow({
      ...newShow,
      matches: newShow.matches.filter(match => match.id !== matchId)
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-orange-600 hover:bg-orange-700">
          <Plus className="w-4 h-4 mr-2" />
          Book New Show
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-800 border-orange-500/30 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Book New Show</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ShowForm show={newShow} setShow={setNewShow} />
          
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
              matches={newShow.matches} 
              onRemoveMatch={removeMatchFromShow} 
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-600">
          <Button 
            onClick={() => setIsOpen(false)} 
            variant="outline"
            className="border-slate-500 text-slate-300 hover:bg-slate-700"
          >
            Cancel
          </Button>
          <Button onClick={createShow} className="bg-orange-600 hover:bg-orange-700">
            Create Show
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
