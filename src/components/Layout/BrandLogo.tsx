
import React from 'react';
import { Link } from 'react-router-dom';
import { BriefcaseBusiness } from 'lucide-react';

const BrandLogo: React.FC = () => (
  <Link to="/" className="flex items-center space-x-2">
    <BriefcaseBusiness className="h-8 w-8 text-careerGpt-indigo" />
    <span className="font-bold text-xl hidden sm:inline">CareerGPT</span>
  </Link>
);

export default BrandLogo;
