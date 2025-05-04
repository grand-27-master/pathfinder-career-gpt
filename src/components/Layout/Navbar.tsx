
import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import BrandLogo from './BrandLogo';
import MobileNavbar from './MobileNavbar';
import DesktopNavbar from './DesktopNavbar';

const Navbar = () => {
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="container mx-auto py-4 px-4 flex justify-between items-center">
        <BrandLogo />

        {isMobile ? (
          <MobileNavbar isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />
        ) : (
          <DesktopNavbar />
        )}
      </div>
    </header>
  );
};

export default Navbar;
