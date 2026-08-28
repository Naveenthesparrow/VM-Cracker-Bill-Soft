import React, { useRef, useState } from 'react';
import { X, Printer, Share2, DollarSign, CreditCard, Receipt, Loader2, Download } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import html2canvas from 'html2canvas';

export const BillPreview = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  const { settings } = useCart();
  const printAreaRef = useRef();
  const [sharingImage, setSharingImage] = useState(false);

  const handlePrint = () => {
    const printContent = printAreaRef.current;
    if (!printContent) return;

    // Create a hidden iframe and print only the bill HTML inside it
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Bill - ${order.billNumber}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            body { font-family: 'Inter', sans-serif; font-size: 11px; color: #000; background: #fff; padding: 8mm; }
            h1 { font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #b91c1c; margin-bottom: 4px; }
            .header { text-align: center; padding-bottom: 8px; border-bottom: 1.5px dashed #000; margin-bottom: 8px; }
            .header p { font-size: 10px; margin-top: 2px; }
            .greeting { text-align: center; margin: 8px 0; padding: 6px; border-top: 1px dashed #000; border-bottom: 1px dashed #000; }
            .greeting p { font-size: 10px; }
            .details { margin: 8px 0; display: grid; grid-template-columns: 120px 1fr; gap: 4px 8px; font-size: 10px; }
            .details .label { color: #555; }
            .details .value { font-weight: 700; text-align: right; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 10px; }
            th { background: #f3f4f6; padding: 5px 6px; border: 1px solid #000; font-weight: 700; }
            td { padding: 5px 6px; border: 1px solid #000; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .strike { text-decoration: line-through; color: #ef4444; font-size: 9px; }
            .green { color: #059669; font-weight: 800; }
            .totals { margin-top: 8px; border-top: 1.5px solid #000; padding-top: 6px; font-size: 11px; }
            .totals-row { display: flex; justify-content: space-between; margin-bottom: 3px; }
            .totals-row.net { font-weight: 800; font-size: 13px; border-top: 1px solid #000; padding-top: 4px; margin-top: 4px; }
            .footer { margin-top: 12px; text-align: center; font-size: 9px; border-top: 1px dashed #000; padding-top: 8px; color: #555; }
            @media print { @page { size: 80mm auto; margin: 5mm; } }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    doc.close();

    iframe.contentWindow.focus();
    iframe.contentWindow.print();

    // Remove iframe after printing
    setTimeout(() => document.body.removeChild(iframe), 1000);
  };

  const handleWhatsAppShare = async () => {
    if (!printAreaRef.current) return;
    setSharingImage(true);

    try {
      // Capture the bill as a high-quality PNG image
      const canvas = await html2canvas(printAreaRef.current, {
        scale: 2,           // 2x resolution for crisp quality
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const fileName = `Bill-${order.billNumber}-${order.customerName}.png`;

      // ── MOBILE: Use Web Share API to share image directly to WhatsApp ──
      if (navigator.canShare && navigator.share) {
        canvas.toBlob(async (blob) => {
          const file = new File([blob], fileName, { type: 'image/png' });
          if (navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                files: [file],
                title: `Bill - ${order.billNumber}`,
              });
            } catch (e) {
              // User cancelled share — no error needed
            }
          } else {
            // File sharing not supported — download instead
            downloadImage(canvas, fileName);
          }
          setSharingImage(false);
        }, 'image/png');
        return;
      }

      // ── DESKTOP: Download image + open WhatsApp ──
      downloadImage(canvas, fileName);
      // Brief delay then open WhatsApp so user can attach the downloaded image
      setTimeout(() => {
        const note = `Bill ${order.billNumber} for ${order.customerName} - ₹${order.netTotal}. (Attach the downloaded image)`;
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(note)}`, '_blank');
      }, 800);

    } catch (err) {
      console.error('Image capture failed:', err);
    } finally {
      setSharingImage(false);
    }
  };

  // Helper: trigger PNG download
  const downloadImage = (canvas, fileName) => {
    const link = document.createElement('a');
    link.download = fileName;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Generate UPI QR Code URL
  // Format: upi://pay?pa=recipient@upi&pn=RecipientName&am=Amount&cu=INR
  const upiQRUrl = settings.upiId
    ? `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
        `upi://pay?pa=${settings.upiId}&pn=${encodeURIComponent(
          settings.shopName
        )}&am=${order.netTotal}&cu=INR&tn=${encodeURIComponent(order.billNumber)}`
      )}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm no-print">
      {/* Modal Container */}
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
          
          {/* Print Template Wrapper (This matches print-only CSS) */}
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

          {/* Copy of printed receipt for window.print() formatting */}
          <div className="print-only">
            <div className="text-center pb-3 border-b border-dashed border-black">
              <h1 className="text-base font-bold uppercase" style={{ margin: '0' }}>{settings.shopName}</h1>
              <p className="text-[10px]" style={{ margin: '2px 0 0 0' }}>{settings.shopAddress}</p>
              <p className="text-[10px]" style={{ margin: '2px 0 0 0' }}>Phone: {settings.shopPhone}</p>
            </div>

            <div className="my-3 text-[10px] grid grid-cols-[120px_1fr] gap-y-1.5 gap-x-2 items-start" style={{ lineOrigin: '2px' }}>
              <span className="text-gray-700">பில் எண் (Bill No):</span>
              <span className="font-bold text-right">{order.billNumber}</span>
              
              <span className="text-gray-700">தேதி (Date):</span>
              <span className="text-right">{new Date(order.createdAt).toLocaleString()}</span>
              
              <span className="text-gray-700">வாடிக்கையாளர் (Customer):</span>
              <span className="font-bold text-right break-all">{order.customerName} {order.customerPhone ? `(${order.customerPhone})` : ''}</span>
            </div>

            {/* Printed Welcome Greeting */}
            <div className="text-center my-2 py-1.5 border-t border-b border-dashed border-black">
              <p className="text-[9px] font-bold" style={{ margin: 0 }}>அன்பான வாடிக்கையாளர் {order.customerName} அவர்களுக்கு நன்றி!</p>
              <p className="text-[8px]" style={{ margin: '2px 0 0 0' }}>Hi {order.customerName}, Thank you for celebrating with VM Crackers!</p>
            </div>

            <table className="w-full text-left text-[10px] border-collapse" style={{ marginTop: '5px', border: '1px solid black' }}>
              <thead>
                <tr className="font-bold" style={{ backgroundColor: '#f3f4f6' }}>
                  <th style={{ padding: '4px 6px', border: '1px solid black' }}>பொருள் (Item)</th>
                  <th style={{ padding: '4px 6px', border: '1px solid black', textAlign: 'center' }}>விலை (Rate)</th>
                  <th style={{ padding: '4px 6px', border: '1px solid black', textAlign: 'center' }}>அளவு (Qty)</th>
                  <th style={{ padding: '4px 6px', border: '1px solid black', textAlign: 'right' }}>தொகை (Amount)</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => {
                  const discUnitRate = Math.round(item.amount / item.quantity);
                  const isDiscounted = item.rate > discUnitRate;
                  return (
                    <tr key={idx}>
                      <td style={{ padding: '4px 6px', border: '1px solid black' }}>
                        <div className="font-semibold">{item.name}</div>
                        {item.tamilName && <div className="text-[8px] text-gray-500">({item.tamilName})</div>}
                      </td>
                      <td style={{ padding: '4px 6px', border: '1px solid black', textAlign: 'center' }}>
                        {isDiscounted ? (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <span style={{ textDecoration: 'line-through', color: 'red', fontSize: '8px' }}>₹{item.rate}</span>
                            <span style={{ color: '#059669', fontWeight: 'bold', fontSize: '10px' }}>₹{discUnitRate}</span>
                          </div>
                        ) : (
                          <span>₹{item.rate}</span>
                        )}
                      </td>
                      <td style={{ padding: '4px 6px', border: '1px solid black', textAlign: 'center' }}>{item.quantity}</td>
                      <td style={{ padding: '4px 6px', border: '1px solid black', textAlign: 'right', fontWeight: 'bold' }}>₹{item.amount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="mt-3 pt-2 border-t border-dashed border-black text-[10px]">
              <div className="flex justify-between">
                <span>மொத்த மதிப்பு (Gross):</span>
                <span>₹{order.grossTotal}</span>
              </div>
              <div className="flex justify-between" style={{ color: '#059669', fontWeight: 'bold' }}>
                <span>தள்ளுபடி (Saved):</span>
                <span>-₹{order.discountTotal}</span>
              </div>
              <div className="flex justify-between font-bold text-xs" style={{ marginTop: '2px', borderTop: '1px solid black', paddingTop: '2px' }}>
                <span>செலுத்த வேண்டியவை (Total):</span>
                <span style={{ color: '#059669', fontWeight: '900' }}>₹{order.netTotal}</span>
              </div>
            </div>

            <div className="text-center text-[9px]" style={{ marginTop: '15px' }}>
              <p style={{ fontWeight: 'bold' }}>இனிய தீபாவளி நல்வாழ்த்துகள்! மிக்க நன்றி!</p>
            </div>
          </div>

        </div>

        {/* Modal Actions */}
        <div className="flex flex-col p-3 border-t border-slate-200 bg-slate-50 gap-2">
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center space-x-1.5 py-2.5 px-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-extrabold rounded-xl shadow-md transition-all transform active:scale-95 cursor-pointer border border-amber-600 text-xs"
            >
              <Printer className="w-4 h-4" />
              <span>பிரிண்ட் (Print)</span>
            </button>
            
            <button
              onClick={handleWhatsAppShare}
              disabled={sharingImage}
              className="flex-1 flex items-center justify-center space-x-1.5 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-emerald-400 text-white font-extrabold rounded-xl shadow-md transition-all transform active:scale-95 cursor-pointer border border-emerald-700 text-xs disabled:cursor-not-allowed"
            >
              {sharingImage ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Capturing...</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>வாட்ஸ்அப் (WhatsApp)</span>
                </>
              )}
            </button>
          </div>

          {/* Download Image button - useful on desktop */}
          <button
            onClick={async () => {
              if (!printAreaRef.current) return;
              setSharingImage(true);
              try {
                const canvas = await html2canvas(printAreaRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false });
                downloadImage(canvas, `Bill-${order.billNumber}-${order.customerName}.png`);
              } finally {
                setSharingImage(false);
              }
            }}
            disabled={sharingImage}
            className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl border border-slate-300 text-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download as Image (PNG)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
export default BillPreview;
