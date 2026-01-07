
import React, { useState } from 'react';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Send, 
  Download, 
  Zap,
  Layout,
  Instagram,
  Smartphone,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  Key,
  Info,
  ExternalLink
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

  const handleOpenKeySelector = async () => {
    try {
      const aistudio = (window as any).aistudio;
      if (aistudio && typeof aistudio.openSelectKey === 'function') {
        await aistudio.openSelectKey();
        setError(null);
      }
    } catch (err) {
      console.error("Erro ao abrir seletor de chaves:", err);
    }
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
      // Regra Obrigatória Gemini 3 Pro: Verificar seleção de chave
      const aistudio = (window as any).aistudio;
      if (aistudio) {
        const hasKey = await aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await aistudio.openSelectKey();
        }
      }

      // Inicializa com a chave mais recente disponível no ambiente
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      // 1. Gerar Roteiro de Vendas (Flash)
      const textPrompt = `Aja como um especialista em copy para gráficas. Crie uma legenda de Instagram para o produto: ${productName}. Objetivo: ${objective}. Preço: ${productPrice}. Inclua emojis e CTA para o WhatsApp ${settings.phone}.`;
      
      const textResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: textPrompt,
      });
      setGeneratedCopy(textResponse.text || "");

      // 2. Gerar Arte Visual (Pro Image)
      const imagePrompt = `Crie uma imagem de anúncio publicitário profissional para uma gráfica. Produto: ${productName}. Ambiente: Estúdio fotográfico minimalista, luz suave, cores modernas (predomínio de ${settings.theme.primaryColor}). Estilo: Fotografia comercial premium, 8k, realista, foco total no produto. Sem textos escritos.`;

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
        let found = false;
        for (const part of imageResponse.candidates[0].content.parts) {
          if (part.inlineData) {
            setGeneratedArt(`data:image/png;base64,${part.inlineData.data}`);
            found = true;
            break;
          }
        }
        if (!found) setError("A IA não conseguiu gerar a imagem. Verifique as restrições da sua conta Gemini.");
      }

    } catch (err: any) {
      console.error("Erro na API Gemini:", err);
      const msg = err.message || "";
      
      if (msg.includes("Requested entity was not found") || msg.includes("API_KEY")) {
        setError("Erro de Autenticação: Sua chave de API não foi reconhecida ou não tem saldo. Por favor, utilize o seletor abaixo para validar uma chave de um projeto pago.");
      } else {
        setError(`Erro na geração: ${msg || "Verifique sua conexão e saldo da API Google."}`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!generatedArt) return;
    const link = document.createElement('a');
    link.href = generatedArt;
    link.download = `arte-ia-grafica-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8">
        
        {/* Painel de Configuração */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-200">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-3 mb-6">
              <Sparkles className="w-6 h-6 text-indigo-600" /> Criador de Arte IA
            </h3>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Qual o Produto?</label>
                <select 
                  value={selectedProductId}
                  onChange={e => setSelectedProductId(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Serviços Gerais / Gráfica</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} - R$ {p.price}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo de Post</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'PROMO', label: 'Promoção', icon: Zap },
                    { id: 'NEW', label: 'Novidade', icon: Sparkles },
                    { id: 'BRAND', label: 'Marca', icon: Layout },
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
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Formato</label>
                <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
                  <button onClick={() => setFormat('1:1')} className={`flex-1 py-3 rounded-xl text-[10px] font-black flex items-center justify-center gap-2 transition-all ${format === '1:1' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>
                    <Instagram className="w-4 h-4" /> POST
                  </button>
                  <button onClick={() => setFormat('9:16')} className={`flex-1 py-3 rounded-xl text-[10px] font-black flex items-center justify-center gap-2 transition-all ${format === '9:16' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>
                    <Smartphone className="w-4 h-4" /> STORY
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl space-y-3 animate-in slide-in-from-top-2">
                  <div className="flex items-start gap-3 text-red-600 text-[11px] font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>{error}</p>
                  </div>
                  <button 
                    onClick={handleOpenKeySelector}
                    className="w-full py-3 bg-white border-2 border-red-200 text-red-600 rounded-xl text-[10px] font-black uppercase hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Key className="w-4 h-4" /> Selecionar Chave Paga (AI Studio)
                  </button>
                  <p className="text-center text-[9px] text-slate-400 italic">Certifique-se de que a chave tenha faturamento ativo.</p>
                </div>
              )}

              <button 
                onClick={generatePromotionalArt}
                disabled={isGenerating}
                className={`w-full py-5 rounded-3xl font-black text-white shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 ${isGenerating ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'}`}
              >
                {isGenerating ? <><Loader2 className="w-5 h-5 animate-spin" /> GERANDO...</> : <><Zap className="w-5 h-5" /> CRIAR CAMPANHA IA</>}
              </button>
            </div>
          </div>
        </div>

        {/* Painel de Visualização */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-200 min-h-[600px] flex flex-col">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Visualização do Anúncio</h4>
            
            <div className="flex-1 flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <div className={`aspect-${format === '1:1' ? 'square' : '[9/16]'} bg-slate-50 rounded-[32px] border-2 border-slate-100 overflow-hidden relative flex items-center justify-center group shadow-inner`}>
                   {isGenerating ? (
                     <div className="text-center p-8 space-y-4 animate-pulse">
                        <ImageIcon className="w-12 h-12 text-indigo-200 mx-auto" />
                        <p className="text-[10px] font-black text-indigo-900 uppercase">A IA está criando sua arte...</p>
                     </div>
                   ) : generatedArt ? (
                     <>
                        <img src={generatedArt} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <button onClick={downloadImage} className="px-6 py-3 bg-white text-slate-800 font-bold rounded-2xl flex items-center gap-2 shadow-2xl hover:scale-105 transition-all">
                             <Download className="w-5 h-5" /> Baixar Imagem
                           </button>
                        </div>
                     </>
                   ) : (
                     <div className="text-center opacity-20">
                        <ImageIcon className="w-16 h-16 mx-auto mb-2" />
                        <p className="text-xs font-bold">A arte publicitária será exibida aqui</p>
                     </div>
                   )}
                </div>
              </div>

              <div className="md:w-72 flex flex-col space-y-4">
                <div className="flex-1 p-6 bg-slate-50 rounded-3xl border border-slate-100 relative flex flex-col overflow-hidden">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Legenda Sugerida</p>
                    {generatedCopy && (
                      <button onClick={handleCopyText} className="p-2 bg-white rounded-xl shadow-sm hover:text-indigo-600 transition-colors">
                        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                  <div className="flex-1 text-xs text-slate-600 leading-relaxed overflow-y-auto whitespace-pre-wrap no-scrollbar">
                    {isGenerating ? "Criando copy persuasiva..." : (generatedCopy || "O texto da legenda será gerado automaticamente pela IA.")}
                  </div>
                </div>

                <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center gap-3">
                   <Info className="w-5 h-5 text-indigo-600 shrink-0" />
                   <div className="flex-1">
                     <p className="text-[10px] font-black text-indigo-900 uppercase leading-none mb-1">Nota</p>
                     <p className="text-[9px] text-indigo-700 leading-tight">Para o **Gemini 3 Pro Image**, é recomendável utilizar uma conta do Google Cloud com faturamento ativado.</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionalAI;
