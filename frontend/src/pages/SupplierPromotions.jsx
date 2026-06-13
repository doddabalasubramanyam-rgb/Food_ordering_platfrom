import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { Plus, Tag, RefreshCw, AlertCircle } from 'lucide-react';

export default function SupplierPromotions() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [discountPct, setDiscountPct] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [validFrom, setValidFrom] = useState('');
  const [validTo, setValidTo] = useState('');
  const [type, setType] = useState('SEASONAL');

  const fetchPromotions = async () => {
    try {
      const data = await api.get('/promotions/all');
      setPromotions(data || []);
    } catch (err) {
      setError('Failed to retrieve promotions list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      name,
      discountPct: parseFloat(discountPct),
      couponCode: couponCode.trim().toUpperCase(),
      validFrom: validFrom ? new Date(validFrom).toISOString() : new Date().toISOString(),
      validTo: validTo ? new Date(validTo).toISOString() : new Date(Date.now() + 7*24*60*60*1000).toISOString(),
      type
    };

    try {
      await api.post('/promotions', payload);
      setShowForm(false);
      setName('');
      setDiscountPct('');
      setCouponCode('');
      setValidFrom('');
      setValidTo('');
      setType('SEASONAL');
      fetchPromotions();
    } catch (err) {
      setError(err.message || 'Failed to create promotion.');
    }
  };

  return (
    <div className="app-container animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '8px' }}>Configure Promotions</h2>
          <p style={{ color: 'hsl(var(--text-muted))' }}>Create coupon codes, seasonal discounts, and scheduling offers</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={fetchPromotions} className="btn-secondary" style={{ padding: '10px 14px' }}>
            <RefreshCw size={16} />
          </button>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary" style={{ padding: '10px 20px' }}>
            <Plus size={18} />
            New Promotion
          </button>
        </div>
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

      {/* Promotion Form Panel */}
      {showForm && (
        <div className="glass-panel animate-slide-up" style={{ marginBottom: '30px', border: '1px solid hsl(var(--secondary-color) / 0.3)' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '20px' }}>Create Promotional Coupon</h3>
          <form onSubmit={handleSubmit} style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            alignItems: 'end'
          }}>
            <div className="form-group">
              <label className="form-label">Promotion Name</label>
              <input 
                type="text" 
                className="form-input" 
                required 
                placeholder="Weekend Pizza Party"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Coupon Code (Uppercase)</label>
              <input 
                type="text" 
                className="form-input" 
                required 
                placeholder="WEEKEND20"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Discount Percentage (%)</label>
              <input 
                type="number" 
                min="1"
                max="100"
                className="form-input" 
                required 
                placeholder="20"
                value={discountPct}
                onChange={(e) => setDiscountPct(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Promo Offer Type</label>
              <select 
                className="form-input"
                value={type}
                onChange={(e) => setType(e.target.value)}
                style={{ background: 'rgba(0,0,0,0.35)' }}
              >
                <option value="SEASONAL">Seasonal / Festive</option>
                <option value="FESTIVE">Holiday Special</option>
                <option value="SCHEDULED">Weekend Special</option>
                <option value="HOURLY">Hourly Specials</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Valid From</label>
              <input 
                type="datetime-local" 
                className="form-input" 
                required
                value={validFrom}
                onChange={(e) => setValidFrom(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Valid Until</label>
              <input 
                type="datetime-local" 
                className="form-input" 
                required
                value={validTo}
                onChange={(e) => setValidTo(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', paddingBottom: '12px' }}>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary" style={{ flex: 1, padding: '10px' }}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg, hsl(var(--secondary-color)), hsl(var(--primary-color)))' }}>
                Create Coupon
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Promotions List Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'hsl(var(--text-muted))' }}>
          Loading active catalog...
        </div>
      ) : promotions.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '40px', color: 'hsl(var(--text-muted))' }}>
          <Tag size={48} style={{ opacity: 0.5, marginBottom: '16px' }} />
          <h3>No Promotions Active</h3>
          <p style={{ marginTop: '8px' }}>There are currently no discount offers running.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {promotions.map(promo => {
            const isFuture = new Date(promo.validFrom) > new Date();
            const isExpired = new Date(promo.validTo) < new Date();
            const isActive = !isFuture && !isExpired;

            return (
              <div key={promo.id} className="glass-panel" style={{
                borderLeft: '4px solid hsl(var(--secondary-color))'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{promo.name}</h3>
                    <span className="badge badge-info" style={{ fontSize: '0.6rem' }}>{promo.type}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'hsl(var(--success-color))' }}>
                      {promo.discountPct}%
                    </span>
                    <span style={{ fontSize: '0.7rem', display: 'block', color: 'hsl(var(--text-muted))' }}>OFF</span>
                  </div>
                </div>

                <div style={{ 
                  margin: '16px 0', 
                  padding: '10px', 
                  background: 'rgba(0,0,0,0.15)', 
                  borderRadius: 'var(--border-radius-sm)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>COUPON CODE</span>
                  <code style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'hsl(var(--primary-color))' }}>
                    {promo.couponCode}
                  </code>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '10px', marginTop: '10px' }}>
                  <div>From: {new Date(promo.validFrom).toLocaleString()}</div>
                  <div>To: {new Date(promo.validTo).toLocaleString()}</div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
