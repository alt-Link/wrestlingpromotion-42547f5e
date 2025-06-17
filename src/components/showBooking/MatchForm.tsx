
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { MATCH_TYPES } from "@/types/showBooking";

interface MatchFormProps {
  newMatch: {
    type: string;
    participants: string[];
    championship: string;
    stipulation: string;
    notes: string;
  };
  setNewMatch: (match: any) => void;
  wrestlers: any[];
  championships: any[];
  onAddMatch: () => void;
  toggleWrestlerInMatch: (wrestlerName: string, participants: string[], setParticipants: (participants: string[]) => void) => void;
}

export const MatchForm = ({ 
  newMatch, 
  setNewMatch, 
  wrestlers, 
  championships, 
  onAddMatch, 
  toggleWrestlerInMatch 
}: MatchFormProps) => {
  return (
    <div className="bg-slate-700/50 p-4 rounded-lg">
      <h3 className="text-orange-200 font-medium mb-3">Add Match</h3>
      
      <div className="space-y-3">
        <Select value={newMatch.type} onValueChange={(value) => setNewMatch({...newMatch, type: value})}>
          <SelectTrigger className="bg-slate-600 border-orange-500/30 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-700 border-orange-500/30 max-h-48">
            {MATCH_TYPES.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div>
          <Label className="text-orange-200 text-sm">Participants</Label>
          <div className="bg-slate-600/50 p-3 rounded max-h-32 overflow-y-auto">
            {wrestlers.length === 0 ? (
              <p className="text-slate-400 text-sm">No wrestlers available. Add wrestlers to your roster first.</p>
            ) : (
              <div className="space-y-1">
                {wrestlers.filter(wrestler => wrestler.name && wrestler.name.trim() !== '').map((wrestler: any) => (
                  <div key={wrestler.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`match-wrestler-${wrestler.id}`}
                      checked={newMatch.participants.includes(wrestler.name)}
                      onCheckedChange={() => toggleWrestlerInMatch(wrestler.name, newMatch.participants, (participants) => setNewMatch({...newMatch, participants}))}
                      className="border-orange-400"
                    />
                    <Label 
                      htmlFor={`match-wrestler-${wrestler.id}`} 
                      className="text-white text-sm cursor-pointer flex-1"
                    >
                      {wrestler.name} <span className="text-slate-400">({wrestler.brand})</span>
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>
          {newMatch.participants.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {newMatch.participants.map((participant) => (
                <Badge key={participant} className="bg-orange-600 text-white text-xs">
                  {participant}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <Select value={newMatch.championship} onValueChange={(value) => setNewMatch({...newMatch, championship: value})}>
          <SelectTrigger className="bg-slate-600 border-orange-500/30 text-white">
            <SelectValue placeholder="Championship (optional)" />
          </SelectTrigger>
          <SelectContent className="bg-slate-700 border-orange-500/30">
            <SelectItem value="none">No Championship</SelectItem>
            {championships
              .filter((c: any) => !c.retired && c.name && c.name.trim() !== '')
              .map((championship: any) => (
                <SelectItem key={championship.id} value={championship.name}>
                  {championship.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        <Input
          placeholder="Stipulation (optional)"
          value={newMatch.stipulation}
          onChange={(e) => setNewMatch({...newMatch, stipulation: e.target.value})}
          className="bg-slate-600 border-orange-500/30 text-white"
        />

        <Textarea
          placeholder="Match notes (optional)"
          value={newMatch.notes}
          onChange={(e) => setNewMatch({...newMatch, notes: e.target.value})}
          className="bg-slate-600 border-orange-500/30 text-white"
          rows={2}
        />

        <Button 
          onClick={onAddMatch} 
          className="w-full bg-orange-600 hover:bg-orange-700"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Match
        </Button>
      </div>
    </div>
  );
};
