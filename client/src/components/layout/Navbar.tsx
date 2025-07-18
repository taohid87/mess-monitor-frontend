import { User as FirebaseUser } from 'firebase/auth';
import { User } from '@/types';
import { logout } from '@/services/auth';
import { Button } from '@/components/ui/button';
import { LogOut, Utensils } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NavbarProps {
  user: FirebaseUser | null;
  userProfile: User | null;
}

export const Navbar = ({ user, userProfile }: NavbarProps) => {
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error: any) {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!user || !userProfile) return null;

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Utensils className="text-primary text-2xl mr-2" />
              <span className="font-inter font-bold text-xl text-gray-800">Mess Monitor</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">
              Welcome, {userProfile.role === 'admin' ? 'Admin' : userProfile.name}
            </span>
            <Button onClick={handleLogout} variant="destructive" size="sm">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
