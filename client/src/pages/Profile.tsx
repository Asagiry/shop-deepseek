import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API, Order } from '../api';

export default function Profile() {
  const { user, token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    fetch(`${API}/api/orders/history`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.json()).then(data => {
      setOrders(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [isAuthenticated, token, navigate]);

  const statusColor = (status: string) => {
    const map: Record<string, string> = {
      'new': 'bg-blue-500/20 text-blue-400',
      'confirmed': 'bg-yellow-500/20 text-yellow-400',
      'shipped': 'bg-purple-500/20 text-purple-400',
      'delivered': 'bg-green-500/20 text-green-400',
    };
    return map[status] || 'bg-gray-500/20 text-gray-400';
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-white mb-8">My Profile</h1>

      <div className="bg-dark-800 rounded-xl p-6 border border-dark-600 mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Account Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="text-gray-400 text-sm">Name</span>
            <p className="text-white font-medium">{user?.name || 'N/A'}</p>
          </div>
          <div>
            <span className="text-gray-400 text-sm">Email</span>
            <p className="text-white font-medium">{user?.email || 'N/A'}</p>
          </div>
          <div>
            <span className="text-gray-400 text-sm">Role</span>
            <p className="text-white font-medium capitalize">{user?.role || 'N/A'}</p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-white mb-4">Order History</h2>
      {loading ? (
        <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500" /></div>
      ) : orders.length === 0 ? (
        <p className="text-gray-400 bg-dark-800 rounded-xl p-6 border border-dark-600">No orders yet. Start shopping!</p>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-dark-800 rounded-xl p-5 border border-dark-600">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-white font-semibold">Order #{order.id}</h3>
                  <p className="text-gray-500 text-sm">{new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${statusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <div className="space-y-2">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-300">{item.name} x{item.quantity} ({item.size})</span>
                    <span className="text-gray-400">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-3 pt-3 border-t border-dark-600">
                <span className="text-gray-400 font-medium">Total</span>
                <span className="text-brand-400 font-bold text-lg">${parseFloat(String(order.total)).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}