
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Plus, Users } from "lucide-react";

export const RivalryTracker = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Zap className="w-6 h-6 text-red-400" />
          <h2 className="text-2xl font-bold text-white">Rivalry Tracker</h2>
        </div>
        <Button className="bg-red-600 hover:bg-red-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Rivalry
        </Button>
      </div>

      <Card className="bg-slate-800/50 border-red-500/30">
        <CardContent className="text-center py-12">
          <Zap className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Rivalry Tracking Coming Soon</h3>
          <p className="text-purple-200 mb-4">
            Track storylines, feuds, and wrestler relationships to create compelling narratives.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
