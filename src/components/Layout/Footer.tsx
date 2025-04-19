
import React from 'react';
import { Link } from 'react-router-dom';
import { BriefcaseBusiness } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <Link to="/" className="flex items-center space-x-2">
              <BriefcaseBusiness className="h-8 w-8 text-careerGpt-indigo" />
              <span className="font-bold text-xl">CareerGPT</span>
            </Link>
            <p className="text-gray-600 mt-2 max-w-md">
              Your AI-powered career mentor helping you land your dream job.
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm">
            &copy; {new Date().getFullYear()} CareerGPT. All rights reserved.
          </p>
          <p className="text-gray-600 text-sm mt-2 sm:mt-0">
            Made with ❤️ by vashishth
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
