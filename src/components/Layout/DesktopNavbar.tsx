
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger 
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { User, FileStack, MessagesSquare, FileText } from 'lucide-react';
import AuthDialog from '@/components/Auth/AuthDialog';
import { useUser } from '@/context/UserContext';
import ThemeToggle from './ThemeToggle';

const DesktopNavbar: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, signOut, user } = useUser();

  return (
    <div className="flex items-center space-x-6">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger className="hover:text-sky-500 hover:bg-sky-50 transition-colors">Features</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="grid gap-3 p-4 w-[400px]">
                <Link to="/dashboard" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-sky-50 hover:text-sky-500 focus:bg-accent focus:text-accent-foreground">
                  <div className="flex items-center gap-2">
                    <FileStack size={18} />
                    <span className="text-sm font-medium leading-none">Dashboard</span>
                  </div>
                  <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                    View your career progress and analytics
                  </p>
                </Link>
                <Link to="/interviews" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-sky-50 hover:text-sky-500 focus:bg-accent focus:text-accent-foreground">
                  <div className="flex items-center gap-2">
                    <MessagesSquare size={18} />
                    <span className="text-sm font-medium leading-none">Interviews</span>
                  </div>
                  <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                    Practice interviews with AI
                  </p>
                </Link>
                
                {/* Only show Resumes tab for non-authenticated users */}
                {!isAuthenticated && (
                  <Link to="/resumes" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-sky-50 hover:text-sky-500 focus:bg-accent focus:text-accent-foreground">
                    <div className="flex items-center gap-2">
                      <FileText size={18} />
                      <span className="text-sm font-medium leading-none">Resumes</span>
                    </div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      Manage and optimize your resumes
                    </p>
                  </Link>
                )}
                
                <Link to="/pricing" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-sky-50 hover:text-sky-500 focus:bg-accent focus:text-accent-foreground">
                  <div className="flex items-center gap-2">
                    <FileText size={18} />
                    <span className="text-sm font-medium leading-none">Pricing</span>
                  </div>
                  <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                    View our pricing plans and features
                  </p>
                </Link>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      
      <div className="flex items-center space-x-4">
        <ThemeToggle />
        
        {isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/resumes')}>
                My Resumes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/interviews')}>
                My Interviews
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center space-x-2">
            <AuthDialog mode="signin" />
            <AuthDialog mode="signup" />
          </div>
        )}
      </div>
    </div>
  );
};

export default DesktopNavbar;
