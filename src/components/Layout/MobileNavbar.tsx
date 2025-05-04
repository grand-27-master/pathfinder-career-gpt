
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { X, Menu, FileStack, MessagesSquare, FileText, User } from 'lucide-react';
import AuthDialog from '@/components/Auth/AuthDialog';
import { useUser } from '@/context/UserContext';
import { NavLink } from './NavLink';

interface MobileNavbarProps {
  isMenuOpen: boolean;
  toggleMenu: () => void;
}

const MobileNavbar: React.FC<MobileNavbarProps> = ({ isMenuOpen, toggleMenu }) => {
  const { isAuthenticated, signOut, user } = useUser();

  return (
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
            <NavLink to="/dashboard" icon={<FileStack size={18} />} onClick={toggleMenu}>Dashboard</NavLink>
            <NavLink to="/interviews" icon={<MessagesSquare size={18} />} onClick={toggleMenu}>Interviews</NavLink>
            
            {/* Only show Resumes tab for non-authenticated users */}
            {!isAuthenticated && (
              <NavLink to="/resumes" icon={<FileText size={18} />} onClick={toggleMenu}>Resumes</NavLink>
            )}
            
            <NavLink to="/pricing" icon={<FileText size={18} />} onClick={toggleMenu}>Pricing</NavLink>
            <div className="pt-2 border-t border-gray-100">
              {isAuthenticated ? (
                <>
                  <NavLink to="/profile" icon={<User size={18} />} onClick={toggleMenu}>My Profile</NavLink>
                  <Button variant="default" className="w-full mt-2" onClick={() => {
                    signOut();
                    toggleMenu();
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
  );
};

export default MobileNavbar;
