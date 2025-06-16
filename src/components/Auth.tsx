
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { LogIn, UserPlus } from 'lucide-react';

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignInForm = z.infer<typeof signInSchema>;
type SignUpForm = z.infer<typeof signUpSchema>;

export const Auth = () => {
  const { signIn, signUp, loading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const signInForm = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const signUpForm = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSignIn = async (values: SignInForm) => {
    setSubmitting(true);
    await signIn(values.email, values.password);
    setSubmitting(false);
  };

  const onSignUp = async (values: SignUpForm) => {
    setSubmitting(true);
    const { error } = await signUp(values.email, values.password);
    if (!error) {
      signUpForm.reset();
    }
    setSubmitting(false);
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    signInForm.reset();
    signUpForm.reset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800/50 border-purple-500/30">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white mb-2">
            Wrestling Universe Manager
          </CardTitle>
          <p className="text-purple-200">
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {isSignUp ? (
            <Form {...signUpForm}>
              <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-4">
                <FormField
                  control={signUpForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-purple-200">Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your email"
                          type="email"
                          className="bg-slate-700 border-purple-500/30 text-white placeholder:text-slate-400"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signUpForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-purple-200">Password</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your password"
                          type="password"
                          className="bg-slate-700 border-purple-500/30 text-white placeholder:text-slate-400"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signUpForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-purple-200">Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Confirm your password"
                          type="password"
                          className="bg-slate-700 border-purple-500/30 text-white placeholder:text-slate-400"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={loading || submitting}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  size="lg"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  {submitting ? 'Creating Account...' : 'Sign Up'}
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...signInForm}>
              <form onSubmit={signInForm.handleSubmit(onSignIn)} className="space-y-4">
                <FormField
                  control={signInForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-purple-200">Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your email"
                          type="email"
                          className="bg-slate-700 border-purple-500/30 text-white placeholder:text-slate-400"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signInForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-purple-200">Password</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your password"
                          type="password"
                          className="bg-slate-700 border-purple-500/30 text-white placeholder:text-slate-400"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={loading || submitting}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  size="lg"
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  {submitting ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>
            </Form>
          )}
          
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={toggleMode}
              className="text-purple-300 hover:text-purple-200 hover:bg-purple-500/20"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </Button>
          </div>
          
          <div className="text-center text-sm text-purple-300">
            <p>Create and manage your wrestling roster, championships, shows, and storylines</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
