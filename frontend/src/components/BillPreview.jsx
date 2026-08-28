import React, { useRef, useState } from 'react';
import { X, Printer, Share2, Download, Loader2, Receipt, FileText } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const BillPreview = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  const { settings } = useCart();
  const billRef = useRef();
  const [loading, setLoading] = useState(false);

  // ── Capture bill as canvas ──────────────────────────────────────────────
  const captureCanvas = async () => {
    return await html2canvas(billRef.current, {
      scale: 3,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: billRef.current.scrollWidth,
      windowHeight: billRef.current.scrollHeight,
    });
  };

  // ── Download PDF ─────────────────────────────────────────────────────────
  const handleDownloadPDF = async () => {
    setLoading(true);
    try {
      const canvas = await captureCanvas();
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgW = pageW;
      const imgH = (canvas.height * pageW) / canvas.width;
      // If content taller than page, scale to fit
      if (imgH <= pageH) {
        pdf.addImage(imgData, 'PNG', 0, 0, imgW, imgH);
      } else {
        pdf.addImage(imgData, 'PNG', 0, 0, imgW, pageH);
      }
      pdf.save(`Bill-${order.billNumber}-${order.customerName}.pdf`);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // ── Download PNG Image ───────────────────────────────────────────────────
  const handleDownloadImage = async () => {
    setLoading(true);
    try {
      const canvas = await captureCanvas();
      const link = document.createElement('a');
      link.download = `Bill-${order.billNumber}-${order.customerName}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // ── Print ────────────────────────────────────────────────────────────────
  const handlePrint = async () => {
    setLoading(true);
    try {
      const canvas = await captureCanvas();
      const imgData = canvas.toDataURL('image/png');
      const iframe = document.createElement('iframe');
      iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:none;';
      document.body.appendChild(iframe);
      const doc = iframe.contentWindow.document;
      doc.open();
      doc.write(`<!DOCTYPE html><html><head><style>
        *{margin:0;padding:0;box-sizing:border-box;}
        body{background:#fff;}
        img{width:100%;height:auto;display:block;}
        @page{size:A5;margin:5mm;}
      </style></head><body><img src="${imgData}"/></body></html>`);
      doc.close();
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => document.body.removeChild(iframe), 1500);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // ── WhatsApp Share ───────────────────────────────────────────────────────
  const handleWhatsAppShare = async () => {
    setLoading(true);
    try {
      const canvas = await captureCanvas();
      const fileName = `Bill-${order.billNumber}-${order.customerName}.png`;
      if (navigator.canShare && navigator.share) {
        canvas.toBlob(async (blob) => {
          const file = new File([blob], fileName, { type: 'image/png' });
          if (navigator.canShare({ files: [file] })) {
            try { await navigator.share({ files: [file], title: `Bill - ${order.billNumber}` }); }
            catch (e) { /* cancelled */ }
          } else {
            downloadCanvasAsImage(canvas, fileName);
          }
          setLoading(false);
        }, 'image/png');
        return;
      }
      // Desktop fallback: download image then open WhatsApp
      downloadCanvasAsImage(canvas, fileName);
      setTimeout(() => {
        const msg = `Bill ${order.billNumber} for ${order.customerName} - ₹${order.netTotal} (Attach the downloaded image)`;
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
      }, 800);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const downloadCanvasAsImage = (canvas, fileName) => {
    const link = document.createElement('a');
    link.download = fileName;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // ── Bill Data Computations ───────────────────────────────────────────────
  const billDate = new Date(order.createdAt);
  const formattedDate = billDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const formattedTime = billDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-black/80 backdrop-blur-sm">
      {/* Modal */}
      <div className="relative flex flex-col w-full max-w-md h-[95vh] md:h-[92vh] bg-slate-100 rounded-2xl shadow-2xl overflow-hidden">

        {/* ── Top Bar ── */}
        <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shrink-0">
          <div className="flex items-center space-x-2">
            <Receipt className="w-4 h-4 text-amber-500" />
            <span className="font-black text-slate-800 text-sm">பில் விவரம்</span>
            <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">{order.billNumber}</span>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Scrollable Bill Area ── */}
        <div className="flex-1 overflow-y-auto p-3 md:p-4">

          {/* ╔══════════════════════════════════════╗
              ║        PROFESSIONAL BILL DESIGN       ║
              ╚══════════════════════════════════════╝ */}
          <div
            ref={billRef}
            style={{
              background: '#fff',
              width: '100%',
              fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
              color: '#111',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
            }}
          >
            {/* ── Header Banner ── */}
            <div style={{
              background: 'linear-gradient(135deg, #7f1d1d 0%, #b91c1c 50%, #dc2626 100%)',
              padding: '20px 24px 16px',
              textAlign: 'center',
              position: 'relative',
            }}>
              {/* Decorative circles */}
              <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
              <div style={{ position: 'absolute', bottom: -15, left: -15, width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

              <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 4 }}>
                🎆 {settings.shopName}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', marginBottom: 2 }}>
                {settings.shopAddress}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.90)', fontWeight: 700 }}>
                📞 {settings.shopPhone}
              </div>
              <div style={{ marginTop: 10, display: 'inline-block', background: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: '3px 14px' }}>
                <span style={{ color: '#fde68a', fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>✦ OFFICIAL INVOICE ✦</span>
              </div>
            </div>

            {/* ── Bill Info Row ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: '#fef2f2', padding: '12px 20px', borderBottom: '2px solid #fee2e2' }}>
              <div>
                <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 3 }}>Bill Number</div>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#b91c1c', fontFamily: 'monospace' }}>{order.billNumber}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 3 }}>Date & Time</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#374151' }}>{formattedDate}</div>
                <div style={{ fontSize: 10, color: '#6b7280' }}>{formattedTime}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 3 }}>Payment</div>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#065f46', background: '#d1fae5', padding: '2px 8px', borderRadius: 6 }}>
                  {order.paymentMode || 'Cash'}
                </div>
              </div>
            </div>

            {/* ── Customer Info ── */}
            <div style={{ padding: '12px 20px', background: '#fff', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#b91c1c,#dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 15, flexShrink: 0 }}>
                {order.customerName?.charAt(0)?.toUpperCase() || 'C'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>வாடிக்கையாளர் (Customer)</div>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#111827', marginTop: 1 }}>{order.customerName}</div>
                {order.customerPhone && (
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 1 }}>📞 {order.customerPhone}</div>
                )}
              </div>
            </div>

            {/* ── Items Table ── */}
            <div style={{ padding: '0 0 0 0' }}>
              {/* Table Header */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 45px 72px', background: '#1f2937', padding: '8px 16px', gap: 4 }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: '#d1d5db', textTransform: 'uppercase', letterSpacing: 0.5 }}>பொருள் (Item)</div>
                <div style={{ fontSize: 9, fontWeight: 800, color: '#d1d5db', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' }}>விலை (Rate)</div>
                <div style={{ fontSize: 9, fontWeight: 800, color: '#d1d5db', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' }}>Qty</div>
                <div style={{ fontSize: 9, fontWeight: 800, color: '#d1d5db', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'right' }}>Amount</div>
              </div>

              {/* Table Rows */}
              {order.items.map((item, idx) => {
                const discUnitRate = Math.round(item.amount / item.quantity);
                const isDiscounted = item.rate > discUnitRate;
                return (
                  <div key={idx} style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 80px 45px 72px',
                    padding: '9px 16px',
                    gap: 4,
                    background: idx % 2 === 0 ? '#fff' : '#f9fafb',
                    borderBottom: '1px solid #f3f4f6',
                    alignItems: 'center',
                  }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#111827', lineHeight: 1.3 }}>{item.name}</div>
                      {item.tamilName && (
                        <div style={{ fontSize: 9, color: '#9ca3af', marginTop: 1 }}>({item.tamilName})</div>
                      )}
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      {isDiscounted ? (
                        <>
                          <div style={{ fontSize: 9, color: '#ef4444', textDecoration: 'line-through' }}>₹{item.rate}</div>
                          <div style={{ fontSize: 11, fontWeight: 800, color: '#059669' }}>₹{discUnitRate}</div>
                        </>
                      ) : (
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#374151' }}>₹{item.rate}</div>
                      )}
                    </div>
                    <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 800, color: '#111827' }}>{item.quantity}</div>
                    <div style={{ textAlign: 'right', fontSize: 12, fontWeight: 900, color: '#111827' }}>₹{item.amount}</div>
                  </div>
                );
              })}
            </div>

            {/* ── Totals ── */}
            <div style={{ padding: '12px 20px', background: '#f9fafb', borderTop: '2px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>மொத்த மதிப்பு (Gross Total)</span>
                <span style={{ fontSize: 11, color: '#374151', fontWeight: 700 }}>₹{order.grossTotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 11, color: '#059669', fontWeight: 700 }}>🎉 தள்ளுபடி (Discount Saved)</span>
                <span style={{ fontSize: 11, color: '#059669', fontWeight: 800 }}>-₹{order.discountTotal}</span>
              </div>
              {/* Net Total Highlight Box */}
              <div style={{
                background: 'linear-gradient(135deg,#b91c1c,#dc2626)',
                borderRadius: 10,
                padding: '10px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span style={{ fontSize: 12, color: '#fff', fontWeight: 800 }}>செலுத்த வேண்டியவை (Net Payable)</span>
                <span style={{ fontSize: 20, color: '#fde68a', fontWeight: 900, fontFamily: 'monospace' }}>₹{order.netTotal}</span>
              </div>
            </div>

            {/* ── Thank You Banner ── */}
            <div style={{
              background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
              padding: '14px 20px',
              textAlign: 'center',
              borderTop: '2px dashed #fcd34d',
            }}>
              <div style={{ fontSize: 12, fontWeight: 900, color: '#92400e', marginBottom: 3 }}>
                அன்பான வாடிக்கையாளர் {order.customerName} அவர்களுக்கு நன்றி! 🙏
              </div>
              <div style={{ fontSize: 10, color: '#b45309', fontWeight: 600 }}>
                Thank you for celebrating Diwali with {settings.shopName}!
              </div>
              <div style={{ fontSize: 9, color: '#d97706', marginTop: 6, letterSpacing: 0.5 }}>
                ✦ இனிய தீபாவளி நல்வாழ்த்துகள் ✦
              </div>
            </div>

            {/* ── Footer ── */}
            <div style={{ background: '#1f2937', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 9, color: '#9ca3af' }}>{settings.shopAddress}</div>
                <div style={{ fontSize: 9, color: '#9ca3af' }}>{settings.shopPhone}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 9, color: '#6b7280' }}>Powered by VM Billing</div>
                <div style={{ fontSize: 8, color: '#4b5563', fontFamily: 'monospace' }}>{order.billNumber}</div>
              </div>
            </div>
          </div>
          {/* End of bill design */}
        </div>

        {/* ── Action Buttons ── */}
        <div className="shrink-0 p-3 bg-white border-t border-slate-200 space-y-2">
          <div className="flex gap-2">
            {/* Print */}
            <button
              onClick={handlePrint}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-xl text-xs shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-60 border border-amber-600"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            {/* WhatsApp */}
            <button
              onClick={handleWhatsAppShare}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-60 border border-emerald-700"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>WhatsApp</span>
            </button>
          </div>

          <div className="flex gap-2">
            {/* Download PDF */}
            <button
              onClick={handleDownloadPDF}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-60 border border-blue-700"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
              <span>Download PDF</span>
            </button>

            {/* Download Image */}
            <button
              onClick={handleDownloadImage}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-slate-700 hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-60 border border-slate-800"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>Save Image</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BillPreview;
