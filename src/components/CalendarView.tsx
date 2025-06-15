
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, ChevronLeft, ChevronRight, Plus, Users, Trophy, Clock, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Show {
  id: string;
  name: string;
  brand: string;
  date?: Date;
  frequency: string;
  venue: string;
  description: string;
  matches?: Match[];
}

interface Match {
  id: string;
  participants: string[];
  type: string;
  championship?: string;
  stipulation?: string;
  description: string;
}

export const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [shows, setShows] = useState<Show[]>([]);
  const [wrestlers, setWrestlers] = useState<any[]>([]);
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [isMatchDialogOpen, setIsMatchDialogOpen] = useState(false);
  const [isShowDetailsDialogOpen, setIsShowDetailsDialogOpen] = useState(false);
  const [newMatch, setNewMatch] = useState<Partial<Match>>({
    participants: [],
    type: "Singles",
    description: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    const savedShows = localStorage.getItem("shows");
    if (savedShows) {
      const parsed = JSON.parse(savedShows);
      const showsWithDates = parsed.map((show: any) => ({
        ...show,
        date: show.date ? new Date(show.date) : undefined,
        matches: show.matches || []
      }));
      setShows(showsWithDates);
    }

    const savedWrestlers = localStorage.getItem("wrestlers");
    if (savedWrestlers) {
      setWrestlers(JSON.parse(savedWrestlers));
    }
  }, []);

  const saveShows = (updatedShows: Show[]) => {
    setShows(updatedShows);
    localStorage.setItem("shows", JSON.stringify(updatedShows));
  };

  const addMatchToShow = () => {
    if (!newMatch.participants?.length || newMatch.participants.length < 2) {
      toast({
        title: "Error",
        description: "At least 2 participants are required for a match",
        variant: "destructive"
      });
      return;
    }

    const match: Match = {
      id: Date.now().toString(),
      participants: newMatch.participants!,
      type: newMatch.type || "Singles",
      championship: newMatch.championship,
      stipulation: newMatch.stipulation,
      description: newMatch.description || ""
    };

    const updatedShows = shows.map(show => 
      show.id === selectedShow?.id 
        ? { ...show, matches: [...(show.matches || []), match] }
        : show
    );

    saveShows(updatedShows);
    
    // Update selectedShow to reflect the new match
    if (selectedShow) {
      setSelectedShow({
        ...selectedShow,
        matches: [...(selectedShow.matches || []), match]
      });
    }
    
    setNewMatch({
      participants: [],
      type: "Singles",
      description: ""
    });
    setIsMatchDialogOpen(false);
    
    toast({
      title: "Match Added",
      description: `Match has been added to ${selectedShow?.name}.`
    });
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
  };

  const getBrandColor = (brand: string) => {
    switch (brand) {
      case "Raw": return "bg-red-600";
      case "SmackDown": return "bg-blue-600";
      case "NXT": return "bg-yellow-600";
      case "PPV": return "bg-orange-600";
      case "Special": return "bg-green-600";
      default: return "bg-gray-600";
    }
  };

  const getShowsForDate = (day: number) => {
    return shows.filter(show => {
      if (!show.date) return false;
      const showDate = new Date(show.date);
      return showDate.getDate() === day &&
             showDate.getMonth() === currentDate.getMonth() &&
             showDate.getFullYear() === currentDate.getFullYear();
    });
  };

  const handleShowClick = (show: Show, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedShow(show);
    
    // If the show has matches, show details, otherwise open match booking
    if (show.matches && show.matches.length > 0) {
      setIsShowDetailsDialogOpen(true);
    } else {
      setIsMatchDialogOpen(true);
    }
  };

  const openMatchBooking = () => {
    setIsShowDetailsDialogOpen(false);
    setIsMatchDialogOpen(true);
  };

  const renderCalendarDays = () => {
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-24 bg-slate-800/30 border border-slate-700/50"></div>
      );
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
      const dayShows = getShowsForDate(day);
      
      days.push(
        <div
          key={day}
          className={`h-24 border border-slate-700/50 p-2 hover:bg-slate-700/30 cursor-pointer transition-colors ${
            isToday ? 'bg-purple-600/20 border-purple-500/50' : 'bg-slate-800/50'
          }`}
        >
          <div className={`text-sm font-medium ${isToday ? 'text-purple-300' : 'text-white'}`}>
            {day}
          </div>
          <div className="mt-1 space-y-1">
            {dayShows.map((show, index) => (
              <div 
                key={show.id}
                className={`text-white text-xs px-1 rounded truncate cursor-pointer hover:opacity-80 ${getBrandColor(show.brand)}`}
                title={`${show.name}${show.venue ? ` at ${show.venue}` : ''} - Click to view/add matches`}
                onClick={(e) => handleShowClick(show, e)}
              >
                {show.name} ({show.matches?.length || 0} matches)
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    return days;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Calendar className="w-6 h-6 text-green-400" />
          <h2 className="text-2xl font-bold text-white">Calendar View</h2>
        </div>
      </div>

      {/* Show Details Dialog */}
      <Dialog open={isShowDetailsDialogOpen} onOpenChange={setIsShowDetailsDialogOpen}>
        <DialogContent className="bg-slate-800 border-green-500/30 max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">
              {selectedShow?.name} - Show Details
            </DialogTitle>
          </DialogHeader>
          {selectedShow && (
            <div className="space-y-6">
              {/* Show Information */}
              <div className="bg-slate-700/50 border border-green-500/30 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Brand:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs text-white ${getBrandColor(selectedShow.brand)}`}>
                      {selectedShow.brand}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Date:</span>
                    <span className="text-white ml-2">
                      {selectedShow.date ? new Date(selectedShow.date).toLocaleDateString() : "Not set"}
                    </span>
                  </div>
                  {selectedShow.venue && (
                    <div>
                      <span className="text-slate-400">Venue:</span>
                      <span className="text-white ml-2">{selectedShow.venue}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-400">Frequency:</span>
                    <span className="text-white ml-2">{selectedShow.frequency}</span>
                  </div>
                </div>
                {selectedShow.description && (
                  <div className="mt-4">
                    <span className="text-slate-400">Description:</span>
                    <p className="text-white mt-1">{selectedShow.description}</p>
                  </div>
                )}
              </div>

              {/* Matches List */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-green-200">Match Card ({selectedShow.matches?.length || 0} matches)</h3>
                  <Button onClick={openMatchBooking} className="bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Match
                  </Button>
                </div>
                
                {selectedShow.matches && selectedShow.matches.length > 0 ? (
                  <div className="space-y-3">
                    {selectedShow.matches.map((match, index) => (
                      <div key={match.id} className="bg-slate-700/50 border border-green-500/30 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-white">{match.participants.join(" vs ")}</h4>
                            <p className="text-sm text-green-200">{match.type}</p>
                          </div>
                          <span className="text-sm text-slate-400">Match #{index + 1}</span>
                        </div>
                        
                        {match.championship && (
                          <div className="flex items-center text-sm text-yellow-400 mb-1">
                            <Trophy className="w-4 h-4 mr-1" />
                            Championship: {match.championship}
                          </div>
                        )}
                        
                        {match.stipulation && (
                          <p className="text-sm text-orange-400 mb-1">Stipulation: {match.stipulation}</p>
                        )}
                        
                        {match.description && (
                          <p className="text-sm text-slate-300">{match.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-slate-700/30 rounded-lg border border-green-500/30">
                    <Users className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <p className="text-green-200 mb-2">No matches booked yet</p>
                    <p className="text-sm text-slate-400 mb-4">Start building your match card for this show</p>
                    <Button onClick={openMatchBooking} className="bg-green-600 hover:bg-green-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Book First Match
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Match Booking Dialog */}
      <Dialog open={isMatchDialogOpen} onOpenChange={setIsMatchDialogOpen}>
        <DialogContent className="bg-slate-800 border-green-500/30 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">
              Add Match to {selectedShow?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-green-200">Match Type</Label>
              <Select value={newMatch.type} onValueChange={(value) => setNewMatch({...newMatch, type: value})}>
                <SelectTrigger className="bg-slate-700 border-green-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-green-500/30">
                  <SelectItem value="Singles">Singles Match</SelectItem>
                  <SelectItem value="Tag Team">Tag Team Match</SelectItem>
                  <SelectItem value="Triple Threat">Triple Threat</SelectItem>
                  <SelectItem value="Fatal 4-Way">Fatal 4-Way</SelectItem>
                  <SelectItem value="Battle Royal">Battle Royal</SelectItem>
                  <SelectItem value="Ladder">Ladder Match</SelectItem>
                  <SelectItem value="Steel Cage">Steel Cage Match</SelectItem>
                  <SelectItem value="Hell in a Cell">Hell in a Cell</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-green-200">Participants</Label>
              <div className="space-y-2">
                {wrestlers.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    {wrestlers.map((wrestler) => (
                      <label key={wrestler.id} className="flex items-center space-x-2 text-sm text-white">
                        <input
                          type="checkbox"
                          checked={newMatch.participants?.includes(wrestler.name) || false}
                          onChange={(e) => {
                            const participants = newMatch.participants || [];
                            if (e.target.checked) {
                              setNewMatch({...newMatch, participants: [...participants, wrestler.name]});
                            } else {
                              setNewMatch({...newMatch, participants: participants.filter(p => p !== wrestler.name)});
                            }
                          }}
                          className="rounded border-green-500/30"
                        />
                        <span>{wrestler.name}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm">No wrestlers found. Add wrestlers to your roster first.</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="championship" className="text-green-200">Championship (Optional)</Label>
                <Input
                  id="championship"
                  value={newMatch.championship || ""}
                  onChange={(e) => setNewMatch({...newMatch, championship: e.target.value})}
                  className="bg-slate-700 border-green-500/30 text-white"
                  placeholder="e.g. WWE Championship"
                />
              </div>
              <div>
                <Label htmlFor="stipulation" className="text-green-200">Stipulation (Optional)</Label>
                <Input
                  id="stipulation"
                  value={newMatch.stipulation || ""}
                  onChange={(e) => setNewMatch({...newMatch, stipulation: e.target.value})}
                  className="bg-slate-700 border-green-500/30 text-white"
                  placeholder="e.g. No DQ, TLC"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="matchDescription" className="text-green-200">Match Description</Label>
              <Input
                id="matchDescription"
                value={newMatch.description || ""}
                onChange={(e) => setNewMatch({...newMatch, description: e.target.value})}
                className="bg-slate-700 border-green-500/30 text-white"
                placeholder="Describe the match storyline"
              />
            </div>

            <Button onClick={addMatchToShow} className="w-full bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Match
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="bg-slate-800/50 border-green-500/30">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-white text-xl">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={previousMonth}
                className="border-green-500/30 text-green-400 hover:bg-green-500/20"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={nextMonth}
                className="border-green-500/30 text-green-400 hover:bg-green-500/20"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-0 mb-4">
            {daysOfWeek.map((day) => (
              <div
                key={day}
                className="h-8 bg-slate-700 border border-slate-600 flex items-center justify-center text-purple-200 font-medium text-sm"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0">
            {renderCalendarDays()}
          </div>
          
          <div className="mt-6 flex space-x-4 flex-wrap">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-600 rounded"></div>
              <span className="text-purple-200 text-sm">Raw</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-600 rounded"></div>
              <span className="text-purple-200 text-sm">SmackDown</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-600 rounded"></div>
              <span className="text-purple-200 text-sm">NXT</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-600 rounded"></div>
              <span className="text-purple-200 text-sm">Pay-Per-View</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-600 rounded"></div>
              <span className="text-purple-200 text-sm">Special Event</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-600 rounded"></div>
              <span className="text-purple-200 text-sm">Today</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
