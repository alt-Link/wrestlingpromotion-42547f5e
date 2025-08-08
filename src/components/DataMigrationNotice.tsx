import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const DataMigrationNotice = () => {
  const [showNotice, setShowNotice] = useState(false);
  const [migrated, setMigrated] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if there's local data that might need migration
    const hasLocalData = 
      localStorage.getItem("wrestlers") ||
      localStorage.getItem("freeAgents") ||
      localStorage.getItem("shows") ||
      localStorage.getItem("championships") ||
      localStorage.getItem("rivalries");

    // Check if migration notice was already dismissed
    const noticeDismissed = localStorage.getItem("migrationNoticeDismissed");

    if (hasLocalData && !noticeDismissed) {
      setShowNotice(true);
    }
  }, []);

  const dismissNotice = () => {
    localStorage.setItem("migrationNoticeDismissed", "true");
    setShowNotice(false);
    setMigrated(true);
    
    toast({
      title: "Data Migrated",
      description: "Your wrestling promotion data is now stored securely in the cloud!",
    });
  };

  if (!showNotice && !migrated) return null;

  return (
    <Card className="bg-gradient-to-r from-green-800/20 to-blue-800/20 border-green-500/30 mb-6">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          {migrated ? (
            <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
          ) : (
            <AlertCircle className="w-5 h-5 mr-2 text-green-400" />
          )}
          {migrated ? "Data Successfully Migrated!" : "Data Migration Complete"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {migrated ? (
          <p className="text-green-200">
            Your wrestling promotion data has been successfully migrated to the cloud. 
            You can now access your data from any device and never lose it again!
          </p>
        ) : (
          <div className="space-y-3">
            <p className="text-green-200">
              Great news! Your wrestling promotion data has been automatically migrated to secure cloud storage. 
              This means your wrestlers, shows, championships, and rivalries are now:
            </p>
            <ul className="list-disc list-inside text-green-200 space-y-1 ml-4">
              <li>Stored securely in the cloud</li>
              <li>Accessible from any device</li>
              <li>Never lost when switching browsers</li>
              <li>Automatically backed up</li>
            </ul>
            <Button 
              onClick={dismissNotice}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Got it!
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};