import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api';
import { ClipboardList, ArrowRight, ShieldCheck, RefreshCw, XCircle, AlertTriangle } from 'lucide-react';

export default function OrderTracking() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const data = await api.get('/orders');
      setOrders(data || []);
    } catch (err) {
      setError('Failed to retrieve order history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Poll orders status every 10 seconds for real-time tracking updates
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await api.put(`/orders/${orderId}/cancel`);
      alert('Order cancelled successfully.');
      fetchOrders();
    } catch (err) {
      alert(err.message || 'Failed to cancel order.');
    }
  };

  const handlePayNow = (order) => {
    navigate('/payment', {
      state: {
        orderId: order.id,
        amount: order.totalAmount
      }
    });
  };

  const handleReorder = async (orderId) => {
    try {
      const newOrder = await api.post(`/orders/${orderId}/reorder`);
      alert(`Re-ordered successfully! New Order #${newOrder.id} placed.`);
      
      // Redirect to payment page for the newly created order
      navigate('/payment', {
        state: {
          orderId: newOrder.id,
          amount: newOrder.totalAmount
        }
      });
    } catch (err) {
      alert(err.message || 'Re-order failed. Check product availability.');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING_PAYMENT': return 'badge-warning';
      case 'PAID': return 'badge-success';
      case 'CANCELLED': return 'badge-danger';
      case 'PREPARING': return 'badge-info';
      case 'READY': return 'badge-success';
      case 'DELIVERED': return 'badge-success';
      default: return 'badge-info';
    }
  };

  const formatStatus = (status) => {
    return status ? status.replace('_', ' ') : '';
  };

  return (
    <div className="app-container animate-fade-in">
      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '8px' }}>Your Orders</h2>
          <p style={{ color: 'hsl(var(--text-muted))' }}>Track status and review purchase history</p>
        </div>
        <button onClick={fetchOrders} className="btn-secondary" style={{ padding: '10px 14px' }}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
          Loading order history...
        </div>
      ) : error ? (
        <div className="glass-panel" style={{ color: 'hsl(var(--danger-color))', textAlign: 'center', padding: '30px' }}>
          <AlertTriangle size={32} style={{ marginBottom: '10px' }} />
          <p>{error}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '50px', color: 'hsl(var(--text-muted))' }}>
          <ClipboardList size={48} style={{ opacity: 0.5, marginBottom: '16px' }} />
          <h3>no orders yet</h3>
          <p style={{ marginTop: '8px', marginBottom: '24px' }}>You haven't placed any orders yet.</p>
          <Link to="/products" className="btn-primary">Go to Menu</Link>
        </div>
      ) : (
        /* Orders list */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {orders.map(order => (
            <div key={order.id} className="glass-panel" style={{
              borderLeft: order.status === 'PENDING_PAYMENT' ? '4px solid hsl(var(--warning-color))' :
                          order.status === 'PAID' ? '4px solid hsl(var(--success-color))' : '1px solid var(--glass-border)'
            }}>
              {/* Header row */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid var(--glass-border)',
                paddingBottom: '16px',
                marginBottom: '16px',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div>
                  <span style={{ fontWeight: 'bold', fontSize: '1.15rem' }}>Order #{order.id}</span>
                  <span style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', marginLeft: '12px' }}>
                    {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                    {formatStatus(order.status)}
                  </span>
                  <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'hsl(var(--primary-color))' }}>
                    ₹{order.totalAmount}
                  </span>
                </div>
              </div>

              {/* Items row */}
              <div style={{ marginBottom: '20px' }}>
                {order.items.map(item => (
                  <div key={item.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    fontSize: '0.9rem',
                    color: 'hsl(var(--text-main))'
                  }}>
                    <div>
                      <span style={{ fontWeight: 600 }}>{item.product.name}</span>
                      <span style={{ color: 'hsl(var(--text-muted))', marginLeft: '8px' }}>x {item.quantity}</span>
                    </div>
                    <div style={{ color: 'hsl(var(--text-muted))' }}>
                      ₹{item.unitPrice * item.quantity} (₹{item.unitPrice} each)
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions row */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                borderTop: '1px solid rgba(255,255,255,0.03)',
                paddingTop: '16px'
              }}>
                {order.status === 'PENDING_PAYMENT' && (
                  <>
                    <button 
                      onClick={() => handleCancelOrder(order.id)} 
                      className="btn-secondary" 
                      style={{ padding: '8px 16px', color: 'hsl(var(--danger-color))', borderColor: 'hsl(var(--danger-color) / 0.3)' }}
                    >
                      <XCircle size={16} />
                      Cancel
                    </button>
                    <button 
                      onClick={() => handlePayNow(order)} 
                      className="btn-primary" 
                      style={{ padding: '8px 16px' }}
                    >
                      <ShieldCheck size={16} />
                      Pay Now
                    </button>
                  </>
                )}

                {order.status !== 'PENDING_PAYMENT' && (
                  <button 
                    onClick={() => handleReorder(order.id)} 
                    className="btn-secondary" 
                    style={{ padding: '8px 16px' }}
                  >
                    <RefreshCw size={16} />
                    Reorder Items
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
