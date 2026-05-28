import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API, Product } from '../api';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('M');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/products/${id}`)
      .then(r => r.json()).then(data => {
        setProduct(data);
        if (data.sizes?.length) setSelectedSize(data.sizes[0]);
        setLoading(false);
      }).catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-500" /></div>;
  }

  if (!product) {
    return <div className="text-center py-20 text-gray-400">Product not found.</div>;
  }

  const handleAddToCart = () => {
    addItem(product, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition-colors mb-6 flex items-center gap-1">
        <span>&larr;</span> Back
      </button>
      <div className="grid md:grid-cols-2 gap-10">
        <div className="aspect-square bg-dark-800 rounded-2xl overflow-hidden border border-dark-600">
          <img
            src={`${API}${product.image_url}`}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect fill="%23373a40" width="200" height="200"/><text fill="%23909296" x="100" y="105" text-anchor="middle" font-size="14">No Image</text></svg>'; }}
          />
        </div>
        <div>
          <span className="text-brand-400 text-sm font-medium uppercase tracking-wide">{product.category_name}</span>
          <h1 className="text-3xl font-bold text-white mt-2">{product.name}</h1>
          <p className="text-3xl font-extrabold text-brand-400 mt-3">${parseFloat(String(product.price)).toFixed(2)}</p>
          <p className="text-gray-400 mt-4 leading-relaxed">{product.description}</p>

          {product.sizes && product.sizes.length > 0 && product.sizes[0] !== 'one-size' && (
            <div className="mt-6">
              <h3 className="text-white font-semibold mb-2">Size</h3>
              <div className="flex gap-2">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-10 rounded-lg text-sm font-medium transition-all ${
                      selectedSize === size ? 'bg-brand-600 text-white' : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 space-y-3">
            {product.stock > 0 ? (
              <>
                <p className={`text-sm ${product.stock <= 5 ? 'text-yellow-500' : 'text-green-400'}`}>
                  {product.stock <= 5 ? `Only ${product.stock} left in stock` : 'In Stock'}
                </p>
                <button
                  onClick={handleAddToCart}
                  className={`w-full py-3 rounded-xl font-bold text-lg transition-all ${
                    added ? 'bg-green-600 text-white' : 'btn-primary'
                  }`}
                >
                  {added ? 'Added!' : 'Add to Cart'}
                </button>
              </>
            ) : (
              <>
                <p className="text-red-500 text-sm">Out of Stock</p>
                <button disabled className="w-full py-3 rounded-xl font-bold text-lg bg-dark-600 text-gray-500 cursor-not-allowed">
                  Out of Stock
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}