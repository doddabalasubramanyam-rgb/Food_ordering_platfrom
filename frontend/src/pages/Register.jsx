import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, AlertCircle } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CUSTOMER'); // Default CUSTOMER
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password, role);
      if (role === 'SUPPLIER') {
        navigate('/supplier/products');
      } else {
        navigate('/products');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '75vh'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>Create Account</h2>
          <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.9rem' }}>Join the ABC Food Zone network</p>
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

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="John Doe"
              required 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-input" 
              placeholder="john@example.com"
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="Min 6 characters"
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">I want to register as a:</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setRole('CUSTOMER')}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 'var(--border-radius-sm)',
                  border: role === 'CUSTOMER' ? '2px solid hsl(var(--primary-color))' : '1px solid var(--glass-border)',
                  background: role === 'CUSTOMER' ? 'hsl(var(--primary-color) / 0.1)' : 'transparent',
                  color: role === 'CUSTOMER' ? 'hsl(var(--primary-color))' : 'hsl(var(--text-muted))',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'var(--transition-smooth)'
                }}
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => setRole('SUPPLIER')}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 'var(--border-radius-sm)',
                  border: role === 'SUPPLIER' ? '2px solid hsl(var(--secondary-color))' : '1px solid var(--glass-border)',
                  background: role === 'SUPPLIER' ? 'hsl(var(--secondary-color) / 0.1)' : 'transparent',
                  color: role === 'SUPPLIER' ? 'hsl(var(--secondary-color))' : 'hsl(var(--text-muted))',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'var(--transition-smooth)'
                }}
              >
                Supplier / Admin
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%', padding: '14px' }}
            disabled={loading}
          >
            <UserPlus size={18} />
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem', color: 'hsl(var(--text-muted))' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'hsl(var(--primary-color))', textDecoration: 'none', fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
