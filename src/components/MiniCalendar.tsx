import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2, Users, Trophy, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "./ConfirmDialog";
import { Show, Match } from "@/types/show";


export const MiniCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [shows, setShows] = useState<Show[]>([]);
  const [wrestlers, setWrestlers] = useState<any[]>([]);
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isShowDetailsDialogOpen, setIsShowDetailsDialogOpen] = useState(false);
  const [isMatchDialogOpen, setIsMatchDialogOpen] = useState(false);
  const [isAddShowDialogOpen, setIsAddShowDialogOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<{ type: 'show' | 'match'; id: string; showId?: string } | null>(null);
  const [newMatch, setNewMatch] = useState<Partial<Match>>({
    participants: [],
    type: "Singles"
  });
  const [newShow, setNewShow] = useState({
    name: "",
    brand: "",
    venue: "",
    description: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    refreshShows();
    
    const savedWrestlers = localStorage.getItem("wrestlers");
    if (savedWrestlers) {
      setWrestlers(JSON.parse(savedWrestlers));
    }
    
    const handleStorageChange = () => {
      refreshShows();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const refreshShows = () => {
    const savedShows = localStorage.getItem("shows");
    if (savedShows) {
      const parsedShows = JSON.parse(savedShows).map((show: any) => ({
        ...show,
        date: show.date ? new Date(show.date) : undefined,
        instanceDate: show.instanceDate ? new Date(show.instanceDate) : undefined,
        matches: show.matches || [],
      }));
      setShows(parsedShows);
    }
  };

  const saveShows = (updatedShows: Show[]) => {
    setShows(updatedShows);
    localStorage.setItem("shows", JSON.stringify(updatedShows));
    window.dispatchEvent(new StorageEvent("storage", { key: "shows" }));
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getShowsForDate = (date: Date): Show[] => {
    const dateStr = date.toDateString();
    const showsForDate: Show[] = [];

    shows.forEach((show) => {
      // Check specific instances
      if (!show.isTemplate && show.instanceDate) {
        if (show.instanceDate.toDateString() === dateStr) {
          showsForDate.push(show);
        }
      }
      // Check templates for recurring shows
      else if (show.isTemplate && show.date) {
        const templateDate = new Date(show.date);
        templateDate.setHours(0, 0, 0, 0);
        
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);

        if (show.frequency === 'weekly') {
          const daysDiff = Math.floor((checkDate.getTime() - templateDate.getTime()) / (1000 * 60 * 60 * 24));
          if (daysDiff >= 0 && daysDiff % 7 === 0) {
            showsForDate.push(show);
          }
        } else if (show.frequency === 'monthly') {
          if (templateDate.getDate() === checkDate.getDate()) {
            showsForDate.push(show);
          }
        } else if (show.frequency === 'one-time') {
          if (templateDate.toDateString() === dateStr) {
            showsForDate.push(show);
          }
        }
      }
    });

    return showsForDate;
  };

  const getBrandColor = (brand: string) => {
    switch (brand) {
      case "Raw": return "bg-red-500/70";
      case "SmackDown": return "bg-blue-500/70";
      case "NXT": return "bg-yellow-500/70";
      case "PPV": return "bg-orange-500/70";
      case "Special": return "bg-green-500/70";
      default: return "bg-gray-500/70";
    }
  };

  const getUniqueBrands = () => {
    const brands = new Set(shows.map(show => show.brand));
    return Array.from(brands).sort();
  };

  const handleDateClick = (date: Date) => {
    const showsForDate = getShowsForDate(date);
    setSelectedDate(date);
    
    if (showsForDate.length === 0) {
      setIsAddShowDialogOpen(true);
    } else if (showsForDate.length === 1) {
      setSelectedShow(showsForDate[0]);
      setIsShowDetailsDialogOpen(true);
    } else {
      // Multiple shows, show first one for now
      setSelectedShow(showsForDate[0]);
      setIsShowDetailsDialogOpen(true);
    }
  };

  const handleAddShow = () => {
    if (!newShow.name || !newShow.brand || !selectedDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const show: Show = {
      id: Date.now().toString(),
      name: newShow.name,
      brand: newShow.brand,
      venue: newShow.venue,
      description: newShow.description,
      frequency: "one-time",
      matches: [],
      isTemplate: false,
      instanceDate: selectedDate
    };

    const updatedShows = [...shows, show];
    saveShows(updatedShows);
    
    setNewShow({ name: "", brand: "", venue: "", description: "" });
    setIsAddShowDialogOpen(false);
    
    toast({
      title: "Show Added",
      description: `${show.name} has been added for ${selectedDate.toLocaleDateString()}.`
    });
  };

  const handleAddMatch = () => {
    if (!newMatch.participants?.length || newMatch.participants.length < 2 || !selectedShow || !selectedDate) {
      toast({
        title: "Error",
        description: "Please select at least 2 participants",
        variant: "destructive"
      });
      return;
    }

    const match: Match = {
      id: Date.now().toString(),
      participants: newMatch.participants,
      type: newMatch.type || "Singles",
      championship: newMatch.championship
    };

    const updatedShows = shows.map(show =>
      show.id === selectedShow.id
        ? { ...show, matches: [...(show.matches || []), match] }
        : show
    );

    saveShows(updatedShows);
    
    // Force refresh and update selectedShow state
    const updatedShow = updatedShows.find(s => s.id === selectedShow.id);
    if (updatedShow) {
      setSelectedShow(updatedShow);
    }
    
    setNewMatch({ participants: [], type: "Singles" });
    setIsMatchDialogOpen(false);
    
    // Refresh the shows data to ensure calendar reflects changes
    setTimeout(() => {
      refreshShows();
    }, 100);
    
    toast({
      title: "Match Added",
      description: `Match has been added to ${selectedShow.name}.`
    });
  };

  const handleDeleteMatch = (matchId: string, showId: string) => {
    setDeleteItem({ type: 'match', id: matchId, showId });
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteItem) return;

    if (deleteItem.type === 'match' && deleteItem.showId) {
      const updatedShows = shows.map(show =>
        show.id === deleteItem.showId
          ? { ...show, matches: show.matches.filter(match => match.id !== deleteItem.id) }
          : show
      );
      
      saveShows(updatedShows);
      
      const updatedShow = updatedShows.find(s => s.id === deleteItem.showId);
      if (updatedShow) {
        setSelectedShow(updatedShow);
      }
      
      toast({
        title: "Match Deleted",
        description: "The match has been removed from the show."
      });
    }

    setDeleteItem(null);
    setIsDeleteConfirmOpen(false);
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-8 w-8"></div>
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const showsForDate = getShowsForDate(date);
      const isToday = date.toDateString() === today.toDateString();

      days.push(
        <div
          key={day}
          className={`h-8 w-8 flex items-center justify-center text-xs relative rounded cursor-pointer ${
            isToday ? 'bg-primary text-primary-foreground font-bold' : 'text-white hover:bg-purple-500/20'
          }`}
          onClick={() => handleDateClick(date)}
        >
          <span className="z-10">{day}</span>
          {showsForDate.length > 0 && (
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex gap-1">
              {showsForDate.slice(0, 3).map((show, index) => (
                <div
                  key={index}
                  className={`w-1 h-1 rounded-full ${getBrandColor(show.brand)}`}
                  title={show.name}
                />
              ))}
              {showsForDate.length > 3 && (
                <div className="w-1 h-1 rounded-full bg-white/50" title={`+${showsForDate.length - 3} more`} />
              )}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Card className="bg-slate-800/50 border-purple-500/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center justify-between">
          <span className="text-sm">Shows Calendar</span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={previousMonth}
              className="h-6 w-6 p-0 text-purple-400 hover:text-white"
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <span className="text-xs text-purple-200 min-w-[80px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={nextMonth}
              className="h-6 w-6 p-0 text-purple-400 hover:text-white"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="space-y-2">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1">
            {dayNames.map((day) => (
              <div key={day} className="h-6 flex items-center justify-center text-xs text-purple-400 font-medium">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {renderCalendarDays()}
          </div>

          {/* Legend */}
          <div className="pt-2 border-t border-purple-500/30">
            <div className="flex flex-wrap gap-2 text-xs">
              {getUniqueBrands().map((brand) => (
                <div key={brand} className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${getBrandColor(brand)}`}></div>
                  <span className="text-purple-300">{brand}</span>
                </div>
              ))}
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <span className="text-purple-300">Today</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-purple-300">📅 = Recurring Template</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Show Details Dialog */}
      <Dialog open={isShowDetailsDialogOpen} onOpenChange={setIsShowDetailsDialogOpen}>
        <DialogContent className="bg-slate-800 border-purple-500/30 max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">
              {selectedShow?.name} - {selectedDate?.toLocaleDateString()}
              {selectedShow?.isTemplate && " (Recurring Template)"}
            </DialogTitle>
          </DialogHeader>
          {selectedShow && (
            <div className="space-y-4">
              <div className="bg-slate-700/50 border border-purple-500/30 rounded-lg p-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-slate-400">Brand:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs text-white ${getBrandColor(selectedShow.brand)}`}>
                      {selectedShow.brand}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Venue:</span>
                    <span className="text-white ml-2">{selectedShow.venue}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-purple-200">
                    Matches ({selectedShow.matches?.length || 0})
                  </h3>
                  <Button 
                    onClick={() => {
                      setIsShowDetailsDialogOpen(false);
                      setIsMatchDialogOpen(true);
                    }}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Match
                  </Button>
                </div>
                
                {selectedShow.matches && selectedShow.matches.length > 0 ? (
                  <div className="space-y-2">
                    {selectedShow.matches.map((match, index) => (
                      <div key={match.id} className="bg-slate-700/50 border border-purple-500/30 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-white text-sm">{match.participants.join(" vs ")}</h4>
                            <p className="text-xs text-purple-200">{match.type}</p>
                            {match.championship && (
                              <div className="flex items-center text-xs text-yellow-400 mt-1">
                                <Trophy className="w-3 h-3 mr-1" />
                                {match.championship}
                              </div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteMatch(match.id, selectedShow.id)}
                            className="text-red-400 hover:text-red-300 h-6 w-6 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-slate-700/30 rounded-lg border border-purple-500/30">
                    <Users className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                    <p className="text-purple-200 mb-2">No matches scheduled</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Match Dialog */}
      <Dialog open={isMatchDialogOpen} onOpenChange={setIsMatchDialogOpen}>
        <DialogContent className="bg-slate-800 border-purple-500/30">
          <DialogHeader>
            <DialogTitle className="text-white">Add Match</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-slate-300">Match Type</Label>
              <Select value={newMatch.type} onValueChange={(value) => setNewMatch({...newMatch, type: value})}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="Singles">Singles</SelectItem>
                  <SelectItem value="Tag Team">Tag Team</SelectItem>
                  <SelectItem value="Triple Threat">Triple Threat</SelectItem>
                  <SelectItem value="Fatal 4-Way">Fatal 4-Way</SelectItem>
                  <SelectItem value="Battle Royal">Battle Royal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-slate-300">Participants</Label>
              <Select value="" onValueChange={(value) => {
                if (value && !newMatch.participants?.includes(value)) {
                  setNewMatch({
                    ...newMatch, 
                    participants: [...(newMatch.participants || []), value]
                  });
                }
              }}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Add participant" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  {wrestlers.map((wrestler) => (
                    <SelectItem key={wrestler.id} value={wrestler.name}>
                      {wrestler.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {newMatch.participants && newMatch.participants.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {newMatch.participants.map((participant, index) => (
                    <span key={index} className="bg-purple-600 text-white px-2 py-1 rounded text-sm flex items-center">
                      {participant}
                      <button
                        onClick={() => setNewMatch({
                          ...newMatch,
                          participants: newMatch.participants?.filter((_, i) => i !== index)
                        })}
                        className="ml-2 text-purple-200 hover:text-white"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label className="text-slate-300">Championship (Optional)</Label>
              <Input
                value={newMatch.championship || ""}
                onChange={(e) => setNewMatch({...newMatch, championship: e.target.value})}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="e.g., WWE Championship"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsMatchDialogOpen(false)}
                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddMatch}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Add Match
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Show Dialog */}
      <Dialog open={isAddShowDialogOpen} onOpenChange={setIsAddShowDialogOpen}>
        <DialogContent className="bg-slate-800 border-purple-500/30">
          <DialogHeader>
            <DialogTitle className="text-white">Add Show for {selectedDate?.toLocaleDateString()}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-slate-300">Show Name</Label>
              <Input
                value={newShow.name}
                onChange={(e) => setNewShow({...newShow, name: e.target.value})}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="e.g., Monday Night Raw"
              />
            </div>
            
            <div>
              <Label className="text-slate-300">Brand</Label>
              <Input
                value={newShow.brand}
                onChange={(e) => setNewShow({...newShow, brand: e.target.value})}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="e.g., Raw, SmackDown, NXT"
              />
            </div>

            <div>
              <Label className="text-slate-300">Venue</Label>
              <Input
                value={newShow.venue}
                onChange={(e) => setNewShow({...newShow, venue: e.target.value})}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="e.g., Madison Square Garden"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsAddShowDialogOpen(false)}
                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddShow}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Add Show
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        title={deleteItem?.type === 'match' ? "Delete Match" : "Delete Show"}
        description={
          deleteItem?.type === 'match' 
            ? "Are you sure you want to delete this match? This action cannot be undone."
            : "Are you sure you want to delete this show? This action cannot be undone."
        }
        onConfirm={confirmDelete}
        confirmText="Delete"
        destructive
      />
    </Card>
  );
};