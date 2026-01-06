
import React from 'react';
import { Quotation, StockItem } from '../types';
import { 
  TrendingUp, 
  Users, 
  FileText, 
  ArrowUpRight,
  Plus,
  AlertTriangle
} from 'lucide-react';

interface Props {
  quotations: Quotation[];
  stock: StockItem[];
  onNavigateToNew: () => void;
}

const Dashboard: React.FC<Props> = ({ quotations, stock, onNavigateToNew }) => {
  const totalVolume = quotations.reduce((acc, q) => acc + q.total, 0);
  const uniqueClients = new Set(quotations.map(q => q.customerName)).size;
  const lowStockItems = stock.filter(s => s.currentQuantity <= s.minQuantity);

  const stats = [
    { label: 'Volume Bruto', value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalVolume), icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Base de Clientes', value: uniqueClients.toString(), icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Total Orçamentos', value: quotations.length.toString(), icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 bg-gradient-to-br from-indigo-800 to-indigo-950 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">Bem-vindo à Personalize +</h1>
            <p className="text-indigo-200 mb-6 font-light">Seu sistema inteligente de orçamentos e produção.</p>
            <button 
              onClick={onNavigateToNew}
              className="bg-white text-indigo-900 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> Novo Orçamento
            </button>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        </div>

        <div className="grid grid-cols-1 gap-4 w-full md:w-80">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-xl font-black text-slate-800">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">Orçamentos Recentes</h3>
            <button className="text-indigo-600 text-sm font-bold flex items-center gap-1">Ver todos</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase">
                <tr>
                  <th className="px-6 py-3">Cliente</th>
                  <th className="px-6 py-3 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quotations.slice(0, 5).map(q => (
                  <tr key={q.id}>
                    <td className="px-6 py-4 text-sm font-bold text-slate-700">{q.customerName}</td>
                    <td className="px-6 py-4 text-sm font-black text-indigo-900 text-right">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(q.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" /> Alertas de Estoque
          </h3>
          <div className="space-y-4">
            {lowStockItems.length > 0 ? lowStockItems.map(item => (
              <div key={item.id} className="flex justify-between items-center p-4 bg-red-50 rounded-2xl border border-red-100">
                <div>
                  <p className="text-sm font-bold text-red-800">{item.name}</p>
                  <p className="text-xs text-red-600">Saldo atual: {item.currentQuantity} {item.unit}</p>
                </div>
                <span className="text-[10px] font-bold text-red-700 bg-white px-2 py-1 rounded-full uppercase">Crítico</span>
              </div>
            )) : (
              <p className="text-sm text-slate-400 py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">Todo o estoque está em dia!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;