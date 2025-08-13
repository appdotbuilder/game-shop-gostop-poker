import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: any) => void;
}

export function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const handleGoogleAuth = async () => {
    try {
      // In a real implementation, this would integrate with Google OAuth
      // For now, we'll simulate a successful login
      const mockUser = {
        id: 'google_123456',
        email: 'user@gmail.com',
        name: 'John Doe',
        avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        oauth_provider: 'google',
        oauth_id: 'google_123456',
        created_at: new Date()
      };
      
      console.log('Google authentication simulated');
      onAuthSuccess(mockUser);
    } catch (error) {
      console.error('Google authentication failed:', error);
      alert('Authentication failed. Please try again.');
    }
  };

  const handleAppleAuth = async () => {
    try {
      // In a real implementation, this would integrate with Apple OAuth
      // For now, we'll simulate a successful login
      const mockUser = {
        id: 'apple_789012',
        email: 'user@icloud.com',
        name: 'Jane Smith',
        avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
        oauth_provider: 'apple',
        oauth_id: 'apple_789012',
        created_at: new Date()
      };
      
      console.log('Apple authentication simulated');
      onAuthSuccess(mockUser);
    } catch (error) {
      console.error('Apple authentication failed:', error);
      alert('Authentication failed. Please try again.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto">
            <span className="text-white text-3xl">🔐</span>
          </div>
          
          <DialogTitle className="text-2xl font-bold text-gray-800">
            Welcome to GameStore
          </DialogTitle>
          
          <DialogDescription className="text-gray-600">
            Sign in to purchase premium gaming items and access exclusive content.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          {/* Google Sign In */}
          <Button
            onClick={handleGoogleAuth}
            variant="outline"
            size="lg"
            className="w-full flex items-center justify-center gap-3 py-6 hover:bg-red-50 hover:border-red-200"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285f4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34a853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#fbbc05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#ea4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">or</span>
            </div>
          </div>

          {/* Apple Sign In */}
          <Button
            onClick={handleAppleAuth}
            variant="outline"
            size="lg"
            className="w-full flex items-center justify-center gap-3 py-6 hover:bg-gray-50 hover:border-gray-300"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z"/>
            </svg>
            Continue with Apple
          </Button>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </div>
      </DialogContent>
    </Dialog>
  );
}