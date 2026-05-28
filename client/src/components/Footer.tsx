import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-dark-800 border-t border-dark-600 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <h3 className="text-brand-400 font-bold text-lg mb-2">Indie Merch</h3>
            <p className="text-gray-400 text-sm">Official indie game apparel and posters. Quality merch for true gamers.</p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-2">Links</h3>
            <div className="flex flex-col gap-1">
              <Link to="/" className="text-gray-400 hover:text-white text-sm transition-colors">Shop</Link>
              <Link to="/cart" className="text-gray-400 hover:text-white text-sm transition-colors">Cart</Link>
              <Link to="/profile" className="text-gray-400 hover:text-white text-sm transition-colors">Profile</Link>
            </div>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-2">Contact</h3>
            <p className="text-gray-400 text-sm">support@indiemerch.game</p>
            <p className="text-gray-500 text-xs mt-2">&copy; {new Date().getFullYear()} Indie Merch. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}