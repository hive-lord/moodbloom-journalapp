import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/components/AuthProvider';
import heroImage from '@/assets/hero-calm.jpg';

const Auth = () => {
  const { user, signIn, signUp, loading } = useAuth();
  const [signInData, setSignInData] = useState({ email: '', password: '' });
  const [signUpData, setSignUpData] = useState({ email: '', password: '', displayName: '' });

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn(signInData.email, signInData.password);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    await signUp(signUpData.email, signUpData.password, signUpData.displayName);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={heroImage} 
          alt="Calm meditation background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/60" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white space-y-2">
            <h1 className="text-4xl font-light">Calm Journal</h1>
            <p className="text-lg opacity-90">Your space for mindful reflection</p>
          </div>
        </div>
      </div>

      {/* Auth Forms */}
      <div className="flex items-center justify-center px-4 py-12 -mt-12 relative z-10">
        <Card className="w-full max-w-md p-6 shadow-card">
          <Tabs defaultValue="signin" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-medium">Welcome back</h2>
                <p className="text-sm text-muted-foreground">
                  Continue your wellness journey
                </p>
              </div>

              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    value={signInData.email}
                    onChange={(e) => setSignInData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={signInData.password}
                    onChange={(e) => setSignInData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="••••••••"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full shadow-soft hover:shadow-glow" 
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-medium">Start your journey</h2>
                <p className="text-sm text-muted-foreground">
                  Create an account to save your progress
                </p>
              </div>

              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Display Name (optional)</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    value={signUpData.displayName}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, displayName: e.target.value }))}
                    placeholder="How should we call you?"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={signUpData.email}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signUpData.password}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full shadow-soft hover:shadow-glow" 
                  disabled={loading}
                >
                  {loading ? 'Creating account...' : 'Sign Up'}
                </Button>
              </form>

              <div className="text-center text-xs text-muted-foreground">
                By signing up, you agree to keep your data private and secure
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <Button variant="ghost" size="sm" asChild>
              <a href="/">Continue as Guest</a>
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Guest mode uses local storage only
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Auth;