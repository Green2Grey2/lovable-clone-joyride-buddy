
import { Card, CardContent } from '@/components/ui/card';

interface DepartmentMascotProps {
  department: string;
  mascot: string;
  theme: string;
  image?: string;
}

export const DepartmentMascot = ({ department, mascot, theme, image }: DepartmentMascotProps) => {
  const getThemeClasses = (theme: string) => {
    switch (theme) {
      case 'blue':
        return 'bg-gradient-to-br from-blue-500/20 to-blue-600/30 border-blue-300/40 backdrop-blur-sm';
      case 'green':
        return 'bg-gradient-to-br from-green-500/20 to-green-600/30 border-green-300/40 backdrop-blur-sm';
      case 'purple':
        return 'bg-gradient-to-br from-purple-500/20 to-purple-600/30 border-purple-300/40 backdrop-blur-sm';
      case 'orange':
        return 'bg-gradient-to-br from-orange-500/20 to-orange-600/30 border-orange-300/40 backdrop-blur-sm';
      default:
        return 'bg-gradient-to-br from-gray-500/20 to-gray-600/30 border-gray-300/40 backdrop-blur-sm';
    }
  };

  return (
    <Card className={`${getThemeClasses(theme)} border-2 hover:scale-105 transform transition-all duration-300 shadow-lg hover:shadow-xl`}>
      <CardContent className="p-6 text-center">
        <div className="w-20 h-20 mx-auto mb-4 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-3xl shadow-lg border border-white/30">
          {image ? (
            <img src={image} alt={mascot} className="w-full h-full rounded-full object-cover" />
          ) : (
            <span className="text-2xl">🏆</span>
          )}
        </div>
        <h3 className="font-bold text-lg text-gray-800 mb-1">{department}</h3>
        <p className="text-sm text-gray-600 font-medium">{mascot}</p>
      </CardContent>
    </Card>
  );
};
