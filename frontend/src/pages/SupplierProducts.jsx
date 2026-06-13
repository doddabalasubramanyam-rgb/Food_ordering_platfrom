import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { Plus, Edit2, Trash2, ShieldAlert, Check, RefreshCw } from 'lucide-react';

export default function SupplierProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form state
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Pizza');
  const [price, setPrice] = useState('');
  const [stockQty, setStockQty] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);

  const fetchMyProducts = async () => {
    try {
      const data = await api.get('/products/my');
      setProducts(data || []);
    } catch (err) {
      setError('Failed to fetch supplier catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProducts();
  }, []);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setName('');
    setCategory('Pizza');
    setPrice('');
    setStockQty('');
    setIsAvailable(true);
    setShowForm(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setName(p.name);
    setCategory(p.category);
    setPrice(p.price);
    setStockQty(p.stockQty);
    setIsAvailable(p.isAvailable);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      name,
      category,
      price: parseFloat(price),
      stockQty: parseInt(stockQty),
      isAvailable: isAvailable
    };

    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      setShowForm(false);
      fetchMyProducts();
    } catch (err) {
      setError(err.message || 'Operation failed.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product from your inventory?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchMyProducts();
    } catch (err) {
      alert(err.message || 'Failed to delete product.');
    }
  };

  const handleAdjustStock = async (product, delta) => {
    const newQty = Math.max(0, product.stockQty + delta);
    try {
      await api.put(`/products/${product.id}`, {
        name: product.name,
        category: product.category,
        price: product.price,
        stockQty: newQty,
        isAvailable: newQty > 0
      });
      fetchMyProducts();
    } catch (err) {
      alert('Failed to update stock: ' + err.message);
    }
  };

  return (
    <div className="app-container animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '8px' }}>Manage Inventory</h2>
          <p style={{ color: 'hsl(var(--text-muted))' }}>Control catalog listings, availability, and stock quantities</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={fetchMyProducts} className="btn-secondary" style={{ padding: '10px 14px' }}>
            <RefreshCw size={16} />
          </button>
          <button onClick={handleOpenAdd} className="btn-primary" style={{ padding: '10px 20px' }}>
            <Plus size={18} />
            Add Product
          </button>
        </div>
      </div>

      {error && (
        <div className="glass-panel" style={{ color: 'hsl(var(--danger-color))', marginBottom: '24px', borderLeft: '4px solid hsl(var(--danger-color))' }}>
          {error}
        </div>
      )}

      {/* Product Form Modal Panel */}
      {showForm && (
        <div className="glass-panel animate-slide-up" style={{ marginBottom: '30px', border: '1px solid hsl(var(--primary-color) / 0.3)' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '20px' }}>
            {editingProduct ? 'Edit Product Details' : 'Add New Menu Product'}
          </h3>
          <form onSubmit={handleSubmit} style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            alignItems: 'end'
          }}>
            <div className="form-group">
              <label className="form-label">Product Name</label>
              <input 
                type="text" 
                className="form-input" 
                required 
                placeholder="Pizza Margherita"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Category</label>
              <select 
                className="form-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ background: 'rgba(0,0,0,0.35)' }}
              >
                <option value="Pizza">Pizza</option>
                <option value="Cold Drinks">Cold Drinks</option>
                <option value="Bread">Bread</option>
                <option value="Sides">Sides</option>
                <option value="Desserts">Desserts</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Price (₹)</label>
              <input 
                type="number" 
                step="0.01" 
                className="form-input" 
                required 
                placeholder="299.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Stock Quantity</label>
              <input 
                type="number" 
                className="form-input" 
                required 
                placeholder="50"
                value={stockQty}
                onChange={(e) => setStockQty(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ paddingBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input 
                type="checkbox" 
                id="isAvailable" 
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="isAvailable" style={{ cursor: 'pointer', fontSize: '0.9rem' }}>Available for ordering</label>
            </div>

            <div style={{ display: 'flex', gap: '10px', paddingBottom: '12px' }}>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary" style={{ flex: 1, padding: '10px' }}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" style={{ flex: 1, padding: '10px' }}>
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Catalog Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'hsl(var(--text-muted))' }}>
          Loading supplier catalog...
        </div>
      ) : products.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '50px', color: 'hsl(var(--text-muted))' }}>
          <ShieldAlert size={48} style={{ opacity: 0.5, marginBottom: '16px' }} />
          <h3>Catalog Empty</h3>
          <p style={{ marginTop: '8px', marginBottom: '20px' }}>You haven't listed any products yet.</p>
          <button onClick={handleOpenAdd} className="btn-primary">Add Your First Product</button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {products.map(p => (
            <div key={p.id} className="glass-panel" style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span className="badge badge-info">{p.category}</span>
                  {p.isAvailable ? (
                    <span className="badge badge-success">Active</span>
                  ) : (
                    <span className="badge badge-danger">Disabled</span>
                  )}
                </div>

                <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', fontWeight: 600 }}>{p.name}</h3>
                
                {/* Price and Stock Indicators */}
                <div style={{ display: 'flex', gap: '20px', margin: '14px 0', fontSize: '0.95rem' }}>
                  <div>
                    <span style={{ color: 'hsl(var(--text-muted))', fontSize: '0.8rem', display: 'block' }}>PRICE</span>
                    <span style={{ fontWeight: 700 }}>₹{p.price}</span>
                  </div>
                  <div>
                    <span style={{ color: 'hsl(var(--text-muted))', fontSize: '0.8rem', display: 'block' }}>STOCK</span>
                    <span style={{ 
                      fontWeight: 700,
                      color: p.stockQty < 5 ? 'hsl(var(--danger-color))' : 'hsl(var(--success-color))' 
                    }}>
                      {p.stockQty} {p.stockQty < 5 && '(Low)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick stock adjustments and actions */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: '1px solid rgba(255,255,255,0.03)',
                paddingTop: '16px',
                marginTop: '16px'
              }}>
                {/* Inline Stock Adjustment Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button onClick={() => handleAdjustStock(p, -5)} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>-5</button>
                  <button onClick={() => handleAdjustStock(p, -1)} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>-1</button>
                  <span style={{ margin: '0 4px', fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>Adjust</span>
                  <button onClick={() => handleAdjustStock(p, 1)} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>+1</button>
                  <button onClick={() => handleAdjustStock(p, 5)} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>+5</button>
                </div>

                {/* Edit & Delete Actions */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleOpenEdit(p)} className="btn-secondary" style={{ padding: '8px' }} title="Edit">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="btn-secondary" style={{ padding: '8px', color: 'hsl(var(--danger-color))', borderColor: 'hsl(var(--danger-color)/0.2)' }} title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
