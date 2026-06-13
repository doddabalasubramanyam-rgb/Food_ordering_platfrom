import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { Search, ShoppingCart, Info, AlertTriangle } from 'lucide-react';

export default function Menu({ addToCart }) {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await api.get('/products');
        setProducts(data || []);
      } catch (err) {
        setError('Failed to load menu products.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleQuantityChange = (productId, val) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, parseInt(val) || 1)
    }));
  };

  const handleAddToCart = (product) => {
    const qty = quantities[product.id] || 1;
    if (qty > product.stockQty) {
      alert(`Cannot add ${qty} items! Only ${product.stockQty} items left in stock.`);
      return;
    }
    addToCart(product, qty);
    alert(`Added ${qty} x ${product.name} to cart.`);
  };

  // Extract unique categories
  const categories = ['All', ...new Set(products.map(p => p.category))];

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) || 
                          product.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="app-container animate-fade-in">
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '8px' }}>Our Menu</h2>
        <p style={{ color: 'hsl(var(--text-muted))' }}>Browse fresh food from verified local suppliers</p>
      </div>

      {/* Search and Category Filter Controls */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '40px'
      }}>
        {/* Search Input */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
          <Search size={18} style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'hsl(var(--text-muted))'
          }} />
          <input 
            type="text" 
            className="form-input" 
            placeholder="Search pizza, drinks, bread..." 
            style={{ paddingLeft: '44px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Category Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                fontFamily: 'var(--font-main)',
                fontWeight: 600,
                fontSize: '0.85rem',
                border: '1px solid var(--glass-border)',
                borderRadius: '20px',
                padding: '8px 18px',
                cursor: 'pointer',
                background: selectedCategory === cat ? 'hsl(var(--primary-color) / 0.15)' : 'rgba(255, 255, 255, 0.03)',
                color: selectedCategory === cat ? 'hsl(var(--primary-color))' : 'hsl(var(--text-muted))',
                transition: 'var(--transition-smooth)'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Loading & Error displays */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
          Fetching fresh menu items...
        </div>
      ) : error ? (
        <div className="glass-panel" style={{ color: 'hsl(var(--danger-color))', textAlign: 'center', padding: '30px' }}>
          <AlertTriangle size={32} style={{ marginBottom: '10px' }} />
          <p>{error}</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '40px', color: 'hsl(var(--text-muted))' }}>
          <p>No products found matching your criteria.</p>
        </div>
      ) : (
        /* Products Grid */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {filteredProducts.map(product => {
            const isOutOfStock = product.stockQty <= 0;
            const itemQty = quantities[product.id] || 1;

            return (
              <div key={product.id} className="glass-panel animate-slide-up" style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                opacity: isOutOfStock ? 0.75 : 1
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <span className="badge badge-info">{product.category}</span>
                    {isOutOfStock ? (
                      <span className="badge badge-danger">Out of Stock</span>
                    ) : (
                      <span className="badge badge-success">In Stock ({product.stockQty})</span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1.3rem', marginBottom: '6px', fontWeight: 700 }}>{product.name}</h3>
                  <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.85rem', marginBottom: '16px' }}>
                    Supplier: {product.supplier.name}
                  </p>
                </div>

                <div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '16px',
                    borderTop: '1px solid rgba(255,255,255,0.04)',
                    paddingTop: '16px'
                  }}>
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'hsl(var(--primary-color))' }}>
                      ₹{product.price}
                    </span>

                    {/* Quantity controller (only show for instock products and Customer role) */}
                    {!isOutOfStock && user && user.role === 'CUSTOMER' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Qty:</span>
                        <input
                          type="number"
                          min="1"
                          max={product.stockQty}
                          className="form-input"
                          style={{ width: '56px', padding: '6px 8px', fontSize: '0.85rem', textAlign: 'center' }}
                          value={itemQty}
                          onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                        />
                      </div>
                    )}
                  </div>

                  {/* Add to Cart / Action buttons */}
                  {user ? (
                    user.role === 'CUSTOMER' ? (
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="btn-primary"
                        style={{ width: '100%', padding: '10px' }}
                        disabled={isOutOfStock}
                      >
                        <ShoppingCart size={16} />
                        Add to Cart
                      </button>
                    ) : (
                      <div style={{ 
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: 'var(--border-radius-sm)',
                        padding: '10px',
                        textAlign: 'center',
                        fontSize: '0.75rem',
                        color: 'hsl(var(--text-muted))'
                      }}>
                        Logged in as Supplier
                      </div>
                    )
                  ) : (
                    <div style={{ display: 'flex', gap: '8px', fontSize: '0.8rem', alignItems: 'center', color: 'hsl(var(--text-muted))' }}>
                      <Info size={14} style={{ color: 'hsl(var(--primary-color))' }} />
                      <span>Please login as a Customer to order.</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
