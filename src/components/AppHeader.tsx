
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User, Save } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface AppHeaderProps {
  onSave?: () => void;
  saving?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onSave, saving }) => {
  const { user, signOut } = useAuth();

  return (
    <Card className="bg-slate-800/50 border-purple-500/30 p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-bold text-white">Wrestling Universe Manager</h1>
          {onSave && (
            <Button
              onClick={onSave}
              disabled={saving}
              variant="outline"
              size="sm"
              className="border-purple-500/30 text-purple-200 hover:bg-purple-500/20"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-purple-200">
            <User className="w-4 h-4" />
            <span className="text-sm">{user?.email}</span>
          </div>
          <Button
            onClick={signOut}
            variant="outline"
            size="sm"
            className="border-red-500/30 text-red-200 hover:bg-red-500/20"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </Card>
  );
};
