import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api';
import { Trash2, ShoppingBag, ArrowRight, Tag, AlertCircle } from 'lucide-react';

export default function Cart({ cart, updateCartQty, removeFromCart, clearCart }) {
  const [couponCode, setCouponCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Computations
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = appliedPromo ? (subtotal * (appliedPromo.discountPct / 100)) : 0;
  const total = subtotal - discountAmount;

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponError('');
    setError('');
    
    if (!couponCode.trim()) return;

    try {
      // Fetch active promotions
      const promos = await api.get('/promotions');
      const found = promos.find(p => p.couponCode.toLowerCase() === couponCode.trim().toLowerCase());
      
      if (found) {
        setAppliedPromo(found);
        setCouponCode('');
      } else {
        setCouponError('Invalid or expired coupon code!');
        setAppliedPromo(null);
      }
    } catch (err) {
      setCouponError('Failed to validate coupon.');
    }
  };

  const handlePlaceOrder = async () => {
    setError('');
    setLoading(true);

    const orderItems = cart.map(item => ({
      productId: item.id,
      quantity: item.quantity
    }));

    try {
      const order = await api.post('/orders', {
        items: orderItems,
        couponCode: appliedPromo ? appliedPromo.couponCode : null
      });

      clearCart();
      // Redirect to simulated payment page, passing order ID and total amount
      navigate('/payment', { 
        state: { 
          orderId: order.id, 
          amount: order.totalAmount 
        } 
      });
    } catch (err) {
      setError(err.message || 'Failed to place the order.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="app-container" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div className="glass-panel" style={{ maxWidth: '480px', margin: '0 auto', padding: '40px' }}>
          <ShoppingBag size={48} style={{ color: 'hsl(var(--primary-color))', marginBottom: '20px', opacity: 0.7 }} />
          <h2 style={{ fontSize: '1.75rem', marginBottom: '12px' }}>Your Cart is Empty</h2>
          <p style={{ color: 'hsl(var(--text-muted))', marginBottom: '30px' }}>Add delicious food from our menu to satisfy your cravings.</p>
          <Link to="/products" className="btn-primary">Browse Menu</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container animate-fade-in">
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '8px' }}>Your Cart</h2>
        <p style={{ color: 'hsl(var(--text-muted))' }}>Review and verify your checkout items</p>
      </div>

      {error && (
        <div style={{
          background: 'hsl(var(--danger-color) / 0.1)',
          border: '1px solid hsl(var(--danger-color) / 0.3)',
          borderRadius: 'var(--border-radius-sm)',
          padding: '12px',
          color: 'hsl(var(--danger-color))',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '20px',
          fontSize: '0.9rem'
        }}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '30px',
        alignItems: 'start'
      }} className="responsive-cart-grid">
        {/* We can styling the grid dynamically using inline flex/grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Cart items list */}
          <div className="glass-panel" style={{ padding: '0px' }}>
            {cart.map((item, index) => (
              <div 
                key={item.id} 
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '24px',
                  borderBottom: index === cart.length - 1 ? 'none' : '1px solid var(--glass-border)',
                  gap: '16px',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ flex: 1, minWidth: '180px' }}>
                  <span className="badge badge-info" style={{ marginBottom: '6px' }}>{item.category}</span>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>{item.name}</h3>
                  <span style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>
                    Unit Price: ₹{item.price}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  {/* Quantity adjustment */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>Qty:</span>
                    <input 
                      type="number" 
                      min="1" 
                      max={item.stockQty}
                      className="form-input" 
                      style={{ width: '60px', padding: '6px', textAlign: 'center' }}
                      value={item.quantity}
                      onChange={(e) => updateCartQty(item.id, parseInt(e.target.value) || 1)}
                    />
                  </div>

                  {/* Subtotal */}
                  <div style={{ width: '80px', textAlign: 'right', fontWeight: 'bold' }}>
                    ₹{item.price * item.quantity}
                  </div>

                  {/* Remove Button */}
                  <button 
                    onClick={() => removeFromCart(item.id)} 
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: 'none',
                      color: 'hsl(var(--danger-color))',
                      borderRadius: 'var(--border-radius-sm)',
                      padding: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'var(--transition-smooth)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Checkout Summary panel */}
        <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', marginLeft: 'auto' }}>
          <h3 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px', marginBottom: '20px' }}>
            Order Summary
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', fontSize: '0.95rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'hsl(var(--text-muted))' }}>Subtotal:</span>
              <span>₹{subtotal}</span>
            </div>

            {appliedPromo && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'hsl(var(--success-color))' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Tag size={14} />
                  Discount ({appliedPromo.couponCode}):
                </span>
                <span>-₹{discountAmount} ({appliedPromo.discountPct}%)</span>
              </div>
            )}

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              fontSize: '1.25rem', 
              fontWeight: 700, 
              borderTop: '1px solid var(--glass-border)', 
              paddingTop: '16px',
              marginTop: '8px' 
            }}>
              <span>Total:</span>
              <span style={{ color: 'hsl(var(--primary-color))' }}>₹{total}</span>
            </div>
          </div>

          {/* Coupon Input form */}
          <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Coupon Code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              disabled={appliedPromo !== null}
            />
            <button 
              type="submit" 
              className="btn-secondary" 
              style={{ flexShrink: 0, padding: '10px 16px' }}
              disabled={appliedPromo !== null}
            >
              Apply
            </button>
          </form>

          {couponError && (
            <p style={{ color: 'hsl(var(--danger-color))', fontSize: '0.8rem', marginTop: '-16px', marginBottom: '16px' }}>
              {couponError}
            </p>
          )}

          {appliedPromo && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'hsl(var(--success-color) / 0.08)', border: '1px solid hsl(var(--success-color) / 0.2)', padding: '10px 14px', borderRadius: 'var(--border-radius-sm)', marginBottom: '24px' }}>
              <span style={{ color: 'hsl(var(--success-color))', fontSize: '0.85rem', fontWeight: 600 }}>
                Coupon '{appliedPromo.couponCode}' Applied!
              </span>
              <button 
                onClick={() => setAppliedPromo(null)}
                style={{ background: 'transparent', border: 'none', color: 'hsl(var(--danger-color))', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
              >
                Remove
              </button>
            </div>
          )}

          <button 
            onClick={handlePlaceOrder}
            className="btn-primary" 
            style={{ width: '100%', padding: '14px', display: 'flex', justifyContent: 'center' }}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Place Order'}
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
