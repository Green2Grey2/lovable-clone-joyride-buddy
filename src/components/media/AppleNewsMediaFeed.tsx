
import { useState } from 'react';
import { MediaHeroCard } from './MediaHeroCard';
import { MediaFeaturedCard } from './MediaFeaturedCard';
import { MediaStandardCard } from './MediaStandardCard';
import { MediaListCard } from './MediaListCard';

interface AppleNewsMediaFeedProps {
  onArticleClick: (id: string) => void;
}

export const AppleNewsMediaFeed = ({ onArticleClick }: AppleNewsMediaFeedProps) => {
  const [articles] = useState({
    hero: {
      id: 'hero-1',
      title: 'The Science of Recovery: How Elite Athletes Maximize Their Rest',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80',
      category: 'Recovery',
      readTime: '8 min read',
      excerpt: 'Discover the cutting-edge recovery techniques used by professional athletes to enhance performance and prevent injury through scientific sleep and nutrition protocols.'
    },
    featured: [
      {
        id: 'featured-1',
        title: 'High-Intensity Interval Training: A Complete Guide',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',
        category: 'Training',
        readTime: '6 min read',
        excerpt: 'Master the art of HIIT with evidence-based protocols that maximize fat burning and cardiovascular fitness in minimal time.',
        author: 'Dr. Sarah Chen'
      },
      {
        id: 'featured-2',
        title: 'Nutrition Timing: When to Eat for Peak Performance',
        image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80',
        category: 'Nutrition',
        readTime: '5 min read',
        excerpt: 'Learn the optimal timing strategies for pre, during, and post-workout nutrition to fuel your body for maximum results.',
        author: 'Marcus Johnson'
      }
    ],
    standard: [
      {
        id: 'standard-1',
        title: 'Mental Health Benefits of Regular Exercise',
        image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80',
        category: 'Wellness',
        readTime: '4 min read',
        author: 'Dr. Emily Park'
      },
      {
        id: 'standard-2',
        title: 'Building Strength: Progressive Overload Principles',
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80',
        category: 'Strength',
        readTime: '7 min read',
        author: 'Alex Rodriguez'
      },
      {
        id: 'standard-3',
        title: 'Yoga for Athletes: Flexibility and Focus',
        image: 'https://images.unsplash.com/photo-1506629905877-51d2a8f30ae4?auto=format&fit=crop&w=600&q=80',
        category: 'Flexibility',
        readTime: '5 min read',
        author: 'Lisa Thompson'
      },
      {
        id: 'standard-4',
        title: 'Hydration Strategies for Optimal Performance',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80',
        category: 'Nutrition',
        readTime: '3 min read',
        author: 'Michael Kim'
      }
    ],
    list: [
      {
        id: 'list-1',
        title: 'The Psychology of Habit Formation in Fitness',
        category: 'Psychology',
        readTime: '6 min read',
        author: 'Dr. Rachel Green',
        trending: true
      },
      {
        id: 'list-2',
        title: 'Wearable Tech: Tracking Your Way to Better Health',
        category: 'Technology',
        readTime: '4 min read',
        author: 'David Wilson'
      },
      {
        id: 'list-3',
        title: 'Common Exercise Myths Debunked by Science',
        category: 'Science',
        readTime: '5 min read',
        author: 'Prof. James Lee',
        trending: true
      }
    ]
  });

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <MediaHeroCard article={articles.hero} onClick={onArticleClick} />

      {/* Featured Articles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {articles.featured.map((article) => (
          <MediaFeaturedCard key={article.id} article={article} onClick={onArticleClick} />
        ))}
      </div>

      {/* Standard Articles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {articles.standard.map((article) => (
          <MediaStandardCard key={article.id} article={article} onClick={onArticleClick} />
        ))}
      </div>

      {/* Trending & List Articles */}
      <div className="space-y-3">
        <h3 className="text-[#1D244D] text-lg font-semibold mb-4">Trending Now</h3>
        {articles.list.map((article) => (
          <MediaListCard key={article.id} article={article} onClick={onArticleClick} />
        ))}
      </div>
    </div>
  );
};
