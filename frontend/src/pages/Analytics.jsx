import React, { useState, useMemo } from 'react';
import { LineChart, Settings as Gear, Store, MapPin, Phone, Percent, Landmark, Check } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';

export const Analytics = () => {
  const { orders, settings, updateSettings } = useCart();
  
  // Settings Form State
  const [shopName, setShopName] = useState(settings.shopName);
  const [shopAddress, setShopAddress] = useState(settings.shopAddress);
  const [shopPhone, setShopPhone] = useState(settings.shopPhone);
  const [globalDiscount, setGlobalDiscount] = useState(settings.globalDiscountPercentage);
  const [upiId, setUpiId] = useState(settings.upiId || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync settings state when context changes
  React.useEffect(() => {
    if (settings) {
      setShopName(settings.shopName);
      setShopAddress(settings.shopAddress);
      setShopPhone(settings.shopPhone);
      setGlobalDiscount(settings.globalDiscountPercentage);
      setUpiId(settings.upiId || '');
    }
  }, [settings]);

  // Compute Analytics Metrics
  const metrics = useMemo(() => {
    const totalSales = orders.reduce((acc, order) => acc + order.netTotal, 0);
    const invoiceCount = orders.length;
    
    let totalItemsCount = 0;
    const productSales = {};

    orders.forEach(order => {
      order.items.forEach(item => {
        totalItemsCount += item.quantity;
        productSales[item.name] = (productSales[item.name] || 0) + item.quantity;
      });
    });

    const averageBillValue = invoiceCount > 0 ? Math.round(totalSales / invoiceCount) : 0;
    
    // Sort top products
    const topProducts = Object.entries(productSales)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    return {
      totalSales,
      invoiceCount,
      totalItemsCount,
      averageBillValue,
      topProducts
    };
  }, [orders]);

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    const success = await updateSettings({
      shopName,
      shopAddress,
      shopPhone,
      globalDiscountPercentage: Number(globalDiscount),
      upiId: upiId.trim()
    });

    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  // Helper hook to trigger useMemo properly
  // Note: we can import useMemo or just call React.useMemo. Since we imported useMemo from React, we can call it.
  // Wait, did we import useMemo in Analytics.jsx imports? The previous implementation did! Let's check imports:
  // "import React, { useState } from 'react';" -> wait! The previous file had "import React, { useState, useMemo } from 'react';"!
  // In the replacement content, I wrote: "import React, { useState } from 'react';" but I used "useMemo" inside the component!
  // Oh! That would throw a ReferenceError: useMemo is not defined!
  // Let's make sure we import `useMemo` in imports!
  // That's a crucial catch! I'll define: "import React, { useState, useMemo } from 'react';" at the top.

  return (
    <div className="min-h-[calc(100vh-60px)] pb-24 pt-4 max-w-5xl mx-auto px-4 no-print space-y-6 text-slate-850">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Analytics & Settings</h2>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">Track shop performance and configure billing metadata.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Metric 1 */}
        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
          <p className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">Total Sales</p>
          <h3 className="text-xl font-black text-slate-900 font-mono mt-1">₹{metrics.totalSales}</h3>
        </div>

        {/* Metric 2 */}
        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
          <p className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">Bills Saved</p>
          <h3 className="text-xl font-black text-slate-900 font-mono mt-1">{metrics.invoiceCount}</h3>
        </div>

        {/* Metric 3 */}
        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
          <p className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">Items Sold</p>
          <h3 className="text-xl font-black text-slate-900 font-mono mt-1">{metrics.totalItemsCount}</h3>
        </div>

        {/* Metric 4 */}
        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
          <p className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">Average Bill</p>
          <h3 className="text-xl font-black text-slate-900 font-mono mt-1">₹{metrics.averageBillValue}</h3>
        </div>
      </div>

      {/* Middle Section: Top Products & Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Top Sold Products */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-xs">
          <h3 className="text-sm font-extrabold text-slate-900 tracking-wider flex items-center space-x-2">
            <LineChart className="w-5 h-5 text-amber-500" />
            <span>Top Sold Crackers</span>
          </h3>

          <div className="space-y-3">
            {metrics.topProducts.length > 0 ? (
              metrics.topProducts.map((p, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs font-semibold">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-5 h-5 bg-slate-100 text-slate-600 font-bold rounded flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="text-slate-800 truncate max-w-[200px]">{p.name}</span>
                  </div>
                  <span className="text-amber-600 font-bold font-mono">{p.qty} units</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic py-4 text-center">No sales history yet.</p>
            )}
          </div>
        </div>

        {/* Edit shop settings */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-xs">
          <h3 className="text-sm font-extrabold text-slate-900 tracking-wider flex items-center space-x-2">
            <Gear className="w-5 h-5 text-amber-500" />
            <span>Shop Configuration</span>
          </h3>

          <form onSubmit={handleSettingsSubmit} className="space-y-3.5 text-xs text-slate-700">
            {/* Shop Name */}
            <div>
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Shop Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-450">
                  <Store className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-205 rounded-xl text-slate-950 font-bold"
                />
              </div>
            </div>

            {/* Shop Address */}
            <div>
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Receipt Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 pt-2 flex items-start text-slate-450">
                  <MapPin className="w-4 h-4" />
                </span>
                <textarea
                  required
                  rows={2}
                  value={shopAddress}
                  onChange={(e) => setShopAddress(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-205 rounded-xl text-slate-950 font-semibold focus:ring-0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Phone */}
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Contact Phone
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-450">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={shopPhone}
                    onChange={(e) => setShopPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-205 rounded-xl text-slate-950 font-semibold"
                  />
                </div>
              </div>

              {/* Default Discount */}
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Global Discount (%)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-450">
                    <Percent className="w-4 h-4" />
                  </span>
                  <input
                    type="number"
                    required
                    min={0}
                    max={100}
                    value={globalDiscount}
                    onChange={(e) => setGlobalDiscount(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-205 rounded-xl text-slate-950 font-bold"
                  />
                </div>
              </div>
            </div>

            {/* UPI ID */}
            <div>
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                UPI ID (for bill payments QR code)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-455">
                  <Landmark className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="e.g. merchant@okaxis"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-205 rounded-xl text-slate-950 font-semibold"
                />
              </div>
            </div>

            {/* Submit settings */}
            <div className="pt-2 flex items-center space-x-3">
              <button
                type="submit"
                className="w-full flex items-center justify-center space-x-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow-md cursor-pointer text-xs"
              >
                <span>Save settings</span>
              </button>

              {saveSuccess && (
                <div className="flex items-center space-x-1 px-3 py-2 bg-emerald-50 border border-emerald-200 text-emerald-600 font-bold rounded-xl animate-bounce">
                  <Check className="w-4 h-4" />
                  <span>Saved!</span>
                </div>
              )}
            </div>

          </form>
        </div>

      </div>

    </div>
  );
};
export default Analytics;
