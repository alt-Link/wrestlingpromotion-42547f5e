
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Trophy } from "lucide-react";
import type { Match } from "@/types/showBooking";

interface MatchesListProps {
  matches: Match[];
  onRemoveMatch: (matchId: string) => void;
}

export const MatchesList = ({ matches, onRemoveMatch }: MatchesListProps) => {
  return (
    <div>
      <Label className="text-orange-200">Booked Matches ({matches.length})</Label>
      <div className="max-h-64 overflow-y-auto space-y-2 mt-2">
        {matches.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-4">No matches booked yet</p>
        ) : (
          matches.map((match) => (
            <div key={match.id} className="bg-slate-600/50 p-3 rounded flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white text-sm font-medium">{match.type}</span>
                  {match.championship && (
                    <Badge className="bg-yellow-600 text-white text-xs">
                      <Trophy className="w-3 h-3 mr-1" />
                      {match.championship}
                    </Badge>
                  )}
                </div>
                <div className="text-slate-300 text-xs mb-1">
                  {match.participants.join(" vs ")}
                </div>
                {match.stipulation && (
                  <div className="text-orange-400 text-xs">Stipulation: {match.stipulation}</div>
                )}
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onRemoveMatch(match.id)}
                className="text-red-400 hover:bg-red-500/20 ml-2"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
