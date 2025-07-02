import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FloatingBottomNav } from '@/components/FloatingBottomNav';
import { ProfileDropdown } from '@/components/ProfileDropdown';
import { NotificationBell } from '@/components/NotificationBell';
import { GlobalSearch } from '@/components/GlobalSearch';
import { WalkingChallengeCountdown } from '@/components/WalkingChallengeCountdown';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, Share, Bookmark } from 'lucide-react';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { AppleNewsMediaFeed } from '@/components/media/AppleNewsMediaFeed';

export const MediaNavigation = ({ 
  navPosition, 
  onBackToFeed, 
  onShare, 
  onBookmark 
}: {
  navPosition: 'top' | 'bottom' | 'hidden';
  onBackToFeed: () => void;
  onShare: () => void;
  onBookmark: () => void;
}) => (
  <div className="absolute top-0 left-0 right-0 z-20 p-6 pt-12">
    <div className="flex justify-between items-center">
      <Button 
        variant="ghost" 
        size="sm"
        className="bg-background/20 backdrop-blur-sm text-white hover:bg-background/30 w-10 h-10 p-0 rounded-full transition-all duration-300 hover:scale-110"
        onClick={onBackToFeed}
        soundEnabled={false}
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <div className="flex gap-3">
        <Button 
          variant="ghost" 
          size="sm"
          className="bg-background/20 backdrop-blur-sm text-white hover:bg-background/30 w-10 h-10 p-0 rounded-full transition-all duration-300 hover:scale-110"
          onClick={onShare}
          soundEnabled={false}
        >
          <Share className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          className="bg-background/20 backdrop-blur-sm text-white hover:bg-background/30 w-10 h-10 p-0 rounded-full transition-all duration-300 hover:scale-110"
          onClick={onBookmark}
          soundEnabled={false}
        >
          <Bookmark className="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
);

export const ArticleHeader = ({ 
  article, 
  onBackToFeed, 
  onShare, 
  onBookmark 
}: {
  article: any;
  onBackToFeed: () => void;
  onShare: () => void;
  onBookmark: () => void;
}) => (
  <div className="relative h-[60vh] overflow-hidden">
    <img 
      src={article.image} 
      alt={article.title}
      className="w-full h-full object-cover transform scale-105 transition-transform duration-1000"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
    
    <MediaNavigation 
      navPosition="top"
      onBackToFeed={onBackToFeed}
      onShare={onShare}
      onBookmark={onBookmark}
    />
    
    <div className="absolute bottom-0 left-0 right-0 p-8 z-10 transform transition-transform duration-500">
      <h1 className="text-white text-4xl font-bold leading-tight mb-4 animate-fade-in">
        {article.title}
      </h1>
      <div className="flex items-center gap-4 text-white/90 text-sm animate-fade-in">
        <span>by {article.author}</span>
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-1" />
          {article.readTime}
        </div>
        <span>{article.publishDate}</span>
      </div>
    </div>
  </div>
);

const Media = () => {
  const { playSoftClick } = useSoundEffects();
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Sample article data for demonstration
  const articleData = {
    'hero-1': {
      title: 'The Science of Recovery: How Elite Athletes Maximize Their Rest',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80',
      author: 'Dr. Michael Chen',
      readTime: '8 min read',
      publishDate: 'June 28, 2025',
      content: `Elite athletes understand that recovery isn't just rest—it's a science. The latest research reveals groundbreaking insights into how our bodies repair and strengthen during downtime.

Recent studies from Stanford's Sleep Research Center show that athletes who follow structured recovery protocols see 23% better performance gains compared to those who don't. The key lies in understanding your body's natural rhythms.

**The Science Behind Recovery**

During deep sleep, your body releases growth hormone at levels up to 10 times higher than during waking hours. This hormone is crucial for muscle repair and adaptation. But quality sleep isn't just about duration—it's about timing and consistency.

Professional athletes like LeBron James reportedly sleep 12 hours per night, but it's not just the quantity that matters. The consistency of sleep timing helps regulate circadian rhythms, which control everything from hormone release to cellular repair processes.

**Nutrition's Role in Recovery**

What you eat after training can make or break your recovery. The "golden window" of 30-45 minutes post-workout is when your muscles are most receptive to nutrients. A 3:1 ratio of carbohydrates to protein has been shown to maximize glycogen replenishment and muscle protein synthesis.

**Active Recovery Techniques**

Static rest isn't always optimal. Light movement, stretching, and techniques like contrast showers (alternating hot and cold water) can enhance circulation and reduce inflammation markers by up to 40%.

The future of recovery lies in personalization—using data from wearables to optimize individual recovery protocols based on heart rate variability, sleep quality, and training load.`
    },
    'featured-1': {
      title: 'High-Intensity Interval Training: A Complete Guide',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',
      author: 'Dr. Sarah Chen',
      readTime: '6 min read',
      publishDate: 'June 27, 2025',
      content: `HIIT has revolutionized fitness, but most people are doing it wrong. Here's the science-backed approach to maximizing your high-intensity intervals.

The magic of HIIT lies in its ability to trigger EPOC (Excess Post-Exercise Oxygen Consumption), keeping your metabolism elevated for up to 24 hours after your workout. But the key is in the details—intensity, duration, and recovery ratios all matter.

**The Perfect HIIT Formula**

Research shows that the sweet spot for HIIT is working at 85-95% of your maximum heart rate during work intervals. This intensity triggers the metabolic adaptations that make HIIT so effective.

For beginners: 30 seconds work, 90 seconds rest
For intermediate: 45 seconds work, 60 seconds rest  
For advanced: 60 seconds work, 30 seconds rest

**Common Mistakes to Avoid**

Many people confuse circuit training with true HIIT. If you can hold a conversation during your "high-intensity" intervals, you're not working hard enough. The intensity should be unsustainable for more than the prescribed work period.`
    }
  };

  // Handle scroll behavior for navigation visibility in article view
  useEffect(() => {
    if (!selectedArticle) {
      setNavVisible(true);
      return;
    }

    const handleScroll = () => {
      const scrollContainer = scrollContainerRef.current;
      if (!scrollContainer) return;

      const currentScrollY = scrollContainer.scrollTop;
      const scrollDifference = currentScrollY - lastScrollY;

      // Show nav when scrolling up, hide when scrolling down
      if (scrollDifference < -20 && !navVisible) {
        setNavVisible(true);
      } else if (scrollDifference > 20 && navVisible && currentScrollY > 200) {
        setNavVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [lastScrollY, navVisible, selectedArticle]);

  // These functions are no longer needed since we use the proper components
  // const handleNotifications = () => {
  //   playSoftClick();
  //   console.log('Notifications clicked');
  // };

  // const handleSearch = () => {
  //   playSoftClick();
  //   console.log('Search clicked');
  // };

  const handleArticleClick = (articleId: string) => {
    playSoftClick();
    setIsTransitioning(true);
    
    setTimeout(() => {
      setSelectedArticle(articleId);
      setIsTransitioning(false);
      // Initially hide nav for immersive reading
      setTimeout(() => setNavVisible(false), 1000);
    }, 150);
  };

  const handleBackToFeed = () => {
    playSoftClick();
    setIsTransitioning(true);
    
    setTimeout(() => {
      setSelectedArticle(null);
      setIsTransitioning(false);
      setNavVisible(true);
    }, 150);
  };

  const handleShare = () => {
    playSoftClick();
    console.log('Share article');
  };

  const handleBookmark = () => {
    playSoftClick();
    console.log('Bookmark article');
  };

  // Article Detail View
  if (selectedArticle && articleData[selectedArticle as keyof typeof articleData]) {
    const article = articleData[selectedArticle as keyof typeof articleData];
    
    return (
      <div className={`min-h-screen bg-background transition-all duration-300 ${isTransitioning ? 'opacity-95 scale-98' : 'opacity-100 scale-100'}`}>
        <div 
          ref={scrollContainerRef}
          className="min-h-screen overflow-y-auto pb-24"
        >
          {/* Article Header with Parallax Effect */}
          <ArticleHeader 
            article={article}
            onBackToFeed={handleBackToFeed}
            onShare={handleShare}
            onBookmark={handleBookmark}
          />

          {/* Article Content */}
          <div className="relative bg-card rounded-t-3xl -mt-6 z-10 min-h-screen transition-all duration-500 animate-slide-up">
            <div className="px-8 py-12 max-w-2xl mx-auto">
              <div className="prose prose-lg prose-gray max-w-none">
                {article.content.split('\n\n').map((paragraph, index) => {
                  if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                    return (
                      <h3 key={index} className="text-2xl font-bold text-foreground mt-8 mb-4">
                        {paragraph.replace(/\*\*/g, '')}
                      </h3>
                    );
                  }
                  return (
                    <p key={index} className="text-foreground text-lg leading-relaxed mb-6">
                      {paragraph}
                    </p>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation - Show/Hide based on scroll */}
        <div className={`transition-all duration-300 ease-in-out ${
          navVisible 
            ? 'opacity-100 visible translate-y-0' 
            : 'opacity-0 invisible translate-y-full'
        }`}>
          <FloatingBottomNav />
        </div>
      </div>
    );
  }

  // Main Feed View
  return (
    <div className={`min-h-screen bg-background transition-all duration-300 ${isTransitioning ? 'opacity-95 scale-98' : 'opacity-100 scale-100'}`}>
      {/* Enhanced Header with Apple News styling */}
      <div className="glass dark:glass-dark backdrop-blur-xl sticky top-0 z-30 border-b border-border/50">
        <div className="px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1 tracking-tight">
                Today
              </h1>
              <p className="text-muted-foreground text-sm font-medium">Sunday, June 29</p>
            </div>
            <div className="flex items-center gap-3">
              <GlobalSearch />
              <NotificationBell />
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 space-y-8 pb-32">
        {/* Walking Challenge - Subtle integration */}
        <div className="mb-6">
          <WalkingChallengeCountdown />
        </div>
        
        {/* Apple News-inspired Media Feed */}
        <AppleNewsMediaFeed onArticleClick={handleArticleClick} />
      </div>

      {/* Navigation - Always visible and properly positioned in main feed */}
      <FloatingBottomNav />
    </div>
  );
};

export default Media;
