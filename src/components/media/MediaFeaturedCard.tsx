
import { Card, CardContent } from '@/components/ui/card';
import { Clock, ArrowUpRight } from 'lucide-react';
import { useSoundEffects } from '@/hooks/useSoundEffects';

interface MediaFeaturedCardProps {
  article: {
    id: string;
    title: string;
    image: string;
    category: string;
    readTime: string;
    excerpt: string;
    author: string;
  };
  onClick: (id: string) => void;
}

export const MediaFeaturedCard = ({ article, onClick }: MediaFeaturedCardProps) => {
  const { playSoftClick } = useSoundEffects();

  const handleClick = () => {
    playSoftClick();
    onClick(article.id);
  };

  return (
    <Card 
      className="bg-white rounded-3xl overflow-hidden cursor-pointer group transition-all duration-300 hover:shadow-[0px_15px_35px_rgba(0,0,0,0.12)] hover:-translate-y-1 border-0 shadow-[0px_8px_25px_rgba(0,0,0,0.08)]"
      onClick={handleClick}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={article.image} 
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-white/90 backdrop-blur-sm text-[#735CF7] text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
            {article.category}
          </span>
        </div>
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-2">
            <ArrowUpRight className="h-4 w-4 text-[#735CF7]" />
          </div>
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center text-[#8A94A6] text-sm">
            <Clock className="h-4 w-4 mr-1" />
            {article.readTime}
          </div>
          <span className="text-[#8A94A6] text-sm">by {article.author}</span>
        </div>
        
        <h3 className="text-[#1D244D] text-xl font-bold leading-tight mb-3 group-hover:text-[#735CF7] transition-colors duration-300">
          {article.title}
        </h3>
        
        <p className="text-[#8A94A6] text-sm leading-relaxed line-clamp-2">
          {article.excerpt}
        </p>
      </CardContent>
    </Card>
  );
};
