import React from 'react';
import { Link } from 'react-router-dom';
import { Car } from 'lucide-react';


function Navbar() {
  
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
        {/* Logo/Brand */}
        <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <Car className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
                MavPark
            </span>
        </Link>
          
        </div>
      </div>
    </nav>
  );
}

export default Navbar;