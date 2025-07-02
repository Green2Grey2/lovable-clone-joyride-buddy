
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Share2, Trophy, Target, Zap, Award, Medal, Crown } from 'lucide-react';
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

export const SocialActivityFeed = () => {
  const { userProfile } = useApp();
  
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
    },
    {
      id: '4',
      userId: '4',
      userName: 'Emma Davis',
      userDepartment: 'Design',
      type: 'milestone',
      content: 'Reached 50,000 total steps! Every step counts! 🎯',
      timestamp: '8 hours ago',
      likes: 6,
      comments: 1,
      isLiked: false,
      data: {
        milestoneValue: 50000,
        metricType: 'steps'
      }
    },
    {
      id: '5',
      userId: '5',
      userName: 'Tom Wilson',
      userDepartment: 'Sales',
      type: 'personal_record',
      content: 'New personal record: 18,500 steps in a single day! 🔥',
      timestamp: '1 day ago',
      likes: 10,
      comments: 4,
      isLiked: true,
      data: {
        milestoneValue: 18500,
        metricType: 'steps'
      }
    }
  ]);

  const getPostIcon = (type: string, data?: ActivityPost['data']) => {
    switch (type) {
      case 'achievement':
        if (data?.achievementRarity === 'legendary') return <Crown className="h-5 w-5 text-yellow-500" />;
        if (data?.achievementRarity === 'epic') return <Medal className="h-5 w-5 text-purple-500" />;
        return <Award className="h-4 w-4 text-blue-500" />;
      case 'milestone':
        return <Target className="h-4 w-4 text-green-500" />;
      case 'challenge':
        return <Trophy className="h-4 w-4 text-orange-500" />;
      case 'streak':
        return <Zap className="h-4 w-4 text-red-500" />;
      case 'personal_record':
        return <Trophy className="h-4 w-4 text-pink-500" />;
      default:
        return <Target className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPostBadge = (type: string, data?: ActivityPost['data']) => {
    switch (type) {
      case 'achievement':
        return <Badge className="bg-blue-100 text-blue-800">Achievement</Badge>;
      case 'milestone':
        return <Badge className="bg-green-100 text-green-800">Milestone</Badge>;
      case 'challenge':
        return <Badge className="bg-orange-100 text-orange-800">Challenge</Badge>;
      case 'streak':
        return <Badge className="bg-red-100 text-red-800">Streak</Badge>;
      case 'personal_record':
        return <Badge className="bg-pink-100 text-pink-800">Personal Record</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Activity</Badge>;
    }
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
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#1D244D]">Activity Feed</h2>
        <Button size="sm" variant="outline">
          Share Achievement
        </Button>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id} className="bg-white border-0 rounded-2xl shadow-[0px_8px_25px_rgba(115,92,247,0.08)] hover:shadow-[0px_12px_35px_rgba(115,92,247,0.12)] transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className={`${getDepartmentColor(post.userDepartment)} text-white font-semibold`}>
                    {getUserInitials(post.userName)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-[#1D244D]">{post.userName}</h3>
                    <span className="text-sm text-[#8A94A6]">•</span>
                    <span className="text-sm text-[#8A94A6]">{post.userDepartment}</span>
                    <span className="text-sm text-[#8A94A6]">•</span>
                    <span className="text-sm text-[#8A94A6]">{post.timestamp}</span>
                    {getPostBadge(post.type, post.data)}
                  </div>
                  
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-gray-50 rounded-full">
                      {getPostIcon(post.type, post.data)}
                    </div>
                    <p className="text-[#1D244D] leading-relaxed">{post.content}</p>
                  </div>

                  {/* Special data display */}
                  {post.data && (
                    <div className="mb-4 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                      {post.type === 'achievement' && post.data.achievementName && (
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-blue-500" />
                          <span className="font-semibold text-[#1D244D]">{post.data.achievementName}</span>
                          {post.data.achievementRarity && (
                            <Badge className={
                              post.data.achievementRarity === 'legendary' ? 'bg-yellow-100 text-yellow-800' :
                              post.data.achievementRarity === 'epic' ? 'bg-purple-100 text-purple-800' :
                              post.data.achievementRarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }>
                              {post.data.achievementRarity}
                            </Badge>
                          )}
                        </div>
                      )}
                      {post.type === 'streak' && post.data.streakDays && (
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-red-500" />
                          <span className="font-semibold text-[#1D244D]">{post.data.streakDays}-day streak</span>
                        </div>
                      )}
                      {post.type === 'challenge' && post.data.challengeName && (
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-orange-500" />
                          <span className="font-semibold text-[#1D244D]">{post.data.challengeName}</span>
                        </div>
                      )}
                      {(post.type === 'milestone' || post.type === 'personal_record') && post.data.milestoneValue && (
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-green-500" />
                          <span className="font-semibold text-[#1D244D]">
                            {post.data.milestoneValue.toLocaleString()} {post.data.metricType}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        className={`flex items-center gap-2 ${post.isLiked ? 'text-red-500' : 'text-[#8A94A6]'}`}
                        onClick={() => handleLike(post.id)}
                      >
                        <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                        {post.likes}
                      </Button>
                      <Button size="sm" variant="ghost" className="flex items-center gap-2 text-[#8A94A6]">
                        <MessageCircle className="h-4 w-4" />
                        {post.comments}
                      </Button>
                      <Button size="sm" variant="ghost" className="flex items-center gap-2 text-[#8A94A6]">
                        <Share2 className="h-4 w-4" />
                        Share
                      </Button>
                    </div>
                    
                    {post.userName === userProfile.name && (
                      <Badge variant="secondary" className="text-xs">
                        You
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center py-6">
        <Button variant="outline" className="w-full">
          Load More Activities
        </Button>
      </div>
    </div>
  );
};
