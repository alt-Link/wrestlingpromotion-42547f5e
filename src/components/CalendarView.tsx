
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, ChevronLeft, ChevronRight, Plus, Users, Trophy, Clock, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUniverseData } from "@/hooks/useUniverseData";

interface Show {
  id: string;
  name: string;
  brand: string;
  date?: Date;
  frequency: string;
  venue: string;
  description: string;
  matches?: Match[];
  is_template?: boolean;
  base_show_id?: string;
  instance_date?: Date;
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
  const { data, loading, saveShow } = useUniverseData();
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isMatchDialogOpen, setIsMatchDialogOpen] = useState(false);
  const [isShowDetailsDialogOpen, setIsShowDetailsDialogOpen] = useState(false);
  const [newMatch, setNewMatch] = useState<Partial<Match>>({
    participants: [],
    type: "Singles",
    description: ""
  });
  const { toast } = useToast();

  const shows = data.shows || [];
  const wrestlers = data.wrestlers || [];
  const championships = data.championships || [];

  const findOrCreateShowInstance = async (baseShow: Show, targetDate: Date): Promise<Show> => {
    const dateKey = targetDate.toDateString();
    
    // Look for existing instance for this date
    const existingInstance = shows.find(show => 
      show.base_show_id === baseShow.id && 
      show.instance_date && new Date(show.instance_date).toDateString() === dateKey
    );
    
    if (existingInstance) {
      return existingInstance;
    }
    
    // Create new instance
    const newInstance: any = {
      name: baseShow.name,
      brand: baseShow.brand,
      date: baseShow.date,
      frequency: baseShow.frequency,
      venue: baseShow.venue,
      description: baseShow.description,
      matches: [],
      is_template: false,
      base_show_id: baseShow.id,
      instance_date: targetDate
    };
    
    const { error } = await saveShow(newInstance);
    if (error) {
      console.error('Error creating show instance:', error);
      throw error;
    }
    
    return newInstance;
  };

  const addMatchToShow = async () => {
    if (!newMatch.participants?.length || newMatch.participants.length < 2) {
      toast({
        title: "Error",
        description: "At least 2 participants are required for a match",
        variant: "destructive"
      });
      return;
    }

    if (!selectedShow || !selectedDate) {
      toast({
        title: "Error",
        description: "No show or date selected",
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

    let targetShow = selectedShow;
    
    // If this is a template (recurring show), create/find instance
    if (selectedShow.is_template) {
      try {
        targetShow = await findOrCreateShowInstance(selectedShow, selectedDate);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to create show instance",
          variant: "destructive"
        });
        return;
      }
    }

    const updatedShow = {
      ...targetShow,
      matches: [...(targetShow.matches || []), match]
    };

    const { error } = await saveShow(updatedShow);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to add match to show",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedShow(updatedShow);
    setNewMatch({
      participants: [],
      type: "Singles",
      description: ""
    });
    setIsMatchDialogOpen(false);
    
    toast({
      title: "Match Added",
      description: `Match has been added to ${targetShow.name} on ${selectedDate.toLocaleDateString()}.`
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
    const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    cellDate.setHours(0, 0, 0, 0);

    const showsForDate: Show[] = [];

    // First, check for specific instances on this date that have matches
    const instances = shows.filter(show => {
      if (show.is_template) return false;
      if (!show.instance_date) return false;
      
      try {
        const instanceDate = new Date(show.instance_date);
        const hasMatches = show.matches && show.matches.length > 0;
        return instanceDate.toDateString() === cellDate.toDateString() && hasMatches;
      } catch (error) {
        console.error('Error parsing instance date:', error);
        return false;
      }
    });

    instances.forEach(instance => {
      showsForDate.push({
        ...instance,
        instance_date: new Date(instance.instance_date!)
      });
    });

    // For recurring show templates, only show them if they're scheduled for this date AND it's the first occurrence
    // This prevents templates from showing every week without matches
    const templates = shows.filter(show => show.is_template && show.date);
    
    templates.forEach(template => {
      if (!template.date) return;
      
      let showStartDate;
      try {
        showStartDate = new Date(template.date);
        showStartDate.setHours(0, 0, 0, 0);
      } catch (error) {
        console.error('Error parsing template date:', error);
        return;
      }

      if (cellDate < showStartDate) {
        return; // Cannot occur before its start date
      }

      // Check if there's already an instance for this template on this date
      const hasInstance = instances.some(instance => instance.base_show_id === template.id);
      if (hasInstance) {
        return; // Don't show template if instance exists
      }

      let shouldShow = false;

      // Only show the template on its exact start date for initial booking
      // After that, only instances with matches should appear
      switch (template.frequency) {
        case 'one-time':
          shouldShow = cellDate.getTime() === showStartDate.getTime();
          break;
        
        case 'weekly':
          // Only show if it's the exact start date (for initial setup)
          shouldShow = cellDate.getTime() === showStartDate.getTime();
          break;

        case 'monthly':
          // Only show if it's the exact start date (for initial setup)
          shouldShow = cellDate.getTime() === showStartDate.getTime();
          break;

        case 'quarterly':
          // Only show if it's the exact start date (for initial setup)
          shouldShow = cellDate.getTime() === showStartDate.getTime();
          break;

        case 'yearly':
          // Only show if it's the exact start date (for initial setup)
          shouldShow = cellDate.getTime() === showStartDate.getTime();
          break;

        default:
          shouldShow = cellDate.getTime() === showStartDate.getTime();
      }

      if (shouldShow) {
        showsForDate.push({
          ...template,
          date: new Date(template.date)
        });
      }
    });

    return showsForDate;
  };

  const handleShowClick = (show: Show, event: React.MouseEvent, clickDate: Date) => {
    event.stopPropagation();
    
    console.log('Show clicked:', show);
    console.log('Click date:', clickDate);
    
    try {
      // Safely handle show selection
      let targetShow = { ...show };
      
      // If it's a template, find or get the latest instance data
      if (show.is_template) {
        const existingInstance = shows.find(s => 
          s.base_show_id === show.id && 
          s.instance_date && 
          new Date(s.instance_date).toDateString() === clickDate.toDateString()
        );
        
        if (existingInstance) {
          targetShow = { ...existingInstance };
        }
      }
      
      // Ensure matches array exists
      if (!targetShow.matches) {
        targetShow.matches = [];
      }
      
      setSelectedShow(targetShow);
      setSelectedDate(new Date(clickDate));
      
      // Always show details dialog
      setIsShowDetailsDialogOpen(true);
      
    } catch (error) {
      console.error('Error handling show click:', error);
      toast({
        title: "Error",
        description: "Failed to load show details",
        variant: "destructive"
      });
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
      const clickDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      
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
                key={`${show.id}-${day}-${index}`}
                className={`text-white text-xs px-1 rounded truncate cursor-pointer hover:opacity-80 ${getBrandColor(show.brand)} ${
                  show.is_template ? 'opacity-75' : ''
                }`}
                title={`${show.name}${show.venue ? ` at ${show.venue}` : ''} - ${show.matches?.length || 0} matches`}
                onClick={(e) => handleShowClick(show, e, clickDate)}
              >
                {show.name} ({show.matches?.length || 0})
                {show.is_template && <span className="ml-1 text-xs">📅</span>}
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    return days;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
      </div>
    );
  }

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
              {selectedShow?.name} - {selectedDate?.toLocaleDateString()}
              {selectedShow?.is_template && " (Recurring Show)"}
            </DialogTitle>
          </DialogHeader>
          {selectedShow && selectedDate && (
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
                    <span className="text-slate-400">Type:</span>
                    <span className="text-white ml-2">
                      {selectedShow.is_template ? "Recurring Template" : "Specific Instance"}
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
                  <h3 className="text-lg font-semibold text-green-200">
                    Match Card for {selectedDate.toLocaleDateString()} ({selectedShow.matches?.length || 0} matches)
                  </h3>
                  <Button onClick={openMatchBooking} className="bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Match
                  </Button>
                </div>
                
                {selectedShow.matches && selectedShow.matches.length > 0 ? (
                  <div className="space-y-3">
                    {selectedShow.matches.map((match, index) => (
                      <div key={match.id || index} className="bg-slate-700/50 border border-green-500/30 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-white">{match.participants?.join(" vs ") || "TBD"}</h4>
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
                    <p className="text-green-200 mb-2">No matches booked for this date</p>
                    <p className="text-sm text-slate-400 mb-4">Start building your match card for {selectedDate.toLocaleDateString()}</p>
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
              Add Match to {selectedShow?.name} - {selectedDate?.toLocaleDateString()}
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
                    {wrestlers.filter(wrestler => wrestler.name && wrestler.name.trim()).map((wrestler) => (
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
                <Select value={newMatch.championship || ""} onValueChange={(value) => setNewMatch({...newMatch, championship: value || undefined})}>
                  <SelectTrigger className="bg-slate-700 border-green-500/30 text-white">
                    <SelectValue placeholder="Select championship" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-green-500/30">
                    <SelectItem value="none">No Championship</SelectItem>
                    {championships.filter(championship => championship.name && championship.name.trim()).map((championship) => (
                      <SelectItem key={championship.id} value={championship.name}>
                        {championship.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <div className="w-3 h-3 bg-purple-600 rounded"></div>
              <span className="text-purple-200 text-sm">Today</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-purple-200 text-sm">📅 = Recurring Show Template</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
