
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Chrome } from 'lucide-react';

export const Auth = () => {
  const { signInWithGoogle, loading } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800/50 border-purple-500/30">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white mb-2">
            Wrestling Universe Manager
          </CardTitle>
          <p className="text-purple-200">
            Sign in to manage your wrestling universe
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={signInWithGoogle}
            disabled={loading}
            className="w-full bg-white hover:bg-gray-100 text-gray-900 border"
            size="lg"
          >
            <Chrome className="w-5 h-5 mr-2" />
            Sign in with Google
          </Button>
          
          <div className="text-center text-sm text-purple-300">
            <p>Create and manage your wrestling roster, championships, shows, and storylines</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
