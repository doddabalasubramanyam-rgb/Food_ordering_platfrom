import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { RefreshCw, ClipboardList, Filter, Calendar } from 'lucide-react';

export default function SupplierOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateFilter, setDateFilter] = useState(''); // YYYY-MM-DD

  const fetchOrderQueue = async () => {
    try {
      const endpoint = dateFilter ? `/orders/queue?date=${dateFilter}` : '/orders/queue';
      const data = await api.get(endpoint);
      setOrders(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch order queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderQueue();
    // Poll queue status every 15 seconds
    const interval = setInterval(fetchOrderQueue, 15000);
    return () => clearInterval(interval);
  }, [dateFilter]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status?status=${newStatus}`);
      alert(`Order #${orderId} updated to ${newStatus}.`);
      fetchOrderQueue();
    } catch (err) {
      alert(err.message || 'Failed to update order status.');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING_PAYMENT': return 'badge-warning';
      case 'PAID': return 'badge-info'; // Paid is ready for kitchen
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
      {/* Title section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '8px' }}>Order Processing Queue</h2>
          <p style={{ color: 'hsl(var(--text-muted))' }}>Fulfill client orders and transition cooking/pickup states</p>
        </div>
        <button onClick={fetchOrderQueue} className="btn-secondary" style={{ padding: '10px 14px' }}>
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Date Filter & Status filtering controls */}
      <div className="glass-panel" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '16px 24px',
        marginBottom: '32px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={18} style={{ color: 'hsl(var(--primary-color))' }} />
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Filter by Day:</span>
        </div>
        
        <input 
          type="date" 
          className="form-input" 
          style={{ width: '180px', padding: '8px 12px', background: 'rgba(0,0,0,0.25)' }}
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />

        {dateFilter && (
          <button 
            onClick={() => setDateFilter('')}
            className="btn-secondary" 
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            Clear Filter
          </button>
        )}
      </div>

      {error && (
        <div className="glass-panel" style={{ color: 'hsl(var(--danger-color))', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {/* Order Cards Queue */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'hsl(var(--text-muted))' }}>
          Loading order queue...
        </div>
      ) : orders.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '50px', color: 'hsl(var(--text-muted))' }}>
          <ClipboardList size={48} style={{ opacity: 0.5, marginBottom: '16px' }} />
          <h3>No Orders Found</h3>
          <p style={{ marginTop: '8px' }}>There are currently no orders in your processing queue.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {orders.map(order => (
            <div key={order.id} className="glass-panel" style={{
              borderLeft: order.status === 'PAID' ? '4px solid hsl(var(--primary-color))' :
                          order.status === 'PREPARING' ? '4px solid hsl(var(--secondary-color))' :
                          order.status === 'READY' ? '4px solid hsl(var(--success-color))' : '1px solid var(--glass-border)'
            }}>
              {/* Header block */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid var(--glass-border)',
                paddingBottom: '14px',
                marginBottom: '14px',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div>
                  <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Order #{order.id}</span>
                  <span style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', marginLeft: '12px' }}>
                    Customer: {order.customer.name} ({order.customer.email})
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                    {formatStatus(order.status)}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>
                    Placed at: {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Items grid */}
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Items in Order</h4>
                {order.items.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.9rem' }}>
                    <div>
                      <span style={{ fontWeight: 600 }}>{item.product.name}</span>
                      <span style={{ color: 'hsl(var(--text-muted))', marginLeft: '8px' }}>x {item.quantity}</span>
                    </div>
                    <div style={{ color: 'hsl(var(--text-muted))' }}>
                      Stock: {item.product.stockQty} units
                    </div>
                  </div>
                ))}
              </div>

              {/* Action transitions bar */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid rgba(255,255,255,0.03)',
                paddingTop: '12px',
                marginTop: '12px',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>
                  Total billing value: <strong style={{ color: 'hsl(var(--text-main))' }}>₹{order.totalAmount}</strong>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  {order.status === 'PAID' && (
                    <button 
                      onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                      className="btn-primary" 
                      style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                    >
                      Start Preparing
                    </button>
                  )}
                  {order.status === 'PREPARING' && (
                    <button 
                      onClick={() => handleUpdateStatus(order.id, 'READY')}
                      className="btn-primary" 
                      style={{ padding: '8px 16px', fontSize: '0.85rem', background: 'linear-gradient(135deg, hsl(var(--success-color)), hsl(var(--primary-color)))' }}
                    >
                      Mark Ready
                    </button>
                  )}
                  {order.status === 'READY' && (
                    <button 
                      onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                      className="btn-primary" 
                      style={{ padding: '8px 16px', fontSize: '0.85rem', background: 'linear-gradient(135deg, hsl(var(--success-color)), #22c55e)' }}
                    >
                      Mark Delivered
                    </button>
                  )}
                  {order.status === 'DELIVERED' && (
                    <span style={{ fontSize: '0.85rem', color: 'hsl(var(--success-color))', fontWeight: 600 }}>
                      ✓ Delivered
                    </span>
                  )}
                  {order.status === 'CANCELLED' && (
                    <span style={{ fontSize: '0.85rem', color: 'hsl(var(--danger-color))', fontWeight: 600 }}>
                      ✕ Cancelled
                    </span>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
