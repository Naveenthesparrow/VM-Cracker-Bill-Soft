import React, { useState, useRef, useEffect } from 'react';
import { ShoppingCart, History, Package, BarChart2, Menu, X, Search } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';

export const Navbar = ({ activeTab, setActiveTab, onSearch }) => {
  const { totalItems } = useCart();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);

  const navItems = [
    { id: 'billing', label: 'Billing', icon: ShoppingCart, count: totalItems },
    { id: 'orders', label: 'History', icon: History },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 }
  ];

  return (
    <>
      {/* Top Header Bar (Desktop & Mobile) */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-xs no-print text-slate-800 md:pl-64">
        <div className="max-w-5xl mx-auto flex items-center justify-between h-9">
          
          {/* Mobile Logo & Hamburger Button */}
          <div className="flex items-center space-x-2.5 md:hidden">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-1.5 -ml-1 text-slate-650 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-base font-black tracking-wider text-rose-650 font-mono">
                VM CRACKERS
              </h1>
              <p className="text-[9px] text-slate-500 font-bold tracking-widest uppercase">Billing Engine</p>
            </div>
          </div>

          {/* Search Icon Button (right side of header) */}
          <button
            id="navbar-search-btn"
            onClick={() => {
              setIsSearchOpen((prev) => !prev);
              setTimeout(() => searchInputRef.current?.focus(), 80);
            }}
            className={`p-2 rounded-xl transition-all duration-200 cursor-pointer ${
              isSearchOpen
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Search products"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Floating Search Overlay */}
      {isSearchOpen && (
        <div
          className="sticky top-[61px] z-20 no-print md:ml-64"
          id="navbar-search-overlay"
        >
          <div className="bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-lg px-4 py-3">
            <div className="max-w-5xl mx-auto relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-amber-500">
                <Search className="w-4 h-4" />
              </span>
              <input
                ref={searchInputRef}
                id="navbar-search-input"
                type="search"
                placeholder="Search by Code, Name, or தமிழ்..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  onSearch?.(e.target.value);
                }}
                className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all text-sm font-extrabold"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    onSearch?.('');
                    searchInputRef.current?.focus();
                  }}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-45 bg-black/60 backdrop-blur-xs transition-opacity duration-300 md:hidden"
        />
      )}

      {/* Desktop & Mobile Sliding Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } no-print text-slate-800 shadow-xs`}
      >
        
        {/* Sidebar Logo Header */}
        <div className="h-[61px] flex items-center justify-between px-6 border-b border-slate-200/80">
          <div>
            <h1 className="text-base font-black tracking-wider text-rose-650 font-mono">
              VM CRACKERS
            </h1>
            <p className="text-[9px] text-slate-500 font-bold tracking-widest uppercase">Billing Engine</p>
          </div>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-1 -mr-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg md:hidden cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Navigation Items */}
        <div className="flex-1 space-y-2 p-4 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/15'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-semibold'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
                
                {/* Cart badge desktop */}
                {item.count > 0 && (
                  <span className={`font-black text-[10px] px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-slate-950 text-amber-500' : 'bg-red-600 text-white'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </aside>
    </>
  );
};
export default Navbar;
