
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MediaItem } from '@/pages/Editorial';
import { Edit, Pin, PinOff, Trash2, Clock, Play, Eye } from 'lucide-react';

interface EditorialMediaListProps {
  items: MediaItem[];
  onEdit: (item: MediaItem) => void;
  onTogglePin: (itemId: string) => void;
  onDelete: (itemId: string) => void;
}

export const EditorialMediaList = ({ items, onEdit, onTogglePin, onDelete }: EditorialMediaListProps) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-[#8A94A6] text-lg mb-2">No content found</div>
        <p className="text-[#8A94A6] text-sm">Create your first article or video to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
          <CardContent className="p-0">
            <div className="flex">
              {/* Thumbnail */}
              <div className="relative w-32 h-24 flex-shrink-0">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                {item.type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="bg-white/90 rounded-full p-1">
                      <Play className="h-3 w-3 text-[#735CF7] ml-0.5" fill="currentColor" />
                    </div>
                  </div>
                )}
                {item.isPinned && (
                  <div className="absolute top-1 left-1">
                    <div className="bg-[#735CF7] text-white rounded-full p-1">
                      <Pin className="h-3 w-3" />
                    </div>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={item.type === 'article' ? 'default' : 'secondary'} className="text-xs">
                      {item.type}
                    </Badge>
                    <Badge variant={item.status === 'published' ? 'default' : 'outline'} className="text-xs">
                      {item.status}
                    </Badge>
                    {item.isPinned && (
                      <Badge variant="outline" className="text-xs bg-[#735CF7]/10 text-[#735CF7] border-[#735CF7]/20">
                        Pinned
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTogglePin(item.id)}
                      soundEnabled={false}
                      className="h-8 w-8 p-0"
                    >
                      {item.isPinned ? (
                        <PinOff className="h-4 w-4 text-[#8A94A6]" />
                      ) : (
                        <Pin className="h-4 w-4 text-[#8A94A6]" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(item)}
                      soundEnabled={false}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4 text-[#8A94A6]" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(item.id)}
                      soundEnabled={false}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <h3 className="font-semibold text-[#1D244D] mb-1 line-clamp-2">
                  {item.title}
                </h3>
                
                <p className="text-[#8A94A6] text-sm mb-2 line-clamp-2">
                  {item.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-[#8A94A6]">
                  <span>by {item.author}</span>
                  
                  {item.type === 'article' && item.readTime && (
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {item.readTime}
                    </div>
                  )}
                  
                  {item.type === 'video' && item.duration && (
                    <div className="flex items-center">
                      <Play className="h-3 w-3 mr-1" />
                      {item.duration}
                    </div>
                  )}
                  
                  <span>•</span>
                  <span>{item.category}</span>
                  
                  {item.difficulty && (
                    <>
                      <span>•</span>
                      <span>{item.difficulty}</span>
                    </>
                  )}
                  
                  <span>•</span>
                  <span>{item.publishDate}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
