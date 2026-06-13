import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import OrderTracking from './pages/OrderTracking';
import PaymentGateway from './pages/PaymentGateway';
import SupplierProducts from './pages/SupplierProducts';
import SupplierOrders from './pages/SupplierOrders';
import SupplierPromotions from './pages/SupplierPromotions';

// Protected Route for Authenticated Users (General)
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// Protected Route specifically for Customers
const CustomerRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'CUSTOMER') return <Navigate to="/" replace />;
  return children;
};

// Protected Route specifically for Suppliers
const SupplierRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'SUPPLIER') return <Navigate to="/" replace />;
  return children;
};

function AppContent() {
  const [cart, setCart] = useState([]);
  
  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('food_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        setCart([]);
      }
    }
  }, []);

  // Save cart to localStorage
  const saveCartToStorage = (newCart) => {
    setCart(newCart);
    localStorage.setItem('food_cart', JSON.stringify(newCart));
  };

  const addToCart = (product, quantity) => {
    const existingIndex = cart.findIndex(item => item.id === product.id);
    let newCart = [...cart];
    
    if (existingIndex > -1) {
      const currentQty = newCart[existingIndex].quantity;
      const targetQty = currentQty + quantity;
      newCart[existingIndex].quantity = Math.min(targetQty, product.stockQty);
    } else {
      newCart.push({
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        stockQty: product.stockQty,
        quantity: Math.min(quantity, product.stockQty)
      });
    }
    saveCartToStorage(newCart);
  };

  const updateCartQty = (productId, qty) => {
    const newCart = cart.map(item => {
      if (item.id === productId) {
        return {
          ...item,
          quantity: Math.max(1, Math.min(qty, item.stockQty))
        };
      }
      return item;
    });
    saveCartToStorage(newCart);
  };

  const removeFromCart = (productId) => {
    const newCart = cart.filter(item => item.id !== productId);
    saveCartToStorage(newCart);
  };

  const clearCart = () => {
    saveCartToStorage([]);
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Router>
      <Navbar cartCount={totalCartCount} />
      <div style={{ paddingBottom: '40px' }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/products" element={<Menu addToCart={addToCart} />} />

          {/* Customer Only Protected Routes */}
          <Route path="/cart" element={
            <CustomerRoute>
              <Cart 
                cart={cart} 
                updateCartQty={updateCartQty} 
                removeFromCart={removeFromCart} 
                clearCart={clearCart} 
              />
            </CustomerRoute>
          } />
          <Route path="/payment" element={
            <CustomerRoute>
              <PaymentGateway />
            </CustomerRoute>
          } />

          {/* General Protected Routes */}
          <Route path="/orders" element={
            <ProtectedRoute>
              <OrderTracking />
            </ProtectedRoute>
          } />

          {/* Supplier Only Protected Routes */}
          <Route path="/supplier/products" element={
            <SupplierRoute>
              <SupplierProducts />
            </SupplierRoute>
          } />
          <Route path="/supplier/orders" element={
            <SupplierRoute>
              <SupplierOrders />
            </SupplierRoute>
          } />
          <Route path="/supplier/promotions" element={
            <SupplierRoute>
              <SupplierPromotions />
            </SupplierRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
