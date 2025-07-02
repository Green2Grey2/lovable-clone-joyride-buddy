
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-card flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-card flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-accent rounded-full blur-2xl animate-pulse [animation-delay:1s]"></div>
        <div className="absolute bottom-32 left-1/3 w-28 h-28 bg-secondary rounded-full blur-3xl animate-pulse [animation-delay:2s]"></div>
      </div>

      <div className="relative z-10 text-center max-w-3xl mx-auto">
        {/* Logo/Brand */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold gradient-text mb-4">
            Olive View UCLA Medical Center
          </h1>
          <p className="text-xl text-muted-foreground font-medium mb-2">Employee Wellness & Fitness Program</p>
          <p className="text-lg text-muted-foreground">For healthcare staff and employees only</p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="text-center p-6 glass-card rounded-2xl">
            <div className="text-4xl mb-4">👩‍⚕️</div>
            <h3 className="text-xl font-bold text-foreground mb-2">Staff Wellness</h3>
            <p className="text-muted-foreground">Designed specifically for healthcare employees</p>
          </div>
          <div className="text-center p-6 glass-card rounded-2xl">
            <div className="text-4xl mb-4">🏥</div>
            <h3 className="text-xl font-bold text-foreground mb-2">Team Challenges</h3>
            <p className="text-muted-foreground">Compete with colleagues across departments</p>
          </div>
          <div className="text-center p-6 glass-card rounded-2xl">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-foreground mb-2">Health Tracking</h3>
            <p className="text-muted-foreground">Monitor wellness goals and progress</p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex justify-center">
          <Button 
            onClick={() => navigate('/auth')}
            className="h-14 px-8 text-white font-bold text-lg rounded-xl shadow-glow-hover hover:scale-[1.02] transition-all duration-300"
            size="lg"
          >
            Employee Portal Login
          </Button>
        </div>

        <div className="mt-8 text-sm text-muted-foreground">
          <p>For Olive View UCLA Medical Center employees only</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
