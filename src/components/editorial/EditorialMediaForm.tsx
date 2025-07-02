
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { MediaItem } from '@/pages/Editorial';
import { Save, X, Pin } from 'lucide-react';

interface EditorialMediaFormProps {
  item: MediaItem | null;
  onSave: (item: Omit<MediaItem, 'id'>) => void;
  onCancel: () => void;
}

export const EditorialMediaForm = ({ item, onSave, onCancel }: EditorialMediaFormProps) => {
  const [formData, setFormData] = useState({
    type: 'article' as 'article' | 'video',
    title: '',
    description: '',
    content: '',
    thumbnail: '',
    author: '',
    readTime: '',
    duration: '',
    category: '',
    difficulty: '',
    instructor: '',
    isPinned: false,
    status: 'draft' as 'draft' | 'published'
  });

  useEffect(() => {
    if (item) {
      setFormData({
        type: item.type,
        title: item.title,
        description: item.description,
        content: item.content || '',
        thumbnail: item.thumbnail,
        author: item.author,
        readTime: item.readTime || '',
        duration: item.duration || '',
        category: item.category,
        difficulty: item.difficulty || '',
        instructor: item.instructor || '',
        isPinned: item.isPinned,
        status: item.status
      });
    }
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newItem: Omit<MediaItem, 'id'> = {
      ...formData,
      publishDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    };

    onSave(newItem);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl">
            {item ? 'Edit Content' : 'Create New Content'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel} soundEnabled={false}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Content Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Content Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'article' | 'video') => handleInputChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="article">Article</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'draft' | 'published') => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter content title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of the content"
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnail">Thumbnail URL</Label>
              <Input
                id="thumbnail"
                value={formData.thumbnail}
                onChange={(e) => handleInputChange('thumbnail', e.target.value)}
                placeholder="https://example.com/image.jpg"
                type="url"
                required
              />
            </div>
          </div>

          {/* Author and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => handleInputChange('author', e.target.value)}
                placeholder="Author name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                placeholder="e.g., Fitness, Nutrition, Recovery"
                required
              />
            </div>
          </div>

          {/* Type-specific fields */}
          {formData.type === 'article' && (
            <div className="space-y-2">
              <Label htmlFor="readTime">Read Time</Label>
              <Input
                id="readTime"
                value={formData.readTime}
                onChange={(e) => handleInputChange('readTime', e.target.value)}
                placeholder="e.g., 5 min read"
              />
            </div>
          )}

          {formData.type === 'video' && (
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  placeholder="e.g., 15 min"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructor">Instructor</Label>
                <Input
                  id="instructor"
                  value={formData.instructor}
                  onChange={(e) => handleInputChange('instructor', e.target.value)}
                  placeholder="Instructor name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value) => handleInputChange('difficulty', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                    <SelectItem value="All Levels">All Levels</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Content */}
          {formData.type === 'article' && (
            <div className="space-y-2">
              <Label htmlFor="content">Article Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="Write your article content here..."
                rows={10}
                className="min-h-[200px]"
              />
            </div>
          )}

          {/* Pin to Home */}
          <div className="flex items-center space-x-2 p-4 bg-primary/5 rounded-lg">
            <Pin className="h-4 w-4 text-primary" />
            <div className="flex-1">
              <Label htmlFor="isPinned" className="font-medium">Pin to Home Screen</Label>
              <p className="text-sm text-muted-foreground">
                Pinned content will appear in the curated fitness videos section on the home screen
              </p>
            </div>
            <Switch
              id="isPinned"
              checked={formData.isPinned}
              onCheckedChange={(checked) => handleInputChange('isPinned', checked)}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel} soundEnabled={false}>
              Cancel
            </Button>
            <Button type="submit" className="rounded-full">
              <Save className="h-4 w-4 mr-2" />
              {item ? 'Update' : 'Create'} Content
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
