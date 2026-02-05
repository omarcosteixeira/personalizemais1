
import React, { useState, useEffect } from 'react';
import { Quotation, OrderStatus } from '../types';
import { storage } from '../services/storageService';
import { Search, FileDown, User, Copy, CheckCircle2, Clock, Truck, Box as BoxIcon, X, Send, Edit, Trash2, DollarSign, AlertCircle } from 'lucide-react';
import { pdfService } from '../services/pdfService';

interface Props {
  quotations: Quotation[];
  onDuplicate: (q: Quotation) => void;
  onEdit: (q: Quotation) => void;
  onUpdate: () => void;
}

const QuotationHistory: React.FC<Props> = ({ quotations, onDuplicate, onEdit, onUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [localQuotations, setLocalQuotations] = useState<Quotation[]>(quotations);
  
  // Modal de Pagamento
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedForPay, setSelectedForPay] = useState<Quotation | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

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
    setLocalQuotations(prev => prev.map(item => item.id === q.id ? updated : item));
  };

  const openPaymentModal = (q: Quotation) => {
    setSelectedForPay(q);
    // Sugere o valor restante
    const paidSoFar = q.amountPaid || (q.isPaid ? q.total : 0);
    setPaymentAmount(parseFloat((q.total - paidSoFar).toFixed(2)));
    setShowPayModal(true);
  };

  const handleConfirmPayment = () => {
    if (!selectedForPay) return;

    const currentPaid = selectedForPay.amountPaid || (selectedForPay.isPaid ? selectedForPay.total : 0);
    const newTotalPaid = currentPaid + paymentAmount;
    
    // Verifica se quitou
    const isFullyPaid = newTotalPaid >= (selectedForPay.total - 0.05); // Margem de erro centavos

    const updated: Quotation = {
      ...selectedForPay,
      amountPaid: newTotalPaid,
      isPaid: isFullyPaid,
      paidAt: new Date().toISOString(),
      // Se pagou algo e estava pendente, avança para produção
      status: (newTotalPaid > 0 && (selectedForPay.status === 'PENDING' || selectedForPay.status === 'AWAITING_PAYMENT'))
        ? 'PRODUCTION'
        : selectedForPay.status
    };

    storage.saveQuotation(updated);
    setLocalQuotations(prev => prev.map(item => item.id === selectedForPay.id ? updated : item));
    setShowPayModal(false);
    setSelectedForPay(null);
    setPaymentAmount(0);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este orçamento permanentemente?')) {
      storage.deleteQuotation(id);
      onUpdate();
    }
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
          const paidAmount = q.amountPaid !== undefined ? q.amountPaid : (q.isPaid ? q.total : 0);
          const remaining = Math.max(0, q.total - paidAmount);
          const percentPaid = q.total > 0 ? (paidAmount / q.total) * 100 : 0;

          return (
            <div key={q.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
              {q.isPaid ? (
                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[9px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest flex items-center gap-1 shadow-sm">
                  <CheckCircle2 className="w-3 h-3" /> Pago
                </div>
              ) : paidAmount > 0 ? (
                <div className="absolute top-0 right-0 bg-orange-400 text-white text-[9px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest flex items-center gap-1 shadow-sm">
                  <AlertCircle className="w-3 h-3" /> Parcial
                </div>
              ) : null}
              
              <div className="flex justify-between items-center mb-4 mt-2">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 ${status.color}`}>
                  <status.icon className="w-3 h-3"/> {status.label}
                </span>
                <div className="flex gap-2">
                  <span className="text-[10px] font-bold text-slate-400">{q.id}</span>
                  <button onClick={() => handleDelete(q.id)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-3 h-3"/></button>
                </div>
              </div>
              <h4 className="font-bold text-slate-800 mb-1 flex items-center gap-2"><User className="w-4 h-4 text-slate-400"/> {q.customerName}</h4>
              <p className="text-xs text-slate-500 mb-4">{new Date(q.createdAt).toLocaleString()}</p>
              
              {/* Barra de Pagamento */}
              <div className="mb-4">
                <div className="flex justify-between text-[10px] font-bold mb-1">
                  <span className="text-slate-500">Pago: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(paidAmount)}</span>
                  <span className={remaining > 0 ? 'text-red-500' : 'text-emerald-500'}>
                    Restante: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(remaining)}
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${q.isPaid ? 'bg-emerald-500' : 'bg-orange-400'}`} 
                    style={{ width: `${Math.min(100, percentPaid)}%` }}
                  ></div>
                </div>
              </div>

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
              </div>

              <div className="pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Total Final</p>
                    <p className="text-lg font-black text-indigo-900">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(q.total)}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => onEdit(q)} title="Editar Pedido" className="p-2 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-lg"><Edit className="w-4 h-4"/></button>
                    <button onClick={() => onDuplicate(q)} title="Duplicar Pedido" className="p-2 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-lg"><Copy className="w-4 h-4"/></button>
                    <button onClick={() => pdfService.generateQuotation(q).save(`${q.id}.pdf`)} title="Baixar PDF" className="p-2 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-lg"><FileDown className="w-4 h-4"/></button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => notifyClient(q)}
                    className="py-2.5 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  >
                    <Send className="w-3 h-3"/> WhatsApp
                  </button>
                  <button 
                    onClick={() => openPaymentModal(q)}
                    className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-sm ${q.isPaid ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-white border border-slate-200 text-slate-400 hover:border-emerald-300 hover:text-emerald-500'}`}
                  >
                    {q.isPaid ? <><CheckCircle2 className="w-3 h-3"/> Quitado</> : <><DollarSign className="w-3 h-3"/> Baixar $</>}
                  </button>
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

      {/* Payment Modal */}
      {showPayModal && selectedForPay && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">Registrar Pagamento</h3>
              <button onClick={() => setShowPayModal(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5"/></button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <p className="text-xs text-slate-500 mb-1">Total do Pedido</p>
                <p className="text-xl font-black text-slate-800">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedForPay.total)}</p>
                <div className="h-px bg-slate-200 my-2"></div>
                <p className="text-xs text-slate-500 mb-1">Já Pago</p>
                <p className="text-sm font-bold text-emerald-600">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedForPay.amountPaid || 0)}</p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Valor a lançar agora</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                  <input 
                    type="number" 
                    value={paymentAmount} 
                    onChange={e => setPaymentAmount(parseFloat(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 bg-white border-2 border-indigo-100 rounded-xl font-bold text-lg text-indigo-900 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setPaymentAmount(parseFloat((selectedForPay.total - (selectedForPay.amountPaid || 0)).toFixed(2)))}
                className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs uppercase"
              >
                Restante Total
              </button>
              <button 
                onClick={handleConfirmPayment}
                className="flex-[2] py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotationHistory;
