import React, { useState } from 'react';
import { CartProvider } from './context/CartContext.jsx';
import Navbar from './components/Navbar.jsx';
import Billing from './pages/Billing.jsx';
import Orders from './pages/Orders.jsx';
import Products from './pages/Products.jsx';
import Analytics from './pages/Analytics.jsx';

export const App = () => {
  const [activeTab, setActiveTab] = useState('billing');
  const [navSearchQuery, setNavSearchQuery] = useState('');

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
      default:
        return <Billing />;
    }
  };

  return (
    <CartProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
        {/* Navigation & Header */}
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} onSearch={setNavSearchQuery} />
        
        {/* Main Content Pane */}
        <main className="flex-1 overflow-x-hidden md:pl-64">
          {renderActivePage()}
        </main>
      </div>
    </CartProvider>
  );
};
export default App;
