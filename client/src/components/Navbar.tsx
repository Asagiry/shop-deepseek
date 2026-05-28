import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  return (
    <nav className="bg-dark-800 border-b border-dark-600 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-extrabold text-brand-400 glow-text tracking-tight">
              INDIE MERCH
            </span>
          </Link>

          <div className="flex items-center space-x-6">
            <Link to="/" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
              Shop
            </Link>
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
                  <Link to="/admin" className="text-brand-400 hover:text-brand-300 transition-colors text-sm font-semibold">
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => { logout(); navigate('/'); }}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="btn-primary text-sm py-2 px-4">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}