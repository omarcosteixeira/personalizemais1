
import React, { useState, useRef, useEffect } from 'react';
import { storage } from '../services/storageService';
import { AppSettings, ShippingOption, SidebarBanner, CustomFont } from '../types';
import { Save, Building, MapPin, Phone, Mail, Instagram, Facebook, Globe, Upload, Image as ImageIcon, X, Truck, Plus, Layout, MessageSquare, Palette, Settings, ShoppingBag, Music, ExternalLink, ToggleLeft, ToggleRight, Type, FileUp, Trash2 } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(storage.getSettings());
  const [customFonts, setCustomFonts] = useState<CustomFont[]>(storage.getCustomFonts());
  const [activeTab, setActiveTab] = useState<'business' | 'logistics' | 'messages' | 'appearance' | 'fonts'>('business');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const sidebarInputRef = useRef<HTMLInputElement>(null);
  const fontInputRef = useRef<HTMLInputElement>(null);

  const [newShipping, setNewShipping] = useState({ name: '', price: 0 });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner' | 'sidebar' | 'font') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (type === 'logo') {
          setSettings({ ...settings, logoUrl: result });
        } else if (type === 'banner') {
          const currentBanners = settings.banners || [];
          if (currentBanners.length < 5) {
            setSettings({ ...settings, banners: [...currentBanners, result] });
          } else {
            alert('Máximo de 5 banners atingido.');
          }
        } else if (type === 'sidebar') {
          const currentSidebar = settings.sidebarBanners || [];
          if (currentSidebar.length < 6) {
            const newBanner: SidebarBanner = {
              id: Math.random().toString(36).substr(2, 9),
              imageUrl: result,
              link: ''
            };
            setSettings({ ...settings, sidebarBanners: [...currentSidebar, newBanner] });
          } else {
            alert('Máximo de 6 banners laterais atingido.');
          }
        } else if (type === 'font') {
          const fontName = file.name.split('.')[0];
          const format = file.name.split('.').pop() || 'ttf';
          
          // Check if font already exists
          if (customFonts.some(f => f.name === fontName)) {
            alert('Esta fonte já foi importada.');
            return;
          }

          const newFont: CustomFont = {
            id: Math.random().toString(36).substr(2, 9),
            name: fontName,
            data: result,
            format: format
          };

          storage.saveCustomFont(newFont);
          setCustomFonts(storage.getCustomFonts());
          alert('Fonte importada com sucesso!');
        }
      };
      
      if (type === 'font') {
        reader.readAsDataURL(file); // Store as DataURL for font injection
      } else {
        reader.readAsDataURL(file);
      }
    }
  };

  const removeBanner = (index: number) => {
    const newBanners = [...settings.banners];
    newBanners.splice(index, 1);
    setSettings({ ...settings, banners: newBanners });
  };

  const removeSidebarBanner = (id: string) => {
    setSettings({ ...settings, sidebarBanners: settings.sidebarBanners.filter(b => b.id !== id) });
  };

  const deleteFont = (id: string) => {
    if (confirm('Deseja realmente excluir esta fonte?')) {
      storage.deleteCustomFont(id);
      setCustomFonts(storage.getCustomFonts());
    }
  };

  const updateSidebarLink = (id: string, link: string) => {
    setSettings({
      ...settings,
      sidebarBanners: settings.sidebarBanners.map(b => b.id === id ? { ...b, link } : b)
    });
  };

  const addShipping = () => {
    if (!newShipping.name) return;
    const opt: ShippingOption = { id: Math.random().toString(36).substr(2, 9), ...newShipping };
    setSettings({ ...settings, shippingOptions: [...(settings.shippingOptions || []), opt] });
    setNewShipping({ name: '', price: 0 });
  };

  const removeShipping = (id: string) => {
    setSettings({ ...settings, shippingOptions: settings.shippingOptions.filter(o => o.id !== id) });
  };

  const handleSave = () => {
    storage.saveSettings(settings);
    alert('Configurações salvas com sucesso!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Configurações Gerais</h3>
          <p className="text-sm text-slate-500">Personalize seu sistema, cores e comunicações.</p>
        </div>
        <button onClick={handleSave} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg flex items-center gap-2 hover:bg-indigo-700 transition-all active:scale-95">
          <Save className="w-5 h-5" /> Salvar Tudo
        </button>
      </div>

      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl overflow-x-auto no-scrollbar">
        {[
          { id: 'business', label: 'Empresa', icon: Building },
          { id: 'logistics', label: 'Banners e Fretes', icon: Truck },
          { id: 'messages', label: 'Mensagens WA', icon: MessageSquare },
          { id: 'appearance', label: 'Aparência', icon: Palette },
          { id: 'fonts', label: 'Fontes', icon: Type }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-white/50'}`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'business' && (
        <div className="space-y-8 animate-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col items-center">
              <div className="relative mb-6">
                <div className="w-32 h-32 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                  {settings.logoUrl ? <img src={settings.logoUrl} className="w-full h-full object-contain" /> : <ImageIcon className="w-12 h-12 text-slate-300" />}
                </div>
                <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 p-3 bg-indigo-600 text-white rounded-2xl shadow-lg hover:bg-indigo-700 transition-all"><Upload className="w-5 h-5" /></button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'logo')} />
              </div>
              <h4 className="font-bold text-slate-800 text-lg mb-1">{settings.businessName || 'Sua Gráfica'}</h4>
              <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Logotipo Principal</p>
            </div>

            <div className="md:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-200 grid grid-cols-2 gap-4">
               <div className="col-span-2 space-y-1"><label className="text-xs font-bold text-slate-400 uppercase">Nome Fantasia</label><input type="text" value={settings.businessName} onChange={e => setSettings({...settings, businessName: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
               <div className="col-span-2 space-y-1"><label className="text-xs font-bold text-slate-400 uppercase">Endereço</label><input type="text" value={settings.address} onChange={e => setSettings({...settings, address: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
               <div className="space-y-1"><label className="text-xs font-bold text-slate-400 uppercase">WhatsApp</label><input type="text" value={settings.phone} onChange={e => setSettings({...settings, phone: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
               <div className="space-y-1"><label className="text-xs font-bold text-slate-400 uppercase">E-mail</label><input type="text" value={settings.email} onChange={e => setSettings({...settings, email: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" /></div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-4">
            <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-4"><Globe className="w-5 h-5 text-emerald-500" /> Redes Sociais</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                <input type="text" value={settings.socialLinks.instagram} onChange={e => setSettings({...settings, socialLinks: {...settings.socialLinks, instagram: e.target.value}})} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="URL Instagram" />
              </div>
              <div className="relative">
                <Facebook className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                <input type="text" value={settings.socialLinks.facebook} onChange={e => setSettings({...settings, socialLinks: {...settings.socialLinks, facebook: e.target.value}})} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="URL Facebook" />
              </div>
              <div className="relative">
                <Music className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                <input type="text" value={settings.socialLinks.tiktokShop} onChange={e => setSettings({...settings, socialLinks: {...settings.socialLinks, tiktokShop: e.target.value}})} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="URL TikTok Shop" />
              </div>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                <input type="text" value={settings.socialLinks.website} onChange={e => setSettings({...settings, socialLinks: {...settings.socialLinks, website: e.target.value}})} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Site Oficial" />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logistics' && (
        <div className="space-y-8 animate-in slide-in-from-top-4 duration-300">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-slate-800 flex items-center gap-2"><Layout className="w-5 h-5 text-indigo-500" /> Banners da Loja Online</h4>
              <span className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full">{settings.banners?.length || 0}/5</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {settings.banners?.map((banner, index) => (
                <div key={index} className="relative aspect-video rounded-2xl overflow-hidden group border border-slate-100 shadow-sm">
                  <img src={banner} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={() => removeBanner(index)}
                      className="p-3 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition-all transform hover:scale-110"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
              
              {(settings.banners?.length || 0) < 5 && (
                <button 
                  onClick={() => bannerInputRef.current?.click()}
                  className="aspect-video rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-2 text-slate-400 hover:bg-slate-100 hover:border-indigo-300 hover:text-indigo-500 transition-all"
                >
                  <Plus className="w-8 h-8" />
                  <span className="text-xs font-bold uppercase tracking-widest">Adicionar Banner</span>
                </button>
              )}
              <input type="file" ref={bannerInputRef} className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'banner')} />
            </div>
            <p className="text-[10px] text-slate-400 text-center font-medium italic">Recomendado: 1920x600px.</p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 flex items-center gap-2"><ShoppingBag className="w-5 h-5 text-indigo-500" /> Banners Laterais de Anúncios</h4>
                <p className="text-xs text-slate-400">Exibidos na lateral direita da loja online.</p>
              </div>
              <button 
                onClick={() => setSettings({...settings, showSidebarBanners: !settings.showSidebarBanners})}
                className={`p-2 rounded-xl transition-all flex items-center gap-2 font-bold text-xs ${settings.showSidebarBanners ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}
              >
                {settings.showSidebarBanners ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                {settings.showSidebarBanners ? 'ATIVADO' : 'DESATIVADO'}
              </button>
            </div>

            {settings.showSidebarBanners && (
              <div className="space-y-6 animate-in slide-in-from-top-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {settings.sidebarBanners?.map((banner) => (
                    <div key={banner.id} className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 group relative">
                      <div className="aspect-[3/4] rounded-xl overflow-hidden bg-slate-200 relative group">
                        <img src={banner.imageUrl} className="w-full h-full object-cover" />
                        <button 
                          onClick={() => removeSidebarBanner(banner.id)}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="relative">
                        <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                        <input 
                          type="text" 
                          value={banner.link}
                          onChange={(e) => updateSidebarLink(banner.id, e.target.value)}
                          placeholder="Link do Anúncio"
                          className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-[10px] outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  ))}

                  {settings.sidebarBanners.length < 6 && (
                    <button 
                      onClick={() => sidebarInputRef.current?.click()}
                      className="aspect-[3/4] rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-2 text-slate-400 hover:bg-slate-100 hover:border-indigo-300 hover:text-indigo-500 transition-all self-start"
                    >
                      <Plus className="w-6 h-6" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-center px-4">Adicionar Anúncio (Vertical)</span>
                    </button>
                  )}
                  <input type="file" ref={sidebarInputRef} className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'sidebar')} />
                </div>
                <p className="text-[10px] text-slate-400 text-center font-medium italic">Recomendado formato vertical (ex: 300x400px ou similar).</p>
              </div>
            )}
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-4">
            <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-4"><Truck className="w-5 h-5 text-indigo-500" /> Logística de Entrega (Fretes)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-slate-50 p-6 rounded-2xl">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Forma de Entrega</label>
                <input type="text" value={newShipping.name} onChange={e => setNewShipping({...newShipping, name: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl" placeholder="Ex: Motoboy" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Preço (R$)</label>
                <input type="number" value={newShipping.price} onChange={e => setNewShipping({...newShipping, price: parseFloat(e.target.value)})} className="w-full p-3 bg-white border border-slate-200 rounded-xl" />
              </div>
              <button onClick={addShipping} className="py-3 bg-indigo-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700">
                <Plus className="w-4 h-4"/> Adicionar Opção
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              {settings.shippingOptions?.map(opt => (
                <div key={opt.id} className="p-4 bg-white border border-slate-200 rounded-2xl flex justify-between items-center group shadow-sm">
                  <div><p className="font-bold text-slate-700">{opt.name}</p><p className="text-sm text-indigo-600 font-black">R$ {opt.price.toFixed(2)}</p></div>
                  <button onClick={() => removeShipping(opt.id)} className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><X className="w-4 h-4"/></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="space-y-8 animate-in slide-in-from-top-4 duration-300">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-slate-800 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-indigo-500" /> Templates de WhatsApp</h4>
              <span className="text-[10px] bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-black">SISTEMA AUTOMÁTICO</span>
            </div>
            
            <p className="text-xs text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
              Use as tags: <span className="font-bold text-indigo-600">{`{cliente}`}</span>, <span className="font-bold text-indigo-600">{`{empresa}`}</span>, <span className="font-bold text-indigo-600">{`{total}`}</span>, <span className="font-bold text-indigo-600">{`{id}`}</span> para orçamentos.<br/>
              Use <span className="font-bold text-indigo-600">{`{produto}`}</span> e <span className="font-bold text-indigo-600">{`{preco}`}</span> para consultas na loja virtual.
            </p>

            {[
              { id: 'quotation', label: 'Envio de Orçamento (PDF)', key: 'quotation' },
              { id: 'awaiting_payment', label: 'Aguardando Pagamento', key: 'awaiting_payment' },
              { id: 'production', label: 'Pedido em Produção', key: 'production' },
              { id: 'shipping', label: 'Saiu para Entrega', key: 'shipping' },
              { id: 'delivered', label: 'Pedido Entregue', key: 'delivered' },
              { id: 'cancelled', label: 'Pedido Cancelado', key: 'cancelled' },
              { id: 'store_product', label: 'Consulta de Produto (Loja Online)', key: 'store_product' }
            ].map(msg => (
              <div key={msg.id} className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{msg.label}</label>
                <textarea 
                  value={(settings.waMessages as any)[msg.key]} 
                  onChange={e => setSettings({...settings, waMessages: {...settings.waMessages, [msg.key]: e.target.value}})}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm h-32"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'appearance' && (
        <div className="space-y-8 animate-in slide-in-from-top-4 duration-300">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
            <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-4"><Palette className="w-5 h-5 text-indigo-500" /> Identidade Visual do Sistema</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Cor Primária (Botões, Menus)</label>
                  <div className="flex gap-4 items-center">
                    <input 
                      type="color" 
                      value={settings.theme.primaryColor} 
                      onChange={e => setSettings({...settings, theme: {...settings.theme, primaryColor: e.target.value}})}
                      className="w-16 h-16 rounded-2xl cursor-pointer border-0 bg-transparent"
                    />
                    <input 
                      type="text" 
                      value={settings.theme.primaryColor}
                      onChange={e => setSettings({...settings, theme: {...settings.theme, primaryColor: e.target.value}})}
                      className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Cor Secundária (Alertas, Extras)</label>
                  <div className="flex gap-4 items-center">
                    <input 
                      type="color" 
                      value={settings.theme.secondaryColor} 
                      onChange={e => setSettings({...settings, theme: {...settings.theme, secondaryColor: e.target.value}})}
                      className="w-16 h-16 rounded-2xl cursor-pointer border-0 bg-transparent"
                    />
                    <input 
                      type="text" 
                      value={settings.theme.secondaryColor}
                      onChange={e => setSettings({...settings, theme: {...settings.theme, secondaryColor: e.target.value}})}
                      className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 flex flex-col items-center justify-center text-center">
                <div className="w-32 h-32 rounded-3xl shadow-lg flex items-center justify-center mb-4" style={{ backgroundColor: settings.theme.primaryColor }}>
                  <ImageIcon className="text-white w-12 h-12" />
                </div>
                <h5 className="font-black text-slate-700">Preview Visual</h5>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-2">As cores serão aplicadas em todo o sistema.</p>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100">
               <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-6"><Layout className="w-5 h-5 text-indigo-500" /> Layout da Loja Online</h4>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {[
                   { id: 'modern', label: 'Moderno e Elegante', desc: 'Foco em banners e arredondamento' },
                   { id: 'minimal', label: 'Minimalista Clean', desc: 'Foco em tipografia e espaço' },
                   { id: 'bold', label: 'Impactante / Bold', desc: 'Contraste forte e elementos grandes' }
                 ].map(layout => (
                   <button 
                    key={layout.id}
                    onClick={() => setSettings({...settings, theme: {...settings.theme, storeLayout: layout.id as any}})}
                    className={`p-6 rounded-[32px] border-2 text-left transition-all ${settings.theme.storeLayout === layout.id ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                   >
                     <div className={`w-full h-24 mb-4 rounded-2xl bg-slate-200 overflow-hidden relative`}>
                        <div className={`absolute top-2 left-2 w-1/3 h-2 rounded-full ${settings.theme.storeLayout === layout.id ? 'bg-indigo-600' : 'bg-slate-300'}`}></div>
                        <div className={`absolute bottom-2 left-2 w-3/4 h-2 rounded-full ${settings.theme.storeLayout === layout.id ? 'bg-indigo-300' : 'bg-slate-300'}`}></div>
                        {layout.id === 'modern' && <div className="absolute right-2 top-2 w-8 h-8 rounded-full bg-white/50"></div>}
                        {layout.id === 'bold' && <div className="absolute inset-0 bg-indigo-900/10"></div>}
                     </div>
                     <h6 className="font-bold text-slate-800">{layout.label}</h6>
                     <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">{layout.desc}</p>
                   </button>
                 ))}
               </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'fonts' && (
        <div className="space-y-8 animate-in slide-in-from-top-4 duration-300">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 flex items-center gap-2"><Type className="w-5 h-5 text-indigo-500" /> Fontes Personalizadas</h4>
                <p className="text-xs text-slate-500">Importe arquivos de fonte para usar no laboratório de testes.</p>
              </div>
              <button 
                onClick={() => fontInputRef.current?.click()}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
              >
                <FileUp className="w-4 h-4" /> Importar Fonte
              </button>
              <input 
                type="file" 
                ref={fontInputRef} 
                className="hidden" 
                accept=".ttf,.otf,.woff,.woff2" 
                onChange={e => handleFileUpload(e, 'font')} 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {customFonts.length > 0 ? customFonts.map(font => (
                <div key={font.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg"><Type className="w-4 h-4 text-slate-400" /></div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">{font.name}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">{font.format}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => deleteFont(font.id)}
                    className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )) : (
                <div className="col-span-full py-12 text-center bg-slate-50 border border-dashed border-slate-200 rounded-3xl">
                  <Type className="w-12 h-12 text-slate-200 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 font-bold uppercase">Nenhuma fonte importada ainda.</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
              <Settings className="w-5 h-5 text-amber-500 shrink-0" />
              <p className="text-[10px] text-amber-700 leading-relaxed font-bold uppercase tracking-widest">
                Dica: Fontes importadas aqui aparecerão automaticamente na aba "Testar Fontes" no menu lateral. O armazenamento é local no seu navegador.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
