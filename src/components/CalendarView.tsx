
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface Show {
  id: string;
  name: string;
  brand: string;
  date?: Date;
  frequency: string;
  venue: string;
  description: string;
}

export const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [shows, setShows] = useState<Show[]>([]);

  useEffect(() => {
    const savedShows = localStorage.getItem("shows");
    if (savedShows) {
      const parsed = JSON.parse(savedShows);
      const showsWithDates = parsed.map((show: any) => ({
        ...show,
        date: show.date ? new Date(show.date) : undefined
      }));
      setShows(showsWithDates);
    }
  }, []);

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
                className={`text-white text-xs px-1 rounded truncate ${getBrandColor(show.brand)}`}
                title={`${show.name}${show.venue ? ` at ${show.venue}` : ''}`}
              >
                {show.name}
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
