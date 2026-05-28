import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { API } from '../api';

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice, exportCart, importCart } = useCart();
  const navigate = useNavigate();
  const [importStr, setImportStr] = useState('');
  const [importMsg, setImportMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const handleExport = () => {
    const data = exportCart();
    navigator.clipboard.writeText(data).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleImport = () => {
    if (importCart(importStr)) {
      setImportMsg('Cart imported successfully');
      setImportStr('');
      setTimeout(() => setImportMsg(''), 3000);
    } else {
      setImportMsg('Invalid cart data');
      setTimeout(() => setImportMsg(''), 3000);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-white mb-4">Your cart is empty</h2>
        <p className="text-gray-400 mb-6">Add some indie merch to get started!</p>
        <Link to="/" className="btn-primary inline-block">Browse Products</Link>

        <div className="mt-12 max-w-md mx-auto bg-dark-800 rounded-xl p-6 border border-dark-600">
          <h3 className="text-lg font-semibold text-white mb-3">Import Cart</h3>
          <textarea
            value={importStr}
            onChange={e => setImportStr(e.target.value)}
            placeholder="Paste base64 cart data..."
            className="input-field h-24 text-sm mb-3"
          />
          <button onClick={handleImport} className="btn-secondary w-full">Import</button>
          {importMsg && <p className={`text-sm mt-2 ${importMsg.includes('success') ? 'text-green-400' : 'text-red-400'}`}>{importMsg}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Shopping Cart</h1>
        <button onClick={clearCart} className="text-red-400 hover:text-red-300 text-sm font-medium">Clear All</button>
      </div>

      <div className="space-y-4">
        {items.map((item, idx) => (
          <div key={`${item.product_id}-${item.size}-${idx}`} className="bg-dark-800 rounded-xl p-4 flex gap-4 items-center border border-dark-600">
            <img
              src={`${API}${item.image_url}`}
              alt={item.name}
              className="w-20 h-20 object-cover rounded-lg"
              onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect fill="%23373a40" width="80" height="80"/></svg>'; }}
            />
            <div className="flex-1">
              <h3 className="text-white font-semibold">{item.name}</h3>
              <p className="text-gray-400 text-sm">Size: {item.size}</p>
              <p className="text-brand-400 font-bold">${(item.price * item.quantity).toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.product_id, item.size, item.quantity - 1)}
                className="w-8 h-8 rounded-lg bg-dark-700 text-white hover:bg-dark-600 transition-colors"
              >-</button>
              <span className="text-white font-semibold w-6 text-center">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.product_id, item.size, item.quantity + 1)}
                className="w-8 h-8 rounded-lg bg-dark-700 text-white hover:bg-dark-600 transition-colors"
              >+</button>
            </div>
            <button
              onClick={() => removeItem(item.product_id, item.size)}
              className="text-red-400 hover:text-red-300 ml-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-dark-800 rounded-xl p-6 border border-dark-600">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-300 text-lg">Total</span>
          <span className="text-3xl font-extrabold text-brand-400">${totalPrice.toFixed(2)}</span>
        </div>
        <button onClick={() => navigate('/checkout')} className="btn-primary w-full py-3 text-lg font-bold">
          Proceed to Checkout
        </button>
      </div>

      <div className="mt-8 flex gap-4">
        <div className="flex-1 bg-dark-800 rounded-xl p-4 border border-dark-600">
          <h3 className="text-sm font-semibold text-white mb-2">Export Cart</h3>
          <button onClick={handleExport} className="btn-secondary w-full text-sm">
            {copied ? 'Copied!' : 'Copy Base64'}
          </button>
        </div>
        <div className="flex-1 bg-dark-800 rounded-xl p-4 border border-dark-600">
          <h3 className="text-sm font-semibold text-white mb-2">Import Cart</h3>
          <div className="flex gap-2">
            <input
              value={importStr}
              onChange={e => setImportStr(e.target.value)}
              placeholder="Paste data..."
              className="input-field text-sm py-1.5 flex-1"
            />
            <button onClick={handleImport} className="btn-secondary text-sm whitespace-nowrap">Import</button>
          </div>
          {importMsg && <p className={`text-xs mt-2 ${importMsg.includes('success') ? 'text-green-400' : 'text-red-400'}`}>{importMsg}</p>}
        </div>
      </div>
    </div>
  );
}