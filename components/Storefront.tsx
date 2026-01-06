
import React, { useState, useEffect } from 'react';
import { Product, PricingMode, AppSettings, SidebarBanner } from '../types';
import { storage } from '../services/storageService';
import { 
  ShoppingCart, 
  MessageCircle, 
  Search, 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  Instagram, 
  Facebook, 
  Globe,
  Tag,
  ArrowRight,
  X,
  Info,
  Layers,
  Clock,
  ArrowUpRight,
  Music
} from 'lucide-react';

interface Props {
  products: Product[];
}

const Storefront: React.FC<Props> = ({ products }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [currentBanner, setCurrentBanner] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const settings = storage.getSettings();

  const categories = ['Todos', ...Array.from(new Set(products.map(p => p.category)))];
  const highlightedProducts = products.filter(p => p.isHighlighted);

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'Todos' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    if (settings.banners && settings.banners.length > 1) {
      const timer = setInterval(() => {
        nextBanner();
      }, 6000);
      return () => clearInterval(timer);
    }
  }, [settings.banners, currentBanner]);

  const nextBanner = () => {
    if (!settings.banners || settings.banners.length === 0) return;
    setCurrentBanner(prev => (prev + 1) % settings.banners.length);
  };

  const prevBanner = () => {
    if (!settings.banners || settings.banners.length === 0) return;
    setCurrentBanner(prev => (prev - 1 + settings.banners.length) % settings.banners.length);
  };

  const handleRequestQuote = (product: Product) => {
    const template = settings.waMessages.store_product || 'Olá! Gostaria de mais informações sobre o produto *{produto}* no valor de {preco} que vi na sua loja online da {empresa}.';
    const formattedPrice = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price);
    
    const message = template
      .replace(/{produto}/g, product.name)
      .replace(/{preco}/g, formattedPrice)
      .replace(/{empresa}/g, settings.businessName);

    const phone = settings.phone.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleCustomQuote = () => {
    const phone = settings.phone.replace(/\D/g, '');
    const message = `Olá! Não achei o produto que eu queria na loja online da ${settings.businessName}, gostaria de solicitar um orçamento personalizado por aqui.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const primaryColor = settings.theme.primaryColor;
  const secondaryColor = settings.theme.secondaryColor;
  const layout = settings.theme.storeLayout;

  const cardRadius = layout === 'modern' ? 'rounded-[48px]' : layout === 'minimal' ? 'rounded-2xl' : 'rounded-none';
  const imgRadius = layout === 'modern' ? 'rounded-[40px]' : layout === 'minimal' ? 'rounded-xl' : 'rounded-none';

  return (
    <div className={`min-h-screen font-sans text-slate-900 pb-0 ${layout === 'bold' ? 'bg-slate-100' : 'bg-slate-50'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm`}>
        <div className="flex items-center gap-3">
          {settings.logoUrl ? (
            <img src={settings.logoUrl} className="h-10 w-auto object-contain" />
          ) : (
            <div className={`p-2 rounded-xl shadow-lg`} style={{ backgroundColor: primaryColor, color: '#fff' }}><ShoppingCart className="w-6 h-6"/></div>
          )}
          <h1 className={`text-xl font-black tracking-tight hidden sm:block text-slate-800 ${layout === 'minimal' ? 'uppercase tracking-widest text-sm' : ''}`}>{settings.businessName}</h1>
        </div>
        
        <div className="relative flex-1 max-w-lg mx-6">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="O que você precisa hoje?" 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            className={`w-full pl-12 pr-4 py-3 bg-slate-100 rounded-2xl outline-none transition-all border border-transparent focus:bg-white focus:border-indigo-200`} 
          />
        </div>

        <div className="flex items-center">
           <button 
            onClick={handleCustomQuote} 
            className="hidden md:flex flex-col items-end gap-0.5 group transition-all active:scale-95"
           >
             <div className="flex items-center gap-2 px-6 py-2.5 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-100" style={{ backgroundColor: secondaryColor, color: '#fff' }}>
               <MessageCircle className="w-5 h-5"/> WhatsApp
             </div>
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter max-w-[180px] text-right group-hover:text-emerald-600 transition-colors">
               Não achou o produto que deseja? Faça um orçamento personalizado por aqui!
             </span>
           </button>
           {/* Mobile view WhatsApp only */}
           <button 
            onClick={handleCustomQuote}
            className="md:hidden p-3 rounded-xl text-white shadow-lg"
            style={{ backgroundColor: secondaryColor }}
           >
             <MessageCircle className="w-6 h-6"/>
           </button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row">
        {/* Sidebar Left Navigation */}
        <aside className="lg:w-64 lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] p-6 bg-white border-r border-slate-200 hidden lg:block overflow-y-auto z-30">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Categorias</h3>
          <nav className="space-y-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-bold transition-all flex items-center justify-between group ${
                  activeCategory === cat 
                  ? 'text-white shadow-lg' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
                style={activeCategory === cat ? { backgroundColor: primaryColor } : {}}
              >
                <span>{cat}</span>
                <ArrowRight className={`w-4 h-4 transition-transform ${activeCategory === cat ? 'translate-x-0' : '-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'}`} />
              </button>
            ))}
          </nav>

          <div className="mt-12 p-6 bg-slate-50 rounded-[32px] border border-slate-100 text-center">
             <h4 className="text-sm font-black text-slate-800 mb-2">Precisa de algo único?</h4>
             <p className="text-xs text-slate-500 mb-4 leading-relaxed">Se não encontrou no catálogo, nossa equipe pode criar do zero para você.</p>
             <button 
              onClick={handleCustomQuote}
              className="w-full py-3 rounded-xl text-white text-xs font-black uppercase tracking-widest shadow-md transition-all hover:scale-105"
              style={{ backgroundColor: secondaryColor }}
             >
               Solicitar Orçamento
             </button>
          </div>
        </aside>

        {/* Mobile Category Menu (Horizontal Scroll) */}
        <div className="lg:hidden p-4 overflow-x-auto no-scrollbar flex gap-2 bg-white sticky top-[73px] z-30 border-b border-slate-100">
          {categories.map(cat => (
            <button 
              key={cat} 
              onClick={() => setActiveCategory(cat)} 
              className={`px-6 py-2.5 rounded-full text-xs font-black whitespace-nowrap transition-all border-2 ${activeCategory === cat ? 'text-white shadow-lg' : 'bg-slate-50 text-slate-500 border-transparent'}`}
              style={activeCategory === cat ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden">
          {/* Banners */}
          {settings.banners && settings.banners.length > 0 && activeCategory === 'Todos' && !searchTerm && (
            <section className={`relative group ${layout === 'minimal' ? 'h-[400px]' : 'h-[300px] md:h-[450px]'} bg-slate-200 overflow-hidden`}>
              {settings.banners.map((b, i) => (
                <div 
                  key={i} 
                  className={`absolute inset-0 transition-all duration-1000 ease-in-out ${i === currentBanner ? 'opacity-100 scale-100' : 'opacity-0 scale-110 pointer-events-none'}`}
                >
                  <img src={b} className="w-full h-full object-cover" alt={`Banner ${i + 1}`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-8 md:p-16">
                     <div className="max-w-3xl text-white space-y-4">
                        <span className="inline-block px-5 py-2 text-[10px] font-black uppercase rounded-full mb-2 tracking-[0.2em] shadow-xl" style={{ backgroundColor: primaryColor }}>Qualidade Gráfica Premium</span>
                        <h2 className={`text-3xl md:text-5xl font-black leading-none drop-shadow-2xl ${layout === 'minimal' ? 'uppercase' : ''}`}>
                          {layout === 'bold' ? 'A MELHOR IMPRESSÃO.' : 'Impressione com a melhor resolução.'}
                        </h2>
                     </div>
                  </div>
                </div>
              ))}
              {settings.banners.length > 1 && (
                <>
                  <button onClick={prevBanner} className="absolute left-6 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/30 backdrop-blur-xl rounded-full text-white transition-all opacity-0 group-hover:opacity-100 border border-white/20"><ChevronLeft className="w-6 h-6" /></button>
                  <button onClick={nextBanner} className="absolute right-6 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/30 backdrop-blur-xl rounded-full text-white transition-all opacity-0 group-hover:opacity-100 border border-white/20"><ChevronRight className="w-6 h-6" /></button>
                </>
              )}
            </section>
          )}

          {/* Highlights */}
          {highlightedProducts.length > 0 && activeCategory === 'Todos' && !searchTerm && (
            <section className="py-12 px-6 max-w-7xl mx-auto">
              <div className="flex items-center gap-3 mb-10">
                <div className="p-3 bg-yellow-100 rounded-2xl">
                  <Star className="w-6 h-6 text-yellow-600 fill-yellow-500" />
                </div>
                <h3 className={`text-2xl font-black text-slate-800 tracking-tight ${layout === 'minimal' ? 'uppercase' : ''}`}>Destaques Especiais</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {highlightedProducts.map(p => (
                  <div key={p.id} onClick={() => setSelectedProduct(p)} className={`group bg-white p-5 ${cardRadius} shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer flex flex-col`}>
                    <div className={`aspect-square ${imgRadius} overflow-hidden mb-6 bg-slate-50 relative shrink-0`}>
                      {p.imageUrl ? (
                        <img src={p.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={p.name} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-200"><Tag className="w-16 h-16" /></div>
                      )}
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-2xl opacity-0 group-hover:opacity-100 transition-all shadow-xl">
                        <Info className="w-6 h-6" style={{ color: primaryColor }} />
                      </div>
                    </div>
                    <div className="px-3 flex-1 flex flex-col text-center">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 block" style={{ color: primaryColor }}>{p.category}</span>
                      <h4 className="font-bold text-slate-800 text-xl line-clamp-1 mb-2">{p.name}</h4>
                      <p className="text-2xl font-black text-slate-900 mb-6">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.price)}</p>
                      <div className="mt-auto w-full py-4 text-white text-center rounded-3xl text-sm font-black transition-colors shadow-lg" style={{ backgroundColor: layout === 'bold' ? '#000' : primaryColor }}>Ver Detalhes</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Main Catalog */}
          <main className="py-12 px-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <h3 className={`text-3xl font-black text-slate-800 tracking-tight ${layout === 'minimal' ? 'uppercase' : ''}`}>
                {activeCategory === 'Todos' ? 'Catálogo Completo' : activeCategory}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {filtered.map(p => (
                <div key={p.id} onClick={() => setSelectedProduct(p)} className={`bg-white ${cardRadius} overflow-hidden border border-slate-100 hover:shadow-2xl group flex flex-col p-2 transition-all cursor-pointer`}>
                  <div className={`aspect-[4/3] overflow-hidden ${imgRadius} relative bg-slate-50 shrink-0`}>
                    {p.imageUrl ? (
                      <img src={p.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={p.name} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-200"><Tag className="w-12 h-12" /></div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="px-4 py-1.5 bg-white/95 backdrop-blur-sm text-[10px] font-black uppercase rounded-xl shadow-lg ring-1 ring-slate-100" style={{ color: primaryColor }}>{p.category}</span>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h4 className="text-lg font-black text-slate-800 mb-3 leading-tight line-clamp-2">{p.name}</h4>
                    <div className="mt-auto flex items-end justify-between pt-4 border-t border-slate-50">
                       <div>
                          <p className="text-[9px] text-slate-400 font-black uppercase mb-1 tracking-widest">Valor Unitário</p>
                          <p className="text-xl font-black text-slate-900 tracking-tighter">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.price)}
                          </p>
                       </div>
                       <div className="p-3 text-white rounded-2xl transition-all shadow-lg" style={{ backgroundColor: primaryColor }}>
                        <ArrowRight className="w-5 h-5"/>
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {filtered.length === 0 && (
              <div className="p-20 text-center bg-white rounded-[40px] border border-dashed border-slate-200">
                <Search className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-bold uppercase text-sm">Nenhum produto encontrado nesta categoria.</p>
              </div>
            )}
          </main>
        </div>

        {/* Sidebar Right Ad Section */}
        {settings.showSidebarBanners && settings.sidebarBanners.length > 0 && (
          <aside className="lg:w-64 lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] p-6 bg-slate-50 border-l border-slate-200 hidden xl:block overflow-y-auto z-30">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 text-center">Anúncios & Ofertas</h3>
            <div className="space-y-6">
              {settings.sidebarBanners.map((banner) => (
                <a 
                  key={banner.id} 
                  href={banner.link || '#'} 
                  target={banner.link ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                  className="block group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <img src={banner.imageUrl} className="w-full aspect-[3/4] object-cover" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ArrowUpRight className="text-white w-8 h-8" />
                  </div>
                </a>
              ))}
            </div>
            
            <div className="mt-12 p-4 bg-white rounded-3xl border border-slate-200 shadow-sm text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase leading-relaxed">Publicidade</p>
            </div>
          </aside>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-16 px-6 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="flex items-center gap-3 mb-6">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} className="h-12 w-auto object-contain" />
            ) : (
              <div className="p-3 bg-indigo-900 rounded-xl text-white"><ShoppingCart className="w-6 h-6"/></div>
            )}
            <h2 className="text-xl font-black text-slate-800 tracking-tight">{settings.businessName}</h2>
          </div>
          
          <p className="text-slate-500 text-sm max-w-lg mb-8 leading-relaxed">
            {settings.address}<br/>
            {settings.phone} | {settings.email}
          </p>

          <div className="flex gap-4 mb-10">
            {settings.socialLinks.instagram && (
              <a href={settings.socialLinks.instagram} target="_blank" rel="noreferrer" className="p-3 bg-slate-100 rounded-2xl text-slate-400 hover:bg-pink-50 hover:text-pink-600 transition-all">
                <Instagram className="w-6 h-6" />
              </a>
            )}
            {settings.socialLinks.facebook && (
              <a href={settings.socialLinks.facebook} target="_blank" rel="noreferrer" className="p-3 bg-slate-100 rounded-2xl text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all">
                <Facebook className="w-6 h-6" />
              </a>
            )}
            {settings.socialLinks.website && (
              <a href={settings.socialLinks.website} target="_blank" rel="noreferrer" className="p-3 bg-slate-100 rounded-2xl text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                <Globe className="w-6 h-6" />
              </a>
            )}
            {settings.socialLinks.tiktokShop && (
              <a href={settings.socialLinks.tiktokShop} target="_blank" rel="noreferrer" className="p-3 bg-slate-100 rounded-2xl text-slate-400 hover:bg-slate-900 hover:text-white transition-all">
                <Music className="w-6 h-6" />
              </a>
            )}
          </div>

          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
            © {new Date().getFullYear()} {settings.businessName} - Todos os direitos reservados.
          </p>
        </div>
      </footer>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[48px] shadow-2xl overflow-hidden relative flex flex-col lg:flex-row animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setSelectedProduct(null)} 
              className="absolute top-6 right-6 z-10 p-3 bg-white/80 hover:bg-white backdrop-blur-md rounded-full text-slate-400 hover:text-slate-900 transition-all shadow-xl"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Product Image Section */}
            <div className="lg:w-1/2 bg-slate-50 flex items-center justify-center p-4 min-h-[300px] lg:min-h-0">
              {selectedProduct.imageUrl ? (
                <img 
                  src={selectedProduct.imageUrl} 
                  className="w-full h-full object-contain max-h-[70vh]" 
                  alt={selectedProduct.name} 
                />
              ) : (
                <div className="text-slate-200 flex flex-col items-center gap-4">
                  <Tag className="w-32 h-32" />
                  <p className="font-black text-[10px] uppercase tracking-widest">Imagem indisponível</p>
                </div>
              )}
            </div>

            {/* Product Info Section */}
            <div className="lg:w-1/2 p-8 lg:p-12 overflow-y-auto bg-white flex flex-col">
              <div className="mb-8">
                <span className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                  {selectedProduct.category}
                </span>
                <h2 className="text-3xl lg:text-4xl font-black text-slate-800 leading-tight mb-4">
                  {selectedProduct.name}
                </h2>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-black text-indigo-600">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedProduct.price)}
                  </p>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                    {selectedProduct.mode === PricingMode.AREA ? 'Por m²' : selectedProduct.mode === PricingMode.MILHEIRO ? 'Por Milheiro' : 'Por Unidade'}
                  </span>
                </div>
              </div>

              {/* Badges/Tags */}
              <div className="flex flex-wrap gap-2 mb-8">
                 {selectedProduct.productionTime && (
                   <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-amber-100">
                     <Clock className="w-4 h-4" /> {selectedProduct.productionTime}
                   </div>
                 )}
                 {selectedProduct.hasSize && (
                   <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                     <Layers className="w-4 h-4" /> Tamanhos Disponíveis
                   </div>
                 )}
              </div>

              {/* Description Area */}
              <div className="flex-1 mb-10">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Info className="w-4 h-4 text-indigo-500" /> Descrição Completa
                </h4>
                <div className="text-slate-600 text-sm leading-relaxed space-y-4 whitespace-pre-wrap">
                  {selectedProduct.description || "Nenhuma descrição adicional informada para este produto."}
                </div>
                
                {selectedProduct.hasSize && selectedProduct.availableSizes && selectedProduct.availableSizes.length > 0 && (
                  <div className="mt-8">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Grade de Tamanhos</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.availableSizes.map(size => (
                        <span key={size} className="w-10 h-10 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700">
                          {size}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="sticky bottom-0 bg-white pt-6 border-t border-slate-100 mt-auto flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => handleRequestQuote(selectedProduct)}
                  className="flex-1 py-4 bg-emerald-600 text-white font-black rounded-3xl shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  <MessageCircle className="w-6 h-6" /> Solicitar este Produto
                </button>
                <button 
                  onClick={() => setSelectedProduct(null)}
                  className="px-8 py-4 bg-slate-100 text-slate-600 font-black rounded-3xl hover:bg-slate-200 transition-all active:scale-95"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Storefront;
