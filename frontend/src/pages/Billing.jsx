import React, { useState, useMemo } from 'react';
import { Search, Plus, Minus, Trash2, Check, Printer, ListFilter, User, Phone, ShoppingBag, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import BillPreview from '../components/BillPreview.jsx';
import confetti from 'canvas-confetti';

export const Billing = () => {
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

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [savedOrder, setSavedOrder] = useState(null);
  const [isCartCollapsed, setIsCartCollapsed] = useState(false);

  // Sort crackers numerically by productId
  const sortedCrackers = useMemo(() => {
    return [...crackers].sort((a, b) => {
      const numA = parseInt(a.productId) || 999;
      const numB = parseInt(b.productId) || 999;
      return numA - numB;
    });
  }, [crackers]);

  // Fixed category order — matches the catalogue sequence (productId order)
  const CATEGORY_ORDER = [
    'ONE SOUND CRACKERS',
    'FLOWER POTS CRACKERS',
    'CHAKKAR CRACKERS',
    'NEW VERITY CHAKKAR',
    'BOMB CRACKERS',
    'BIJILI CRACKERS',
    'TWINKLING STAR',
    'PENCIL CRACKERS',
    'ROCKET CRACKERS',
    'PAPER BOMB CRACKERS',
    'DELUXE CRACKERS',
    'WALA CRACKERS',
    'PEACOCK CRACKERS',
    'KIDS VERITES CRACKERS',
    'SPECIAL VERITES',
    'FOUNTAIN FANCY CRACKERS',
    'MINI FOUNTAIN',
    'MINI FOUNTAIN - BACARDI',
    '4" FOUNTAIN',
    'ARIAL FANCY CRACKERS',
    '2026 NEW VERITES',
    'TIN FOUNTAIN',
    'MULTI COLOUR SHOT',
    'SINGLE SHOT ITAMS',
    '2 PCS FANCY CRACKERS',
    'SPARKLERS CRACKERS',
    'MATCH BOX',
    'STONE CARTOON CRACKERS',
    'GIFT BOX NET RATE',
  ];

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
        p.productId.toString().includes(searchQuery) ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.tamilName && p.tamilName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [sortedCrackers, searchQuery, selectedCategory]);

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
      <div className="h-[calc(100vh-61px)] flex flex-col md:flex-row overflow-hidden bg-slate-100 text-slate-800 no-print">
      
      {/* LEFT COLUMN: Active Cart / Bill Sheet */}
      <div className={`bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col transition-all duration-300 ease-in-out overflow-hidden ${
        isCartCollapsed
          ? 'h-[48px] md:h-full md:w-[390px] flex-none'
          : 'h-[42vh] md:h-full md:w-[390px] flex-[0.9] md:flex-none'
      }`}>
        {/* Cart Header */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between h-[48px] shrink-0">
          <div className="flex items-center space-x-2">
            {/* Collapse/Expand Toggle Button on Mobile */}
            <button
              onClick={() => setIsCartCollapsed(!isCartCollapsed)}
              className="p-1 -ml-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded md:hidden cursor-pointer transition-colors"
            >
              {isCartCollapsed ? (
                <ChevronDown className="w-4 h-4 font-bold" />
              ) : (
                <ChevronUp className="w-4 h-4 font-bold" />
              )}
            </button>
            <h2 className="text-xs font-black text-slate-700 uppercase tracking-wider">
              {isCartCollapsed && cartItems.length > 0
                ? `Cart (${totalQuantity} Units - ₹${netTotal})`
                : `Selected Items (${cartItems.length})`}
            </h2>
          </div>
          
          <div className="flex items-center space-x-2">
            {!isCartCollapsed && cartItems.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[10px] font-black text-red-650 hover:text-red-750 flex items-center space-x-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Cart</span>
              </button>
            )}
            {isCartCollapsed && cartItems.length > 0 && (
              <button
                onClick={() => setIsCheckoutOpen(true)}
                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-lg text-[10px] cursor-pointer shadow-sm border border-amber-600 md:hidden"
              >
                Checkout
              </button>
            )}
          </div>
        </div>

        {/* Selected Items Table */}
        <div className={`flex-1 overflow-y-auto p-2.5 scrollbar-thin transition-all duration-300 ${isCartCollapsed ? 'hidden md:block' : 'block'}`}>
          {cartItems.length > 0 ? (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold text-[10px] uppercase">
                  <th className="pb-2">Item</th>
                  <th className="pb-2 text-center">Qty</th>
                  <th className="pb-2 text-center">Rate</th>
                  <th className="pb-2 text-right">Total</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cartItems.map((item) => {
                  const qty = cart[item.productId];
                  const discount = item.discountPercentage !== undefined ? item.discountPercentage : 90;
                  const discountedRate = item.isNetRate
                    ? item.rate
                    : Math.round(item.rate * (1 - discount / 100));
                  const itemAmount = discountedRate * qty;
                  return (
                    <tr key={item.productId} className="text-slate-800 hover:bg-slate-50/50">
                      <td className="py-2 pr-1.5 min-w-0 max-w-[130px]">
                        <div className="flex items-center space-x-1.5">
                          <span className="px-1.5 py-0.5 bg-slate-100 text-slate-650 rounded text-[9px] font-black font-mono border border-slate-200">{item.productId}</span>
                          <span className="font-extrabold text-[11px] truncate">{item.name}</span>
                        </div>
                        {item.tamilName && (
                          <div className="text-[9px] text-slate-400 font-bold pl-7 truncate">({item.tamilName})</div>
                        )}
                      </td>
                      <td className="py-2 text-center">
                        <div className="flex items-center space-x-1 justify-center">
                          <button
                            onClick={() => removeFromCart(item.productId, 1)}
                            className="w-5 h-5 bg-slate-100 hover:bg-slate-250 text-slate-800 rounded flex items-center justify-center font-bold text-xs cursor-pointer active:scale-90"
                          >
                            -
                          </button>
                          <span className="w-6 text-center font-black text-xs text-slate-900">{qty}</span>
                          <button
                            onClick={() => addToCart(item.productId, 1)}
                            className="w-5 h-5 bg-slate-100 hover:bg-slate-250 text-slate-800 rounded flex items-center justify-center font-bold text-xs cursor-pointer active:scale-90"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="py-2 text-center font-bold text-slate-605 text-[11px]">₹{discountedRate}</td>
                      <td className="py-2 text-right font-black text-emerald-600 text-[11px]">₹{itemAmount}</td>
                      <td className="py-2 pl-2 text-center">
                        <button
                          onClick={() => updateQuantity(item.productId, 0)}
                          className="text-red-505 hover:text-red-700 p-0.5 cursor-pointer rounded hover:bg-slate-100 active:scale-90"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
        <div className={`p-3 bg-slate-50 border-t border-slate-200 space-y-2 transition-all duration-300 ${isCartCollapsed ? 'hidden md:block' : 'block'}`}>
          {/* Breakdown */}
          <div className="space-y-1 text-[11px] font-bold text-slate-500">
            <div className="flex justify-between">
              <span>Gross Total:</span>
              <span className="font-mono">₹{grossTotal}</span>
            </div>
            <div className="flex justify-between text-emerald-600 font-extrabold">
              <span>Saved (90%):</span>
              <span className="font-mono">-₹{discountTotal}</span>
            </div>
            <div className="flex justify-between text-slate-900 font-black text-xs border-t border-slate-200 pt-1.5 mt-0.5">
              <span>Net Payable:</span>
              <span className="text-sm text-emerald-600 font-mono">₹{netTotal}</span>
            </div>
          </div>

          {/* Checkout Trigger Button */}
          <button
            onClick={() => cartItems.length > 0 && setIsCheckoutOpen(true)}
            disabled={cartItems.length === 0}
            className={`w-full py-2.5 rounded-xl shadow-md transition-all font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 cursor-pointer active:scale-98 ${
              cartItems.length > 0
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 border border-amber-600'
                : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>Generate Bill</span>
          </button>
        </div>
      </div>

      {/* RIGHT COLUMN: Product Catalogue Grid */}
      <div className={`flex flex-col transition-all duration-300 ease-in-out overflow-hidden p-3 space-y-2.5 ${
        isCartCollapsed
          ? 'h-[calc(100vh-109px)] md:h-full flex-1'
          : 'h-[58vh] md:h-full flex-[1.1]'
      }`}>
        
        {/* Filters bar — always stacked: search on top, pills below */}
        <div className="flex flex-col gap-2 bg-white border border-slate-200 p-2.5 rounded-2xl shadow-xs">
          {/* Search bar — full width */}
          <div className="relative w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="search"
              placeholder="Search by Code, Name, or தமிழ்..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-xs font-extrabold"
            />
          </div>

          {/* Category Filter Pills — full width horizontal scroll */}
          <div className="flex items-center space-x-1.5 overflow-x-auto py-0.5 scrollbar-none w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-[10px] font-black transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-slate-950 border border-amber-600 shadow-xs'
                    : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>
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
                <div className="flex justify-between text-slate-500">
                  <span>Gross Total</span>
                  <span>₹{grossTotal}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Discount (Saved)</span>
                  <span>-₹{discountTotal}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-black text-sm border-t border-slate-200 pt-2">
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
