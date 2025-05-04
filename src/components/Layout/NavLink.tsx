
import React from 'react';
import { Link } from 'react-router-dom';

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}

export const NavLink = ({ to, icon, children, onClick }: NavLinkProps) => (
  <Link 
    to={to} 
    className="flex items-center space-x-2 text-gray-700 hover:text-sky-500 transition-colors"
    onClick={onClick}
  >
    {icon}
    <span>{children}</span>
  </Link>
);
