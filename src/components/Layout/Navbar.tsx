
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
  User,
  UserPlus
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import AuthDialog from '@/components/Auth/AuthDialog';
import { useUser } from '@/context/UserContext';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated, signOut } = useUser();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
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
                  <NavLink to="/interviews" icon={<MessagesSquare size={18} />} onClick={() => setIsMenuOpen(false)}>Interviews</NavLink>
                  <NavLink to="/resumes" icon={<FileText size={18} />} onClick={() => setIsMenuOpen(false)}>Resumes</NavLink>
                  <NavLink to="/pricing" icon={<FileText size={18} />} onClick={() => setIsMenuOpen(false)}>Pricing</NavLink>
                  <div className="pt-2 border-t border-gray-100">
                    {isAuthenticated ? (
                      <>
                        <NavLink to="/profile" icon={<User size={18} />} onClick={() => setIsMenuOpen(false)}>My Profile</NavLink>
                        <Button variant="default" className="w-full mt-2" onClick={() => {
                          signOut();
                          setIsMenuOpen(false);
                        }}>
                          Sign Out
                        </Button>
                      </>
                    ) : (
                      <div className="flex flex-col space-y-2">
                        <AuthDialog mode="signin" />
                        <AuthDialog mode="signup" />
                      </div>
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
                      <Link to="/resumes" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-sky-50 hover:text-sky-500 focus:bg-accent focus:text-accent-foreground">
                        <div className="flex items-center gap-2">
                          <FileText size={18} />
                          <span className="text-sm font-medium leading-none">Resumes</span>
                        </div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Manage and optimize your resumes
                        </p>
                      </Link>
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
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
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
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <AuthDialog mode="signin" />
                <AuthDialog mode="signup" />
              </div>
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
    className="flex items-center space-x-2 text-gray-700 hover:text-sky-500 transition-colors"
    onClick={onClick}
  >
    {icon}
    <span>{children}</span>
  </Link>
);

export default Navbar;
