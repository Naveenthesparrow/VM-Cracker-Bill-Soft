import React, { useState, useMemo } from 'react';
import { Search, Calendar, Phone, Eye, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import BillPreview from '../components/BillPreview.jsx';

export const Orders = () => {
  const { orders, deleteOrder } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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

  return (
    <div className="min-h-[calc(100vh-60px)] pb-24 pt-4 max-w-5xl mx-auto px-4 no-print text-slate-800">
      
      {/* Page Title & Search */}
      <div className="flex flex-col space-y-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Invoice History</h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">Manage and print saved customer receipts.</p>
        </div>

        {/* Search */}
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
              {/* Left Column: Bill details */}
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

              {/* Right Column: Calculations and Actions */}
              <div className="flex items-center justify-between sm:justify-end sm:space-x-4 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                <div className="text-left sm:text-right pr-2">
                  <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">Grand Total</p>
                  <p className="text-base font-black text-slate-900 font-mono">₹{order.netTotal}</p>
                  <p className="text-[9px] text-slate-500 font-extrabold">({order.items.length} items)</p>
                </div>

                {/* Actions */}
                <div className="flex space-x-1.5">
                  <button
                    onClick={() => openPreview(order)}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors hover:text-slate-900 cursor-pointer border border-slate-200/50"
                    title="View Invoice"
                  >
                    <Eye className="w-4.5 h-4.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(order._id, order.billNumber)}
                    className="p-2.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-xl transition-colors cursor-pointer"
                    title="Delete Invoice"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
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

      {/* Bill Preview Modal overlay */}
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
    </div>
  );
};
export default Orders;
