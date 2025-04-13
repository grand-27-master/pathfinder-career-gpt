
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BriefcaseBusiness, MessagesSquare, FileStack, Menu, X, FileText } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const Navbar = () => {
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

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
                  <NavLink to="/jobs" icon={<BriefcaseBusiness size={18} />} onClick={() => setIsMenuOpen(false)}>Jobs</NavLink>
                  <NavLink to="/interviews" icon={<MessagesSquare size={18} />} onClick={() => setIsMenuOpen(false)}>Interviews</NavLink>
                  <NavLink to="/resumes" icon={<FileText size={18} />} onClick={() => setIsMenuOpen(false)}>Resumes</NavLink>
                  <div className="pt-2 border-t border-gray-100">
                    <Button variant="default" className="w-full">Sign In</Button>
                  </div>
                </nav>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center space-x-6">
            <nav className="flex items-center space-x-6">
              <NavLink to="/dashboard" icon={<FileStack size={18} />}>Dashboard</NavLink>
              <NavLink to="/jobs" icon={<BriefcaseBusiness size={18} />}>Jobs</NavLink>
              <NavLink to="/interviews" icon={<MessagesSquare size={18} />}>Interviews</NavLink>
              <NavLink to="/resumes" icon={<FileText size={18} />}>Resumes</NavLink>
            </nav>
            <Button variant="default">Sign In</Button>
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
