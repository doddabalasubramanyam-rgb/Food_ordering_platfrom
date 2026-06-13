import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { 
  ShoppingBag, 
  LogOut, 
  Utensils, 
  User as UserIcon,
  Bell
} from 'lucide-react';

export default function Navbar({ cartCount }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    const fetchNotifications = async () => {
      try {
        const data = await api.get('/notifications');
        setNotifications(data || []);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // poll every 10 seconds
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (!showNotifications) return;
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.bell-container')) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [showNotifications]);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  return (
    <nav className="navbar glass-panel" style={{
      borderRadius: '0 0 var(--border-radius-lg) var(--border-radius-lg)',
      borderTop: 'none',
      marginBottom: '40px',
      padding: '16px 40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Brand logo */}
      <Link to="/" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        textDecoration: 'none',
        color: 'hsl(var(--text-main))',
        fontSize: '1.5rem',
        fontWeight: 800,
        background: 'linear-gradient(135deg, hsl(var(--primary-color)), hsl(var(--secondary-color)))',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        <Utensils size={28} style={{ stroke: 'url(#cyan-purple-gradient)', color: 'hsl(var(--primary-color))' }} />
        ABC Food Zone
      </Link>

      {/* SVG Gradient definition for Lucide icons */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <linearGradient id="cyan-purple-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary-color))" />
          <stop offset="100%" stopColor="hsl(var(--secondary-color))" />
        </linearGradient>
      </svg>

      {/* Navigation links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
        <Link to="/products" className="nav-link" style={linkStyle}>Menu</Link>
        <Link to="/" className="nav-link" style={linkStyle}>Promotions</Link>

        {user && user.role === 'CUSTOMER' && (
          <>
            <Link to="/orders" className="nav-link" style={linkStyle}>My Orders</Link>
            <Link to="/cart" className="btn-secondary" style={{ padding: '8px 16px', position: 'relative' }}>
              <ShoppingBag size={18} />
              Cart
              {cartCount > 0 && (
                <span style={badgeStyle}>{cartCount}</span>
              )}
            </Link>
          </>
        )}

        {user && user.role === 'SUPPLIER' && (
          <>
            <Link to="/supplier/products" className="nav-link" style={linkStyle}>Manage Products</Link>
            <Link to="/supplier/orders" className="nav-link" style={linkStyle}>Order Queue</Link>
            <Link to="/supplier/promotions" className="nav-link" style={linkStyle}>Coupons</Link>
          </>
        )}
      </div>

      {/* User Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', position: 'relative' }}>
        {user ? (
          <>
            {/* Profile Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                background: 'linear-gradient(135deg, hsl(var(--primary-color) / 0.2), hsl(var(--secondary-color) / 0.2))',
                border: '1px solid var(--glass-border)',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'hsl(var(--primary-color))'
              }}>
                <UserIcon size={18} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.name}</span>
                <span className="badge badge-info" style={{ fontSize: '0.6rem', padding: '2px 6px', width: 'fit-content' }}>
                  {user.role}
                </span>
              </div>
            </div>

            {/* Notification Bell */}
            <div className="bell-container" style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)} 
                className="btn-secondary" 
                style={{ padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span style={bellBadgeStyle}>{unreadCount}</span>
                )}
              </button>

              {showNotifications && (
                <div className="glass-panel" style={dropdownStyle}>
                  <div style={dropdownHeaderStyle}>
                    <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Notifications</span>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllRead} style={markAllStyle}>
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div style={listContainerStyle}>
                    {notifications.length === 0 ? (
                      <div style={emptyStyle}>No notifications</div>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => handleMarkAsRead(n.id)}
                          style={{
                            ...notificationItemStyle,
                            backgroundColor: n.isRead ? 'transparent' : 'rgba(255, 255, 255, 0.05)'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                            <p style={{ margin: 0, fontSize: '0.8rem', textAlign: 'left', lineHeight: '1.4', color: n.isRead ? 'hsl(var(--text-muted))' : 'hsl(var(--text-main))' }}>
                              {n.message}
                            </p>
                            {!n.isRead && <span style={dotStyle} />}
                          </div>
                          <span style={timeStyle}>
                            {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Logout button */}
            <button onClick={handleLogout} className="btn-secondary" style={{ padding: '10px' }}>
              <LogOut size={16} />
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn-secondary" style={{ padding: '8px 16px' }}>Login</Link>
            <Link to="/register" className="btn-primary" style={{ padding: '8px 16px' }}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

const linkStyle = {
  textDecoration: 'none',
  color: 'hsl(var(--text-muted))',
  fontWeight: '500',
  fontSize: '0.95rem',
  transition: 'var(--transition-smooth)',
  cursor: 'pointer'
};

const badgeStyle = {
  position: 'absolute',
  top: '-8px',
  right: '-8px',
  background: 'linear-gradient(135deg, hsl(var(--primary-color)), hsl(var(--secondary-color)))',
  color: 'hsl(var(--bg-secondary))',
  fontSize: '0.7rem',
  fontWeight: 'bold',
  borderRadius: '50%',
  width: '18px',
  height: '18px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const bellBadgeStyle = {
  position: 'absolute',
  top: '-4px',
  right: '-4px',
  background: 'hsl(var(--danger-color))',
  color: 'white',
  fontSize: '0.6rem',
  fontWeight: 'bold',
  borderRadius: '50%',
  width: '14px',
  height: '14px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const dropdownStyle = {
  position: 'absolute',
  right: 0,
  top: '46px',
  width: '320px',
  maxHeight: '320px',
  display: 'flex',
  flexDirection: 'column',
  padding: '12px',
  zIndex: 1000,
  border: '1px solid var(--glass-border)',
  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
  backdropFilter: 'blur(20px)',
  backgroundColor: 'rgba(20, 20, 30, 0.95)'
};

const dropdownHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingBottom: '8px',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  marginBottom: '8px',
  flexShrink: 0
};

const markAllStyle = {
  background: 'transparent',
  border: 'none',
  color: 'hsl(var(--primary-color))',
  fontSize: '0.75rem',
  cursor: 'pointer',
  fontWeight: '600',
  padding: 0
};

const listContainerStyle = {
  overflowY: 'auto',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  maxHeight: '260px'
};

const notificationItemStyle = {
  padding: '10px 8px',
  borderRadius: 'var(--border-radius-sm)',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  borderBottom: '1px solid rgba(255,255,255,0.02)'
};

const dotStyle = {
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  backgroundColor: 'hsl(var(--primary-color))',
  flexShrink: 0,
  marginTop: '4px'
};

const timeStyle = {
  fontSize: '0.7rem',
  color: 'hsl(var(--text-muted))',
  display: 'block',
  marginTop: '4px',
  textAlign: 'left'
};

const emptyStyle = {
  padding: '20px',
  textAlign: 'center',
  color: 'hsl(var(--text-muted))',
  fontSize: '0.85rem'
};
