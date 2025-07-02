
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Welcome back!');
          navigate('/dashboard');
        }
      } else {
        if (!name.trim()) {
          toast.error('Please enter your name');
          setLoading(false);
          return;
        }
        
        const { error } = await signUp(email, password, name);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Account created! Please check your email to verify your account.');
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/95 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-blue-500 rounded-full blur-2xl animate-pulse [animation-delay:1s]"></div>
        <div className="absolute bottom-32 left-1/3 w-28 h-28 bg-orange-500 rounded-full blur-3xl animate-pulse [animation-delay:2s]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent mb-2">
            Olive View UCLA Medical Center
          </h1>
          <p className="text-muted-foreground font-medium">Employee Wellness Portal</p>
        </div>

        <Card className="border-0 shadow-[0px_15px_35px_rgba(115,92,247,0.1)] dark:shadow-[0px_15px_35px_rgba(115,92,247,0.2)] bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-foreground">
              {isLogin ? 'Employee Login' : 'Register as Employee'}
            </CardTitle>
            <p className="text-muted-foreground">
              {isLogin ? 'Sign in to access your wellness dashboard' : 'Create your employee wellness account'}
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground font-medium">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 h-12 border-border focus:border-primary transition-colors"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-medium">Work Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your work email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 border-border focus:border-primary transition-colors"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 border-border focus:border-primary transition-colors"
                    required
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-600 text-primary-foreground font-bold text-lg rounded-xl shadow-[0px_15px_35px_rgba(115,92,247,0.4)] hover:shadow-[0px_20px_45px_rgba(115,92,247,0.5)] hover:scale-[1.02] transition-all duration-300 disabled:opacity-50"
              >
                {loading ? 'Please wait...' : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <Button 
                variant="link" 
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary hover:text-primary/90 font-medium"
              >
                {isLogin ? "Need an account? Register here" : "Already have an account? Sign in"}
              </Button>
            </div>

            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">For Employees Only</span>
              </div>
              <p className="text-blue-600 dark:text-blue-500 text-xs mt-1">
                This portal is exclusively for Olive View UCLA Medical Center staff and employees.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
