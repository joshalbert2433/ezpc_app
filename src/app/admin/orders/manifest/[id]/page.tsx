'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Printer, ArrowLeft, Package, CheckSquare, Square, Truck, Barcode, Download, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Order {
  _id: string;
  items: any[];
  shippingAddress: any;
  paymentMethod: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export default function AdminManifestPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/login');
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/admin/orders/${id}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        } else {
          toast.error('Failed to load manifest');
        }
      } catch (err) {
        toast.error('Error fetching order details');
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'admin') fetchOrder();
  }, [id, user, authLoading, router]);

  const generatePDF = () => {
    if (!order) return;
    const doc = new jsPDF() as any;
    const orderId = order._id.slice(-8).toUpperCase();

    // 1. Header Section
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, 210, 40, 'F'); // Black top bar
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(30);
    doc.setFont('helvetica', 'bold');
    doc.text('WAREHOUSE MANIFEST', 15, 25);
    
    doc.setFontSize(10);
    doc.text('INTERNAL LOGISTICS // SECURE DISPATCH', 15, 32);
    
    doc.setFontSize(14);
    doc.text(`EZ-${orderId}`, 195, 25, { align: 'right' });

    // 2. Info Grid
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('DESTINATION ENDPOINT:', 15, 55);
    doc.text('REGISTRY DATA:', 120, 55);

    doc.setLineWidth(1);
    doc.line(15, 58, 90, 58);
    doc.line(120, 58, 195, 58);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text(order.shippingAddress.fullName, 15, 65);
    
    doc.setFontSize(9);
    let y = 70;
    doc.text(order.shippingAddress.phone, 15, y);
    y += 5;
    doc.text(`${order.shippingAddress.street}, ${order.shippingAddress.houseUnit || ''}`, 15, y);
    y += 5;
    doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}`, 15, y);

    // Registry Side
    doc.setFontSize(9);
    doc.text(`ORDER DATE: ${new Date(order.createdAt).toLocaleDateString()}`, 120, 65);
    doc.text(`PAYMENT: ${order.paymentMethod.toUpperCase()}`, 120, 70);
    doc.text(`PRIORITY: ${order.totalAmount > 1000 ? 'HIGH (PREMIUM)' : 'STANDARD'}`, 120, 75);
    doc.text(`OPERATOR: ${user?.name || 'SYSTEM'}`, 120, 80);

    // 3. Picking Table
    const tableColumn = ["PICK", "COMPONENT IDENTIFIER", "QTY", "SYSTEM ID"];
    const tableRows = order.items.map(item => [
      "[  ]", // Pick checkbox
      item.name.toUpperCase(),
      item.quantity.toString(),
      item.productId.slice(-12).toUpperCase()
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 95,
      theme: 'plain',
      headStyles: { 
        fillColor: [0, 0, 0], 
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10
      },
      bodyStyles: {
        fontSize: 10,
        cellPadding: 8
      },
      columnStyles: {
        0: { cellWidth: 20, fontStyle: 'bold', fontSize: 14 }, // PICK
        1: { cellWidth: 'auto', fontStyle: 'bold' }, // NAME
        2: { cellWidth: 20, halign: 'center', fontStyle: 'bold', fontSize: 16 }, // QTY
        3: { cellWidth: 40, halign: 'right', fontSize: 8 } // ID
      },
      didDrawCell: (data) => {
        if (data.section === 'body' && data.column.index === 2) {
            // Draw box around QTY
            doc.setLineWidth(0.5);
            doc.rect(data.cell.x + 2, data.cell.y + 2, data.cell.width - 4, data.cell.height - 4);
        }
      }
    });

    // 4. Verification Footer
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    
    doc.setLineWidth(0.5);
    doc.rect(15, finalY, 180, 40); // Verification Box
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('LOGISTICS VERIFICATION:', 20, finalY + 10);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('[ ] Packaged with ESD Protection', 20, finalY + 20);
    doc.text('[ ] Quality Assurance Passed', 20, finalY + 28);

    doc.text('DISPATCHER AUTHENTICATION:', 120, finalY + 10);
    doc.line(120, finalY + 30, 185, finalY + 30); // Signature line
    doc.setFontSize(6);
    doc.text('AUTHORIZED SIGNATURE REQUIRED', 120, finalY + 34);

    // Final Branding
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(`EZPC_ AUTOMATED LOGISTICS SYSTEM // GENERATED: ${new Date().toLocaleString()}`, 105, 285, { align: 'center' });

    doc.save(`EZPC_Manifest_${orderId}.pdf`);
    toast.success('Manifest PDF Generated');
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8 md:p-16 font-mono print:p-0 print:bg-white">
      {/* Action Bar - Hidden on Print */}
      <div className="max-w-5xl mx-auto mb-10 flex justify-between items-center print:hidden">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Terminal
        </button>
        <div className="flex gap-4">
          <button 
            onClick={generatePDF}
            className="bg-slate-900 text-white px-8 py-3 rounded-none font-black flex items-center gap-3 shadow-2xl transition-all active:scale-95 text-xs uppercase tracking-[0.2em]"
          >
            <Download size={16} /> Export PDF
          </button>
          <button 
            onClick={handlePrint}
            className="bg-white text-slate-900 border-2 border-slate-900 px-8 py-3 rounded-none font-black flex items-center gap-3 shadow-sm transition-all active:scale-95 text-xs uppercase tracking-[0.2em]"
          >
            <Printer size={16} /> Browser Print
          </button>
        </div>
      </div>

      {/* Manifest Document */}
      <div className="max-w-5xl mx-auto bg-white border-4 border-slate-900 p-12 print:border-2 print:p-8">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-12 border-b-4 border-slate-900 pb-8">
          <div>
            <p className="text-4xl font-black uppercase tracking-tighter mb-2">Warehouse Manifest</p>
            <p className="text-sm font-bold bg-slate-900 text-white inline-block px-3 py-1">INTERNAL USE ONLY // LOGISTICS UNIT</p>
          </div>
          <div className="text-right">
            <Barcode size={64} className="mb-2 ml-auto" />
            <p className="text-xl font-black">EZ-{order._id.slice(-8).toUpperCase()}</p>
          </div>
        </div>

        {/* Dispatch Grid */}
        <div className="grid grid-cols-2 gap-16 mb-12">
          <div className="border-l-4 border-slate-900 pl-6">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Destination</p>
            <p className="text-xl font-black mb-2">{order.shippingAddress.fullName}</p>
            <div className="text-sm font-bold leading-relaxed">
              {order.shippingAddress.phone}<br />
              {order.shippingAddress.street}, {order.shippingAddress.houseUnit || ''}<br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Batch Info</p>
            <div className="space-y-1 font-bold">
              <p>ORDER DATE: {new Date(order.createdAt).toLocaleDateString()}</p>
              <p>PAYMENT: {order.paymentMethod.toUpperCase()}</p>
              <p>PRIORITY: {order.totalAmount > 1000 ? 'HIGH (PREMIUM)' : 'STANDARD'}</p>
            </div>
          </div>
        </div>

        {/* Picking Table */}
        <div className="mb-12">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-4 border-slate-900">
                <th className="py-4 text-xs font-black uppercase w-16">PICK</th>
                <th className="py-4 text-xs font-black uppercase">COMPONENT IDENTIFIER</th>
                <th className="py-4 text-xs font-black uppercase text-center w-24">QTY</th>
                <th className="py-4 text-xs font-black uppercase text-right">SKU/ID</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-100">
              {order.items.map((item, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="py-8">
                    <Square size={32} className="text-slate-300" />
                  </td>
                  <td className="py-8">
                    <p className="font-black text-lg leading-none mb-2">{item.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Verify Serial Number before packing</p>
                  </td>
                  <td className="py-8 text-center">
                    <span className="text-3xl font-black border-2 border-slate-900 px-4 py-1">{item.quantity}</span>
                  </td>
                  <td className="py-8 text-right font-bold text-xs">
                    {item.productId.toUpperCase()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Dispatch Footnote */}
        <div className="grid grid-cols-2 gap-12 pt-12 border-t-4 border-slate-900">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Truck size={24} />
              <p className="text-sm font-black uppercase tracking-widest">Logistics Confirmation</p>
            </div>
            <div className="space-y-6">
              <div className="flex items-center gap-4 text-xs font-bold uppercase">
                <Square size={20} /> Packaged with ESD Protection
              </div>
              <div className="flex items-center gap-4 text-xs font-bold uppercase">
                <Square size={20} /> Quality Assurance Verified
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-between items-end">
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Dispatcher Signature</p>
              <div className="w-64 h-px bg-slate-900 mt-12"></div>
            </div>
            <p className="text-[10px] font-bold text-slate-400 text-right mt-8 leading-relaxed italic">
              EZPC_ Automated Logistics System v4.0.2<br />
              Secure Dispatch Manifest // Internal Revision
            </p>
          </div>
        </div>
      </div>

<style jsx global>{`
  @media print {
    /* Ensure elements like header, sidebar, etc., are hidden during print */
    .print\\:hidden,
    .AdminSidebar,
    .AdminHeader,
    header,
    aside {
      display: none !important;
    }

    /* Remove container paddings/margins from parent layouts */
    main, .flex, .min-h-screen {
      display: block !important;
      padding: 0 !important;
      margin: 0 !important;
      background: white !important;
    }

    .min-h-screen {
      min-height: auto !important;
    }

    @page {
      margin: 15mm;
      size: portrait;
    }

    /* Adjust margins and content for print */
    .max-w-5xl {
      max-width: 100% !important;
      margin: 0 !important;
      border-width: 2px !important;
    }

    /* Ensure the color adjustments are respected */
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      border-color: black !important;
    }

    /* Ensure background and text color adjustments for print */
    .bg-slate-900 {
      background-color: black !important;
      color: white !important;
    }

    /* Make sure margins and paddings are reset properly for print */
    .print\\:p-0, .print\\:bg-white {
      padding: 0 !important;
      background-color: white !important;
    }
  }
`}</style>
    </div>
  );
}
