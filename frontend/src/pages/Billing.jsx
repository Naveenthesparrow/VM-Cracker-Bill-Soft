import React, { useState, useMemo } from 'react';
import { Plus, Minus, Trash2, Check, Printer, ListFilter, User, Phone, ShoppingBag, ShoppingCart, ChevronRight, ChevronUp, ChevronDown, X } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { CATEGORY_ORDER } from '../context/localCrackers.js';
import BillPreview from '../components/BillPreview.jsx';
import confetti from 'canvas-confetti';

export const Billing = ({ navSearchQuery = '' }) => {
  const {
    crackers,
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    saveOrder,
    totalItems,
    totalQuantity,
    grossTotal,
    discountTotal,
    netTotal,
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone
  } = useCart();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [savedOrder, setSavedOrder] = useState(null);
  const [isCartOpenMobile, setIsCartOpenMobile] = useState(false);
  const [isCategoryExpanded, setIsCategoryExpanded] = useState(true);
  const [isTotalsExpanded, setIsTotalsExpanded] = useState(true);

  // Sort crackers numerically by productId
  const sortedCrackers = useMemo(() => {
    return [...crackers].sort((a, b) => {
      const numA = parseInt(a.productId) || 999;
      const numB = parseInt(b.productId) || 999;
      return numA - numB;
    });
  }, [crackers]);

  // Extract unique categories from crackers data, sorted by CATEGORY_ORDER
  const categories = useMemo(() => {
    const available = new Set(crackers.map((c) => c.category));
    const ordered = CATEGORY_ORDER.filter((cat) => available.has(cat));
    // Append any DB categories not in our fixed list at the end
    available.forEach((cat) => { if (!CATEGORY_ORDER.includes(cat)) ordered.push(cat); });
    return ['All', ...ordered];
  }, [crackers]);

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    return sortedCrackers.filter((p) => {
      const matchesSearch =
        p.productId.toString().includes(navSearchQuery) ||
        p.name.toLowerCase().includes(navSearchQuery.toLowerCase()) ||
        (p.tamilName && p.tamilName.toLowerCase().includes(navSearchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [sortedCrackers, navSearchQuery, selectedCategory]);

  // Get active cart items
  const cartItems = useMemo(() => {
    return sortedCrackers.filter((item) => (cart[item.productId] || 0) > 0);
  }, [sortedCrackers, cart]);

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    const result = await saveOrder();
    if (result) {
      setSavedOrder(result);
      setIsCheckoutOpen(false);
      setIsPreviewOpen(true);
      // Confetti celebration
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#d97706', '#dc2626', '#059669', '#2563eb']
      });
    }
  };

  return (
    <>
      <div className="h-[calc(100vh-61px)] flex flex-row overflow-hidden bg-slate-100 text-slate-800 no-print relative">
      
      {/* MOBILE CART OVERLAY */}
      <div 
        className={`md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isCartOpenMobile ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsCartOpenMobile(false)}
      />

      {/* LEFT COLUMN: Active Cart / Bill Sheet (Sidebar on Desktop, Bottom Sheet on Mobile) */}
      <div className={`
        fixed md:static inset-x-0 bottom-0 z-50 md:z-auto
        bg-white md:border-r border-slate-200 flex flex-col 
        transition-transform duration-300 ease-in-out overflow-hidden
        rounded-t-3xl md:rounded-none shadow-2xl md:shadow-none
        h-[85vh] md:h-full md:w-[390px] flex-none
        ${isCartOpenMobile ? 'translate-y-0' : 'translate-y-full md:translate-y-0'}
      `}>
        {/* Cart Header */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between h-[48px] shrink-0">
          <div className="flex items-center space-x-2">
            {/* Close Button on Mobile */}
            <button
              onClick={() => setIsCartOpenMobile(false)}
              className="p-1 -ml-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded md:hidden cursor-pointer transition-colors"
            >
              <X className="w-5 h-5 font-bold" />
            </button>
            <h2 className="text-xs font-black text-slate-700 uppercase tracking-wider">
              {cartItems.length > 0
                ? `Cart (${totalQuantity} Units - ₹${netTotal})`
                : `Selected Items (${cartItems.length})`}
            </h2>
          </div>
          
          <div className="flex items-center space-x-2">
            {cartItems.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[10px] font-black text-red-650 hover:text-red-750 flex items-center space-x-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Selected Items Table */}
        <div className="flex-1 overflow-y-auto p-2.5 scrollbar-thin transition-all duration-300 block">
          {cartItems.length > 0 ? (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold text-[11px] uppercase tracking-wide">
                  <th className="pb-3 pl-1">Item</th>
                  <th className="pb-3 text-center w-[90px]">Qty</th>
                  <th className="pb-3 text-right w-[70px]">Rate</th>
                  <th className="pb-3 w-[40px]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cartItems.map((item) => {
                  const qty = cart[item.productId];
                  const discount = item.discountPercentage !== undefined ? item.discountPercentage : 90;
                  const discountedRate = item.isNetRate
                    ? item.rate
                    : Math.round(item.rate * (1 - discount / 100));
                  return (
                    <tr key={item.productId} className="text-slate-800 hover:bg-slate-50/50">
                      <td className="py-3 pr-1.5 min-w-0 max-w-[140px] pl-1">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-black font-mono border border-slate-200">{item.productId}</span>
                          <span className="font-extrabold text-xs truncate leading-tight">{item.name}</span>
                        </div>
                        {item.tamilName && (
                          <div className="text-[10px] text-slate-400 font-bold pl-8 truncate mt-0.5">({item.tamilName})</div>
                        )}
                      </td>
                      <td className="py-3 text-center">
                        <div className="flex items-center space-x-1.5 justify-center">
                          <button
                            onClick={() => addToCart(item.productId, -1)}
                            className="w-7 h-7 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg flex items-center justify-center font-black text-sm cursor-pointer active:scale-90 transition-transform"
                          >
                            -
                          </button>
                          <span className="w-7 text-center font-black text-sm text-slate-900">{qty}</span>
                          <button
                            onClick={() => addToCart(item.productId, 1)}
                            className="w-7 h-7 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg flex items-center justify-center font-black text-sm cursor-pointer active:scale-90 transition-transform"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        {!item.isNetRate && (
                          <div className="text-[9px] text-red-400 line-through mb-0.5 font-medium leading-none">₹{item.rate}</div>
                        )}
                        <div className="font-black text-emerald-600 text-xs leading-none">₹{discountedRate}</div>
                      </td>
                      <td className="py-3 pl-2 text-center">
                        <button
                          onClick={() => updateQuantity(item.productId, 0)}
                          className="text-red-500 hover:text-red-700 p-1.5 cursor-pointer rounded hover:bg-slate-100 active:scale-90 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-12 text-center px-4">
              <ShoppingBag className="w-9 h-9 text-slate-300 stroke-[1.5] mb-2" />
              <p className="text-slate-400 text-xs font-semibold">No items selected.</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Tap products below to start billing.</p>
            </div>
          )}
        </div>

        {/* Cart Totals & Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 transition-all duration-300 block shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:shadow-none">

          {/* Breakdown Content */}
          <div className="space-y-3">
              {/* Breakdown */}
              <div className="space-y-1.5 text-xs font-bold text-slate-500">
                <div className="flex justify-between items-center text-slate-900 font-black text-sm pt-1">
                  <span>Net Payable:</span>
                  <span className="text-lg text-emerald-600 font-mono">₹{netTotal}</span>
                </div>
              </div>

              {/* Checkout Trigger Button */}
              <button
                onClick={() => cartItems.length > 0 && setIsCheckoutOpen(true)}
                disabled={cartItems.length === 0}
                className={`w-full py-3 rounded-xl shadow-md transition-all font-black text-sm uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer active:scale-98 ${
                  cartItems.length > 0
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 border border-amber-600'
                    : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
                }`}
              >
                <Printer className="w-5 h-5" />
                <span>Generate Bill</span>
              </button>
            </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Product Catalogue Grid */}
      <div className="flex flex-col flex-1 h-full overflow-hidden p-3 space-y-2.5 pb-24 md:pb-3">
        
        {/* Categories — unified card like SELECTED ITEMS */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs shrink-0 overflow-hidden">
          {/* Header row */}
          <div className="flex items-center justify-between bg-slate-50 border-b border-slate-200 px-3 py-2.5">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setIsCategoryExpanded(!isCategoryExpanded)}
                className="p-0.5 text-slate-500 hover:text-slate-800 cursor-pointer transition-colors"
              >
                {isCategoryExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              <h2 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                Categories
              </h2>
            </div>
            {selectedCategory !== 'All' && (
              <span className="px-1.5 py-0.5 bg-amber-100 text-amber-900 text-[9px] font-extrabold rounded-md border border-amber-200 max-w-[120px] truncate">
                {selectedCategory}
              </span>
            )}
          </div>

          {/* Pills */}
          {isCategoryExpanded && (
            <div className="p-2.5 bg-white border-t border-slate-200">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 hover:scrollbar-thumb-slate-400 pr-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full h-full px-2 py-2 rounded-lg text-[10px] font-black tracking-wide transition-all duration-200 cursor-pointer active:scale-95 flex items-center justify-center text-center leading-snug border ${
                      selectedCategory === cat
                        ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-md'
                        : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200 hover:border-slate-300 hover:text-slate-900 shadow-xs'
                    }`}
                  >
                    {cat.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>


        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
              {filteredProducts.map((item) => {
                const qty = cart[item.productId] || 0;
                const discount = item.discountPercentage !== undefined ? item.discountPercentage : 90;
                const discountedRate = item.isNetRate
                  ? item.rate
                  : Math.round(item.rate * (1 - discount / 100));

                return (
                  <button
                    key={item.productId}
                    onClick={() => addToCart(item.productId, 1)}
                    className={`relative p-2 flex flex-col justify-between items-center bg-white border rounded-xl shadow-xs transition-all hover:shadow-md transform active:scale-95 text-center cursor-pointer min-h-[95px] select-none ${
                      qty > 0
                        ? 'border-amber-500 ring-2 ring-amber-500/10 bg-amber-500/5'
                        : 'border-slate-200 hover:border-slate-350'
                    }`}
                  >
                    {/* Badge: Product ID */}
                    <span className="absolute top-1 left-1.5 px-1 py-0.5 bg-slate-100 text-slate-605 rounded text-[8px] font-black font-mono border border-slate-200">
                      {item.productId}
                    </span>

                    {/* Badge: Selected Qty count */}
                    {qty > 0 && (
                      <span className="absolute top-1 right-1.5 bg-red-650 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded-full shadow-sm">
                        {qty}
                      </span>
                    )}

                    {/* Product Name */}
                    <div className="w-full flex-1 flex flex-col justify-center pt-5">
                      <span className="text-[10px] font-black text-slate-850 line-clamp-2 leading-tight">
                        {item.name}
                      </span>
                      {item.tamilName && (
                        <span className="text-[8px] text-slate-400 font-bold mt-0.5 line-clamp-1">
                          {item.tamilName}
                        </span>
                      )}
                    </div>

                    {/* Price section */}
                    <div className="mt-1.5 w-full">
                      {!item.isNetRate && (
                        <span className="text-[8px] text-red-505 line-through font-medium block">
                          ₹{item.rate}
                        </span>
                      )}
                      <span className="text-xs font-black text-emerald-600 block">
                        ₹{discountedRate}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl shadow-xs">
              <p className="text-slate-500 text-xs font-semibold">No items match current filter options.</p>
            </div>
          )}
        </div>
      </div>

      {/* FLOATING CART BUTTON (MOBILE ONLY) */}
      <div className="md:hidden fixed bottom-6 right-4 z-30 no-print">
        <button
          onClick={() => setIsCartOpenMobile(true)}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 p-4 rounded-full shadow-xl flex items-center justify-center relative cursor-pointer active:scale-95 transition-transform"
        >
          <ShoppingCart className="w-6 h-6" />
          {totalQuantity > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm border-2 border-white min-w-[20px] text-center">
              {totalQuantity}
            </span>
          )}
        </button>
      </div>

      {/* Checkout Drawer (Bottom Sheet Modal on Mobile, Centered Modal on Desktop) */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-end md:items-center justify-center no-print">
          <div className="bg-white border-t md:border border-slate-200 rounded-t-3xl md:rounded-2xl w-full max-w-lg p-6 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-250 text-slate-800 shadow-2xl">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-900">Customer Details</h2>
              <button 
                onClick={() => setIsCheckoutOpen(false)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 px-2 py-1 bg-slate-100 rounded-lg cursor-pointer transition-colors"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="mt-5 space-y-5">
              {/* Customer Name */}
              <div>
                <label className="block text-xs font-black text-slate-750 uppercase tracking-wider mb-2">
                  Customer Name
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-5 h-5" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Enter name (e.g. Ramesh)"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-550 hover:bg-slate-100/50 focus:bg-white border-2 border-slate-300 focus:border-amber-500 rounded-xl text-slate-900 placeholder-slate-450 focus:outline-none focus:ring-4 focus:ring-amber-500/15 transition-all font-extrabold text-sm"
                  />
                </div>
              </div>

               {/* Customer Phone */}
              <div>
                <label className="block text-xs font-black text-slate-750 uppercase tracking-wider mb-2">
                  Phone Number
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Phone className="w-5 h-5" />
                  </span>
                  <input
                    type="tel"
                    placeholder="Enter 10 digit number (optional)"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border-2 border-slate-300 focus:border-amber-500 rounded-xl text-slate-900 placeholder-slate-450 focus:outline-none focus:ring-4 focus:ring-amber-500/15 transition-all font-extrabold text-sm"
                  />
                </div>
              </div>

              {/* Selected Items Summary List */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                  Selected Items Summary
                </label>
                <div className="max-h-36 overflow-y-auto border-2 border-slate-200 rounded-xl p-3 bg-slate-50 space-y-2 scrollbar-thin">
                  {cartItems.map((item) => {
                    const qty = cart[item.productId];
                    const discount = item.discountPercentage !== undefined ? item.discountPercentage : 90;
                    const discountedRate = item.isNetRate
                      ? item.rate
                      : Math.round(item.rate * (1 - discount / 100));
                    const itemAmount = discountedRate * qty;
                    return (
                      <div
                        key={item.productId}
                        className="flex justify-between items-center text-xs py-2 border-b border-slate-200 last:border-b-0 gap-2"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-1.5">
                            <span className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded text-[9px] font-black font-mono">
                              {item.productId}
                            </span>
                            <span className="font-extrabold text-slate-800 truncate">{item.name}</span>
                          </div>
                          {item.tamilName && (
                            <p className="text-[10px] text-slate-500 font-bold mt-0.5 pl-7">
                              ({item.tamilName})
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 shrink-0">
                          <span className="font-black text-slate-500 text-[11px]">{qty} x</span>
                          <span className="font-black text-emerald-600 text-right w-16">₹{itemAmount}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Breakdown */}
              <div className="bg-slate-50 p-4 border border-slate-150 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-900 font-black text-sm">
                  <span>Net Payable</span>
                  <span className="text-base text-emerald-600 font-black font-mono">₹{netTotal}</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-black rounded-xl shadow-lg transition-all transform active:scale-98 cursor-pointer flex items-center justify-center space-x-2 text-xs uppercase tracking-wider"
              >
                <Check className="w-5 h-5" />
                <span>Save and Generate Bill</span>
              </button>
            </form>
          </div>
        </div>
      )}
      </div>

      {/* Bill Print Modal (Outside no-print parent) */}
      {isPreviewOpen && (
        <BillPreview
          order={savedOrder}
          isOpen={isPreviewOpen}
          onClose={() => {
            setIsPreviewOpen(false);
            setSavedOrder(null);
          }}
        />
      )}
    </>
  );
};
export default Billing;
