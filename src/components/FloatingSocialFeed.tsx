
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share2, Trophy, Target, Zap, Award, Medal, Crown, Users, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface ActivityPost {
  id: string;
  userId: string;
  userName: string;
  userDepartment: string;
  type: 'achievement' | 'milestone' | 'challenge' | 'workout' | 'streak' | 'personal_record';
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  data?: {
    achievementName?: string;
    achievementRarity?: 'common' | 'rare' | 'epic' | 'legendary';
    challengeName?: string;
    workoutType?: string;
    streakDays?: number;
    milestoneValue?: number;
    metricType?: string;
  };
}

export const FloatingSocialFeed = () => {
  const { userProfile } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(5);
  
  const [posts, setPosts] = useState<ActivityPost[]>([
    {
      id: '1',
      userId: '1',
      userName: 'Alex Chen',
      userDepartment: 'Engineering',
      type: 'achievement',
      content: 'Just unlocked the "Century Club" achievement! 🎉',
      timestamp: '2 hours ago',
      likes: 12,
      comments: 3,
      isLiked: false,
      data: {
        achievementName: 'Century Club',
        achievementRarity: 'epic'
      }
    },
    {
      id: '2',
      userId: '2',
      userName: 'Sarah Johnson',
      userDepartment: 'Engineering',
      type: 'streak',
      content: 'Hit my 15-day workout streak! Feeling unstoppable! 💪',
      timestamp: '4 hours ago',
      likes: 8,
      comments: 2,
      isLiked: true,
      data: {
        streakDays: 15
      }
    },
    {
      id: '3',
      userId: '3',
      userName: 'Mike Rivera',
      userDepartment: 'Marketing',
      type: 'challenge',
      content: 'Completed the Weekend Warriors challenge! Great teamwork Marketing! 🏆',
      timestamp: '6 hours ago',
      likes: 15,
      comments: 5,
      isLiked: false,
      data: {
        challengeName: 'Weekend Warriors'
      }
    }
  ]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  };

  const getPostIcon = (type: string, data?: ActivityPost['data']) => {
    switch (type) {
      case 'achievement':
        if (data?.achievementRarity === 'legendary') return <Crown className="h-4 w-4 text-yellow-500" />;
        if (data?.achievementRarity === 'epic') return <Medal className="h-4 w-4 text-purple-500" />;
        return <Award className="h-4 w-4 text-blue-500" />;
      case 'streak':
        return <Zap className="h-4 w-4 text-red-500" />;
      case 'challenge':
        return <Trophy className="h-4 w-4 text-orange-500" />;
      default:
        return <Target className="h-4 w-4 text-green-500" />;
    }
  };

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getDepartmentColor = (department: string) => {
    const colors = {
      'Engineering': 'bg-blue-500',
      'Marketing': 'bg-green-500',
      'Sales': 'bg-orange-500',
      'Design': 'bg-purple-500',
      'HR': 'bg-pink-500'
    };
    return colors[department as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <Button
          onClick={handleToggle}
          className="fixed bottom-24 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-[#735CF7] to-[#00A3FF] hover:shadow-[0_0_30px_rgba(115,92,247,0.4)] transition-all duration-300 z-40"
          size="sm"
        >
          <Users className="h-6 w-6 text-white" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0">
              {unreadCount}
            </Badge>
          )}
        </Button>
      )}

      {/* Floating Social Feed Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 max-h-[70vh] bg-white rounded-2xl shadow-[0px_20px_50px_rgba(115,92,247,0.15)] border border-gray-100 z-40 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#735CF7] to-[#00A3FF] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-white" />
              <h3 className="font-semibold text-white">Team Activity</h3>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMinimize}
                className="text-white hover:bg-white/20 w-8 h-8 p-0"
              >
                {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggle}
                className="text-white hover:bg-white/20 w-8 h-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          {!isMinimized && (
            <div className="max-h-96 overflow-y-auto p-4 space-y-4">
              {posts.map((post) => (
                <Card key={post.id} className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className={`${getDepartmentColor(post.userDepartment)} text-white text-xs`}>
                          {getUserInitials(post.userName)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm text-[#1D244D] truncate">{post.userName}</p>
                          <span className="text-xs text-[#8A94A6]">{post.timestamp}</span>
                        </div>
                        
                        <div className="flex items-start gap-2 mb-2">
                          {getPostIcon(post.type, post.data)}
                          <p className="text-sm text-[#1D244D] leading-relaxed">{post.content}</p>
                        </div>

                        <div className="flex items-center gap-3 text-xs">
                          <Button
                            size="sm"
                            variant="ghost"
                            className={`h-6 px-2 ${post.isLiked ? 'text-red-500' : 'text-[#8A94A6]'}`}
                            onClick={() => handleLike(post.id)}
                          >
                            <Heart className={`h-3 w-3 mr-1 ${post.isLiked ? 'fill-current' : ''}`} />
                            {post.likes}
                          </Button>
                          <Button size="sm" variant="ghost" className="h-6 px-2 text-[#8A94A6]">
                            <MessageCircle className="h-3 w-3 mr-1" />
                            {post.comments}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Button variant="outline" size="sm" className="w-full">
                View All Activity
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  );
};
