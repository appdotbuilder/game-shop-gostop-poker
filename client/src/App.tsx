import { useState, useEffect, useCallback } from 'react';
import './App.css';

// Type definitions - matches server schema
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

interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
}

// Simple Button component to avoid import issues
function Button({ 
  children, 
  onClick, 
  className = '', 
  variant = 'default',
  size = 'default',
  disabled = false,
  type = 'button'
}: {
  children: React.ReactNode;
  onClick?: (e?: React.MouseEvent) => void;
  className?: string;
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  disabled?: boolean;
  type?: 'button' | 'submit';
}) {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50';
  const variantClasses = variant === 'outline' 
    ? 'border border-input bg-background hover:bg-accent hover:text-accent-foreground' 
    : 'bg-primary text-primary-foreground hover:bg-primary/90';
  const sizeClasses = size === 'sm' ? 'h-9 px-3' : size === 'lg' ? 'h-11 px-8' : 'h-10 px-4 py-2';
  
  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      onClick={(e) => onClick?.(e)}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

// Simple Card component
function Card({ 
  children, 
  className = '',
  onClick 
}: { 
  children: React.ReactNode; 
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div 
      className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>;
}

function CardContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-6 pt-0 ${className}`}>{children}</div>;
}

// Simple Badge component
function Badge({ 
  children, 
  className = '',
  variant = 'default',
  onClick
}: { 
  children: React.ReactNode; 
  className?: string;
  variant?: 'default' | 'outline' | 'secondary';
  onClick?: () => void;
}) {
  const variantClasses = variant === 'outline' 
    ? 'border border-input hover:bg-accent hover:text-accent-foreground'
    : variant === 'secondary'
    ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
    : 'bg-primary text-primary-foreground hover:bg-primary/80';
    
  return (
    <div 
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer ${variantClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// Header Component
function Header({ 
  currentUser, 
  onAuthClick, 
  onGameTypeSelect, 
  selectedGameType 
}: {
  currentUser: User | null;
  onAuthClick: () => void;
  onGameTypeSelect: (gameType: GameType | null) => void;
  selectedGameType: GameType | null;
}) {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => onGameTypeSelect(null)}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">GameStore</h1>
              <p className="text-xs text-gray-500">Premium Gaming Items</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <Button
              variant={selectedGameType === null ? "default" : "outline"}
              onClick={() => onGameTypeSelect(null)}
              className="text-sm"
            >
              🏠 All Games
            </Button>
            
            <Button
              variant={selectedGameType === 'gostop' ? "default" : "outline"}
              onClick={() => onGameTypeSelect('gostop')}
              className="text-sm"
            >
              🎴 GoStop
            </Button>
            
            <Button
              variant={selectedGameType === 'poker' ? "default" : "outline"}
              onClick={() => onGameTypeSelect('poker')}
              className="text-sm"
            >
              ♠️ Poker
            </Button>
          </nav>

          <div className="md:hidden flex items-center space-x-2">
            <Badge 
              variant={selectedGameType === 'gostop' ? "default" : "outline"}
              className="cursor-pointer text-xs"
              onClick={() => onGameTypeSelect('gostop')}
            >
              🎴
            </Badge>
            <Badge 
              variant={selectedGameType === 'poker' ? "default" : "outline"}
              className="cursor-pointer text-xs"
              onClick={() => onGameTypeSelect('poker')}
            >
              ♠️
            </Badge>
            <Badge 
              variant={selectedGameType === null ? "default" : "outline"}
              className="cursor-pointer text-xs"
              onClick={() => onGameTypeSelect(null)}
            >
              All
            </Badge>
          </div>

          <div className="flex items-center space-x-4">
            {currentUser ? (
              <div className="flex items-center space-x-2">
                <img 
                  src={currentUser.avatar_url || '/default-avatar.png'} 
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full"
                />
                <span className="hidden sm:inline text-sm text-gray-700">
                  {currentUser.name}
                </span>
              </div>
            ) : (
              <Button onClick={onAuthClick} size="sm">
                🔐 Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

// Hero Section Component
function HeroSection({ onExploreClick }: { onExploreClick: () => void }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-yellow-300/20 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-pink-300/20 rounded-full"></div>
        <div className="absolute bottom-40 right-1/3 w-8 h-8 bg-green-300/20 rounded-full animate-pulse"></div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-24 text-center text-white">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Premium Gaming
          <br />
          <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
            Items Store
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
          Discover exclusive virtual items for GoStop and Poker. 
          Enhance your gaming experience with our premium collection.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg" 
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-4 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            onClick={onExploreClick}
          >
            🎮 Explore Collection
          </Button>
          
          <Button 
            size="lg" 
            variant="outline" 
            className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg backdrop-blur-sm"
          >
            ✨ View Featured Items
          </Button>
        </div>
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-300">500+</div>
            <div className="text-blue-100">Happy Customers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-300">2</div>
            <div className="text-blue-100">Game Types</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-300">24/7</div>
            <div className="text-blue-100">Support</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Game Section Component
function GameSection({ 
  title, 
  subtitle, 
  items, 
  gameType, 
  onItemClick, 
  onPurchase 
}: {
  title: string;
  subtitle: string;
  items: GameItem[];
  gameType: GameType;
  onItemClick: (item: GameItem) => void;
  onPurchase: (item: GameItem) => void;
}) {
  const isGostop = gameType === 'gostop';
  
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
                  <p className={`mb-4 ${isGostop ? 'text-gray-600' : 'text-gray-300'}`}>
                    {item.description}
                  </p>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={(e) => {
                        e?.stopPropagation();
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
                      onClick={(e) => {
                        e?.stopPropagation();
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

function App() {
  const [gameItems, setGameItems] = useState<GameItem[]>([]);
  const [selectedGameType, setSelectedGameType] = useState<GameType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const loadGameItems = useCallback(async () => {
    try {
      setIsLoading(true);
      // Mock data for demonstration
      const mockItems: GameItem[] = [
        {
          id: 1,
          title: "Golden Dragon Card",
          description: "Rare golden card with dragon design",
          detailed_description: "This magnificent golden dragon card is a legendary artifact in the world of Gostop.",
          price: 29.99,
          game_type: 'gostop' as GameType,
          image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
          is_available: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 2,
          title: "Cherry Blossom Set",
          description: "Beautiful spring-themed card collection",
          detailed_description: "Experience the beauty of spring with this exclusive Cherry Blossom card set.",
          price: 19.99,
          game_type: 'gostop' as GameType,
          image_url: "https://images.unsplash.com/photo-1522383225653-ed111181a951?w=400&h=300&fit=crop",
          is_available: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 3,
          title: "Royal Flush Chips",
          description: "Premium casino-grade poker chips",
          detailed_description: "Elevate your poker experience with these premium Royal Flush chips.",
          price: 49.99,
          game_type: 'poker' as GameType,
          image_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
          is_available: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 4,
          title: "Diamond Ace Cards",
          description: "Luxury playing cards with diamond accents",
          detailed_description: "These exclusive Diamond Ace cards represent the pinnacle of luxury gaming.",
          price: 79.99,
          game_type: 'poker' as GameType,
          image_url: "https://images.unsplash.com/photo-1515004707848-d8e4bded1b2a?w=400&h=300&fit=crop",
          is_available: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      ];
      setGameItems(mockItems);
    } catch (error) {
      console.error('Failed to load game items:', error);
      setGameItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGameItems();
  }, [loadGameItems]);

  const handleItemClick = (item: GameItem) => {
    alert(`Viewing details for: ${item.title}\n\n${item.detailed_description}`);
  };

  const handlePurchase = async (item: GameItem) => {
    if (!currentUser) {
      alert('Please sign in to make a purchase!');
      return;
    }

    try {
      console.log('Purchasing item:', item);
      alert(`Successfully purchased ${item.title} for $${item.price}!`);
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Purchase failed. Please try again.');
    }
  };

  const handleAuth = () => {
    const mockUser: User = {
      id: 'user_123',
      email: 'user@example.com',
      name: 'John Doe',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    };
    setCurrentUser(mockUser);
    alert('Successfully signed in!');
  };

  const gostopItems = gameItems.filter(item => item.game_type === 'gostop');
  const pokerItems = gameItems.filter(item => item.game_type === 'poker');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 mx-auto border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <h2 className="text-2xl font-semibold text-gray-800">Loading GameStore</h2>
          <p className="text-gray-600">Preparing your premium gaming experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header 
        currentUser={currentUser}
        onAuthClick={handleAuth}
        onGameTypeSelect={setSelectedGameType}
        selectedGameType={selectedGameType}
      />
      
      <HeroSection onExploreClick={() => setSelectedGameType(null)} />
      
      <main className="container mx-auto px-4 py-8">
        {selectedGameType === null && (
          <>
            <GameSection
              title="🎴 GoStop Collection"
              subtitle="Discover beautiful Korean traditional cards with modern flair"
              items={gostopItems}
              gameType="gostop"
              onItemClick={handleItemClick}
              onPurchase={handlePurchase}
            />
            
            <GameSection
              title="♠️ Poker Essentials"
              subtitle="Premium poker accessories for the sophisticated player"
              items={pokerItems}
              gameType="poker"
              onItemClick={handleItemClick}
              onPurchase={handlePurchase}
            />
          </>
        )}
        
        {selectedGameType === 'gostop' && (
          <GameSection
            title="🎴 GoStop Collection"
            subtitle="Discover beautiful Korean traditional cards with modern flair"
            items={gostopItems}
            gameType="gostop"
            onItemClick={handleItemClick}
            onPurchase={handlePurchase}
          />
        )}
        
        {selectedGameType === 'poker' && (
          <GameSection
            title="♠️ Poker Essentials"
            subtitle="Premium poker accessories for the sophisticated player"
            items={pokerItems}
            gameType="poker"
            onItemClick={handleItemClick}
            onPurchase={handlePurchase}
          />
        )}
      </main>
    </div>
  );
}

export default App;