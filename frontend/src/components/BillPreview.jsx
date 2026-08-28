import React, { useRef } from 'react';
import { X, Printer, Share2, Receipt } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';

export const BillPreview = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  const { settings } = useCart();
  const printAreaRef = useRef();

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const itemsText = order.items
      .map((item, index) => `${index + 1}. ${item.name} (${item.quantity} Qty) - ₹${item.amount}`)
      .join('\n');

    const message = `*INVOICE: ${order.billNumber}*\n` +
      `--------------------------------\n` +
      `*${settings.shopName}*\n` +
      `${settings.shopAddress}\n` +
      `Phone: ${settings.shopPhone}\n` +
      `--------------------------------\n` +
      `*Customer:* ${order.customerName}\n` +
      `${order.customerPhone ? `*Phone:* ${order.customerPhone}\n` : ''}` +
      `*Date:* ${new Date(order.createdAt).toLocaleDateString()} ${new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}\n` +
      `--------------------------------\n` +
      `*Items:*\n${itemsText}\n` +
      `--------------------------------\n` +
      `*Gross Total:* ₹${order.grossTotal}\n` +
      `*Discount:* -₹${order.discountTotal}\n` +
      `*Net Payable:* ₹${order.netTotal}\n` +
      `*Payment Mode:* ${order.paymentMode}\n` +
      `--------------------------------\n` +
      `Thank you for your business! 🎇`;

    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const renderReceiptCard = (isPrint = false) => {
    return (
      <div 
        ref={isPrint ? null : printAreaRef} 
        className="p-3.5 md:p-6 bg-white text-black rounded-lg shadow-inner max-w-md mx-auto w-full"
        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        {/* Invoice Header */}
        <div className="text-center pb-4 border-b border-dashed border-gray-300">
          <h1 className="text-2xl font-black tracking-wider text-rose-650 uppercase">{settings.shopName}</h1>
          <p className="text-xs text-slate-600 leading-tight mt-1.5 font-medium">{settings.shopAddress}</p>
          <p className="text-xs font-extrabold text-slate-800 mt-1">Phone: {settings.shopPhone}</p>
        </div>

        {/* Personalized Customer Welcome Greeting */}
        <div className="my-4 p-4 bg-rose-50 border-2 border-dashed border-rose-200 rounded-2xl text-center space-y-1">
          <h3 className="text-xs font-black text-rose-950 leading-snug">அன்பான வாடிக்கையாளர் {order.customerName} அவர்களுக்கு நன்றி!</h3>
          <p className="text-[11px] font-extrabold text-rose-700 leading-snug">Hi {order.customerName}, Thank you for celebrating this Diwali with VM Crackers!</p>
        </div>

        {/* Bill Details */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 my-4 text-xs grid grid-cols-[140px_1fr] gap-y-2.5 gap-x-3 items-start">
          <span className="font-bold text-slate-500">பில் எண் (Bill No):</span>
          <span className="font-mono font-black text-slate-800 bg-slate-200 px-2 py-0.5 rounded text-[10px] justify-self-end">{order.billNumber}</span>
          
          <span className="font-bold text-slate-500">தேதி (Date):</span>
          <span className="font-black text-slate-800 text-right">
            {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </span>
          
          <span className="font-bold text-slate-500">வாடிக்கையாளர் (Customer):</span>
          <span className="font-black text-slate-800 text-right break-all">{order.customerName}</span>
          
          {order.customerPhone && (
            <>
              <span className="font-bold text-slate-500">போன் (Phone):</span>
              <span className="font-black text-slate-800 text-right">{order.customerPhone}</span>
            </>
          )}
        </div>

        {/* Items Table */}
        <table className="w-full text-left text-xs border-collapse mt-4 border border-slate-300 table-layout-fixed">
          <thead>
            <tr className="bg-slate-100 font-bold text-gray-700 text-[11px]">
              <th className="py-2 px-1 md:px-2 border border-slate-300 w-[42%]">பொருள் (Item)</th>
              <th className="py-2 px-1 md:px-2 border border-slate-300 text-center w-[23%]">விலை (Rate)</th>
              <th className="py-2 px-1 md:px-2 border border-slate-300 text-center w-[13%]">அளவு (Qty)</th>
              <th className="py-2 px-1 md:px-2 border border-slate-300 text-right w-[22%]">தொகை (Amount)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {order.items.map((item, idx) => {
              const discUnitRate = Math.round(item.amount / item.quantity);
              const isDiscounted = item.rate > discUnitRate;
              return (
                <tr key={idx} className="text-gray-900 hover:bg-slate-50/50">
                  <td className="py-2 px-1 md:px-2 border border-slate-200 break-words">
                    <div className="font-bold text-slate-800 leading-tight">{item.name}</div>
                    {item.tamilName && (
                      <div className="text-[9px] text-slate-500 font-medium mt-0.5">({item.tamilName})</div>
                    )}
                  </td>
                  <td className="py-2 px-1 md:px-2 border border-slate-200 text-center">
                    {isDiscounted ? (
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-[9px] text-red-500 line-through font-medium">₹{item.rate}</span>
                        <span className="text-[11px] font-black text-emerald-600">₹{discUnitRate}</span>
                      </div>
                    ) : (
                      <span className="text-[11px] font-bold text-slate-700">₹{item.rate}</span>
                    )}
                  </td>
                  <td className="py-2 px-1 md:px-2 border border-slate-200 text-center font-extrabold text-slate-800">{item.quantity}</td>
                  <td className="py-2 px-1 md:px-2 border border-slate-200 text-right font-black text-slate-900">₹{item.amount}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Totals Summary */}
        <div className="mt-4 pt-3 border-t border-dashed border-gray-300 text-xs space-y-1.5">
          <div className="flex justify-between text-gray-600">
            <span>மொத்த மதிப்பு (Gross Total)</span>
            <span>₹{order.grossTotal}</span>
          </div>
          <div className="flex justify-between text-emerald-600 font-bold">
            <span>தள்ளுபடி (Discount Saved)</span>
            <span>-₹{order.discountTotal}</span>
          </div>
          <div className="flex justify-between text-gray-900 pt-1 border-t border-gray-200">
            <span className="font-extrabold text-sm">செலுத்த வேண்டியவை (Net Payable)</span>
            <span className="text-base text-emerald-600 font-black font-mono">₹{order.netTotal}</span>
          </div>
        </div>

        {/* Receipt Footer */}
        <div className="text-center text-[10px] text-slate-500 mt-6 pt-3 border-t border-dashed border-slate-200">
          <p className="font-bold text-slate-800">இனிய தீபாவளி நல்வாழ்த்துகள்!</p>
          <p className="mt-0.5 font-medium">மிக்க நன்றி! மீண்டும் வருக!</p>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Screen Modal view */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs no-print">
        <div className="relative flex flex-col w-full max-w-lg h-[90vh] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center space-x-2">
              <Receipt className="w-5 h-5 text-slate-500 animate-pulse" />
              <h2 className="text-lg font-extrabold text-slate-800">பில் விவரம் (Bill Details)</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Scrollable Receipt Area */}
          <div className="flex-1 p-3 md:p-6 overflow-y-auto bg-slate-100">
            {renderReceiptCard(false)}
          </div>

          {/* Modal Actions */}
          <div className="flex p-3 border-t border-slate-200 bg-slate-50 space-x-2.5">
            <button
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-extrabold rounded-xl shadow-md transition-all transform active:scale-95 cursor-pointer border border-amber-600 text-xs"
            >
              <Printer className="w-4 h-4" />
              <span>பிரிண்ட் (Print)</span>
            </button>
            <button
              onClick={handleWhatsAppShare}
              className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold rounded-xl shadow-md transition-all transform active:scale-95 cursor-pointer border border-emerald-700 text-xs"
            >
              <Share2 className="w-4 h-4" />
              <span>வாட்ஸ்அப் (WhatsApp)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Separate print-only container (Rendered outside the modal so it bypasses no-print) */}
      <div className="print-only">
        {renderReceiptCard(true)}
      </div>
    </>
  );
};

export default BillPreview;
