import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// Local type definitions to avoid server import in build
type GameType = 'gostop' | 'poker';

interface GameItem {
  id: number;
  title: string;
  description: string;
  detailed_description: string;
  price: number;
  game_type: GameType;
  image_url: string | null;
  is_available: boolean;
  created_at: Date;
  updated_at: Date;
}

interface GameSectionProps {
  title: string;
  subtitle: string;
  items: GameItem[];
  gameType: GameType;
  onItemClick: (item: GameItem) => void;
  onPurchase: (item: GameItem) => void;
}

export function GameSection({ 
  title, 
  subtitle, 
  items, 
  gameType, 
  onItemClick, 
  onPurchase 
}: GameSectionProps) {
  const isGostop = gameType === 'gostop';
  
  // Theme classes based on game type
  const sectionClasses = isGostop 
    ? "bg-gradient-to-br from-green-50 to-blue-50" 
    : "bg-gradient-to-br from-gray-900 to-black";
    
  const headerClasses = isGostop 
    ? "text-gray-800" 
    : "text-white";
    
  const subtitleClasses = isGostop 
    ? "text-gray-600" 
    : "text-gray-300";
    
  const cardClasses = isGostop
    ? "border-green-200 hover:border-green-300 bg-white/80 backdrop-blur-sm hover:bg-white/90"
    : "border-yellow-600/30 hover:border-yellow-500/50 bg-gray-800/80 backdrop-blur-sm hover:bg-gray-800/90 text-white";

  const priceClasses = isGostop
    ? "text-green-600 bg-green-50"
    : "text-yellow-400 bg-yellow-900/30";

  return (
    <section className={`py-16 px-4 rounded-3xl mb-12 ${sectionClasses}`}>
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${headerClasses}`}>
            {title}
          </h2>
          <p className={`text-lg md:text-xl max-w-2xl mx-auto ${subtitleClasses}`}>
            {subtitle}
          </p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">
              {isGostop ? '🎴' : '♠️'}
            </div>
            <p className={`text-xl ${subtitleClasses}`}>
              Coming soon! New items are being added regularly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item: GameItem) => (
              <Card 
                key={item.id} 
                className={`overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer ${cardClasses}`}
                onClick={() => onItemClick(item)}
              >
                <CardHeader className="p-0">
                  <div className="relative">
                    <img 
                      src={item.image_url || '/placeholder-item.jpg'} 
                      alt={item.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <Badge className={`${priceClasses} font-semibold`}>
                        ${item.price.toFixed(2)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">
                    {item.title}
                  </h3>
                  <p className={`mb-4 line-clamp-2 ${isGostop ? 'text-gray-600' : 'text-gray-300'}`}>
                    {item.description}
                  </p>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        onItemClick(item);
                      }}
                    >
                      👁️ View Details
                    </Button>
                    <Button 
                      size="sm" 
                      className={`flex-1 ${
                        isGostop 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-yellow-600 hover:bg-yellow-700'
                      }`}
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        onPurchase(item);
                      }}
                    >
                      🛒 Buy Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}