import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Globe, 
  BookOpen, 
  Lightbulb, 
  Briefcase, 
  FileText,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Zap,
  Users
} from 'lucide-react';

interface PortfolioHomeProps {
  onNavigate: (page: string) => void;
}

const PortfolioHome: React.FC<PortfolioHomeProps> = ({ onNavigate }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    },
  };

  const cards = [
    {
      id: 'website',
      icon: <Globe className="w-12 h-12" />,
      title: 'رابط المشروع (الدومين)',
      description: 'تفضل بزيارة المنصة الرسمية لـ GoLocal واستكشف النظام المتكامل مباشرة عبر الدومين الخاص بنا',
      color: 'from-blue-600/30 to-blue-900/10',
      borderColor: 'border-blue-500/40',
      textColor: 'text-blue-400',
      action: () => window.open('https://golocal-system.com/', '_blank'),
      external: true,
      featured: true
    },
    {
      id: 'instructions',
      icon: <BookOpen className="w-12 h-12" />,
      title: 'التعليمات والإرشادات',
      description: 'تعلم كيفية استخدام منصة GoLocal بكل احترافية وتحقق أقصى استفادة من جميع المميزات',
      color: 'from-purple-500/20 to-transparent',
      borderColor: 'border-purple-500/20',
      textColor: 'text-purple-400',
      action: () => onNavigate('instructions'),
      external: false
    },
    {
      id: 'solutions',
      icon: <Lightbulb className="w-12 h-12" />,
      title: 'حل المشاكل',
      description: 'كيف يمكن لـ GoLocal أن تساعد في حل مشاكل المجتمع وتخفيف الأزمات المحلية بذكاء',
      color: 'from-emerald-500/20 to-transparent',
      borderColor: 'border-emerald-500/20',
      textColor: 'text-emerald-400',
      action: () => onNavigate('solutions'),
      external: false
    },
    {
      id: 'careers',
      icon: <Briefcase className="w-12 h-12" />,
      title: 'الانضمام معنا',
      description: 'استكشف فرص العمل المتاحة وانضم إلى فريق GoLocal المتنامي في منطقتك',
      color: 'from-orange-500/20 to-transparent',
      borderColor: 'border-orange-500/20',
      textColor: 'text-orange-400',
      action: () => onNavigate('careers'),
      external: false
    },
    {
      id: 'terms',
      icon: <FileText className="w-12 h-12" />,
      title: 'شروط الاستخدام',
      description: 'اقرأ شروط الاستخدام والالتزام بالقوانين والسياسات لضمان تجربة آمنة للجميع',
      color: 'from-red-500/20 to-transparent',
      borderColor: 'border-red-500/20',
      textColor: 'text-red-400',
      action: () => onNavigate('terms'),
      external: false
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white font-sans selection:bg-blue-500/30 overflow-x-hidden">
      {/* Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] left-[30%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md border-b border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Globe className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              GoLocal Portfolio
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-400">
             <button onClick={() => onNavigate('solutions')} className="hover:text-white transition-colors">الحلول</button>
             <button onClick={() => onNavigate('instructions')} className="hover:text-white transition-colors">الإرشادات</button>
             <a href="https://golocal-system.com/" target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-all">فتح المشروع</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="inline-block mb-6 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium"
          >
            مشروع التخرج | منصة GoLocal المتكاملة 🚀
          </motion.div>
          
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight tracking-tight"
          >
            بورتفوليو <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-blue-600">عرض المشروع</span>
          </motion.h1>

          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-400 text-lg md:text-2xl max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            هنا تجد كل ما يخص مشروع GoLocal، من الدومين الرسمي إلى تفاصيل الحلول والإرشادات.
          </motion.p>
        </div>
      </section>

      {/* Main Action Card (Domain) */}
      <section className="px-6 mb-12">
        <div className="max-w-4xl mx-auto">
          <motion.button
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            onClick={() => window.open('https://golocal-system.com/', '_blank')}
            className="w-full relative group p-10 rounded-[40px] bg-gradient-to-br from-blue-600/20 to-purple-600/10 border border-blue-500/30 hover:border-blue-400 transition-all text-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/40 group-hover:scale-110 transition-transform">
                <Globe className="text-white w-10 h-10" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">الدخول إلى المشروع (LIVE)</h2>
              <p className="text-blue-200/70 text-lg mb-8 max-w-xl mx-auto">
                اضغط هنا للانتقال مباشرة إلى موقع GoLocal الرسمي واستعراض النظام بشكل كامل ومباشر.
              </p>
              <div className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white text-black font-bold text-lg hover:bg-gray-200 transition-all shadow-xl">
                <span>golocal-system.com</span>
                <ExternalLink size={20} />
              </div>
            </div>
          </motion.button>
        </div>
      </section>

      {/* Grid Section */}
      <section className="py-12 px-6 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
             <h2 className="text-3xl font-bold">أقسام إضافية</h2>
          </div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto"
          >
            {cards.filter(c => !c.featured).map((card) => (
              <motion.button
                key={card.id}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                onClick={card.action}
                className={`relative p-8 rounded-3xl bg-gradient-to-br ${card.color} border ${card.borderColor} hover:border-white/20 transition-all text-right group overflow-hidden`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative z-10 flex flex-col items-end">
                  <div className={`w-14 h-14 rounded-2xl bg-black/30 flex items-center justify-center mb-6 ${card.textColor} group-hover:scale-110 transition-transform`}>
                    {card.icon}
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-white transition-colors">{card.title}</h3>
                  <p className="text-gray-400 leading-relaxed mb-6 group-hover:text-gray-300 transition-colors text-right">{card.description}</p>
                  
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <ArrowRight size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span>استكشف القسم</span>
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 text-center text-gray-600 text-sm">
        <div className="flex justify-center items-center gap-4 mb-6">
           <Globe size={20} />
           <span className="w-1.5 h-1.5 rounded-full bg-gray-800" />
           <span>GoLocal Portfolio 2026</span>
           <span className="w-1.5 h-1.5 rounded-full bg-gray-800" />
           <span>جميع الحقوق محفوظة</span>
        </div>
        <p>تم التصميم باحترافية لعرض مخرجات المشروع بأفضل صورة ممكنة.</p>
      </footer>
    </div>
  );
};

export default PortfolioHome;
