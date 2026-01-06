
import React, { useState, useRef } from 'react';
import { Product, PricingMode } from '../types';
import { storage } from '../services/storageService';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Check, 
  Upload, 
  Download, 
  Star, 
  TrendingUp, 
  Image as ImageIcon, 
  FileText,
  Sparkles,
  Loader2,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface Props {
  products: Product[];
  onUpdate: () => void;
}

const ProductCatalog: React.FC<Props> = ({ products, onUpdate }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [productionCost, setProductionCost] = useState(0);
  const [mode, setMode] = useState<PricingMode>(PricingMode.AREA);
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isHighlighted, setIsHighlighted] = useState(false);
  
  // New Extra Fields
  const [hasSize, setHasSize] = useState(false);
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [hasTheme, setHasTheme] = useState(false);
  const [productionTime, setProductionTime] = useState('');

  const kidsSizes = ['2', '4', '6', '8', '10', '12', '14', '16'];
  const adultSizes = ['PP', 'P', 'M', 'G', 'GG', 'G1', 'G2', 'G3'];

  const resetForm = () => {
    setName(''); 
    setDescription('');
    setPrice(0); 
    setProductionCost(0); 
    setMode(PricingMode.AREA);
    setCategory(''); 
    setImageUrl(''); 
    setIsHighlighted(false);
    setHasSize(false);
    setAvailableSizes([]);
    setHasTheme(false);
    setProductionTime('');
    setIsAdding(false); 
    setEditingId(null);
  };

  const handleAiImprove = async () => {
    if (!description && !name) {
      alert("Escreva pelo menos o nome ou um rascunho da descrição para que a IA possa ajudar.");
      return;
    }

    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Você é um especialista em marketing e copywriting para gráficas rápidas. 
      Sua tarefa é reescrever a descrição do produto abaixo para torná-la altamente profissional, persuasiva e atraente para vendas na loja online.
      Foque nos benefícios, na qualidade da impressão, durabilidade dos materiais e acabamento impecável.
      Mantenha um tom que gere confiança e desejo de compra.
      
      Produto: ${name}
      Categoria: ${category}
      Descrição Atual: ${description}
      
      Responda APENAS com o texto da nova descrição melhorada, sem introduções ou explicações.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      const improvedText = response.text;
      if (improvedText) {
        setDescription(improvedText.trim());
      }
    } catch (error) {
      console.error("Erro ao melhorar descrição com IA:", error);
      alert("Não foi possível conectar com a inteligência artificial agora. Tente novamente em instantes.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const toggleSize = (size: string) => {
    setAvailableSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const handleSave = () => {
    if (!name || price <= 0) return;
    const product: Product = {
      id: editingId || Math.random().toString(36).substr(2, 9),
      name, 
      description,
      price, 
      productionCost, 
      mode, 
      category: category || 'Geral', 
      imageUrl, 
      isHighlighted,
      hasSize,
      availableSizes,
      hasTheme: hasSize || hasTheme, // Força tema se tiver tamanho
      productionTime
    };
    storage.saveProduct(product);
    onUpdate();
    resetForm();
  };

  const handleEdit = (p: Product) => {
    setName(p.name); 
    setDescription(p.description || '');
    setPrice(p.price); 
    setProductionCost(p.productionCost || 0);
    setMode(p.mode); 
    setCategory(p.category); 
    setImageUrl(p.imageUrl || '');
    setIsHighlighted(!!p.isHighlighted); 
    setHasSize(!!p.hasSize);
    setAvailableSizes(p.availableSizes || []);
    setHasTheme(!!p.hasTheme || !!p.hasSize);
    setProductionTime(p.productionTime || '');
    setEditingId(p.id); 
    setIsAdding(true);
  };

  const toggleHighlight = (p: Product) => {
    const updated = { ...p, isHighlighted: !p.isHighlighted };
    storage.saveProduct(updated);
    onUpdate();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-200 gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Catálogo Admin</h3>
          <p className="text-sm text-slate-500">Gestão de produtos e destaques da loja</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input type="file" ref={csvInputRef} onChange={() => {}} className="hidden" accept=".csv" />
          <button onClick={() => csvInputRef.current?.click()} className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors"><Upload className="w-4 h-4"/> Importar</button>
          <button onClick={() => {}} className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors"><Download className="w-4 h-4"/> Exportar</button>
          <button onClick={() => setIsAdding(true)} className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 flex items-center gap-2 shadow-lg shadow-indigo-100 transition-all"><Plus className="w-4 h-4"/> Novo Item</button>
        </div>
      </div>

      {isAdding && (
        <div className="bg-white p-8 rounded-3xl shadow-xl border-2 border-indigo-100 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase">Nome do Produto</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase">Categoria</label>
              <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Ex: Camisetas" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase">Tipo Cobrança</label>
              <select value={mode} onChange={(e) => setMode(e.target.value as PricingMode)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
                <option value={PricingMode.UNIT}>Unidade</option>
                <option value={PricingMode.AREA}>M² (em cm)</option>
                <option value={PricingMode.MILHEIRO}>Milheiro</option>
              </select>
            </div>
            
            <div className="md:col-span-4 space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1"><FileText className="w-3 h-3"/> Descrição detalhada (aparece na loja)</label>
                <button 
                  onClick={handleAiImprove}
                  disabled={isAiLoading}
                  className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all border border-indigo-200 disabled:opacity-50"
                >
                  {isAiLoading ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" /> Processando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3" /> Melhorar com IA
                    </>
                  )}
                </button>
              </div>
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none h-32 resize-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
                placeholder="Ex: Impressão de alta qualidade..."
              />
            </div>

            {/* Extras Section */}
            <div className="md:col-span-4 bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-6">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-500"/> Configurações Extras do Produto
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Tamanhos */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="checkSize" 
                      checked={hasSize} 
                      onChange={e => {
                        setHasSize(e.target.checked);
                        // Ao habilitar tamanhos, o tema também deve ser solicitado conforme requisito
                        if (e.target.checked) setHasTheme(true);
                      }} 
                      className="w-4 h-4 accent-indigo-600"
                    />
                    <label htmlFor="checkSize" className="text-sm font-bold text-slate-700">Habilitar Tamanhos Específicos</label>
                  </div>
                  
                  {hasSize && (
                    <div className="space-y-4 animate-in slide-in-from-left-2">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Grade Infantil</p>
                        <div className="flex flex-wrap gap-2">
                          {kidsSizes.map(s => (
                            <button 
                              key={s} 
                              onClick={() => toggleSize(s)}
                              className={`w-10 h-10 rounded-lg text-xs font-bold transition-all border-2 ${availableSizes.includes(s) ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-400 hover:border-indigo-200'}`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Grade Adulto</p>
                        <div className="flex flex-wrap gap-2">
                          {adultSizes.map(s => (
                            <button 
                              key={s} 
                              onClick={() => toggleSize(s)}
                              className={`w-10 h-10 rounded-lg text-xs font-bold transition-all border-2 ${availableSizes.includes(s) ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-400 hover:border-indigo-200'}`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="checkTheme" 
                        checked={hasTheme || hasSize} 
                        onChange={e => setHasTheme(e.target.checked)} 
                        className="w-4 h-4 accent-indigo-600"
                        disabled={hasSize} // Se tem tamanho, o tema é obrigatório pelo requisito
                      />
                      <label htmlFor="checkTheme" className={`text-sm font-bold ${hasSize ? 'text-slate-400' : 'text-slate-700'}`}>Campo de Tema/Arte {hasSize && '(Obrigatório p/ Tamanhos)'}</label>
                    </div>
                    {(hasTheme || hasSize) && <p className="text-[10px] text-slate-400 italic">O sistema solicitará o tema ao adicionar o item no orçamento.</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><Clock className="w-3 h-3"/> Prazo de Produção Estimado</label>
                    <input 
                      type="text" 
                      value={productionTime} 
                      onChange={e => setProductionTime(e.target.value)} 
                      placeholder="Ex: 5 dias úteis" 
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase text-emerald-600">Custo Produção (R$)</label>
              <input type="number" step="0.01" value={productionCost} onChange={(e) => setProductionCost(parseFloat(e.target.value) || 0)} className="w-full p-3 bg-emerald-50 border border-emerald-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase text-indigo-600">Preço Venda (R$)</label>
              <input type="number" step="0.01" value={price} onChange={(e) => setPrice(parseFloat(e.target.value) || 0)} className="w-full p-3 bg-indigo-50 border border-indigo-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase">Foto do Produto</label>
              <div className="flex items-center gap-3">
                <input type="file" ref={fileInputRef} onChange={() => {}} className="hidden" accept="image/png, image/jpeg" />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-200 transition-all border border-slate-200"
                >
                  <Upload className="w-4 h-4" /> Enviar Foto
                </button>
                {imageUrl && (
                  <div className="w-12 h-12 rounded-lg border-2 border-indigo-200 overflow-hidden shrink-0 shadow-sm">
                    <img src={imageUrl} className="w-full h-full object-cover" alt="Preview" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl h-[52px] border border-slate-200">
              <input type="checkbox" checked={isHighlighted} onChange={(e) => setIsHighlighted(e.target.checked)} className="w-5 h-5 accent-indigo-600 cursor-pointer" id="highlight-check"/>
              <label htmlFor="highlight-check" className="text-xs font-bold text-slate-600 cursor-pointer flex items-center gap-1"><Star className={`w-3 h-3 ${isHighlighted ? 'fill-yellow-400 text-yellow-400' : ''}`}/> Destacar na Loja</label>
            </div>
            
            <div className="md:col-span-4 flex gap-2 justify-end pt-6 border-t border-slate-100">
              <button onClick={resetForm} className="px-8 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">Cancelar</button>
              <button onClick={handleSave} className="px-12 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">Salvar Produto</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Produto</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Custo</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Venda</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Rentab.</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Destaque</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map(p => {
                const profit = p.price - p.productionCost;
                const margin = p.price > 0 ? (profit / p.price) * 100 : 0;
                return (
                  <tr key={p.id} className="group hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 group-hover:scale-105 transition-transform">
                           {p.imageUrl ? (
                             <img src={p.imageUrl} className="w-full h-full object-cover" alt={p.name} />
                           ) : (
                             <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-6 h-6 text-slate-300"/></div>
                           )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700">{p.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{p.category}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {p.productionTime && (
                              <span className="text-[8px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-black uppercase tracking-widest">
                                <Clock className="w-2 h-2 inline mr-1"/> {p.productionTime}
                              </span>
                            )}
                            {p.hasSize && (
                              <span className="text-[8px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-black uppercase tracking-widest">
                                Grade Ativa
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-xs text-slate-500 font-medium">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.productionCost)}</td>
                    <td className="px-6 py-4 text-right text-sm font-black text-indigo-700">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.price)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className={`text-sm font-black ${profit > 0 ? 'text-emerald-600' : 'text-red-500'}`}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(profit)}</span>
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> {margin.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => toggleHighlight(p)} 
                        className={`p-2 rounded-xl transition-all ${p.isHighlighted ? 'bg-yellow-50 text-yellow-500 shadow-sm' : 'text-slate-200 hover:text-slate-400'}`}
                      >
                        <Star className={`w-6 h-6 ${p.isHighlighted ? 'fill-current' : ''}`} />
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => handleEdit(p)} className="p-2 text-slate-400 hover:bg-white hover:text-indigo-600 hover:shadow-sm rounded-lg transition-all"><Edit2 className="w-4 h-4"/></button>
                        <button onClick={() => { if(confirm('Deseja excluir este item do catálogo?')) { storage.deleteProduct(p.id); onUpdate(); } }} className="p-2 text-slate-400 hover:bg-white hover:text-red-500 hover:shadow-sm rounded-lg transition-all"><Trash2 className="w-4 h-4"/></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductCatalog;
