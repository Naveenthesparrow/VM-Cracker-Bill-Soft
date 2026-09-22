import React, { useState } from 'react';
import { CartProvider } from './context/CartContext.jsx';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Navbar from './components/Navbar.jsx';
import Billing from './pages/Billing.jsx';
import Orders from './pages/Orders.jsx';
import Products from './pages/Products.jsx';
import Analytics from './pages/Analytics.jsx';
import Settings from './pages/Settings.jsx';
import Login from './pages/Login.jsx';
import { useCart } from './context/CartContext.jsx';

export const AppContent = () => {
  const [activeTab, setActiveTab] = useState('billing');
  const [navSearchQuery, setNavSearchQuery] = useState('');
  const { user, loading } = useCart();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500 font-bold flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin mb-4"></div>
          Loading Engine...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderActivePage = () => {
    switch (activeTab) {
      case 'billing':
        return <Billing navSearchQuery={navSearchQuery} />;
      case 'orders':
        return <Orders />;
      case 'products':
        return <Products />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      default:
        return <Billing />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Navigation & Header */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} onSearch={setNavSearchQuery} />
      
      {/* Main Content Pane */}
      <main className="flex-1 overflow-x-hidden md:pl-64">
        {renderActivePage()}
      </main>
    </div>
  );
};

export const App = () => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
