import React, { useState, useMemo } from 'react';
import { Search, Plus, Save, X, Edit, Power, PowerOff, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const Products = () => {
  const { crackers, refreshData, offlineMode } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Modals / Editing States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // Item ID being edited
  const [editRate, setEditRate] = useState('');
  const [editDiscount, setEditDiscount] = useState('');
  
  // Add Form State
  const [newProductId, setNewProductId] = useState('');
  const [newName, setNewName] = useState('');
  const [newTamilName, setNewTamilName] = useState('');
  const [newCategory, setNewCategory] = useState('SPARKLERS CRACKERS');
  const [newRate, setNewRate] = useState('');
  const [newDiscount, setNewDiscount] = useState('90');
  const [newIsNetRate, setNewIsNetRate] = useState(false);

  // Group Categories
  const categories = useMemo(() => {
    const cats = new Set(crackers.map((c) => c.category));
    return ['All', ...Array.from(cats)];
  }, [crackers]);

  // Filter
  const filteredProducts = useMemo(() => {
    return crackers.filter((p) => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const cleanSearch = searchQuery.toLowerCase().trim();
      return (
        matchesCategory &&
        (cleanSearch === '' ||
          p.productId.toLowerCase().includes(cleanSearch) ||
          p.name.toLowerCase().includes(cleanSearch) ||
          (p.tamilName && p.tamilName.toLowerCase().includes(cleanSearch)))
      );
    });
  }, [crackers, selectedCategory, searchQuery]);

  // Handle Toggle Stock Status
  const handleToggleStock = async (item) => {
    try {
      if (offlineMode) {
        item.inStock = !item.inStock;
        alert('Stock status updated locally! Start backend to sync.');
        refreshData();
        return;
      }
      await axios.put(`${API_URL}/crackers/${item._id}`, {
        inStock: !item.inStock
      });
      refreshData();
    } catch (error) {
      console.error('Failed to toggle stock status:', error);
      alert('Error updating item stock status.');
    }
  };

  // Start Edit Inline
  const startEdit = (item) => {
    setEditingItem(item._id);
    setEditRate(item.rate);
    setEditDiscount(item.discountPercentage);
  };

  // Save Inline Edit
  const saveEdit = async (item) => {
    try {
      const payload = {
        rate: Number(editRate),
        discountPercentage: Number(editDiscount)
      };

      if (offlineMode) {
        item.rate = payload.rate;
        item.discountPercentage = payload.discountPercentage;
        alert('Item updated locally!');
        setEditingItem(null);
        refreshData();
        return;
      }

      await axios.put(`${API_URL}/crackers/${item._id}`, payload);
      setEditingItem(null);
      refreshData();
    } catch (error) {
      console.error('Failed to update cracker details:', error);
      alert('Error saving updates.');
    }
  };

  // Submit Add Cracker Form
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      productId: newProductId.trim(),
      name: newName.trim(),
      tamilName: newTamilName.trim() || undefined,
      category: newCategory,
      rate: Number(newRate),
      discountPercentage: Number(newDiscount),
      isNetRate: newIsNetRate
    };

    try {
      if (offlineMode) {
        crackers.push({ ...payload, _id: `temp_${Date.now()}`, inStock: true });
        alert('Cracker added locally! Start backend to save permanently.');
        setIsAddModalOpen(false);
        // Reset state
        setNewProductId('');
        setNewName('');
        setNewTamilName('');
        setNewRate('');
        refreshData();
        return;
      }

      await axios.post(`${API_URL}/crackers`, payload);
      setIsAddModalOpen(false);
      // Reset state
      setNewProductId('');
      setNewName('');
      setNewTamilName('');
      setNewRate('');
      refreshData();
    } catch (error) {
      console.error('Failed to add cracker:', error);
      alert(error.response?.data?.message || 'Error adding new product.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-60px)] pb-24 pt-4 max-w-5xl mx-auto px-4 no-print text-slate-800">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Products Management</h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">Control pricing, discounts, and inventory stock listings.</p>
        </div>
        
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center space-x-1.5 py-2.5 px-4 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold rounded-xl shadow-lg transition-all transform active:scale-95 cursor-pointer text-xs self-start sm:self-auto"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>New Cracker</span>
        </button>
      </div>

      {/* Filter and Search controls */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        {/* Search */}
        <div className="relative md:col-span-2">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search className="w-4.5 h-4.5" />
          </span>
          <input
            type="search"
            placeholder="Search by Code, Name, or Tamil..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-955 placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-all text-xs font-semibold"
          />
        </div>

        {/* Category Selection */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-slate-700 py-2 px-3 rounded-xl focus:outline-none text-xs font-bold"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Inventory Cards */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((item) => {
            const isEditing = editingItem === item._id;
            return (
              <div 
                key={item._id}
                className={`p-4 bg-white border rounded-2xl flex flex-col justify-between space-y-3.5 transition-all duration-200 shadow-xs ${
                  item.inStock !== false ? 'border-slate-200/80' : 'border-red-200 bg-red-50/20'
                }`}
              >
                {/* Header: Name and Tamil */}
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[9px] font-black font-mono px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded-md">
                      {item.productId}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                      {item.category.replace(' CRACKERS', '')}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-1.5">{item.name}</h4>
                  {item.tamilName && (
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">({item.tamilName})</p>
                  )}
                </div>

                {/* Edit Controls / Details */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                  {isEditing ? (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Rate (₹)
                        </label>
                        <input
                          type="number"
                          value={editRate}
                          onChange={(e) => setEditRate(e.target.value)}
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-slate-950 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Discount (%)
                        </label>
                        <input
                          type="number"
                          disabled={item.isNetRate}
                          value={item.isNetRate ? 0 : editDiscount}
                          onChange={(e) => setEditDiscount(e.target.value)}
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-slate-950 font-bold disabled:opacity-50"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <div className="space-y-0.5">
                        <span className="text-slate-400 text-[10px]">Retail Rate:</span>
                        <p className="text-slate-900 font-bold">₹{item.rate}</p>
                      </div>
                      <div className="space-y-0.5 text-center">
                        <span className="text-slate-400 text-[10px]">Discount:</span>
                        <p className="text-red-600 font-bold">
                          {item.isNetRate ? 'Net Rate' : `${item.discountPercentage}%`}
                        </p>
                      </div>
                      <div className="space-y-0.5 text-right">
                        <span className="text-slate-400 text-[10px]">Disc. Rate:</span>
                        <p className="text-emerald-600 font-extrabold">
                          ₹{Math.round(item.rate * (1 - (item.isNetRate ? 0 : item.discountPercentage) / 100))}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer buttons */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  {/* Stock Toggle */}
                  <button
                    onClick={() => handleToggleStock(item)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                      item.inStock !== false
                        ? 'bg-slate-50 text-emerald-600 border-slate-200 hover:bg-slate-100'
                        : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                    }`}
                  >
                    {item.inStock !== false ? (
                      <>
                        <Power className="w-3.5 h-3.5" />
                        <span>In Stock</span>
                      </>
                    ) : (
                      <>
                        <PowerOff className="w-3.5 h-3.5" />
                        <span>No Stock</span>
                      </>
                    )}
                  </button>

                  {/* Edit buttons */}
                  <div className="flex space-x-1.5">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => setEditingItem(null)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => saveEdit(item)}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Save</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => startEdit(item)}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs border border-slate-200 cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl shadow-xs">
            <p className="text-slate-500 text-sm">No crackers matched this description.</p>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 no-print">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Create New Cracker Item</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-3.5 text-slate-800">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Code/ID
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 173"
                    value={newProductId}
                    onChange={(e) => setNewProductId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 font-bold focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Category Group
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-amber-500 text-xs font-bold"
                  >
                    {categories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Product Name (English)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CRACKLING SPARKLERS"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 placeholder-slate-400 focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Product Name (Tamil / தமிழ்)
                </label>
                <input
                  type="text"
                  placeholder="e.g. கிராக்லிங் கம்பி"
                  value={newTamilName}
                  onChange={(e) => setNewTamilName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 placeholder-slate-400 focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Original Rate (₹)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="Rate"
                    value={newRate}
                    onChange={(e) => setNewRate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    required
                    disabled={newIsNetRate}
                    placeholder="90"
                    value={newIsNetRate ? '0' : newDiscount}
                    onChange={(e) => setNewDiscount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-950 focus:outline-none focus:border-amber-500 text-xs disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="newIsNetRate"
                  checked={newIsNetRate}
                  onChange={(e) => setNewIsNetRate(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 bg-slate-50 border-slate-200 focus:ring-0"
                />
                <label htmlFor="newIsNetRate" className="text-xs text-slate-600 font-bold select-none cursor-pointer flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                  <span>Is Net Rate Item (No discount applies)</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-black rounded-xl shadow-lg transition-all text-xs cursor-pointer"
              >
                Create Product
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default Products;
