
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FloatingBottomNav } from '@/components/FloatingBottomNav';
import { ProfileDropdown } from '@/components/ProfileDropdown';
import { Bell, Plus, Search, Filter, Edit, Pin, PinOff, Trash2 } from 'lucide-react';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { EditorialMediaForm } from '@/components/editorial/EditorialMediaForm';
import { EditorialMediaList } from '@/components/editorial/EditorialMediaList';

export interface MediaItem {
  id: string;
  type: 'article' | 'video';
  title: string;
  description: string;
  content?: string;
  thumbnail: string;
  author: string;
  readTime?: string;
  duration?: string;
  category: string;
  difficulty?: string;
  instructor?: string;
  publishDate: string;
  isPinned: boolean;
  status: 'draft' | 'published';
}

const Editorial = () => {
  const { playSoftClick } = useSoundEffects();
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [filter, setFilter] = useState<'all' | 'articles' | 'videos'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Sample media items for demonstration
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([
    {
      id: 'hero-1',
      type: 'article',
      title: 'The Science of Recovery: How Elite Athletes Maximize Their Rest',
      description: 'Elite athletes understand that recovery isn\'t just rest—it\'s a science.',
      content: 'Full article content here...',
      thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80',
      author: 'Dr. Michael Chen',
      readTime: '8 min read',
      category: 'Recovery',
      publishDate: 'June 28, 2025',
      isPinned: true,
      status: 'published'
    },
    {
      id: 'video-1',
      type: 'video',
      title: 'Morning Yoga Flow: Energize Your Day',
      description: 'Start your morning with this energizing yoga sequence.',
      thumbnail: 'https://images.unsplash.com/photo-1506629905877-51d2a8f30ae4?auto=format&fit=crop&w=800&q=80',
      author: 'Sarah Chen',
      duration: '15 min',
      category: 'Yoga',
      instructor: 'Sarah Chen',
      difficulty: 'Beginner',
      publishDate: 'June 27, 2025',
      isPinned: true,
      status: 'published'
    }
  ]);

  const handleNotifications = () => {
    playSoftClick();
    console.log('Notifications clicked');
  };

  const handleSearch = () => {
    playSoftClick();
    console.log('Search clicked');
  };

  const handleCreateNew = () => {
    playSoftClick();
    setEditingItem(null);
    setActiveTab('create');
  };

  const handleEditItem = (item: MediaItem) => {
    playSoftClick();
    setEditingItem(item);
    setActiveTab('create');
  };

  const handleSaveItem = (item: Omit<MediaItem, 'id'>) => {
    playSoftClick();
    if (editingItem) {
      // Update existing item
      setMediaItems(prev => prev.map(i => 
        i.id === editingItem.id ? { ...item, id: editingItem.id } : i
      ));
    } else {
      // Create new item
      const newItem: MediaItem = {
        ...item,
        id: `item-${Date.now()}`,
      };
      setMediaItems(prev => [newItem, ...prev]);
    }
    setActiveTab('list');
    setEditingItem(null);
  };

  const handleTogglePin = (itemId: string) => {
    playSoftClick();
    setMediaItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, isPinned: !item.isPinned } : item
    ));
  };

  const handleDeleteItem = (itemId: string) => {
    playSoftClick();
    setMediaItems(prev => prev.filter(item => item.id !== itemId));
  };

  const filteredItems = mediaItems.filter(item => {
    const matchesFilter = filter === 'all' || 
      (filter === 'articles' && item.type === 'article') ||
      (filter === 'videos' && item.type === 'video');
    
    const matchesSearch = searchTerm === '' || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F7F7F7] pb-32">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-xl sticky top-0 z-30 border-b border-gray-100/50">
        <div className="px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-[#1D244D] mb-1 tracking-tight">
                Editorial
              </h1>
              <p className="text-[#8A94A6] text-sm font-medium">Content Management</p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-[#8A94A6] hover:bg-gray-50 w-10 h-10 p-0 rounded-full"
                onClick={handleSearch}
                soundEnabled={false}
              >
                <Search className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-[#8A94A6] hover:bg-gray-50 w-10 h-10 p-0 rounded-full"
                onClick={handleNotifications}
                soundEnabled={false}
              >
                <Bell className="h-5 w-5" />
              </Button>
              <ProfileDropdown />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-4 mt-6">
            <Button
              variant={activeTab === 'list' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('list')}
              soundEnabled={false}
              className="rounded-full"
            >
              Content Library
            </Button>
            <Button
              variant={activeTab === 'create' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('create')}
              soundEnabled={false}
              className="rounded-full"
            >
              {editingItem ? 'Edit Content' : 'Create New'}
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        {activeTab === 'list' ? (
          <div className="space-y-6">
            {/* Actions Bar */}
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                  soundEnabled={false}
                  className="rounded-full"
                >
                  All ({mediaItems.length})
                </Button>
                <Button
                  variant={filter === 'articles' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('articles')}
                  soundEnabled={false}
                  className="rounded-full"
                >
                  Articles ({mediaItems.filter(i => i.type === 'article').length})
                </Button>
                <Button
                  variant={filter === 'videos' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('videos')}
                  soundEnabled={false}
                  className="rounded-full"
                >
                  Videos ({mediaItems.filter(i => i.type === 'video').length})
                </Button>
              </div>
              
              <Button onClick={handleCreateNew} className="rounded-full">
                <Plus className="h-4 w-4 mr-2" />
                Create New
              </Button>
            </div>

            {/* Content List */}
            <EditorialMediaList
              items={filteredItems}
              onEdit={handleEditItem}
              onTogglePin={handleTogglePin}
              onDelete={handleDeleteItem}
            />
          </div>
        ) : (
          <EditorialMediaForm
            item={editingItem}
            onSave={handleSaveItem}
            onCancel={() => {
              setActiveTab('list');
              setEditingItem(null);
            }}
          />
        )}
      </div>

      <FloatingBottomNav />
    </div>
  );
};

export default Editorial;
