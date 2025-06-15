
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

export const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

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
          {/* Sample events - these would come from your data */}
          {day === 15 && (
            <div className="mt-1">
              <div className="bg-red-600 text-white text-xs px-1 rounded">Raw</div>
            </div>
          )}
          {day === 20 && (
            <div className="mt-1">
              <div className="bg-blue-600 text-white text-xs px-1 rounded">SmackDown</div>
            </div>
          )}
          {day === 25 && (
            <div className="mt-1">
              <div className="bg-yellow-600 text-white text-xs px-1 rounded">PPV</div>
            </div>
          )}
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
          
          <div className="mt-6 flex space-x-4">
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
              <span className="text-purple-200 text-sm">Pay-Per-View</span>
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
