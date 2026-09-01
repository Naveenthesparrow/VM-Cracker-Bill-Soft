import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Calendar, Phone, Eye, Trash2, Pencil, X, Plus, Minus, Check, User, PackagePlus } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import BillPreview from '../components/BillPreview.jsx';

export const Orders = () => {
  const { orders, deleteOrder, updateOrder, crackers } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // ── Edit Modal State ──────────────────────────────────────────────
  const [editingOrder, setEditingOrder] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editItems, setEditItems] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // ── Add-Item Search State ─────────────────────────────────────────
  const [addSearch, setAddSearch] = useState('');
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const addSearchRef = useRef(null);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        addSearchRef.current && !addSearchRef.current.contains(e.target)
      ) {
        setShowAddDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Filter crackers for "add item" search
  const addSearchResults = useMemo(() => {
    const q = addSearch.trim().toLowerCase();
    if (!q) return [];
    return crackers
      .filter(c =>
        c.productId.toString().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        (c.tamilName && c.tamilName.toLowerCase().includes(q))
      )
      .slice(0, 8); // max 8 suggestions
  }, [crackers, addSearch]);

  // Filter bills based on search query
  const filteredOrders = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return orders;
    return orders.filter(
      (order) =>
        order.billNumber.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query) ||
        (order.customerPhone && order.customerPhone.includes(query))
    );
  }, [orders, searchQuery]);

  const handleDelete = async (orderId, billNumber) => {
    if (window.confirm(`Are you sure you want to delete bill ${billNumber}? This action cannot be undone.`)) {
      await deleteOrder(orderId);
    }
  };

  const openPreview = (order) => {
    setSelectedOrder(order);
    setIsPreviewOpen(true);
  };

  // ── Edit Handlers ─────────────────────────────────────────────────
  const openEdit = (order) => {
    setEditingOrder(order);
    setEditName(order.customerName);
    setEditPhone(order.customerPhone || '');
    setEditItems(order.items.map(i => ({ ...i })));
    setAddSearch('');
    setShowAddDropdown(false);
  };

  const closeEdit = () => {
    setEditingOrder(null);
    setEditName('');
    setEditPhone('');
    setEditItems([]);
    setAddSearch('');
    setShowAddDropdown(false);
  };

  const updateEditQty = (idx, delta) => {
    setEditItems(prev => {
      const next = [...prev];
      const newQty = (next[idx].quantity || 1) + delta;
      if (newQty <= 0) return next;
      const discountedRate = Math.round(next[idx].amount / next[idx].quantity);
      next[idx] = { ...next[idx], quantity: newQty, amount: discountedRate * newQty };
      return next;
    });
  };

  const setEditQtyDirect = (idx, val) => {
    const qty = parseInt(val, 10);
    if (isNaN(qty) || qty < 1) return;
    setEditItems(prev => {
      const next = [...prev];
      const discountedRate = Math.round(next[idx].amount / next[idx].quantity);
      next[idx] = { ...next[idx], quantity: qty, amount: discountedRate * qty };
      return next;
    });
  };

  const removeEditItem = (idx) => {
    setEditItems(prev => prev.filter((_, i) => i !== idx));
  };

  // Add a cracker from the catalogue to editItems
  const handleAddCracker = (cracker) => {
    const discount = cracker.discountPercentage !== undefined ? cracker.discountPercentage : 90;
    const discountedRate = cracker.isNetRate
      ? cracker.rate
      : Math.round(cracker.rate * (1 - discount / 100));

    setEditItems(prev => {
      // If already in list, just bump quantity by 1
      const existing = prev.findIndex(i => i.productId === cracker.productId);
      if (existing !== -1) {
        const next = [...prev];
        const newQty = next[existing].quantity + 1;
        next[existing] = {
          ...next[existing],
          quantity: newQty,
          amount: discountedRate * newQty
        };
        return next;
      }
      // Otherwise add new row
      return [
        ...prev,
        {
          productId: cracker.productId,
          name: cracker.name,
          tamilName: cracker.tamilName || '',
          rate: cracker.rate,
          discountedRate,
          discountPercentage: discount,
          quantity: 1,
          amount: discountedRate,
          originalAmount: cracker.rate,
          isNetRate: cracker.isNetRate || false
        }
      ];
    });

    setAddSearch('');
    setShowAddDropdown(false);
  };

  // Recalculated totals from editItems
  const editGrossTotal = editItems.reduce((acc, item) => acc + item.rate * item.quantity, 0);
  const editNetTotal = editItems.reduce((acc, item) => acc + item.amount, 0);
  const editDiscountTotal = editGrossTotal - editNetTotal;

  const handleSaveEdit = async () => {
    if (!editName.trim()) return alert('Customer name is required.');
    if (editItems.length === 0) return alert('At least one item is required.');
    setIsSaving(true);
    const updatedData = {
      customerName: editName.trim(),
      customerPhone: editPhone.trim(),
      items: editItems,
      grossTotal: editGrossTotal,
      discountTotal: editDiscountTotal,
      netTotal: editNetTotal,
      paymentMode: editingOrder.paymentMode
    };
    const result = await updateOrder(editingOrder._id, updatedData);
    setIsSaving(false);
    if (result) {
      closeEdit();
    } else {
      alert('Failed to save changes. Please try again.');
    }
  };

  return (
    <>
      <div className="min-h-[calc(100vh-60px)] pb-24 pt-4 max-w-5xl mx-auto px-4 no-print text-slate-800">
      
      {/* Page Title & Search */}
      <div className="flex flex-col space-y-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Invoice History</h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">Manage and print saved customer receipts.</p>
        </div>

        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="search"
            placeholder="Search by Bill No, Name, or Phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all text-sm font-semibold shadow-xs"
          />
        </div>
      </div>

      {/* Orders List */}
      <div className="mt-6 space-y-3">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div
              key={order._id}
              className="p-4 bg-white border border-slate-200/80 hover:border-slate-300 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3.5 sm:space-y-0 transition-all duration-200 shadow-xs"
            >
              {/* Left Column */}
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-sm text-amber-600 font-mono">{order.billNumber}</span>
                  <span className="text-[10px] font-black px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded-md">
                    {order.paymentMode}
                  </span>
                </div>
                <h4 className="text-sm font-black text-slate-900 tracking-wide">{order.customerName}</h4>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-500 text-xs font-semibold">
                  {order.customerPhone && (
                    <span className="flex items-center space-x-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{order.customerPhone}</span>
                    </span>
                  )}
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </span>
                </div>
              </div>

              {/* Right Column */}
              <div className="flex items-center justify-between sm:justify-end sm:space-x-4 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                <div className="text-left sm:text-right pr-2">
                  <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">Grand Total</p>
                  <p className="text-base font-black text-slate-900 font-mono">₹{order.netTotal}</p>
                  <p className="text-[9px] text-slate-500 font-extrabold">({order.items.length} items)</p>
                </div>
                <div className="flex space-x-1.5">
                  <button
                    onClick={() => openEdit(order)}
                    className="p-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-600 rounded-xl transition-colors cursor-pointer"
                    title="Edit Bill"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openPreview(order)}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors hover:text-slate-900 cursor-pointer border border-slate-200/50"
                    title="View Invoice"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(order._id, order.billNumber)}
                    className="p-2.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-xl transition-colors cursor-pointer"
                    title="Delete Invoice"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl shadow-xs">
            <p className="text-slate-500 text-sm">No billing records found.</p>
          </div>
        )}
      </div>
      </div>

      {/* Bill Preview Modal */}
      {isPreviewOpen && (
        <BillPreview
          order={selectedOrder}
          isOpen={isPreviewOpen}
          onClose={() => {
            setIsPreviewOpen(false);
            setSelectedOrder(null);
          }}
        />
      )}

      {/* ── EDIT MODAL ───────────────────────────────────────────────── */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 no-print">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Edit Bill</h2>
                <p className="text-xs text-amber-600 font-mono font-bold mt-0.5">{editingOrder.billNumber}</p>
              </div>
              <button
                onClick={closeEdit}
                className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin">

              {/* Customer Info */}
              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Customer Details</p>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Customer Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Enter customer name"
                      className="w-full pl-9 pr-4 py-2.5 border-2 border-slate-200 focus:border-amber-500 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all text-sm font-bold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Phone Number</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </span>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="Enter phone (optional)"
                      className="w-full pl-9 pr-4 py-2.5 border-2 border-slate-200 focus:border-amber-500 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all text-sm font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* ── Add Item Search ─────────────────────────────────── */}
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">
                  Add Cracker to Bill
                </p>
                <div className="relative">
                  {/* Search input */}
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <PackagePlus className="w-4 h-4" />
                    </span>
                    <input
                      ref={addSearchRef}
                      type="text"
                      value={addSearch}
                      onChange={(e) => {
                        setAddSearch(e.target.value);
                        setShowAddDropdown(true);
                      }}
                      onFocus={() => addSearch && setShowAddDropdown(true)}
                      placeholder="Search by code, name or தமிழ்..."
                      className="w-full pl-9 pr-4 py-2.5 border-2 border-dashed border-amber-300 focus:border-amber-500 bg-amber-50/40 focus:bg-white rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all text-sm font-bold"
                    />
                    {addSearch && (
                      <button
                        onClick={() => { setAddSearch(''); setShowAddDropdown(false); }}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Dropdown results */}
                  {showAddDropdown && addSearchResults.length > 0 && (
                    <div
                      ref={dropdownRef}
                      className="absolute z-10 w-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden"
                    >
                      {addSearchResults.map((cracker) => {
                        const discount = cracker.discountPercentage !== undefined ? cracker.discountPercentage : 90;
                        const discountedRate = cracker.isNetRate
                          ? cracker.rate
                          : Math.round(cracker.rate * (1 - discount / 100));
                        const alreadyAdded = editItems.some(i => i.productId === cracker.productId);
                        return (
                          <button
                            key={cracker.productId}
                            onClick={() => handleAddCracker(cracker)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-amber-50 transition-colors text-left border-b border-slate-100 last:border-b-0 cursor-pointer group"
                          >
                            {/* ID badge */}
                            <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-black font-mono border border-slate-200 shrink-0">
                              {cracker.productId}
                            </span>
                            {/* Name */}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-extrabold text-slate-800 truncate">{cracker.name}</p>
                              {cracker.tamilName && (
                                <p className="text-[10px] text-slate-400 font-medium truncate">{cracker.tamilName}</p>
                              )}
                            </div>
                            {/* Price */}
                            <div className="text-right shrink-0">
                              <p className="text-xs font-black text-emerald-600">₹{discountedRate}</p>
                              {!cracker.isNetRate && (
                                <p className="text-[9px] text-slate-400 line-through">₹{cracker.rate}</p>
                              )}
                            </div>
                            {/* Already-in-bill indicator */}
                            {alreadyAdded ? (
                              <span className="text-[9px] font-black text-amber-600 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded-md shrink-0">
                                +1
                              </span>
                            ) : (
                              <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <Plus className="w-3.5 h-3.5 text-amber-500" />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* No results hint */}
                  {showAddDropdown && addSearch.trim() && addSearchResults.length === 0 && (
                    <div className="absolute z-10 w-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl px-4 py-3 text-xs text-slate-400 font-semibold">
                      No crackers found for "{addSearch}"
                    </div>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">
                  Items ({editItems.length})
                </p>

                {editItems.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    No items. Use the search above to add crackers.
                  </p>
                )}

                <div className="space-y-2">
                  {editItems.map((item, idx) => {
                    const discountedRate = Math.round(item.amount / item.quantity);
                    return (
                      <div
                        key={`${item.productId}-${idx}`}
                        className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors"
                      >
                        <span className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded text-[9px] font-black font-mono shrink-0">
                          {item.productId}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-extrabold text-slate-800 truncate">{item.name}</p>
                          <p className="text-[10px] text-emerald-600 font-bold">
                            ₹{discountedRate} × {item.quantity} = <span className="text-slate-700">₹{item.amount}</span>
                          </p>
                        </div>
                        <div className="flex items-center space-x-1 shrink-0">
                          <button
                            onClick={() => updateEditQty(idx, -1)}
                            disabled={item.quantity <= 1}
                            className="w-6 h-6 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer font-bold text-sm transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => setEditQtyDirect(idx, e.target.value)}
                            className="w-10 text-center text-xs font-black border border-slate-200 rounded-lg py-0.5 focus:outline-none focus:ring-1 focus:ring-amber-400"
                          />
                          <button
                            onClick={() => updateEditQty(idx, 1)}
                            className="w-6 h-6 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 cursor-pointer font-bold text-sm transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeEditItem(idx)}
                          className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                          title="Remove item"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Totals Summary */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Gross Total</span>
                  <span className="font-mono font-bold">₹{editGrossTotal}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Discount (Saved)</span>
                  <span className="font-mono">-₹{editDiscountTotal}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-black text-sm border-t border-slate-200 pt-2">
                  <span>Net Payable</span>
                  <span className="text-base text-emerald-600 font-mono">₹{editNetTotal}</span>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-5 py-4 border-t border-slate-200 bg-slate-50 flex space-x-2.5 shrink-0">
              <button
                onClick={closeEdit}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-black text-xs flex items-center justify-center space-x-1.5 shadow-md transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default Orders;
