import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { localCrackers, defaultSettings } from './localCrackers.js';

const CartContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const CartProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('auth_token') || null);
  const [crackers, setCrackers] = useState([]);
  const [settings, setSettings] = useState(defaultSettings);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState({}); // { [productId]: quantity }
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [loading, setLoading] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const [globalDiscountOverride, setGlobalDiscountOverride] = useState(null); // null means use item-specific discount

  // Load data on init
  const fetchData = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // 1. Fetch settings
      const settingsRes = await axios.get(`${API_URL}/settings`, config);
      setSettings(settingsRes.data);

      // 2. Fetch crackers
      const crackersRes = await axios.get(`${API_URL}/crackers`);
      setCrackers(crackersRes.data);

      // 3. Fetch orders
      const ordersRes = await axios.get(`${API_URL}/orders`, config);
      setOrders(ordersRes.data);
      setOfflineMode(false);
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
        return;
      }
      console.warn('Backend is offline. Switching to Offline Mode (LocalStorage & Static Fallbacks).', error);
      setOfflineMode(true);

      // Fallback 1: Local crackers (or cached products)
      const storedCrackers = localStorage.getItem('cracker_products');
      if (storedCrackers) {
        try {
          setCrackers(JSON.parse(storedCrackers));
        } catch (e) {
          setCrackers(localCrackers);
        }
      } else {
        setCrackers(localCrackers);
      }

      // Fallback 2: Local settings
      const storedSettings = localStorage.getItem('cracker_settings');
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      } else {
        setSettings(defaultSettings);
      }

      // Fallback 3: Local orders
      const storedOrders = localStorage.getItem('cracker_orders');
      if (storedOrders) {
        setOrders(JSON.parse(storedOrders));
      } else {
        setOrders([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      // For simplicity, we decode user from token or just rely on API returning it on login.
      // In a real app we'd call /api/auth/me here to validate token and get user object.
      // We will assume token is valid and just let fetchData handle 401s.
      // The user object is set during login. If refreshed, we might lose `user.name` unless we decode the JWT or fetch it.
      // We'll set a dummy user if it's missing just to bypass the login screen if token exists.
      if (!user) setUser({ id: 'authenticated' });
      fetchData();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Auth Functions
  const loginWithGoogle = async (credential) => {
    try {
      const res = await axios.post(`${API_URL}/auth/google`, { credential });
      const { token, user } = res.data;
      setToken(token);
      setUser(user);
      localStorage.setItem('auth_token', token);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
    clearCart();
    setOrders([]);
    setSettings(defaultSettings);
  };

  // Add/adjust item
  const addToCart = (productId, quantity = 1) => {
    setCart((prev) => {
      const currentQty = prev[productId] || 0;
      const newQty = currentQty + quantity;
      if (newQty <= 0) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: newQty };
    });
  };

  // Update quantity directly
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) => ({
      ...prev,
      [productId]: quantity
    }));
  };

  // Remove item
  const removeFromCart = (productId) => {
    setCart((prev) => {
      const { [productId]: _, ...rest } = prev;
      return rest;
    });
  };

  // Clear all
  const clearCart = () => {
    setCart({});
    setCustomerName('');
    setCustomerPhone('');
    setPaymentMode('Cash');
    setGlobalDiscountOverride(null);
  };

  // Update settings
  const updateSettings = async (newSettings) => {
    try {
      if (offlineMode) {
        setSettings(newSettings);
        localStorage.setItem('cracker_settings', JSON.stringify(newSettings));
        return true;
      }
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.put(`${API_URL}/settings`, newSettings, config);
      setSettings(res.data);
      return true;
    } catch (error) {
      if (error.response?.status === 401) logout();
      console.error('Failed to update settings:', error);
      return false;
    }
  };

  // Save new bill
  const saveOrder = async () => {
    if (totalItems === 0) return null;

    const orderData = {
      customerName: customerName || 'Walk-in Customer',
      customerPhone: customerPhone || '',
      items: cartList,
      grossTotal,
      discountTotal,
      netTotal,
      paymentMode
    };

    try {
      if (offlineMode) {
        const today = new Date();
        const dateStr = today.getFullYear() + String(today.getMonth() + 1).padStart(2, '0') + String(today.getDate()).padStart(2, '0');
        const billNumber = `INV-${dateStr}-${String(orders.length + 1).padStart(3, '0')} (OFFLINE)`;

        const newOrder = {
          ...orderData,
          _id: `off_${Date.now()}`,
          billNumber,
          createdAt: new Date().toISOString()
        };

        const updatedOrders = [newOrder, ...orders];
        setOrders(updatedOrders);
        localStorage.setItem('cracker_orders', JSON.stringify(updatedOrders));
        clearCart();
        return newOrder;
      }

      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.post(`${API_URL}/orders`, orderData, config);
      setOrders((prev) => [res.data, ...prev]);
      clearCart();
      return res.data;
    } catch (error) {
      if (error.response?.status === 401) logout();
      console.error('Failed to save order:', error);
      alert('Could not save order. If the server is offline, toggle offline mode.');
      return null;
    }
  };

  // Update invoice
  const updateOrder = async (orderId, updatedData) => {
    try {
      if (offlineMode || orderId.startsWith('off_')) {
        const updatedOrders = orders.map(o =>
          o._id === orderId ? { ...o, ...updatedData } : o
        );
        setOrders(updatedOrders);
        localStorage.setItem('cracker_orders', JSON.stringify(updatedOrders));
        return updatedOrders.find(o => o._id === orderId);
      }
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.put(`${API_URL}/orders/${orderId}`, updatedData, config);
      setOrders(prev => prev.map(o => (o._id === orderId ? res.data : o)));
      return res.data;
    } catch (error) {
      if (error.response?.status === 401) logout();
      console.error('Failed to update order:', error);
      return null;
    }
  };

  // Delete invoice
  const deleteOrder = async (orderId) => {
    try {
      if (offlineMode || orderId.startsWith('off_')) {
        const updatedOrders = orders.filter(o => o._id !== orderId);
        setOrders(updatedOrders);
        localStorage.setItem('cracker_orders', JSON.stringify(updatedOrders));
        return true;
      }
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API_URL}/orders/${orderId}`, config);
      setOrders(prev => prev.filter(o => o._id !== orderId));
      return true;
    } catch (error) {
      if (error.response?.status === 401) logout();
      console.error('Failed to delete order:', error);
      return false;
    }
  };

  // Computed cart items details
  const cartList = Object.entries(cart).map(([productId, quantity]) => {
    const cracker = crackers.find((c) => c.productId === productId);
    if (!cracker) return null;

    // Determine discount percentage
    let discount = cracker.discountPercentage;
    if (!cracker.isNetRate && globalDiscountOverride !== null) {
      discount = globalDiscountOverride;
    }

    const discountedRate = Math.round(cracker.rate * (1 - discount / 100));
    const amount = discountedRate * quantity;
    const originalAmount = cracker.rate * quantity;

    return {
      productId,
      name: cracker.name,
      tamilName: cracker.tamilName,
      rate: cracker.rate,
      discountPercentage: discount,
      discountedRate,
      quantity,
      amount,
      originalAmount,
      isNetRate: cracker.isNetRate
    };
  }).filter(Boolean);

  // Computed Totals
  const grossTotal = cartList.reduce((acc, item) => acc + item.originalAmount, 0);
  const netTotal = cartList.reduce((acc, item) => acc + item.amount, 0);
  const discountTotal = grossTotal - netTotal;
  const totalItems = cartList.length;
  const totalQuantity = cartList.reduce((acc, item) => acc + item.quantity, 0);

  // Add a new product/cracker
  const addCracker = async (newCrackerData) => {
    try {
      if (offlineMode) {
        const newProduct = {
          ...newCrackerData,
          _id: `off_p_${Date.now()}`,
          inStock: true
        };
        const updated = [...crackers, newProduct];
        setCrackers(updated);
        localStorage.setItem('cracker_products', JSON.stringify(updated));
        return newProduct;
      }
      const res = await axios.post(`${API_URL}/crackers`, newCrackerData);
      setCrackers((prev) => [...prev, res.data]);
      return res.data;
    } catch (error) {
      console.warn('Failed to add cracker to server, saving locally:', error);
      const newProduct = {
        ...newCrackerData,
        _id: `off_p_${Date.now()}`,
        inStock: true
      };
      const updated = [...crackers, newProduct];
      setCrackers(updated);
      localStorage.setItem('cracker_products', JSON.stringify(updated));
      return newProduct;
    }
  };

  // Update existing cracker details
  const updateCracker = async (crackerId, updatePayload) => {
    try {
      if (offlineMode || String(crackerId).startsWith('off_p_')) {
        const updated = crackers.map(c => 
          c._id === crackerId || c.productId === crackerId ? { ...c, ...updatePayload } : c
        );
        setCrackers(updated);
        localStorage.setItem('cracker_products', JSON.stringify(updated));
        return true;
      }
      const res = await axios.put(`${API_URL}/crackers/${crackerId}`, updatePayload);
      setCrackers(prev => prev.map(c => (c._id === crackerId ? res.data : c)));
      return true;
    } catch (error) {
      console.error('Failed to update cracker:', error);
      const updated = crackers.map(c => 
        c._id === crackerId || c.productId === crackerId ? { ...c, ...updatePayload } : c
      );
      setCrackers(updated);
      localStorage.setItem('cracker_products', JSON.stringify(updated));
      return true;
    }
  };

  return (
    <CartContext.Provider
      value={{
        user,
        token,
        loginWithGoogle,
        logout,
        crackers,
        settings,
        orders,
        cart,
        customerName,
        setCustomerName,
        customerPhone,
        setCustomerPhone,
        paymentMode,
        setPaymentMode,
        loading,
        offlineMode,
        globalDiscountOverride,
        setGlobalDiscountOverride,
        cartList,
        grossTotal,
        discountTotal,
        netTotal,
        totalItems,
        totalQuantity,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        addCracker,
        updateCracker,
        updateSettings,
        saveOrder,
        updateOrder,
        deleteOrder,
        refreshData: fetchData
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
