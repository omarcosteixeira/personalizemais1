
import React, { useState } from 'react';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Type, 
  Send, 
  Download, 
  RefreshCw, 
  ShoppingCart, 
  X,
  Zap,
  Layout,
  Instagram,
  Smartphone,
  Copy,
  Check,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Product } from '../types';
import { storage } from '../services/storageService';
import { GoogleGenAI } from "@google/genai";

interface Props {
  products: Product[];
}

const PromotionalAI: React.FC<Props> = ({ products }) => {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [objective, setObjective] = useState<'PROMO' | 'NEW' | 'BRAND' | 'URGENT'>('PROMO');
  const [format, setFormat] = useState<'1:1' | '9:16'>('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedArt, setGeneratedArt] = useState<string | null>(null);
  const [generatedCopy, setGeneratedCopy] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const settings = storage.getSettings();

  const handleCopyText = () => {
    if (!generatedCopy) return;
    navigator.clipboard.writeText(generatedCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generatePromotionalArt = async () => {
    setIsGenerating(true);
    setError(null);
    setGeneratedArt(null);
    setGeneratedCopy(null);

    const product = products.find(p => p.id === selectedProductId);
    const productName = product ? product.name : "nossos serviços gráficos";
    const productPrice = product ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price) : "";

    try {
      // 1. Verificar Key (Sistema Interno de Seleção)
      const aistudio = (window as any).aistudio;
      if (aistudio) {
        const hasKey = await aistudio.hasSelectedApiKey();
        if (!hasKey) await aistudio.openSelectKey();
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      // 2. Gerar Texto Persuasivo (Copy)
      const textPrompt = `Aja como um especialista em marketing para gráficas rápidas. 
      Crie uma legenda persuasiva de Instagram para o produto: ${productName}.
      Objetivo: ${objective === 'PROMO' ? 'Promoção Imperdível' : objective === 'NEW' ? 'Lançamento' : objective === 'URGENT' ? 'Últimas unidades' : 'Fortalecer marca'}.
      Preço de referência: ${productPrice}. 
      Inclua emojis, hashtags relevantes e um Call to Action para o WhatsApp ${settings.phone}. 
      Mantenha um tom profissional, porém amigável.`;

      const textResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: textPrompt,
      });
      setGeneratedCopy(textResponse.text || "");

      // 3. Gerar Imagem da Arte (Pro)
      const imagePrompt = `Crie uma arte publicitária profissional de alta qualidade para uma gráfica rápida. 
      O foco deve ser o produto: ${productName}. 
      Ambiente: Estúdio fotográfico minimalista com cores modernas (tons de ${settings.theme.primaryColor}). 
      Estilo: Fotografia comercial premium, iluminação dramática, composição centrada, alta fidelidade. 
      Contexto: ${objective === 'PROMO' ? 'Banner de oferta' : 'Exibição de produto de luxo'}. 
      Não adicione textos ilegíveis, foque no realismo do material gráfico.`;

      const imageResponse = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: imagePrompt,
        config: {
          imageConfig: {
            aspectRatio: format,
            imageSize: "1K"
          }
        }
      });

      if (imageResponse.candidates?.[0]?.content?.parts) {
        for (const part of imageResponse.candidates[0].content.parts) {
          if (part.inlineData) {
            setGeneratedArt(`data:image/png;base64,${part.inlineData.data}`);
            break;
          }
        }
      }

    } catch (err: any) {
      console.error(err);
      setError("Houve um erro na geração. Verifique sua conexão ou chave de API.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!generatedArt) return;
    const link = document.createElement('a');
    link.href = generatedArt;
    link.download = `arte-promocional-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8">
        
        {/* Painel de Controle (Esquerda) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-200">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-3 mb-6">
              <Sparkles className="w-6 h-6 text-indigo-600" /> Criador de Arte IA
            </h3>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selecione o Produto</label>
                <select 
                  value={selectedProductId}
                  onChange={e => setSelectedProductId(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none"
                >
                  <option value="">Produto Genérico / Gráfica</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} - R$ {p.price}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Objetivo da Campanha</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'PROMO', label: 'Promoção', icon: Zap },
                    { id: 'NEW', label: 'Lançamento', icon: Sparkles },
                    { id: 'BRAND', label: 'Institucional', icon: Layout },
                    { id: 'URGENT', label: 'Urgente', icon: AlertCircle },
                  ].map(opt => (
                    <button 
                      key={opt.id}
                      onClick={() => setObjective(opt.id as any)}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-1.5 ${objective === opt.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100'}`}
                    >
                      <opt.icon className="w-4 h-4" />
                      <span className="text-[9px] font-black uppercase">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Formato da Arte</label>
                <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
                  <button 
                    onClick={() => setFormat('1:1')}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black flex items-center justify-center gap-2 transition-all ${format === '1:1' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}
                  >
                    <Instagram className="w-4 h-4" /> POST (1:1)
                  </button>
                  <button 
                    onClick={() => setFormat('9:16')}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black flex items-center justify-center gap-2 transition-all ${format === '9:16' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}
                  >
                    <Smartphone className="w-4 h-4" /> STORY (9:16)
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600 text-xs">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <button 
                onClick={generatePromotionalArt}
                disabled={isGenerating}
                className={`w-full py-5 rounded-3xl font-black text-white shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 ${isGenerating ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'}`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    CRIANDO MÁGICA...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    GERAR CONTEÚDO IA
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Canvas de Visualização (Direita) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-200 min-h-[600px] flex flex-col">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Visualização do Anúncio</h4>
            
            <div className="flex-1 flex flex-col md:flex-row gap-8">
              {/* Arte Visual */}
              <div className="flex-1 space-y-4">
                <div className={`aspect-${format === '1:1' ? 'square' : '[9/16]'} bg-slate-50 rounded-[32px] border-2 border-slate-100 overflow-hidden relative flex items-center justify-center shadow-inner group`}>
                   {isGenerating ? (
                     <div className="text-center p-8 space-y-4 animate-pulse">
                        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
                          <ImageIcon className="w-8 h-8 text-indigo-600" />
                        </div>
                        <p className="text-xs font-black text-indigo-900 uppercase">Processando Imagem...</p>
                     </div>
                   ) : generatedArt ? (
                     <>
                        <img src={generatedArt} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <button 
                             onClick={downloadImage}
                             className="px-6 py-3 bg-white text-slate-800 font-bold rounded-2xl flex items-center gap-2 shadow-2xl hover:scale-105 transition-all"
                           >
                             <Download className="w-5 h-5" /> Baixar Imagem
                           </button>
                        </div>
                     </>
                   ) : (
                     <div className="text-center opacity-30">
                        <ImageIcon className="w-12 h-12 mx-auto mb-3" />
                        <p className="text-xs font-bold">Sua arte aparecerá aqui</p>
                     </div>
                   )}
                </div>
              </div>

              {/* Texto Persuasivo */}
              <div className="md:w-72 flex flex-col space-y-4">
                <div className="flex-1 p-6 bg-slate-50 rounded-3xl border border-slate-100 relative overflow-hidden flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Legenda Sugerida</p>
                    {generatedCopy && (
                      <button onClick={handleCopyText} className="p-2 bg-white rounded-xl shadow-sm hover:text-indigo-600 transition-colors">
                        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                  
                  <div className="flex-1 text-xs text-slate-600 leading-relaxed overflow-y-auto max-h-96 whitespace-pre-wrap no-scrollbar">
                    {isGenerating ? (
                      <div className="space-y-3">
                        <div className="h-3 bg-slate-200 rounded-full w-full animate-pulse"></div>
                        <div className="h-3 bg-slate-200 rounded-full w-5/6 animate-pulse"></div>
                        <div className="h-3 bg-slate-200 rounded-full w-4/6 animate-pulse"></div>
                      </div>
                    ) : generatedCopy ? (
                      generatedCopy
                    ) : (
                      <p className="text-slate-300 italic">O roteiro de vendas será gerado automaticamente.</p>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center gap-3">
                   <div className="p-2 bg-white rounded-lg"><Smartphone className="w-4 h-4 text-indigo-600" /></div>
                   <p className="text-[10px] font-bold text-indigo-900 leading-tight">Pronto para publicar no Instagram e WhatsApp.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dicas de Marketing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: "Consistência Visual", desc: "A IA usa as cores da sua marca configuradas nos ajustes para manter sua identidade.", icon: Layout },
          { title: "Copywriting de Elite", desc: "Os textos utilizam gatilhos mentais de escassez e autoridade para converter mais.", icon: Type },
          { title: "Alta Performance", desc: "Artes geradas em 1K com realismo fotográfico aumentam a percepção de valor.", icon: Smartphone }
        ].map((dica, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 flex items-start gap-4 shadow-sm">
             <div className="p-3 bg-slate-50 rounded-2xl"><dica.icon className="w-5 h-5 text-indigo-600" /></div>
             <div>
               <h5 className="font-bold text-slate-800 text-sm mb-1">{dica.title}</h5>
               <p className="text-xs text-slate-500 leading-relaxed">{dica.desc}</p>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PromotionalAI;
