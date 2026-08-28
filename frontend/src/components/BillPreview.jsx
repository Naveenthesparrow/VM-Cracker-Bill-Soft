import React, { useRef } from 'react';
import { X, Printer, Share2, DollarSign, CreditCard, Receipt } from 'lucide-react';
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

  // Generate UPI QR Code URL
  const upiQRUrl = settings.upiId
    ? `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
        `upi://pay?pa=${settings.upiId}&pn=${encodeURIComponent(
          settings.shopName
        )}&am=${order.netTotal}&cu=INR&tn=${encodeURIComponent(order.billNumber)}`
      )}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm no-print">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[95vh] flex flex-col overflow-hidden mx-4">

        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center space-x-2">
            <Receipt className="w-5 h-5 text-amber-600" />
            <h2 className="font-black text-slate-800 text-sm">பில் விவரம் (Bill Details)</h2>
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
          
          {/* Screen Preview Card */}
          <div 
            ref={printAreaRef} 
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

            {/* Totals */}
            <div className="mt-4 pt-3 border-t border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600 font-semibold">
                <span>மொத்த மதிப்பு (Gross):</span>
                <span className="font-mono">₹{order.grossTotal}</span>
              </div>
              <div className="flex justify-between text-emerald-600 font-extrabold">
                <span>தள்ளுபடி (Saved):</span>
                <span className="font-mono">-₹{order.discountTotal}</span>
              </div>
              <div className="flex justify-between font-black text-sm border-t border-slate-300 pt-2 mt-1">
                <span>செலுத்த வேண்டியவை (Total):</span>
                <span className="text-emerald-600 font-mono">₹{order.netTotal}</span>
              </div>
              {order.paymentMode && (
                <div className="flex justify-between text-slate-500 font-semibold text-[11px]">
                  <span>Payment Mode:</span>
                  <span className="font-bold text-slate-700">{order.paymentMode}</span>
                </div>
              )}
            </div>

            {/* UPI QR Code */}
            {upiQRUrl && (
              <div className="mt-4 flex flex-col items-center pt-3 border-t border-dashed border-slate-300">
                <p className="text-[11px] text-slate-500 font-semibold mb-2">UPI Payment QR Code</p>
                <img src={upiQRUrl} alt="UPI QR" className="w-28 h-28 rounded border border-slate-200" />
                <p className="text-[10px] text-slate-400 mt-1 font-mono">{settings.upiId}</p>
              </div>
            )}

            {/* Footer */}
            <div className="text-center mt-5 pt-3 border-t border-dashed border-slate-300">
              <p className="text-xs font-black text-slate-700">இனிய தீபாவளி நல்வாழ்த்துகள்! மிக்க நன்றி!</p>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              THERMAL RECEIPT — only visible when window.print() is called
              Formatted for 58mm / 80mm Bluetooth thermal printers
              ───────────────────────────────────────────────────────────── */}
          <div className="thermal-receipt">

            {/* Shop Header */}
            <div style={{ textAlign: 'center', borderBottom: '1px dashed black', paddingBottom: '4px', marginBottom: '4px' }}>
              <div style={{ fontWeight: '900', fontSize: '11pt', letterSpacing: '1px' }}>{settings.shopName}</div>
              <div style={{ fontSize: '7pt', marginTop: '2px' }}>{settings.shopAddress}</div>
              <div style={{ fontSize: '7pt', marginTop: '1px' }}>Ph: {settings.shopPhone}</div>
            </div>

            {/* Bill Meta */}
            <div style={{ fontSize: '7pt', marginBottom: '4px', lineHeight: '1.5' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Bill No:</span>
                <span style={{ fontWeight: 'bold' }}>{order.billNumber}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Date:</span>
                <span>{new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Customer:</span>
                <span style={{ fontWeight: 'bold' }}>{order.customerName}{order.customerPhone ? ` / ${order.customerPhone}` : ''}</span>
              </div>
            </div>

            {/* Greeting */}
            <div style={{ textAlign: 'center', borderTop: '1px dashed black', borderBottom: '1px dashed black', padding: '3px 0', margin: '4px 0', fontSize: '7pt' }}>
              <div style={{ fontWeight: 'bold' }}>அன்பான வாடிக்கையாளர் {order.customerName} அவர்களுக்கு நன்றி!</div>
              <div>Happy Diwali from VM Crackers!</div>
            </div>

            {/* Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '7pt', marginTop: '4px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid black', borderTop: '1px solid black' }}>
                  <th style={{ textAlign: 'left',  padding: '2px 1px', width: '40%' }}>ITEM</th>
                  <th style={{ textAlign: 'center', padding: '2px 1px', width: '22%' }}>RATE</th>
                  <th style={{ textAlign: 'center', padding: '2px 1px', width: '10%' }}>QTY</th>
                  <th style={{ textAlign: 'right',  padding: '2px 1px', width: '28%' }}>TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => {
                  const discRate = Math.round(item.amount / item.quantity);
                  return (
                    <tr key={idx} style={{ borderBottom: '1px dotted #aaa' }}>
                      <td style={{ padding: '2px 1px', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: 'bold', lineHeight: '1.2' }}>{item.name}</div>
                        {item.tamilName && <div style={{ fontSize: '6pt' }}>({item.tamilName})</div>}
                      </td>
                      <td style={{ textAlign: 'center', padding: '2px 1px', verticalAlign: 'top' }}>
                        {item.rate > discRate ? (
                          <div>
                            <div style={{ textDecoration: 'line-through', fontSize: '6pt' }}>₹{item.rate}</div>
                            <div style={{ fontWeight: 'bold' }}>₹{discRate}</div>
                          </div>
                        ) : <span>₹{item.rate}</span>}
                      </td>
                      <td style={{ textAlign: 'center', padding: '2px 1px', fontWeight: 'bold', verticalAlign: 'top' }}>{item.quantity}</td>
                      <td style={{ textAlign: 'right',  padding: '2px 1px', fontWeight: 'bold', verticalAlign: 'top' }}>₹{item.amount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Totals */}
            <div style={{ borderTop: '1px solid black', marginTop: '4px', paddingTop: '4px', fontSize: '7pt', lineHeight: '1.6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Gross Total:</span><span>₹{order.grossTotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Discount (Saved):</span><span>-₹{order.discountTotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '900', fontSize: '9pt', borderTop: '1px solid black', marginTop: '2px', paddingTop: '2px' }}>
                <span>NET PAYABLE:</span><span>₹{order.netTotal}</span>
              </div>
              {order.paymentMode && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                  <span>Payment:</span><span style={{ fontWeight: 'bold' }}>{order.paymentMode}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ textAlign: 'center', borderTop: '1px dashed black', marginTop: '8px', paddingTop: '4px', fontSize: '7pt' }}>
              <div style={{ fontWeight: 'bold' }}>இனிய தீபாவளி நல்வாழ்த்துகள்!</div>
              <div>Thank you! Visit again.</div>
              <div style={{ marginTop: '2px' }}>*** VM CRACKERS ***</div>
            </div>

          </div>

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
  );
};
export default BillPreview;
