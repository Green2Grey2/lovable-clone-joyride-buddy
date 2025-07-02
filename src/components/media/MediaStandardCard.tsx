
import { Card, CardContent } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { useSoundEffects } from '@/hooks/useSoundEffects';

interface MediaStandardCardProps {
  article: {
    id: string;
    title: string;
    image: string;
    category: string;
    readTime: string;
    author: string;
  };
  onClick: (id: string) => void;
}

export const MediaStandardCard = ({ article, onClick }: MediaStandardCardProps) => {
  const { playSoftClick } = useSoundEffects();

  const handleClick = () => {
    playSoftClick();
    onClick(article.id);
  };

  return (
    <Card 
      className="bg-white rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 hover:shadow-[0px_10px_25px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 border-0 shadow-[0px_4px_15px_rgba(0,0,0,0.06)]"
      onClick={handleClick}
    >
      <div className="relative h-32 overflow-hidden">
        <img 
          src={article.image} 
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-2 left-2">
          <span className="bg-white/90 backdrop-blur-sm text-[#735CF7] text-xs font-semibold px-2 py-1 rounded-full uppercase tracking-wide">
            {article.category}
          </span>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center text-[#8A94A6] text-xs">
            <Clock className="h-3 w-3 mr-1" />
            {article.readTime}
          </div>
          <span className="text-[#8A94A6] text-xs">by {article.author}</span>
        </div>
        
        <h4 className="text-[#1D244D] text-base font-semibold leading-tight group-hover:text-[#735CF7] transition-colors duration-300 line-clamp-2">
          {article.title}
        </h4>
      </CardContent>
    </Card>
  );
};
