
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Play, Clock, Users, Upload, Star, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Video {
  id: string;
  title: string;
  description: string;
  duration: string;
  thumbnail: string;
  category: 'cardio' | 'strength' | 'yoga' | 'walking' | 'stretching';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  views: number;
}

interface VideoLibraryProps {
  isAdmin?: boolean;
}

export const VideoLibrary = ({ isAdmin = false }: VideoLibraryProps) => {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  
  // This will be replaced with real video data from editorial_media table
  const videos: Video[] = [];

  const getCategoryColor = (category: string) => {
    const colors = {
      cardio: 'bg-gradient-to-r from-red-400 to-pink-500 text-white',
      strength: 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white',
      yoga: 'bg-gradient-to-r from-purple-400 to-pink-500 text-white',
      walking: 'bg-gradient-to-r from-green-400 to-emerald-500 text-white',
      stretching: 'bg-gradient-to-r from-orange-400 to-yellow-500 text-white'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      beginner: 'bg-emerald-500',
      intermediate: 'bg-yellow-500',
      advanced: 'bg-red-500'
    };
    return colors[difficulty as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg rounded-3xl overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center">
              <Play className="h-4 w-4 text-white" />
            </div>
            Fitness Videos
          </CardTitle>
          {isAdmin && (
            <Button className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 border-0 rounded-xl shadow-lg">
              <Upload className="h-4 w-4 mr-2" />
              Upload Video
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {videos.map((video) => (
            <Dialog key={video.id}>
              <DialogTrigger asChild>
                <Card className="cursor-pointer hover:scale-105 transition-all duration-300 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl rounded-2xl overflow-hidden group">
                  <div className="relative">
                    <div className="w-full h-40 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center rounded-t-2xl">
                      <Play className="h-12 w-12 text-white bg-black/30 rounded-full p-3 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="absolute top-3 right-3 bg-black/70 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1 backdrop-blur-sm">
                      <Clock className="h-3 w-3" />
                      {video.duration}
                    </div>
                    <div className="absolute top-3 left-3">
                      <Badge className={`${getCategoryColor(video.category)} border-0 shadow-lg`}>
                        {video.category}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <h4 className="font-bold text-lg mb-2 text-gray-800 line-clamp-2">{video.title}</h4>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{video.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getDifficultyColor(video.difficulty)}`} />
                        <span className="text-sm text-gray-600 capitalize">{video.difficulty}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {video.views}
                        </span>
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          <Star className="h-3 w-3" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-4xl rounded-3xl border-0">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-gray-800">{video.title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center">
                    <div className="text-center text-white">
                      <Play className="h-20 w-20 mx-auto mb-4 opacity-70" />
                      <p className="text-xl font-semibold">Video Player</p>
                      <p className="text-sm opacity-70">Integration with video hosting service required</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-50 p-4 rounded-2xl">
                      <h4 className="font-bold mb-3 text-gray-800">Details</h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center">
                          <span>Duration:</span>
                          <span className="font-medium">{video.duration}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Category:</span>
                          <Badge className={`${getCategoryColor(video.category)} border-0 text-xs`}>
                            {video.category}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Difficulty:</span>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getDifficultyColor(video.difficulty)}`} />
                            <span className="capitalize font-medium">{video.difficulty}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Views:</span>
                          <span className="font-medium">{video.views}</span>
                        </div>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <h4 className="font-bold mb-3 text-gray-800">Description</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">{video.description}</p>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
