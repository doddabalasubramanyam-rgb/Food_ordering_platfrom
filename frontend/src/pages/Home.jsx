import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { Tag, Sparkles, ArrowRight, Clock, ShieldCheck, Heart } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  const [promotions, setPromotions] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingPromos, setLoadingPromos] = useState(true);
  const [loadingRecs, setLoadingRecs] = useState(false);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const data = await api.get('/promotions');
        setPromotions(data || []);
      } catch (err) {
        console.error('Error fetching promotions:', err);
      } finally {
        setLoadingPromos(false);
      }
    };

    fetchPromotions();
  }, []);

  useEffect(() => {
    if (!user || user.role !== 'CUSTOMER') return;

    const fetchRecommendations = async () => {
      setLoadingRecs(true);
      try {
        const data = await api.get('/products/recommendations');
        setRecommendations(data || []);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
      } finally {
        setLoadingRecs(false);
      }
    };

    fetchRecommendations();
  }, [user]);

  return (
    <div className="app-container animate-fade-in">
      {/* Hero Banner Section */}
      <header className="glass-panel" style={{
        padding: '60px 40px',
        background: 'radial-gradient(circle at top right, hsl(var(--secondary-color) / 0.15), transparent), var(--glass-bg)',
        marginBottom: '40px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '40px',
          alignItems: 'center'
        }} className="responsive-hero-grid">
          {/* Hero Left Content */}
          <div style={{ textAlign: 'left' }}>
            <span className="badge badge-info" style={{ marginBottom: '16px', padding: '6px 14px' }}>
              <Sparkles size={12} style={{ marginRight: '6px' }} />
              Premium Food Experience
            </span>
            <h1 style={{
              fontSize: '3rem',
              fontWeight: 800,
              marginBottom: '16px',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(to right, #ffffff, #94a3b8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Smart Retail <br />
              <span style={{
                background: 'linear-gradient(135deg, hsl(var(--primary-color)), hsl(var(--secondary-color)))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>Food Platform</span>
            </h1>
            <p style={{
              color: 'hsl(var(--text-muted))',
              fontSize: '1.1rem',
              marginBottom: '30px',
              lineHeight: 1.5
            }}>
              Order fresh meals, pizzas, and drinks from top suppliers. Instant payment confirmation, secure checkout, and real-time tracking dashboard.
            </p>
            <div>
              <Link to="/products" className="btn-primary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
                Browse Menu
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          {/* Hero Right Images Showcase */}
          <div style={{
            position: 'relative',
            height: '280px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* Background glowing circle */}
            <div style={{
              position: 'absolute',
              width: '220px',
              height: '220px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, hsl(var(--primary-color) / 0.15) 0%, transparent 70%)',
              filter: 'blur(10px)',
              zIndex: 0
            }} />
            
            {/* Primary pizza image */}
            <img 
              src="/delicious_pizza.png" 
              alt="Gourmet Pizza"
              style={{
                width: '200px',
                height: '200px',
                objectFit: 'cover',
                borderRadius: '50%',
                border: '4px solid var(--glass-border)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(255, 107, 107, 0.2)',
                zIndex: 2,
                transform: 'rotate(-5deg) translateY(-10px)',
                transition: 'var(--transition-smooth)',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05) rotate(0deg) translateY(-10px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1) rotate(-5deg) translateY(-10px)'}
            />

            {/* Overlapping burger image */}
            <img 
              src="/premium_burger.png" 
              alt="Premium Burger"
              style={{
                width: '130px',
                height: '130px',
                objectFit: 'cover',
                borderRadius: '50%',
                border: '3px solid var(--glass-border)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.6), 0 0 15px rgba(253, 142, 70, 0.2)',
                position: 'absolute',
                bottom: '10px',
                right: '20px',
                zIndex: 3,
                transform: 'rotate(8deg)',
                transition: 'var(--transition-smooth)',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08) rotate(0deg)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1) rotate(8deg)'}
            />
          </div>
        </div>
      </header>

      {/* Stats Cards Row */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '50px'
      }}>
        <div className="glass-panel" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={iconWrapperStyle('hsl(var(--primary-color))')}>
            <Clock size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>Fast Processing</h3>
            <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.9rem' }}>Auto-cancellations for unpaid orders in 10 minutes.</p>
          </div>
        </div>
        
        <div className="glass-panel" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={iconWrapperStyle('hsl(var(--secondary-color))')}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>Secure Payments</h3>
            <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.9rem' }}>QR-based simulator with a strict 2-minute safety timer.</p>
          </div>
        </div>

        <div className="glass-panel" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={iconWrapperStyle('hsl(var(--success-color))')}>
            <Tag size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>Daily Discounts</h3>
            <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.9rem' }}>Weekend specials, hourly offers, and holiday coupons.</p>
          </div>
        </div>
      </section>

      {/* Signature Specialties */}
      <section style={{ marginBottom: '50px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          <Sparkles size={22} style={{ color: 'hsl(var(--primary-color))' }} />
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Signature Specialties</h2>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {/* Specialty 1 */}
          <div className="glass-panel" style={{
            padding: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid var(--glass-border)'
          }}>
            <img 
              src="/delicious_pizza.png" 
              alt="Pizza Specialties" 
              style={{ width: '100%', height: '180px', objectFit: 'cover', transition: 'var(--transition-smooth)' }} 
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            />
            <div style={{ padding: '20px' }}>
              <span className="badge badge-info" style={{ marginBottom: '10px' }}>Specialty</span>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>Artisanal Pizzas</h3>
              <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.9rem', marginBottom: '16px' }}>
                Crispy crust, rich tomato base, and bubbly mozzarella crafted to perfection.
              </p>
              <Link to="/products" className="btn-secondary" style={{ width: '100%', padding: '10px' }}>
                Order Pizza
              </Link>
            </div>
          </div>

          {/* Specialty 2 */}
          <div className="glass-panel" style={{
            padding: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid var(--glass-border)'
          }}>
            <img 
              src="/premium_burger.png" 
              alt="Burger Specialties" 
              style={{ width: '100%', height: '180px', objectFit: 'cover', transition: 'var(--transition-smooth)' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            />
            <div style={{ padding: '20px' }}>
              <span className="badge badge-info" style={{ marginBottom: '10px' }}>Top Seller</span>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>Gourmet Burgers</h3>
              <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.9rem', marginBottom: '16px' }}>
                Flame-grilled patties on brioche bun, loaded with fresh toppings.
              </p>
              <Link to="/products" className="btn-secondary" style={{ width: '100%', padding: '10px' }}>
                Order Burgers
              </Link>
            </div>
          </div>

          {/* Specialty 3 */}
          <div className="glass-panel" style={{
            padding: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid var(--glass-border)'
          }}>
            <img 
              src="/tasty_cupcakes.png" 
              alt="Cupcakes Specialties" 
              style={{ width: '100%', height: '180px', objectFit: 'cover', transition: 'var(--transition-smooth)' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            />
            <div style={{ padding: '20px' }}>
              <span className="badge badge-info" style={{ marginBottom: '10px' }}>Sweet Treats</span>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>Sweet Delights</h3>
              <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.9rem', marginBottom: '16px' }}>
                Decorated cupcakes, muffins, and sweet confectionaries to satisfy your cravings.
              </p>
              <Link to="/products" className="btn-secondary" style={{ width: '100%', padding: '10px' }}>
                Order Desserts
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Personalized Recommendations Section (For Logged In Customers) */}
      {user && user.role === 'CUSTOMER' && recommendations.length > 0 && (
        <section style={{ marginBottom: '50px' }} className="animate-slide-up">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Heart size={22} style={{ color: 'hsl(var(--danger-color))' }} />
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Recommended for You</h2>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '24px'
          }}>
            {recommendations.map(product => (
              <div key={product.id} className="glass-panel" style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.01), rgba(255,255,255,0.03)), var(--glass-bg)'
              }}>
                <span className="badge badge-info" style={{ marginBottom: '12px' }}>{product.category}</span>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>{product.name}</h3>
                <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.85rem', marginBottom: '16px' }}>
                  Supplier: {product.supplier.name}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'hsl(var(--primary-color))' }}>
                    ₹{product.price}
                  </span>
                  <Link to="/products" className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                    View Menu
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Active Promotions / Coupons list */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          <Tag size={22} style={{ color: 'hsl(var(--primary-color))' }} />
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Active Offers & Coupons</h2>
        </div>

        {loadingPromos ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>Loading promotions...</div>
        ) : promotions.length === 0 ? (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '40px', color: 'hsl(var(--text-muted))' }}>
            <p>No active promotions at this time. Check back later!</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            {promotions.map(promo => (
              <div key={promo.id} className="glass-panel" style={{
                borderLeft: '4px solid hsl(var(--primary-color))',
                background: 'linear-gradient(90deg, rgba(0, 242, 254, 0.02), transparent), var(--glass-bg)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.3rem', marginBottom: '4px' }}>{promo.name}</h3>
                    <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>
                      {promo.type}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'hsl(var(--success-color))' }}>
                      {promo.discountPct}%
                    </span>
                    <span style={{ fontSize: '0.75rem', display: 'block', color: 'hsl(var(--text-muted))' }}>OFF</span>
                  </div>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  background: 'rgba(0,0,0,0.15)',
                  padding: '10px 14px',
                  borderRadius: 'var(--border-radius-sm)',
                  marginTop: '16px'
                }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', display: 'block' }}>COUPON CODE</span>
                    <code style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'hsl(var(--primary-color))', letterSpacing: '0.05em' }}>
                      {promo.couponCode}
                    </code>
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(promo.couponCode);
                      alert('Copied: ' + promo.couponCode);
                    }}
                    className="btn-secondary" 
                    style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                  >
                    Copy
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

const iconWrapperStyle = (color) => ({
  background: `${color}15`,
  border: `1px solid ${color}30`,
  borderRadius: 'var(--border-radius-sm)',
  width: '48px',
  height: '48px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: color,
  flexShrink: 0
});
