import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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

interface ItemDetailModalProps {
  item: GameItem;
  isOpen: boolean;
  onClose: () => void;
  onPurchase: () => void;
}

export function ItemDetailModal({ item, isOpen, onClose, onPurchase }: ItemDetailModalProps) {
  const isGostop = item.game_type === 'gostop';
  
  // Theme classes based on game type
  const headerClasses = isGostop 
    ? "text-green-800" 
    : "text-yellow-400";
    
  const priceClasses = isGostop
    ? "text-green-600 bg-green-50"
    : "text-yellow-400 bg-yellow-900/20";

  const gameTypeClasses = isGostop
    ? "text-green-600 bg-green-100"
    : "text-yellow-500 bg-yellow-900/30";

  const buttonClasses = isGostop
    ? "bg-green-600 hover:bg-green-700"
    : "bg-yellow-600 hover:bg-yellow-700";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          {/* Image */}
          <div className="relative rounded-lg overflow-hidden">
            <img 
              src={item.image_url || '/placeholder-item.jpg'} 
              alt={item.title}
              className="w-full h-64 object-cover"
            />
            <div className="absolute top-4 right-4">
              <Badge className={`text-lg px-3 py-1 ${priceClasses}`}>
                ${item.price.toFixed(2)}
              </Badge>
            </div>
          </div>

          {/* Title and Game Type */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={gameTypeClasses}>
                {item.game_type === 'gostop' ? '🎴 GoStop' : '♠️ Poker'}
              </Badge>
            </div>
            <DialogTitle className={`text-3xl font-bold ${headerClasses}`}>
              {item.title}
            </DialogTitle>
            <DialogDescription className="text-lg text-gray-600 mt-2">
              {item.description}
            </DialogDescription>
          </div>
        </DialogHeader>

        <Separator />

        {/* Detailed Description */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800">
            📖 Detailed Description
          </h3>
          <p className="text-gray-700 leading-relaxed">
            {item.detailed_description}
          </p>
        </div>

        <Separator />

        {/* Features */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800">
            ✨ Features
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-green-500">✓</span>
              High Quality Design
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-green-500">✓</span>
              Instant Delivery
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-green-500">✓</span>
              Premium Materials
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-green-500">✓</span>
              Lifetime Access
            </div>
          </div>
        </div>

        <Separator />

        {/* Item Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-semibold text-gray-600">Item ID:</span>
            <span className="ml-2 text-gray-800">#{item.id}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-600">Status:</span>
            <span className="ml-2">
              <Badge variant={item.is_available ? "default" : "secondary"}>
                {item.is_available ? "Available" : "Unavailable"}
              </Badge>
            </span>
          </div>
          <div>
            <span className="font-semibold text-gray-600">Game Type:</span>
            <span className="ml-2 text-gray-800 capitalize">
              {item.game_type}
            </span>
          </div>
          <div>
            <span className="font-semibold text-gray-600">Added:</span>
            <span className="ml-2 text-gray-800">
              {item.created_at.toLocaleDateString()}
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            👈 Close
          </Button>
          <Button 
            className={`${buttonClasses} px-8`}
            onClick={onPurchase}
            disabled={!item.is_available}
          >
            🛒 Purchase for ${item.price.toFixed(2)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}