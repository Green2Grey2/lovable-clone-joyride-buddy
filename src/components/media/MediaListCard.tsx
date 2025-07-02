
import { Card, CardContent } from '@/components/ui/card';
import { Clock, TrendingUp } from 'lucide-react';
import { useSoundEffects } from '@/hooks/useSoundEffects';

interface MediaListCardProps {
  article: {
    id: string;
    title: string;
    category: string;
    readTime: string;
    author: string;
    trending?: boolean;
  };
  onClick: (id: string) => void;
}

export const MediaListCard = ({ article, onClick }: MediaListCardProps) => {
  const { playSoftClick } = useSoundEffects();

  const handleClick = () => {
    playSoftClick();
    onClick(article.id);
  };

  return (
    <Card 
      className="bg-card rounded-2xl cursor-pointer group transition-all duration-300 hover:shadow-[0px_8px_20px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 border-0 shadow-[0px_2px_10px_rgba(0,0,0,0.04)]"
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-primary text-xs font-semibold uppercase tracking-wider">
                {article.category}
              </span>
              {article.trending && (
                <div className="flex items-center text-destructive text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Trending
                </div>
              )}
            </div>
            
            <h4 className="text-foreground text-base font-semibold leading-tight mb-2 group-hover:text-primary transition-colors duration-300">
              {article.title}
            </h4>
            
            <div className="flex items-center gap-3 text-muted-foreground text-xs">
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {article.readTime}
              </div>
              <span>by {article.author}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
