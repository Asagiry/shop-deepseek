import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <nav className="bg-dark-800 border-b border-dark-600 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2 shrink-0" onClick={() => setMenuOpen(false)}>
            <span className="text-xl sm:text-2xl font-extrabold text-brand-400 glow-text tracking-tight">
              INDIE MERCH
            </span>
          </Link>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="sm:hidden text-gray-300 hover:text-white p-2"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          <div className="hidden sm:flex items-center space-x-6">
            <Link to="/" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Shop</Link>
            <Link to="/cart" className="relative text-gray-300 hover:text-white transition-colors text-sm font-medium">
              Cart
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-4 bg-brand-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
                  {user?.name || 'Profile'}
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="text-brand-400 hover:text-brand-300 transition-colors text-sm font-semibold">Admin</Link>
                )}
                <button onClick={handleLogout} className="text-gray-400 hover:text-white transition-colors text-sm">Logout</button>
              </>
            ) : (
              <Link to="/login" className="btn-primary text-sm py-2 px-4">Sign In</Link>
            )}
          </div>
        </div>

        {menuOpen && (
          <div className="sm:hidden pb-4 border-t border-dark-600 pt-3 space-y-2">
            <Link to="/" onClick={() => setMenuOpen(false)} className="block text-gray-300 hover:text-white transition-colors text-sm font-medium py-1">Shop</Link>
            <Link to="/cart" onClick={() => setMenuOpen(false)} className="block text-gray-300 hover:text-white transition-colors text-sm font-medium py-1">
              Cart {totalItems > 0 && <span className="text-brand-400 font-bold">({totalItems})</span>}
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/profile" onClick={() => setMenuOpen(false)} className="block text-gray-300 hover:text-white transition-colors text-sm font-medium py-1">Profile</Link>
                {isAdmin && (
                  <Link to="/admin" onClick={() => setMenuOpen(false)} className="block text-brand-400 hover:text-brand-300 transition-colors text-sm font-semibold py-1">Admin</Link>
                )}
                <button onClick={handleLogout} className="block text-gray-400 hover:text-white transition-colors text-sm py-1 w-full text-left">Logout</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-primary text-sm py-2 px-4 inline-block">Sign In</Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}