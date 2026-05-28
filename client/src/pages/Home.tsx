import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API, Product } from '../api';

const PRODUCTS_PER_PAGE = 12;

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sort, setSort] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetch(`${API}/api/products/categories`)
      .then(r => r.json()).then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory) params.set('category', selectedCategory);
    if (sort) params.set('sort', sort);
    if (search) params.set('search', search);

    fetch(`${API}/api/products?${params}`)
      .then(r => r.json()).then(data => {
        setProducts(data);
        setLoading(false);
      }).catch(() => setLoading(false));
  }, [selectedCategory, sort, search]);

  const displayedProducts = products.slice(page * PRODUCTS_PER_PAGE, (page + 1) * PRODUCTS_PER_PAGE);
  const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);

  return (
    <div>
      <div className="text-center mb-8 sm:mb-12 pt-2 sm:pt-4">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-2 sm:mb-3 tracking-tight">
          Indie Game <span className="text-brand-400 glow-text">Merch</span>
        </h1>
        <p className="text-gray-400 text-sm sm:text-lg max-w-2xl mx-auto px-2">
          Official apparel and posters from your favorite indie titles. Vibe Miner, pixel dungeons, and synthwave dreams.
        </p>
      </div>

      <div className="space-y-3 mb-6 sm:mb-8">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setSelectedCategory(''); setPage(0); }}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${!selectedCategory ? 'bg-brand-600 text-white' : 'bg-dark-700 text-gray-300 hover:bg-dark-600'}`}
          >
            All
          </button>
          {categories.map(c => (
            <button
              key={c.slug}
              onClick={() => { setSelectedCategory(selectedCategory === c.slug ? '' : c.slug); setPage(0); }}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${selectedCategory === c.slug ? 'bg-brand-600 text-white' : 'bg-dark-700 text-gray-300 hover:bg-dark-600'}`}
            >
              {c.name}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="text" placeholder="Search..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            className="input-field max-w-full sm:max-w-[200px] py-1.5 text-sm flex-1 sm:flex-none"
          />
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="input-field max-w-full sm:max-w-[160px] py-1.5 text-sm flex-1 sm:flex-none"
          >
            <option value="">Sort: Default</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A-Z</option>
            <option value="name_desc">Name: Z-A</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-500" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayedProducts.map(product => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="bg-dark-800 rounded-xl overflow-hidden border border-dark-600 card-hover"
              >
                <div className="aspect-square bg-dark-700 overflow-hidden">
                  <img
                    src={`${API}${product.image_url}`}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect fill="%23373a40" width="200" height="200"/><text fill="%23909296" x="100" y="105" text-anchor="middle" font-size="14">No Image</text></svg>'; }}
                  />
                </div>
                <div className="p-4">
                  <span className="text-xs text-brand-400 font-medium uppercase tracking-wide">
                    {product.category_name}
                  </span>
                  <h3 className="text-white font-semibold mt-1 truncate">{product.name}</h3>
                  <p className="text-brand-400 font-bold text-lg mt-1">${parseFloat(String(product.price)).toFixed(2)}</p>
                  {product.stock <= 5 && product.stock > 0 && (
                    <p className="text-yellow-500 text-xs mt-1">Only {product.stock} left</p>
                  )}
                  {product.stock === 0 && (
                    <p className="text-red-500 text-xs mt-1">Out of stock</p>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                    page === i ? 'bg-brand-600 text-white' : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}

          {displayedProducts.length === 0 && (
            <p className="text-center text-gray-500 py-12">No products found.</p>
          )}
        </>
      )}
    </div>
  );
}