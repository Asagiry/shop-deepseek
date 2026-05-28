import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API, Product, Order } from '../api';

type Tab = 'products' | 'orders';

export default function AdminDashboard() {
  const { user, token, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editProduct, setEditProduct] = useState<Partial<Product> | null>(null);
  const [isNew, setIsNew] = useState(false);

  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    if (!isAdmin) { navigate('/login'); return; }
    loadData();
    fetch(`${API}/api/products/categories`).then(r => r.json()).then(setCategories);
  }, [isAdmin]);

  const loadData = async () => {
    setLoading(true);
    const [prodRes, orderRes] = await Promise.all([
      fetch(`${API}/api/products`),
      fetch(`${API}/api/admin/orders`, { headers }),
    ]);
    setProducts(await prodRes.json());
    setOrders(await orderRes.json());
    setLoading(false);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProduct) return;
    const method = isNew ? 'POST' : 'PUT';
    const url = isNew ? `${API}/api/admin/products` : `${API}/api/admin/products/${editProduct.id}`;

    const res = await fetch(url, {
      method,
      headers,
      body: JSON.stringify(editProduct),
    });
    if (res.ok) {
      setEditProduct(null);
      setIsNew(false);
      loadData();
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Delete this product?')) return;
    await fetch(`${API}/api/admin/products/${id}`, { method: 'DELETE', headers });
    loadData();
  };

  const handleStatusChange = async (orderId: number, status: string) => {
    await fetch(`${API}/api/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ status }),
    });
    loadData();
  };

  const statusColor = (s: string) => {
    const map: Record<string, string> = {
      'new': 'bg-blue-500/20 text-blue-400',
      'confirmed': 'bg-yellow-500/20 text-yellow-400',
      'shipped': 'bg-purple-500/20 text-purple-400',
      'delivered': 'bg-green-500/20 text-green-400',
    };
    return map[s] || 'bg-gray-500/20 text-gray-400';
  };

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
      <p className="text-gray-400 mb-6">Welcome, {user?.name}</p>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('products')} className={`px-5 py-2 rounded-lg font-medium transition-all ${tab === 'products' ? 'bg-brand-600 text-white' : 'bg-dark-700 text-gray-300'}`}>
          Products
        </button>
        <button onClick={() => setTab('orders')} className={`px-5 py-2 rounded-lg font-medium transition-all ${tab === 'orders' ? 'bg-brand-600 text-white' : 'bg-dark-700 text-gray-300'}`}>
          Orders
        </button>
      </div>

      {tab === 'products' && (
        <div>
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">{products.length} Products</h2>
            <button onClick={() => { setEditProduct({ name: '', description: '', price: 0, image_url: '', category_id: 0, sizes: [], stock: 0 }); setIsNew(true); }} className="btn-primary">
              Add Product
            </button>
          </div>

          {(editProduct !== null) && (
            <form onSubmit={handleSaveProduct} className="bg-dark-800 rounded-xl p-6 border border-brand-600 mb-6 space-y-4">
              <h3 className="text-lg font-semibold text-white">{isNew ? 'New Product' : `Edit: ${editProduct.name}`}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-300 text-sm block mb-1">Name</label>
                  <input required value={editProduct.name || ''} onChange={e => setEditProduct({...editProduct, name: e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="text-gray-300 text-sm block mb-1">Price</label>
                  <input type="number" step="0.01" required value={editProduct.price || 0} onChange={e => setEditProduct({...editProduct, price: parseFloat(e.target.value)})} className="input-field" />
                </div>
                <div>
                  <label className="text-gray-300 text-sm block mb-1">Category</label>
                  <select value={editProduct.category_id || 0} onChange={e => setEditProduct({...editProduct, category_id: parseInt(e.target.value)})} className="input-field">
                    <option value={0}>Select category</option>
                    {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-gray-300 text-sm block mb-1">Stock</label>
                  <input type="number" value={editProduct.stock || 0} onChange={e => setEditProduct({...editProduct, stock: parseInt(e.target.value)})} className="input-field" />
                </div>
                <div>
                  <label className="text-gray-300 text-sm block mb-1">Sizes (comma-separated)</label>
                  <input value={Array.isArray(editProduct.sizes) ? editProduct.sizes.join(',') : ''} onChange={e => setEditProduct({...editProduct, sizes: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})} className="input-field" />
                </div>
                <div>
                  <label className="text-gray-300 text-sm block mb-1">Image URL</label>
                  <input value={editProduct.image_url || ''} onChange={e => setEditProduct({...editProduct, image_url: e.target.value})} className="input-field" />
                </div>
              </div>
              <div>
                <label className="text-gray-300 text-sm block mb-1">Description</label>
                <textarea value={editProduct.description || ''} onChange={e => setEditProduct({...editProduct, description: e.target.value})} className="input-field h-24" />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary">{isNew ? 'Create' : 'Save'}</button>
                <button type="button" onClick={() => { setEditProduct(null); setIsNew(false); }} className="btn-secondary">Cancel</button>
              </div>
            </form>
          )}

          <div className="grid gap-3">
            {products.map(p => (
              <div key={p.id} className="bg-dark-800 rounded-xl p-4 flex items-center gap-4 border border-dark-600">
                <img src={`${API}${p.image_url}`} alt={p.name} className="w-14 h-14 object-cover rounded-lg" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold truncate">{p.name}</h3>
                  <p className="text-gray-500 text-sm">{p.category_name} | Stock: {p.stock} | ${parseFloat(String(p.price)).toFixed(2)}</p>
                </div>
                <button onClick={() => setEditProduct(p)} className="text-gray-400 hover:text-white text-sm px-3 py-1 bg-dark-700 rounded-lg">Edit</button>
                <button onClick={() => handleDeleteProduct(p.id)} className="text-red-400 hover:text-red-300 text-sm px-3 py-1 bg-dark-700 rounded-lg">Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'orders' && (
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">{orders.length} Orders</h2>
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-dark-800 rounded-xl p-5 border border-dark-600">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-white font-semibold">Order #{order.id} - {(order as any).name || 'N/A'}</h3>
                    <p className="text-gray-500 text-sm">{new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${statusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <div className="space-y-1 mb-3">
                  {order.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-300">{item.name} x{item.quantity} ({item.size})</span>
                      <span className="text-gray-400">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-dark-600">
                  <span className="text-brand-400 font-bold">${parseFloat(String(order.total)).toFixed(2)}</span>
                  <select
                    value={order.status}
                    onChange={e => handleStatusChange(order.id, e.target.value)}
                    className="input-field max-w-[160px] py-1.5 text-sm"
                  >
                    <option value="new">New</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}