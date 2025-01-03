import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom'; // Optional, if routing is used
import { Navbar } from '@/components/navbar/navbar';

export function SplashScreen() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row items-center justify-center bg-gray-50 px-6 py-12">
        {/* Text Section */}
        <div className="text-center md:text-left md:w-1/2 space-y-6">
          <h1 className="text-4xl font-extrabold text-gray-800">
            Welcome to Selene
          </h1>
          <p className="text-gray-600 text-lg">
            Monitor, forecast, and optimize your household energy usage with
            ease.
          </p>
          <div className="space-x-4">
            <Link to="/login">
              <Button className="px-6">Get Started</Button>
            </Link>
          </div>
        </div>

        {/* Image Section */}
        <div className="mt-8 md:mt-0 md:w-1/2">
          <img
            src="/home-page.png"
            alt="Dashboard preview"
            className="rounded-lg shadow-lg"
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6">
        <div className="text-center space-y-2">
          <p>© 2024 Selene. All rights reserved.</p>
          <div className="flex justify-center space-x-4">
            <Link to="/about" className="hover:underline">
              About Us
            </Link>
            <Link to="/privacy" className="hover:underline">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:underline">
              Terms of Service
            </Link>
            <Link to="/contact" className="hover:underline">
              Contact Us
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
