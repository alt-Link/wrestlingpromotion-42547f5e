
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, Clock, Users } from "lucide-react";

export const ShowBooking = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Calendar className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Show Booking</h2>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Book New Show
        </Button>
      </div>

      <Card className="bg-slate-800/50 border-blue-500/30">
        <CardContent className="text-center py-12">
          <Calendar className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Show Booking Coming Soon</h3>
          <p className="text-purple-200 mb-4">
            This feature will allow you to book matches, create show cards, and manage events.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
