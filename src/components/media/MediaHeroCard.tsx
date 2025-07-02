
import { Card } from '@/components/ui/card';
import { Clock, ArrowRight } from 'lucide-react';
import { useSoundEffects } from '@/hooks/useSoundEffects';

interface MediaHeroCardProps {
  article: {
    id: string;
    title: string;
    image: string;
    category: string;
    readTime: string;
    excerpt: string;
  };
  onClick: (id: string) => void;
}

export const MediaHeroCard = ({ article, onClick }: MediaHeroCardProps) => {
  const { playSoftClick } = useSoundEffects();

  const handleClick = () => {
    playSoftClick();
    onClick(article.id);
  };

  return (
    <Card 
      className="relative w-full h-[400px] rounded-3xl overflow-hidden cursor-pointer group transition-all duration-500 hover:shadow-[0px_20px_40px_rgba(0,0,0,0.15)] hover:-translate-y-2"
      onClick={handleClick}
    >
      <div className="relative w-full h-full">
        <img 
          src={article.image} 
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider">
              {article.category}
            </span>
            <div className="flex items-center text-white/80 text-sm">
              <Clock className="h-4 w-4 mr-1" />
              {article.readTime}
            </div>
          </div>
          
          <h1 className="text-white text-3xl font-bold leading-tight mb-3 group-hover:text-white/90 transition-colors duration-300">
            {article.title}
          </h1>
          
          <p className="text-white/90 text-base leading-relaxed mb-4 line-clamp-2">
            {article.excerpt}
          </p>
          
          <div className="flex items-center text-white/80 text-sm font-medium group-hover:text-white transition-colors duration-300">
            Read Article
            <ArrowRight className="h-4 w-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Card>
  );
};
