import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { API } from '../api';

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) { navigate('/login'); return; }
    setLoading(true);
    setError('');

    const res = await fetch(`${API}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        name, address, phone, paymentMethod,
        items: items.map(i => ({ product_id: i.product_id, quantity: i.quantity, size: i.size })),
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'Checkout failed');
      return;
    }

    setSuccess(true);
    clearCart();
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center">
        <div className="text-5xl mb-4">&#10003;</div>
        <h1 className="text-3xl font-bold text-white mb-3">Order Placed!</h1>
        <p className="text-gray-400 mb-6">Thank you for your purchase. You can view your order in your profile.</p>
        <button onClick={() => navigate('/profile')} className="btn-primary">View Orders</button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-white mb-4">Your cart is empty</h2>
        <button onClick={() => navigate('/')} className="btn-primary">Browse Products</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Checkout</h1>

      <div className="bg-dark-800 rounded-xl p-6 border border-dark-600 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Order Summary</h2>
        {items.map(item => (
          <div key={`${item.product_id}-${item.size}`} className="flex justify-between text-sm py-2 border-b border-dark-600 last:border-0">
            <span className="text-gray-300">{item.name} x{item.quantity} ({item.size})</span>
            <span className="text-gray-400">${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="flex justify-between mt-4 pt-3 border-t border-dark-500">
          <span className="text-white font-bold text-lg">Total</span>
          <span className="text-brand-400 font-extrabold text-xl">${totalPrice.toFixed(2)}</span>
        </div>
      </div>

      <form onSubmit={handleCheckout} className="bg-dark-800 rounded-xl p-6 border border-dark-600">
        {error && <p className="text-red-400 mb-4 text-sm bg-red-500/10 p-3 rounded-lg">{error}</p>}
        <div className="space-y-4">
          <div>
            <label className="text-gray-300 text-sm font-medium block mb-1.5">Full Name</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="text-gray-300 text-sm font-medium block mb-1.5">Address</label>
            <input type="text" required value={address} onChange={e => setAddress(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="text-gray-300 text-sm font-medium block mb-1.5">Phone</label>
            <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="text-gray-300 text-sm font-medium block mb-1.5">Payment Method</label>
            <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="input-field">
              <option value="card">Credit Card (Mock)</option>
              <option value="paypal">PayPal (Mock)</option>
              <option value="crypto">Crypto (Mock)</option>
            </select>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-lg font-bold">
            {loading ? 'Processing...' : `Place Order - $${totalPrice.toFixed(2)}`}
          </button>
        </div>
      </form>
    </div>
  );
}