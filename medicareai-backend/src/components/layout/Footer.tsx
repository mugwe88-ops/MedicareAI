import React from 'react';
import Link from 'next/link'; // Use 'react-router-dom' Link if not using Next.js

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          
          {/* Brand/Copyright Section */}
          <div className="flex justify-center md:order-2">
            <p className="text-center text-base text-gray-500">
              &copy; {currentYear} MedicareAI. All rights reserved.
            </p>
          </div>

          {/* Legal Links Section - Meta/Safaricom check these! */}
          <div className="mt-8 md:mt-0 md:order-1">
            <nav className="flex flex-wrap justify-center space-x-6">
              <Link 
                href="/privacy" 
                className="text-gray-400 hover:text-gray-500 text-sm font-medium"
              >
                Privacy Policy
              </Link>
              <Link 
                href="/terms" 
                className="text-gray-400 hover:text-gray-500 text-sm font-medium"
              >
                Terms of Service
              </Link>
              <Link 
                href="/contact" 
                className="text-gray-400 hover:text-gray-500 text-sm font-medium"
              >
                Contact Us
              </Link>
            </nav>
          </div>

        </div>
        
        {/* Verification Note (Optional: helps bots find your physical info) */}
        <div className="mt-8 border-t border-gray-100 pt-8">
          <p className="text-center text-xs text-gray-400">
            MedicareAI Ltd. | Nairobi, Kenya | Registration No: [Your Business No]
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;