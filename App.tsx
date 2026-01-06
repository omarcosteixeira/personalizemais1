
import React, { useState, useEffect } from 'react';
import { 
  Plus, History, Package, LayoutDashboard, Printer, Box, ExternalLink, 
  ChevronLeft, Settings, Ticket, Users, Calculator, Layers, FileSpreadsheet, 
  Type, ShoppingCart, Menu, LogOut, ShieldCheck
} from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './services/firebaseService';
import { storage } from './services/storageService';
import { Product, Quotation, StockItem } from './types';

// Components
import NewQuotation from './components/NewQuotation';
import ProductCatalog from './components/ProductCatalog';
import QuotationHistory from './components/QuotationHistory';
import StockManagement from './components/StockManagement';
import Storefront from './components/Storefront';
import Dashboard from './components/Dashboard';
import SettingsPage from './components/SettingsPage';
import CouponsPage from './components/CouponsPage';
import CustomerManagement from './components/CustomerManagement';
import PricingCalculator from './components/PricingCalculator';
import SheetCalculator from './components/SheetCalculator';
import FontTester from './components/FontTester';
import PDV from './components/PDV';
import LoginPage from './components/LoginPage';
import AdminPanel from './components/AdminPanel';

type Tab = 'dashboard' | 'new' | 'history' | 'products' | 'store' | 'settings' | 'coupons' | 'customers' | 'fonts' | 'pdv' | 'admin';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [productSubTab, setProductSubTab] = useState<'catalog' | 'pricing' | 'stock' | 'sheet'>('catalog');
  const [user, setUser] = useState<any>(null);
  const [userStatus, setUserStatus] = useState<'GUEST' | 'PENDING' | 'EXPIRED' | 'APPROVED'>('GUEST');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSyncing, setIsSyncing] = useState(true);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [stock, setStock] = useState<StockItem[]>([]);
  const [duplicateTarget, setDuplicateTarget] = useState<Quotation | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setIsSyncing(true);
      if (fbUser) {
        setUser(fbUser);
        const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setIsAdmin(!!data.isAdmin);
          
          if (!data.isApproved) {
            setUserStatus('PENDING');
          } else if (data.expiresAt !== 'NEVER' && new Date(data.expiresAt) < new Date()) {
            setUserStatus('EXPIRED');
          } else {
            setUserStatus('APPROVED');
            await storage.initSync();
            refreshData();
          }
        }
      } else {
        setUser(null);
        setUserStatus('GUEST');
        setIsAdmin(false);
      }
      setIsSyncing(false);
    });
    return unsub;
  }, []);

  const refreshData = () => {
    if (userStatus === 'APPROVED') {
      setProducts(storage.getProducts());
      setQuotations(storage.getQuotations());
      setStock(storage.getStock());
    }
  };

  const handleLogout = () => {
    signOut(auth).then(() => {
      setUserStatus('GUEST');
      setUser(null);
      setProducts([]);
      setQuotations([]);
      setStock([]);
    });
  };

  if (userStatus !== 'APPROVED') {
    return <LoginPage userStatus={userStatus} onAuthChange={() => {}} />;
  }

  if (activeTab === 'store') {
    return (
      <div className="relative">
        <button onClick={() => setActiveTab('dashboard')} className="fixed bottom-20 right-8 z-50 bg-indigo-900 text-white p-4 rounded-full shadow-2xl flex items-center gap-2 hover:scale-105 transition-all lg:bottom-8">
          <ChevronLeft className="w-6 h-6" /> Voltar ao Painel
        </button>
        <Storefront products={products} />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard quotations={quotations} stock={stock} onNavigateToNew={() => setActiveTab('new')} />;
      case 'pdv': return <PDV products={products} onSaleComplete={refreshData} />;
      case 'new': return <NewQuotation products={products} initialData={duplicateTarget} onSave={() => { refreshData(); setDuplicateTarget(null); }} onNavigateToHistory={() => setActiveTab('history')} />;
      case 'history': return <QuotationHistory quotations={quotations} onDuplicate={(q) => { setDuplicateTarget(q); setActiveTab('new'); }} />;
      case 'customers': return <CustomerManagement />;
      case 'admin': return <AdminPanel />;
      case 'products':
        return (
          <div className="space-y-6">
            <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit overflow-x-auto no-scrollbar">
              {[{id:'catalog',l:'Catálogo',i:Package},{id:'pricing',l:'Precificação',i:Calculator},{id:'sheet',l:'Folhas',i:FileSpreadsheet},{id:'stock',l:'Estoque',i:Box}].map(sub => (
                <button key={sub.id} onClick={() => setProductSubTab(sub.id as any)} className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 whitespace-nowrap ${productSubTab === sub.id ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>
                  <sub.i className="w-4 h-4" /> {sub.l}
                </button>
              ))}
            </div>
            {productSubTab === 'catalog' && <ProductCatalog products={products} onUpdate={refreshData} />}
            {productSubTab === 'pricing' && <PricingCalculator products={products} onProductCreated={refreshData} />}
            {productSubTab === 'stock' && <StockManagement products={products} onUpdate={refreshData} />}
            {productSubTab === 'sheet' && <SheetCalculator />}
          </div>
        );
      case 'fonts': return <FontTester />;
      case 'coupons': return <CouponsPage />;
      case 'settings': return <SettingsPage />;
      default: return <Dashboard quotations={quotations} stock={stock} onNavigateToNew={() => setActiveTab('new')} />;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'pdv', label: 'PDV', icon: ShoppingCart },
    { id: 'new', label: 'Novo', icon: Plus },
    { id: 'history', label: 'Pedidos', icon: History },
    { id: 'customers', label: 'Clientes', icon: Users },
    { id: 'products', label: 'Produtos', icon: Layers },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin', icon: ShieldCheck }] : []),
    { id: 'settings', label: 'Config', icon: Settings },
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 lg:flex-row overflow-hidden">
      <aside className="hidden lg:flex w-64 bg-indigo-900 text-white flex-col shadow-xl shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-white p-2 rounded-lg"><Printer className="w-6 h-6 text-indigo-900" /></div>
          <span className="text-xl font-bold">Personalize +</span>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-slate-50 text-indigo-900 shadow-lg font-bold' : 'text-indigo-100 hover:bg-indigo-800'}`}>
              <item.icon className="w-5 h-5" /> {item.label}
            </button>
          ))}
          <div className="pt-6 pb-2 px-4"><p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Loja</p></div>
          <button onClick={() => setActiveTab('store')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-emerald-300 hover:bg-indigo-800"><ExternalLink className="w-5 h-5" /> Abrir Loja Online</button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-300 hover:bg-indigo-800 mt-auto"><LogOut className="w-5 h-5" /> Sair</button>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <h1 className="font-black text-indigo-900 lg:hidden">Personalize +</h1>
          <h2 className="hidden lg:block text-lg font-bold text-slate-800 capitalize">{navItems.find(i => i.id === activeTab)?.label}</h2>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user?.email}</span>
          </div>
        </header>
        <section className="flex-1 overflow-y-auto p-4 lg:p-8 pb-20 lg:pb-8">{renderContent()}</section>
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-indigo-900 text-white flex items-center justify-between px-2 z-50">
          {navItems.slice(0, 5).map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`flex-1 flex flex-col items-center justify-center gap-1 ${activeTab === item.id ? 'text-white' : 'text-indigo-300 opacity-60'}`}>
              <item.icon className="w-5 h-5" />
              <span className="text-[9px] font-bold uppercase">{item.label}</span>
            </button>
          ))}
          <button onClick={() => setActiveTab('settings')} className={`flex-1 flex flex-col items-center justify-center gap-1 ${activeTab === 'settings' ? 'text-white' : 'text-indigo-300 opacity-60'}`}>
            <Menu className="w-5 h-5" /><span className="text-[9px] font-bold uppercase">Mais</span>
          </button>
        </nav>
      </main>
    </div>
  );
};

export default App;
