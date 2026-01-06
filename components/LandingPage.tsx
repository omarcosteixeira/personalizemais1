
import React, { useState, useEffect } from 'react';
import { storage } from '../services/storageService';
import { SystemConfig } from '../types';
import { 
  Printer, 
  Sparkles, 
  Calculator, 
  Layers, 
  CheckCircle2, 
  ShoppingCart, 
  MessageCircle, 
  Smartphone, 
  LayoutDashboard,
  Zap,
  Star,
  ChevronRight,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';

interface Props {
  onStart: () => void;
}

const LandingPage: React.FC<Props> = ({ onStart }) => {
  const [config, setConfig] = useState<SystemConfig | null>(null);

  useEffect(() => {
    storage.getSystemConfig().then(setConfig);
  }, []);

  const features = [
    {
      title: "Cálculo de M² Automatizado",
      desc: "Pare de perder tempo com calculadora. Orçamentos precisos por área ou unidade em segundos.",
      icon: Calculator,
      color: "text-indigo-600",
      bg: "bg-indigo-50"
    },
    {
      title: "IA de Arte Promocional",
      desc: "Gere posts profissionais para Instagram e legendas persuasivas usando Inteligência Artificial nativa.",
      icon: Sparkles,
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
    {
      title: "Estoque Inteligente",
      desc: "Saiba exatamente quando repor papéis, tintas e insumos com alertas automáticos de nível crítico.",
      icon: Layers,
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    {
      title: "Sua Loja Online Pronta",
      desc: "Tenha um catálogo digital exclusivo para seus clientes escolherem produtos e pedirem via WhatsApp.",
      icon: ShoppingCart,
      color: "text-rose-600",
      bg: "bg-rose-50"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header / Nav */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-900 rounded-xl shadow-lg"><Printer className="w-6 h-6 text-white" /></div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Personalize <span className="text-indigo-600">+</span></h1>
          </div>
          <button 
            onClick={onStart}
            className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all active:scale-95"
          >
            Acessar Sistema
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-indigo-50/50 rounded-full blur-3xl -z-10"></div>
        <div className="max-w-5xl mx-auto text-center space-y-8 relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-full">
            <Zap className="w-4 h-4 text-indigo-600 fill-indigo-600" />
            <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">O #1 para Gráficas e Papelaria</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-slate-900 leading-tight tracking-tighter">
            Sua Papelaria Personalizada <br /> 
            <span className="text-indigo-600">em Outro Nível.</span>
          </h2>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
            A ferramenta completa para quem vive de criatividade. Orçamentos rápidos, precificação justa, controle de estoque e IA para suas artes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <button 
              onClick={onStart}
              className="px-10 py-5 bg-indigo-600 text-white font-black rounded-3xl shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 text-lg group"
            >
              COMEÇAR AGORA <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="flex items-center gap-4 px-8 py-5">
              <div className="flex -space-x-2">
                {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" />)}
              </div>
              <span className="text-xs font-bold text-slate-400">Junte-se a +500 ateliês</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h3 className="text-3xl font-black text-slate-800 tracking-tight">Feito por quem entende de ateliê</h3>
            <p className="text-slate-400 font-medium">Todas as ferramentas que você precisa em um só lugar.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <div key={i} className="p-8 rounded-[40px] border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all group">
                <div className={`p-4 ${f.bg} ${f.color} rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-black text-slate-800 mb-3">{f.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 space-y-8">
            <h3 className="text-4xl font-black text-slate-800 tracking-tight">Porque o Personalize + é a escolha certa?</h3>
            <div className="space-y-6">
              {[
                { t: "Fim das Planilhas Confusas", d: "Esqueça fórmulas complexas de Excel. Nosso sistema já vem configurado para o seu mercado." },
                { t: "Lucro Real no Bolso", d: "Nossa calculadora de precificação considera seus custos fixos e pro-labore automaticamente." },
                { t: "Profissionalismo Instantâneo", d: "Envie PDFs de orçamentos e pedidos elegantes com a sua marca para seus clientes." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="mt-1"><CheckCircle2 className="w-6 h-6 text-indigo-600" /></div>
                  <div>
                    <h5 className="text-lg font-bold text-slate-800">{item.t}</h5>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">{item.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 w-full">
            <div className="aspect-video bg-indigo-900 rounded-[48px] shadow-2xl relative overflow-hidden flex items-center justify-center p-12 text-center group">
               <div className="absolute inset-0 bg-gradient-to-br from-indigo-800 to-black opacity-40"></div>
               <div className="relative z-10 space-y-6">
                  <LayoutDashboard className="w-20 h-20 text-white/20 mx-auto group-hover:scale-110 transition-transform duration-700" />
                  <p className="text-white text-xl font-bold">Interface Intuitiva & Moderna</p>
                  <p className="text-indigo-200 text-sm font-medium">Projetada para que você não perca tempo aprendendo e foque no que importa: Criar.</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-6 bg-indigo-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="space-y-4 mb-16">
            <h3 className="text-4xl font-black text-white tracking-tight">O investimento que se paga em 1 orçamento.</h3>
            <p className="text-indigo-200 font-medium">Escolha o plano que melhor se adapta ao seu momento.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Plano Básico */}
            <div className="bg-white p-10 rounded-[48px] shadow-2xl text-left flex flex-col">
              <div className="mb-8">
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full mb-2 inline-block">Plano Essencial</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-black text-slate-800">R$ {config?.basicPlanPrice.toFixed(2) || '49,90'}</span>
                  <span className="text-slate-400 font-bold">/mês</span>
                </div>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                {["Gestão de Orçamentos", "Cálculo de M² e Unidade", "Catálogo de Produtos", "Gerador de PDF", "Histórico de Clientes"].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm font-bold text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" /> {item}
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => window.open(config?.paymentLink, '_blank')}
                className="w-full py-4 bg-slate-50 text-indigo-600 font-black rounded-2xl hover:bg-indigo-50 transition-all border border-indigo-100"
              >
                ASSINAR AGORA
              </button>
            </div>

            {/* Plano Pro */}
            <div className="bg-indigo-600 p-10 rounded-[48px] shadow-2xl text-left border-4 border-white/10 flex flex-col relative scale-105">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-950 text-[9px] font-black px-4 py-1.5 rounded-full shadow-lg">MAIS VENDIDO</div>
              <div className="mb-8 text-white">
                <span className="text-[10px] font-black text-indigo-100 uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full mb-2 inline-block">Plano Completo</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-black">R$ {config?.proPlanPrice.toFixed(2) || '89,90'}</span>
                  <span className="text-indigo-200 font-bold">/mês</span>
                </div>
              </div>
              <ul className="space-y-4 mb-10 flex-1 text-white">
                {[
                  "Tudo do plano Essencial", 
                  "IA de Criação de Artes", 
                  "Controle de Estoque Pro", 
                  "Multi-usuários", 
                  "Dashboard Financeiro", 
                  "Laboratório de Fontes"
                ].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm font-bold opacity-90">
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" /> {item}
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => window.open(config?.paymentLink, '_blank')}
                className="w-full py-4 bg-white text-indigo-600 font-black rounded-2xl shadow-xl hover:scale-105 transition-all"
              >
                ASSINAR PRO AGORA
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-900 rounded-xl"><Printer className="w-5 h-5 text-white" /></div>
            <h1 className="text-lg font-black text-slate-800 tracking-tight">Personalize <span className="text-indigo-600">+</span></h1>
          </div>
          <div className="flex gap-8 text-xs font-black text-slate-400 uppercase tracking-widest">
            <a href="#" className="hover:text-indigo-600 transition-colors">Funcionalidades</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Suporte</a>
          </div>
          <p className="text-[10px] font-bold text-slate-300">© 2024 Personalize + - Desenvolvido para Ateliês</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
