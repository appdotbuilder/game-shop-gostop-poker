import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// Local type definition to avoid server import in build
type GameType = 'gostop' | 'poker';

interface HeaderProps {
  currentUser: any;
  onAuthClick: () => void;
  onGameTypeSelect: (gameType: GameType | null) => void;
  selectedGameType: GameType | null;
}

export function Header({ currentUser, onAuthClick, onGameTypeSelect, selectedGameType }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
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

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Button
              variant={selectedGameType === null ? "default" : "ghost"}
              onClick={() => onGameTypeSelect(null)}
              className="text-sm"
            >
              🏠 All Games
            </Button>
            
            <Button
              variant={selectedGameType === 'gostop' ? "default" : "ghost"}
              onClick={() => onGameTypeSelect('gostop')}
              className="text-sm"
            >
              🎴 GoStop
            </Button>
            
            <Button
              variant={selectedGameType === 'poker' ? "default" : "ghost"}
              onClick={() => onGameTypeSelect('poker')}
              className="text-sm"
            >
              ♠️ Poker
            </Button>
          </nav>

          {/* Mobile Navigation */}
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

          {/* Auth Button */}
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