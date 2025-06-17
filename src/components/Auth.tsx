
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { LogIn, UserPlus, Apple } from 'lucide-react';

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

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type SignInForm = z.infer<typeof signInSchema>;
type SignUpForm = z.infer<typeof signUpSchema>;
type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export const Auth = () => {
  const { signIn, signUp, resetPassword, signInWithApple, loading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
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

  const forgotPasswordForm = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
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

  const onForgotPassword = async (values: ForgotPasswordForm) => {
    setSubmitting(true);
    await resetPassword(values.email);
    setSubmitting(false);
  };

  const handleSignInWithApple = async () => {
    setSubmitting(true);
    await signInWithApple();
    setSubmitting(false);
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setIsForgotPassword(false);
    signInForm.reset();
    signUpForm.reset();
    forgotPasswordForm.reset();
  };

  const toggleForgotPassword = () => {
    setIsForgotPassword(!isForgotPassword);
    setIsSignUp(false);
    signInForm.reset();
    signUpForm.reset();
    forgotPasswordForm.reset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800/50 border-purple-500/30">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white mb-2">
            Wrestling Universe Manager
          </CardTitle>
          <p className="text-purple-200">
            {isForgotPassword 
              ? 'Reset your password' 
              : isSignUp 
                ? 'Create your account' 
                : 'Sign in to your account'
            }
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {isForgotPassword ? (
            <Form {...forgotPasswordForm}>
              <form onSubmit={forgotPasswordForm.handleSubmit(onForgotPassword)} className="space-y-4">
                <FormField
                  control={forgotPasswordForm.control}
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
                <Button
                  type="submit"
                  disabled={loading || submitting}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  size="lg"
                >
                  {submitting ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>
            </Form>
          ) : isSignUp ? (
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
                <div className="text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={toggleForgotPassword}
                    className="text-purple-300 hover:text-purple-200 hover:bg-purple-500/20 text-sm p-0 h-auto"
                  >
                    Forgot password?
                  </Button>
                </div>
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

          {!isForgotPassword && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-purple-500/30" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-slate-800 px-2 text-purple-300">Or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleSignInWithApple}
                disabled={loading || submitting}
                className="w-full bg-slate-700 border-purple-500/30 text-white hover:bg-slate-600"
                size="lg"
              >
                <Apple className="w-5 h-5 mr-2" />
                Sign in with Apple
              </Button>
            </>
          )}
          
          <div className="text-center">
            {!isForgotPassword ? (
              <Button
                variant="ghost"
                onClick={toggleMode}
                className="text-purple-300 hover:text-purple-200 hover:bg-purple-500/20"
              >
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </Button>
            ) : (
              <Button
                variant="ghost"
                onClick={toggleForgotPassword}
                className="text-purple-300 hover:text-purple-200 hover:bg-purple-500/20"
              >
                Back to sign in
              </Button>
            )}
          </div>
          
          <div className="text-center text-sm text-purple-300">
            <p>Create and manage your wrestling roster, championships, shows, and storylines</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
