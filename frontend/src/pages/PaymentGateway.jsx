import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { Clock, ShieldCheck, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

export default function PaymentGateway() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract order state from router navigation state
  const { orderId, amount } = location.state || {};
  
  const [payment, setPayment] = useState(null);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [status, setStatus] = useState('PENDING'); // PENDING, SUCCESS, EXPIRED, FAILED
  const [error, setError] = useState('');
  const timerRef = useRef(null);
  const initiatedRef = useRef(false);

  // 1. Initiate Payment Session
  useEffect(() => {
    if (!orderId) {
      setError('No order ID provided. Please place an order first.');
      setStatus('FAILED');
      return;
    }

    if (initiatedRef.current) return;
    initiatedRef.current = true;

    const startPaymentSession = async () => {
      try {
        const data = await api.post('/payment/initiate', { orderId });
        setPayment(data);
        setStatus('PENDING');
        setTimeLeft(120); // Reset timer to 2 minutes
      } catch (err) {
        setError(err.message || 'Failed to initiate payment session.');
        setStatus('FAILED');
      }
    };

    startPaymentSession();
  }, [orderId]);

  // 2. Countdown Timer Loop
  useEffect(() => {
    if (status !== 'PENDING') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setStatus('EXPIRED');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  // 3. Confirm Payment Execution
  const handleConfirmPayment = async () => {
    if (status !== 'PENDING') return;
    setError('');

    try {
      const confirmedPayment = await api.post('/payment/confirm', { orderId });
      setPayment(confirmedPayment);
      setStatus('SUCCESS');
      
      // Auto redirect to orders page after 3 seconds
      setTimeout(() => {
        navigate('/orders');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Payment confirmation failed.');
      setStatus('FAILED');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Error screen when order details are missing
  if (!orderId && status === 'FAILED') {
    return (
      <div className="app-container" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div className="glass-panel" style={{ maxWidth: '480px', margin: '0 auto', padding: '40px' }}>
          <AlertTriangle size={48} style={{ color: 'hsl(var(--danger-color))', marginBottom: '20px' }} />
          <h2 style={{ fontSize: '1.75rem', marginBottom: '12px' }}>Invalid Request</h2>
          <p style={{ color: 'hsl(var(--text-muted))', marginBottom: '30px' }}>{error}</p>
          <Link to="/products" className="btn-primary">Browse Menu</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container animate-fade-in" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: '20px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '460px',
        padding: '36px',
        textAlign: 'center',
        borderTop: status === 'SUCCESS' ? '4px solid hsl(var(--success-color))' : 
                   status === 'EXPIRED' ? '4px solid hsl(var(--danger-color))' : '1px solid var(--glass-border)'
      }}>
        
        {/* Header Summary */}
        <div style={{ marginBottom: '24px' }}>
          <span className="badge badge-info" style={{ marginBottom: '12px' }}>Order #{orderId}</span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>Payment Gateway</h2>
          <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.9rem' }}>Scan and pay using the simulated QR terminal</p>
        </div>

        {/* Dynamic States View */}
        {status === 'PENDING' && (
          <>
            {/* Timer Banner */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: timeLeft < 30 ? 'hsl(var(--danger-color) / 0.15)' : 'rgba(255, 255, 255, 0.04)',
              border: timeLeft < 30 ? '1px solid hsl(var(--danger-color) / 0.3)' : '1px solid var(--glass-border)',
              padding: '8px 16px',
              borderRadius: '20px',
              color: timeLeft < 30 ? 'hsl(var(--danger-color))' : 'hsl(var(--primary-color))',
              fontWeight: 700,
              fontSize: '1.1rem',
              marginBottom: '30px',
              boxShadow: timeLeft < 30 ? '0 0 15px hsl(var(--danger-color) / 0.1)' : 'none'
            }}>
              <Clock size={16} />
              <span>Time Left: {formatTime(timeLeft)}</span>
            </div>

            {/* Simulated QR Code Box */}
            <div style={{
              margin: '0 auto 30px auto',
              background: 'white',
              padding: '20px',
              borderRadius: '16px',
              width: '220px',
              height: '220px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}>
              {/* Pulse scanning laser line */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '4px',
                background: 'rgba(0, 242, 254, 0.65)',
                boxShadow: '0 0 12px #00f2fe',
                animation: 'scanLaser 2.5s linear infinite'
              }} />

              {/* Styled Vector Mock QR Code */}
              <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                {/* Outer corners */}
                <rect x="5" y="5" width="25" height="25" fill="none" stroke="#0f172a" strokeWidth="6" />
                <rect x="11" y="11" width="13" height="13" fill="#0f172a" />
                
                <rect x="70" y="5" width="25" height="25" fill="none" stroke="#0f172a" strokeWidth="6" />
                <rect x="76" y="11" width="13" height="13" fill="#0f172a" />
                
                <rect x="5" y="70" width="25" height="25" fill="none" stroke="#0f172a" strokeWidth="6" />
                <rect x="11" y="76" width="13" height="13" fill="#0f172a" />
                
                {/* Center logo backdrop and random qr blocks */}
                <rect x="42" y="42" width="16" height="16" fill="#0f172a" rx="3" />
                <circle cx="50" cy="50" r="4" fill="#00f2fe" />

                {/* Random QR pixels */}
                <path d="M 40,10 H 50 M 45,20 H 60 M 10,40 H 25 M 35,50 H 40 M 60,45 H 65 M 15,55 H 30 M 55,60 H 70 M 80,45 H 90 M 40,75 H 55 M 65,80 H 80 M 80,70 H 95" stroke="#0f172a" strokeWidth="4" strokeLinecap="square" />
                <path d="M 45,5 V 15 M 55,10 V 30 M 15,35 V 50 M 50,35 V 45 M 65,30 V 40 M 35,60 V 65 M 60,65 V 80 M 75,60 V 75 M 85,55 V 65 M 90,80 V 95" stroke="#0f172a" strokeWidth="4" strokeLinecap="square" />
              </svg>

              <style>{`
                @keyframes scanLaser {
                  0% { top: 5%; }
                  50% { top: 90%; }
                  100% { top: 5%; }
                }
              `}</style>
            </div>

            {/* Amount Label */}
            <div style={{ marginBottom: '30px' }}>
              <span style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', display: 'block', marginBottom: '4px' }}>
                TOTAL AMOUNT
              </span>
              <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'hsl(var(--primary-color))' }}>
                ₹{amount}
              </span>
            </div>

            {/* Confirm Payment button */}
            <button 
              onClick={handleConfirmPayment}
              className="btn-primary" 
              style={{ width: '100%', padding: '14px', display: 'flex', justifyContent: 'center' }}
            >
              <ShieldCheck size={18} />
              I Have Completed Payment
            </button>
          </>
        )}

        {status === 'SUCCESS' && (
          <div className="animate-slide-up" style={{ padding: '20px 0' }}>
            <CheckCircle2 size={64} style={{ color: 'hsl(var(--success-color))', marginBottom: '18px', display: 'inline-block' }} />
            <h3 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '8px', color: 'hsl(var(--success-color))' }}>
              Payment Confirmed!
            </h3>
            <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.95rem', marginBottom: '24px' }}>
              Your order #{(payment && payment.order && payment.order.id) || orderId} was received. Preparing your food.
            </p>
            <div style={{ color: 'hsl(var(--text-muted))', fontSize: '0.8rem' }}>
              Redirecting to order tracking dashboard in a few seconds...
            </div>
          </div>
        )}

        {status === 'EXPIRED' && (
          <div className="animate-slide-up" style={{ padding: '20px 0' }}>
            <XCircle size={64} style={{ color: 'hsl(var(--danger-color))', marginBottom: '18px', display: 'inline-block' }} />
            <h3 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '8px', color: 'hsl(var(--danger-color))' }}>
              Payment Window Expired
            </h3>
            <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.95rem', marginBottom: '30px' }}>
              The 2-minute safety window for UPI payments expired. Your order has been cancelled.
            </p>
            <button onClick={() => navigate('/products')} className="btn-primary">
              Return to Menu
            </button>
          </div>
        )}

        {error && status === 'FAILED' && (
          <div className="animate-slide-up" style={{ padding: '20px 0' }}>
            <XCircle size={64} style={{ color: 'hsl(var(--danger-color))', marginBottom: '18px', display: 'inline-block' }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px', color: 'hsl(var(--danger-color))' }}>
              Transaction Failed
            </h3>
            <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.95rem', marginBottom: '30px' }}>
              {error}
            </p>
            <button onClick={() => navigate('/products')} className="btn-primary">
              Return to Menu
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
