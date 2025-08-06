import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Show {
  id: string;
  name: string;
  brand: string;
  date?: Date;
  frequency: string;
  venue: string;
  description: string;
  matches: any[];
  isTemplate?: boolean;
  baseShowId?: string;
  instanceDate?: Date;
}

export const MiniCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [shows, setShows] = useState<Show[]>([]);

  useEffect(() => {
    refreshShows();
    
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
      }));
      setShows(parsedShows);
    }
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
          className={`h-8 w-8 flex items-center justify-center text-xs relative rounded ${
            isToday ? 'bg-primary text-primary-foreground font-bold' : 'text-white hover:bg-purple-500/20'
          }`}
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
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500/70"></div>
                <span className="text-purple-300">Raw</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-500/70"></div>
                <span className="text-purple-300">SD</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-yellow-500/70"></div>
                <span className="text-purple-300">NXT</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-orange-500/70"></div>
                <span className="text-purple-300">PPV</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};