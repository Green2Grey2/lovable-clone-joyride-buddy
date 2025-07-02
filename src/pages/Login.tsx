
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Mail, Lock } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempt:', { email, password });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F9F9] to-white flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-32 h-32 bg-[#735CF7] rounded-full blur-3xl animate-pulse-subtle"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-[#00A3FF] rounded-full blur-2xl animate-pulse-subtle" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-32 left-1/3 w-28 h-28 bg-[#FF7B5A] rounded-full blur-3xl animate-pulse-subtle" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#735CF7] to-[#00A3FF] bg-clip-text text-transparent mb-2">
            Olive View UCLA Medical Center
          </h1>
          <p className="text-[#8A94A6] font-medium">Wellness Portal</p>
        </div>

        <Card className="border-0 shadow-[0px_15px_35px_rgba(115,92,247,0.1)] bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-[#1D244D]">Welcome Back</CardTitle>
            <p className="text-[#8A94A6]">Sign in to access your wellness dashboard</p>
          </CardHeader>
          <CardContent className="pt-0">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#1D244D] font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#8A94A6]" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 border-gray-200 focus:border-[#735CF7] transition-colors"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#1D244D] font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#8A94A6]" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 border-gray-200 focus:border-[#735CF7] transition-colors"
                    required
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-[#735CF7] to-[#00A3FF] hover:from-[#6B4FF5] hover:to-[#0092E6] text-white font-bold text-lg rounded-xl shadow-[0px_15px_35px_rgba(115,92,247,0.4)] hover:shadow-[0px_20px_45px_rgba(115,92,247,0.5)] hover:scale-[1.02] transition-all duration-300"
              >
                Sign In
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </form>
            <div className="mt-6 text-center">
              <Button 
                variant="link" 
                onClick={() => navigate('/admin')}
                className="text-[#735CF7] hover:text-[#6B4FF5] font-medium"
              >
                Healthcare Staff Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
