import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Play, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSoundEffects } from '@/hooks/useSoundEffects';

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  category: string;
  instructor: string;
  difficulty: string;
  isPinned?: boolean;
}

export const AppleNewsVideoLibrary = () => {
  const navigate = useNavigate();
  const { playSoftClick, playNavigation } = useSoundEffects();

  // This would normally come from your editorial system/context
  const [videos] = useState<Video[]>([
    {
      id: 'hero-video',
      title: 'Morning Yoga Flow: Energize Your Day',
      thumbnail: 'https://images.unsplash.com/photo-1506629905877-51d2a8f30ae4?auto=format&fit=crop&w=800&q=80',
      duration: '15 min',
      category: 'Yoga',
      instructor: 'Sarah Chen',
      difficulty: 'Beginner',
      isPinned: true
    },
    {
      id: 'featured-1',
      title: 'HIIT Cardio Blast',
      thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80',
      duration: '20 min',
      category: 'HIIT',
      instructor: 'Mike Rodriguez',
      difficulty: 'Intermediate',
      isPinned: true
    },
    {
      id: 'featured-2',
      title: 'Strength Training Basics',
      thumbnail: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80',
      duration: '25 min',
      category: 'Strength',
      instructor: 'Alex Thompson',
      difficulty: 'Beginner',
      isPinned: true
    },
    {
      id: 'standard-1',
      title: 'Core Stability',
      thumbnail: 'https://images.unsplash.com/photo-1506629905877-51d2a8f30ae4?auto=format&fit=crop&w=400&q=80',
      duration: '12 min',
      category: 'Core',
      instructor: 'Lisa Park',
      difficulty: 'All Levels',
      isPinned: true
    }
  ]);

  const handleVideoClick = (videoId: string) => {
    playSoftClick();
    console.log('Playing video:', videoId);
  };

  const handleMoreClick = () => {
    playNavigation();
    navigate('/media');
  };

  // Filter only pinned content for home screen curation
  const pinnedVideos = videos.filter(video => video.isPinned);
  const heroVideo = pinnedVideos[0];
  const featuredVideos = pinnedVideos.slice(1, 3);
  const standardVideos = pinnedVideos.slice(3);

  if (pinnedVideos.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">Fitness Videos</h2>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-primary hover:bg-primary/10 font-medium"
            onClick={handleMoreClick}
            soundEnabled={false}
          >
            More
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <p>No pinned videos available. Visit the editorial section to pin content to the home screen.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Fitness Videos</h2>
        <Button 
          variant="ghost" 
          size="sm"
          className="text-primary hover:bg-primary/10 font-medium"
          onClick={handleMoreClick}
          soundEnabled={false}
        >
          More
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Hero Video Card */}
      {heroVideo && (
        <Card 
          className="card-modern glass dark:glass-dark relative w-full h-[280px] rounded-3xl overflow-hidden cursor-pointer group transition-all duration-500 hover:shadow-premium hover:-translate-y-2"
          onClick={() => handleVideoClick(heroVideo.id)}
        >
          <div className="relative w-full h-full">
            <img 
              src={heroVideo.thumbnail} 
              alt={heroVideo.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            {/* Play Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-background/20 backdrop-blur-sm rounded-full p-4 group-hover:bg-background/30 transition-all duration-300 group-hover:scale-110">
                <Play className="h-8 w-8 text-primary-foreground ml-1" fill="currentColor" />
              </div>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-background/20 backdrop-blur-sm text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider">
                  {heroVideo.category}
                </span>
                <div className="flex items-center text-primary-foreground/80 text-sm">
                  <Clock className="h-4 w-4 mr-1" />
                  {heroVideo.duration}
                </div>
              </div>
              
              <h3 className="text-primary-foreground text-2xl font-bold leading-tight mb-2 group-hover:text-primary-foreground/90 transition-colors duration-300">
                {heroVideo.title}
              </h3>
              
              <div className="flex items-center gap-3 text-primary-foreground/80 text-sm">
                <span>with {heroVideo.instructor}</span>
                <span>•</span>
                <span>{heroVideo.difficulty}</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Featured Videos Grid */}
      {featuredVideos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {featuredVideos.map((video) => (
            <Card 
              key={video.id}
              className="card-modern glass dark:glass-dark rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 hover:shadow-medium hover:-translate-y-1 border-0"
              onClick={() => handleVideoClick(video.id)}
            >
              <div className="relative h-32 overflow-hidden">
                <img 
                  src={video.thumbnail} 
                  alt={video.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-background/80 backdrop-blur-sm rounded-full p-2 group-hover:bg-background transition-all duration-300">
                    <Play className="h-4 w-4 text-primary ml-0.5" fill="currentColor" />
                  </div>
                </div>
                <div className="absolute top-2 left-2">
                  <span className="bg-background/90 backdrop-blur-sm text-primary text-xs font-semibold px-2 py-1 rounded-full uppercase tracking-wide">
                    {video.category}
                  </span>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center text-muted-foreground text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {video.duration}
                  </div>
                  <span className="text-muted-foreground text-xs">•</span>
                  <span className="text-muted-foreground text-xs">{video.difficulty}</span>
                </div>
                
                <h4 className="text-foreground text-sm font-semibold leading-tight group-hover:text-primary transition-colors duration-300 line-clamp-2">
                  {video.title}
                </h4>
                
                <p className="text-muted-foreground text-xs mt-1">
                  with {video.instructor}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Standard Videos - if we have any */}
      {standardVideos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {standardVideos.map((video) => (
            <Card 
              key={video.id}
              className="card-modern glass dark:glass-dark rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 hover:shadow-soft hover:-translate-y-0.5 border-0"
              onClick={() => handleVideoClick(video.id)}
            >
              <div className="relative h-20 overflow-hidden">
                <img 
                  src={video.thumbnail} 
                  alt={video.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-background/80 backdrop-blur-sm rounded-full p-1.5 group-hover:bg-background transition-all duration-300">
                    <Play className="h-3 w-3 text-primary ml-0.5" fill="currentColor" />
                  </div>
                </div>
              </div>
              
              <CardContent className="p-2">
                <div className="flex items-center gap-1 mb-1">
                  <div className="flex items-center text-muted-foreground text-xs">
                    <Clock className="h-2.5 w-2.5 mr-0.5" />
                    {video.duration}
                  </div>
                </div>
                
                <h4 className="text-foreground text-xs font-semibold leading-tight group-hover:text-primary transition-colors duration-300 line-clamp-2">
                  {video.title}
                </h4>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
