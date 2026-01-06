
import React, { useState, useEffect } from 'react';
import { db, auth } from '../services/firebaseService';
import { storage } from '../services/storageService';
import { SystemConfig } from '../types';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Users, CheckCircle, Clock, Trash2, ShieldCheck, Mail, Calendar, TrendingUp, Link as LinkIcon, DollarSign, Save } from 'lucide-react';

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'sales'>('users');
  
  // Config States
  const [sysConfig, setSysConfig] = useState<SystemConfig>({
    basicPlanPrice: 0,
    proPlanPrice: 0,
    paymentLink: ''
  });

  const isSuperAdmin = auth.currentUser?.email === 'atelie.arianeartes@gmail.com';

  const fetchUsers = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, 'users'));
    setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  const fetchConfig = async () => {
    const config = await storage.getSystemConfig();
    setSysConfig(config);
  };

  useEffect(() => { 
    fetchUsers();
    if (isSuperAdmin) fetchConfig();
  }, []);

  const handleSaveConfig = async () => {
    await storage.saveSystemConfig(sysConfig);
    alert('Configurações de venda salvas!');
  };

  const approveUser = async (userId: string, days: number) => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);
    
    await updateDoc(doc(db, 'users', userId), {
      isApproved: true,
      expiresAt: expiresAt.toISOString()
    });
    fetchUsers();
  };

  const deleteUser = async (userId: string) => {
    if (confirm('Excluir este usuário permanentemente?')) {
      await deleteDoc(doc(db, 'users', userId));
      fetchUsers();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-indigo-600" /> Painel de Controle
          </h3>
          
          {isSuperAdmin && (
            <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
              <button 
                onClick={() => setActiveSubTab('users')}
                className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeSubTab === 'users' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}
              >
                USUÁRIOS
              </button>
              <button 
                onClick={() => setActiveSubTab('sales')}
                className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeSubTab === 'sales' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}
              >
                VENDAS
              </button>
            </div>
          )}
        </div>

        {activeSubTab === 'users' && (
          loading ? (
            <div className="py-20 text-center animate-pulse text-slate-400 font-bold uppercase tracking-widest">Carregando usuários...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {users.map(u => (
                <div key={u.id} className={`p-6 rounded-3xl border ${u.isApproved ? 'bg-white border-slate-100' : 'bg-amber-50 border-amber-100'} shadow-sm flex flex-col justify-between`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-black text-slate-800 truncate max-w-[200px] flex items-center gap-2">
                        <Mail className="w-3 h-3" /> {u.email}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                        {u.isAdmin ? 'Administrador' : u.isApproved ? 'Ativo' : 'Aguardando Aprovação'}
                      </p>
                    </div>
                    {!u.isAdmin && (
                      <button onClick={() => deleteUser(u.id)} className="text-red-300 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {u.isApproved && !u.isAdmin && (
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 bg-slate-50 p-2 rounded-xl">
                        <Calendar className="w-3 h-3" /> Expira em: {u.expiresAt === 'NEVER' ? 'Vitalício' : new Date(u.expiresAt).toLocaleDateString()}
                      </div>
                    )}

                    {!u.isAdmin && (
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => approveUser(u.id, 2)} className="py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100">Liberar 2 Dias</button>
                        <button onClick={() => approveUser(u.id, 30)} className="py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700">Liberar 30 Dias</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {activeSubTab === 'sales' && isSuperAdmin && (
          <div className="max-w-2xl space-y-8 animate-in slide-in-from-top-4">
            <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 space-y-6">
              <h4 className="font-black text-indigo-900 text-xs uppercase tracking-widest flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Valores da Landing Page
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Preço Plano Básico (R$)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      type="number" 
                      value={sysConfig.basicPlanPrice} 
                      onChange={e => setSysConfig({...sysConfig, basicPlanPrice: parseFloat(e.target.value)})}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl font-bold" 
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Preço Plano Pro (R$)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      type="number" 
                      value={sysConfig.proPlanPrice} 
                      onChange={e => setSysConfig({...sysConfig, proPlanPrice: parseFloat(e.target.value)})}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl font-bold" 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase">Link de Pagamento (Mercado Pago / Outros)</label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input 
                    type="text" 
                    value={sysConfig.paymentLink} 
                    onChange={e => setSysConfig({...sysConfig, paymentLink: e.target.value})}
                    placeholder="https://link-de-pagamento.com"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl font-medium" 
                  />
                </div>
              </div>

              <button 
                onClick={handleSaveConfig}
                className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" /> SALVAR CONFIGURAÇÕES DE VENDA
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
