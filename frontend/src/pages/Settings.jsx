import React, { useState, useEffect } from 'react';
import { Save, Store, Phone, MapPin, Percent, QrCode, CheckCircle2, Plus, Minus, LogOut } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';

export const Settings = () => {
  const { settings, updateSettings, logout } = useCart();
  
  const [formData, setFormData] = useState({
    shopName: '',
    shopPhone: '',
    shopAddress: '',
    globalDiscountPercentage: 90,
    upiId: ''
  });
  
  const [phones, setPhones] = useState(['']);
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        shopName: settings.shopName || '',
        shopPhone: settings.shopPhone || '',
        shopAddress: settings.shopAddress || '',
        globalDiscountPercentage: settings.globalDiscountPercentage || 90,
        upiId: settings.upiId || ''
      });
      setPhones(settings.shopPhone ? settings.shopPhone.split(',').map(p => p.trim()) : ['']);
    }
  }, [settings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'globalDiscountPercentage' ? Number(value) : value
    }));
  };

  const handlePhoneChange = (index, value) => {
    const newPhones = [...phones];
    newPhones[index] = value;
    setPhones(newPhones);
    setFormData(prev => ({ ...prev, shopPhone: newPhones.filter(p => p.trim() !== '').join(', ') }));
  };

  const addPhone = () => setPhones([...phones, '']);
  
  const removePhone = (index) => {
    const newPhones = phones.filter((_, i) => i !== index);
    if (newPhones.length === 0) newPhones.push('');
    setPhones(newPhones);
    setFormData(prev => ({ ...prev, shopPhone: newPhones.filter(p => p.trim() !== '').join(', ') }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    
    const success = await updateSettings(formData);
    
    setIsSaving(false);
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      alert('Failed to save settings. Please try again.');
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Shop Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your store details, contact info, and default configurations.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Shop Name */}
            <div className="space-y-2 text-left">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                <Store className="w-4 h-4 text-slate-400" />
                <span>Shop Name</span>
              </label>
              <input
                type="text"
                name="shopName"
                value={formData.shopName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border-2 border-slate-200 focus:border-amber-500 rounded-xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all font-bold text-sm"
                placeholder="e.g. VM Crackers"
              />
            </div>

            {/* Shop Phone */}
            <div className="space-y-2 text-left">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>Contact Number(s)</span>
                </label>
                <button
                  type="button"
                  onClick={addPhone}
                  className="text-amber-600 hover:text-amber-700 p-1 bg-amber-50 hover:bg-amber-100 rounded-md transition-colors flex items-center space-x-1 text-[10px] font-bold uppercase tracking-wider"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add</span>
                </button>
              </div>
              
              <div className="space-y-2">
                {phones.map((phone, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => handlePhoneChange(index, e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border-2 border-slate-200 focus:border-amber-500 rounded-xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all font-bold text-sm"
                      placeholder="e.g. +91 98765 43210"
                    />
                    <button
                      type="button"
                      onClick={() => removePhone(index)}
                      className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Shop Address */}
            <div className="space-y-2 text-left md:col-span-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>Shop Address</span>
              </label>
              <textarea
                name="shopAddress"
                value={formData.shopAddress}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border-2 border-slate-200 focus:border-amber-500 rounded-xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all font-bold text-sm resize-none"
                placeholder="Enter full shop address..."
              />
            </div>

            {/* Global Discount */}
            <div className="space-y-2 text-left">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                <Percent className="w-4 h-4 text-slate-400" />
                <span>Default Discount %</span>
              </label>
              <input
                type="number"
                name="globalDiscountPercentage"
                value={formData.globalDiscountPercentage}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border-2 border-slate-200 focus:border-amber-500 rounded-xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all font-bold text-sm"
                placeholder="90"
              />
              <p className="text-[10px] text-slate-500 font-medium">Applied to all products except net-rate items.</p>
            </div>

            {/* UPI ID */}
            <div className="space-y-2 text-left">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                <QrCode className="w-4 h-4 text-slate-400" />
                <span>UPI ID</span>
              </label>
              <input
                type="text"
                name="upiId"
                value={formData.upiId}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border-2 border-slate-200 focus:border-amber-500 rounded-xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all font-bold text-sm"
                placeholder="e.g. yourname@upi"
              />
            </div>

          </div>

          {/* Action Button */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={logout}
              className="px-5 py-3 rounded-xl transition-all font-bold text-sm flex items-center space-x-2 text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>

            <div className="flex items-center space-x-4">
              {saveSuccess && (
                <div className="flex items-center space-x-1.5 text-emerald-600 animate-in fade-in slide-in-from-right-4">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm font-bold">Saved Successfully</span>
                </div>
              )}
              <button
                type="submit"
                disabled={isSaving}
                className={`px-8 py-3 rounded-xl shadow-md transition-all font-black text-sm uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer active:scale-95 ${
                  isSaving 
                    ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    : 'bg-amber-500 hover:bg-amber-600 text-slate-950 border border-amber-600'
                }`}
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>
          </div>
          
        </form>
      </div>
    </div>
  );
};

export default Settings;
