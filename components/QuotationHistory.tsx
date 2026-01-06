
import React, { useState, useEffect } from 'react';
import { Quotation, OrderStatus } from '../types';
import { storage } from '../services/storageService';
import { Search, FileDown, MessageSquare, Calendar, User, Phone, Copy, CheckCircle2, Clock, Truck, Box as BoxIcon, X, Send } from 'lucide-react';
import { pdfService } from '../services/pdfService';

interface Props {
  quotations: Quotation[];
  onDuplicate: (q: Quotation) => void;
}

const QuotationHistory: React.FC<Props> = ({ quotations, onDuplicate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [localQuotations, setLocalQuotations] = useState<Quotation[]>(quotations);
  const settings = storage.getSettings();

  useEffect(() => {
    setLocalQuotations(quotations);
  }, [quotations]);

  const filtered = localQuotations.filter(q => 
    q.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const updateStatus = (q: Quotation, newStatus: OrderStatus) => {
    const updated = { ...q, status: newStatus };
    storage.saveQuotation(updated);
    
    // Update local state instead of reloading
    setLocalQuotations(prev => prev.map(item => item.id === q.id ? updated : item));
    
    // Optional: notify on status change automatically? 
    // Usually better to let the user click "Notificar" to review.
  };

  const getStatusInfo = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING': return { label: 'Orçamento', color: 'bg-yellow-100 text-yellow-700', icon: Clock };
      case 'AWAITING_PAYMENT': return { label: 'Aguard. Pagamento', color: 'bg-orange-100 text-orange-700', icon: Clock };
      case 'PRODUCTION': return { label: 'Em Produção', color: 'bg-blue-100 text-blue-700', icon: BoxIcon };
      case 'SHIPPING': return { label: 'Em Rota de Entrega', color: 'bg-purple-100 text-purple-700', icon: Truck };
      case 'DELIVERED': return { label: 'Entregue / Finalizado', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 };
      case 'CANCELLED': return { label: 'Cancelado', color: 'bg-red-100 text-red-700', icon: X };
      default: return { label: 'Pendente', color: 'bg-slate-100 text-slate-700', icon: Clock };
    }
  };

  const replaceWaTokens = (template: string, quotation: Quotation) => {
    const formattedTotal = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(quotation.total);
    return template
      .replace(/{cliente}/g, quotation.customerName)
      .replace(/{empresa}/g, settings.businessName)
      .replace(/{total}/g, formattedTotal)
      .replace(/{id}/g, quotation.id);
  };

  const notifyClient = (q: Quotation) => {
    let template = settings.waMessages.quotation;
    if (q.status === 'AWAITING_PAYMENT') template = settings.waMessages.awaiting_payment;
    if (q.status === 'PRODUCTION') template = settings.waMessages.production;
    if (q.status === 'SHIPPING') template = settings.waMessages.shipping;
    if (q.status === 'DELIVERED') template = settings.waMessages.delivered;
    if (q.status === 'CANCELLED') template = settings.waMessages.cancelled;

    const message = replaceWaTokens(template, q);
    const phone = q.customerContact.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const statusList: { key: OrderStatus, label: string }[] = [
    { key: 'PENDING', label: 'Orç.' },
    { key: 'AWAITING_PAYMENT', label: 'Pgto' },
    { key: 'PRODUCTION', label: 'Prod.' },
    { key: 'SHIPPING', label: 'Rota' },
    { key: 'DELIVERED', label: 'Entreg.' },
    { key: 'CANCELLED', label: 'Canc.' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h3 className="text-xl font-bold text-slate-800">Fluxo de Pedidos</h3><p className="text-sm text-slate-500">Gerencie o status e notifique seus clientes</p></div>
        <div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input type="text" placeholder="Buscar por cliente ou ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl outline-none" /></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(q => {
          const status = getStatusInfo(q.status);
          return (
            <div key={q.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative">
              <div className="flex justify-between items-center mb-4">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 ${status.color}`}>
                  <status.icon className="w-3 h-3"/> {status.label}
                </span>
                <span className="text-[10px] font-bold text-slate-400">{q.id}</span>
              </div>
              <h4 className="font-bold text-slate-800 mb-1 flex items-center gap-2"><User className="w-4 h-4 text-slate-400"/> {q.customerName}</h4>
              <p className="text-xs text-slate-500 mb-4">{new Date(q.createdAt).toLocaleString()}</p>
              
              <div className="py-4 border-y border-slate-50 space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Ações de Status</p>
                <div className="flex flex-wrap gap-1">
                  {statusList.map(s => (
                    <button 
                      key={s.key} 
                      onClick={() => updateStatus(q, s.key)} 
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${q.status === s.key ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => notifyClient(q)}
                  className="w-full py-2 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-100 transition-colors"
                >
                  <Send className="w-3 h-3"/> Notificar p/ WhatsApp
                </button>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <div><p className="text-[10px] text-slate-400 uppercase font-bold">Total Final</p><p className="text-lg font-black text-indigo-900">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(q.total)}</p></div>
                <div className="flex gap-1">
                  <button onClick={() => onDuplicate(q)} title="Duplicar Pedido" className="p-2 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-lg"><Copy className="w-4 h-4"/></button>
                  <button onClick={() => pdfService.generateQuotation(q).save(`${q.id}.pdf`)} title="Baixar PDF" className="p-2 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-lg"><FileDown className="w-4 h-4"/></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {filtered.length === 0 && (
        <div className="p-20 text-center bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 italic">
          Nenhum pedido encontrado.
        </div>
      )}
    </div>
  );
};

export default QuotationHistory;
