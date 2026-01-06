
import React, { useState, useEffect } from 'react';
import { db } from '../services/firebaseService';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Users, CheckCircle, Clock, Trash2, ShieldCheck, Mail, Calendar } from 'lucide-react';

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, 'users'));
    setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

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
        <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3 mb-6">
          <ShieldCheck className="w-8 h-8 text-indigo-600" /> Gestão de Acessos
        </h3>

        {loading ? (
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
                      <Calendar className="w-3 h-3" /> Expira em: {new Date(u.expiresAt).toLocaleDateString()}
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
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
