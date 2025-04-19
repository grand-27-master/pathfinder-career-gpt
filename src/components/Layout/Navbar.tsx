
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  BriefcaseBusiness, 
  MessagesSquare, 
  FileStack, 
  Menu, 
  X, 
  FileText,
  LogIn,
  LogOut,
  User
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from '@/hooks/use-toast';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

const Navbar = () => {
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isSignedIn, setIsSignedIn] = React.useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignIn = () => {
    setIsSignedIn(true);
    toast({
      title: "Signed In Successfully",
      description: "Welcome to CareerGPT! You now have access to all features.",
    });
  };

  const handleSignOut = () => {
    setIsSignedIn(false);
    toast({
      title: "Signed Out",
      description: "You have been signed out successfully.",
    });
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="container mx-auto py-4 px-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <BriefcaseBusiness className="h-8 w-8 text-careerGpt-indigo" />
          <span className="font-bold text-xl hidden sm:inline">CareerGPT</span>
        </Link>

        {isMobile ? (
          <>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
            
            {isMenuOpen && (
              <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 py-4 px-6 shadow-md">
                <nav className="flex flex-col space-y-4">
                  <NavLink to="/dashboard" icon={<FileStack size={18} />} onClick={() => setIsMenuOpen(false)}>Dashboard</NavLink>
                  <NavLink to="/jobs" icon={<BriefcaseBusiness size={18} />} onClick={() => setIsMenuOpen(false)}>Jobs</NavLink>
                  <NavLink to="/interviews" icon={<MessagesSquare size={18} />} onClick={() => setIsMenuOpen(false)}>Interviews</NavLink>
                  <NavLink to="/resumes" icon={<FileText size={18} />} onClick={() => setIsMenuOpen(false)}>Resumes</NavLink>
                  <div className="pt-2 border-t border-gray-100">
                    {isSignedIn ? (
                      <Button variant="default" className="w-full" onClick={handleSignOut}>
                        <LogOut className="mr-2" size={18} />
                        Sign Out
                      </Button>
                    ) : (
                      <Button variant="default" className="w-full" onClick={handleSignIn}>
                        <LogIn className="mr-2" size={18} />
                        Sign In
                      </Button>
                    )}
                  </div>
                </nav>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center space-x-6">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Features</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-4 w-[400px]">
                      <NavigationMenuLink asChild>
                        <Link to="/dashboard" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="flex items-center gap-2">
                            <FileStack size={18} />
                            <span className="text-sm font-medium leading-none">Dashboard</span>
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            View your career progress and analytics
                          </p>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link to="/jobs" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="flex items-center gap-2">
                            <BriefcaseBusiness size={18} />
                            <span className="text-sm font-medium leading-none">Jobs</span>
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Find and apply to your dream job
                          </p>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link to="/interviews" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="flex items-center gap-2">
                            <MessagesSquare size={18} />
                            <span className="text-sm font-medium leading-none">Interviews</span>
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Practice interviews with AI
                          </p>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link to="/resumes" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="flex items-center gap-2">
                            <FileText size={18} />
                            <span className="text-sm font-medium leading-none">Resumes</span>
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Manage and optimize your resumes
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            {isSignedIn ? (
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
                <Button variant="outline" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button variant="default" onClick={handleSignIn}>
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}

const NavLink = ({ to, icon, children, onClick }: NavLinkProps) => (
  <Link 
    to={to} 
    className="flex items-center space-x-2 text-gray-700 hover:text-careerGpt-indigo transition-colors"
    onClick={onClick}
  >
    {icon}
    <span>{children}</span>
  </Link>
);

export default Navbar;
