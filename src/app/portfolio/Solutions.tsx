import React from 'react';
import { motion } from 'framer-motion';
import { 
  Lightbulb, 
  ArrowRight,
  TrendingUp,
  Users,
  Zap,
  Shield,
  MapPin,
  Clock
} from 'lucide-react';

interface SolutionsProps {
  onBack: () => void;
}

const Solutions: React.FC<SolutionsProps> = ({ onBack }) => {
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    },
  };

  const problems = [
    {
      problem: 'صعوبة الوصول للخدمات',
      solution: 'GoLocal توفر منصة موحدة تربطك بجميع الخدمات المحلية بضغطة زر',
      impact: 'توفير وقت + سهولة في الحصول على الخدمات',
      icon: <MapPin size={32} />
    },
    {
      problem: 'مشاكل التنقل والازدحام',
      solution: 'نظام ذكي لتوزيع الطلبات يقلل أوقات الانتظار والازدحام',
      impact: 'تخفيف الازدحام + رحلات أسرع',
      icon: <Zap size={32} />
    },
    {
      problem: 'عدم الثقة والأمان',
      solution: 'نظام تقييم وتحقق صارم يضمن الأمان والموثوقية',
      impact: 'ثقة عالية + سلامة المستخدمين',
      icon: <Shield size={32} />
    },
    {
      problem: 'ارتفاع تكاليف الخدمات',
      solution: 'نظام تسعير شفاف وعادل مع عروض مستمرة',
      impact: 'أسعار منخفضة + قيمة حقيقية',
      icon: <TrendingUp size={32} />
    },
    {
      problem: 'البطالة وقلة فرص العمل',
      solution: 'فرص عمل للسائقين والخدماتيين في المناطق المحلية',
      impact: 'توفير آلاف فرص العمل المحلية',
      icon: <Users size={32} />
    },
    {
      problem: 'عدم توفر الخدمات بعد ساعات معينة',
      solution: 'خدمة 24/7 مع سائقين متاحين طوال الوقت',
      impact: 'راحة بال دائمة + خدمات طوال اليوم',
      icon: <Clock size={32} />
    }
  ];

  const impacts = [
    {
      number: '10K+',
      text: 'مستخدم نشط',
      color: 'from-blue-500/20'
    },
    {
      number: '5K+',
      text: 'سائق موثوق',
      color: 'from-purple-500/20'
    },
    {
      number: '98%',
      text: 'رضا المستخدمين',
      color: 'from-emerald-500/20'
    },
    {
      number: '24/7',
      text: 'خدمة مستمرة',
      color: 'from-orange-500/20'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white font-sans overflow-x-hidden">
      {/* Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-emerald-900/20 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md border-b border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-emerald-400" />
            <span className="text-lg font-bold">حل المشاكل</span>
          </div>
          <button 
            onClick={onBack}
            className="px-5 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm font-medium flex items-center gap-2"
          >
            <ArrowRight size={18} />
            العودة
          </button>
        </div>
      </nav>

      {/* Header */}
      <section className="relative pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="inline-block mb-6 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium"
          >
            الحلول المستدامة 💡
          </motion.div>
          
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-extrabold mb-4"
          >
            كيف تساهم GoLocal في حل مشاكل المجتمع
          </motion.h1>

          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto"
          >
            نحن لا نقدم فقط خدمات تنقل، بل نعمل على تخفيف الأزمات وتحسين جودة الحياة في مجتمعك
          </motion.p>
        </div>
      </section>

      {/* Problems & Solutions Grid */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {problems.map((item, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="p-8 rounded-3xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-white/20 transition-all"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-red-400 mb-1">المشكلة:</h3>
                    <p className="text-sm">{item.problem}</p>
                  </div>
                </div>

                <div className="mb-4 pl-20">
                  <h4 className="text-lg font-bold text-emerald-400 mb-1">الحل:</h4>
                  <p className="text-gray-300 text-sm">{item.solution}</p>
                </div>

                <div className="pl-20 pt-4 border-t border-white/10">
                  <p className="text-sm font-semibold text-yellow-400">📊 التأثير: {item.impact}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Metrics */}
      <section className="py-16 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">تأثيرنا حتى الآن</h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            {impacts.map((item, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className={`p-8 rounded-3xl bg-gradient-to-br ${item.color} to-transparent border border-white/10 text-center`}
              >
                <div className="text-4xl font-bold mb-2">{item.number}</div>
                <p className="text-gray-400">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 rounded-3xl p-12 text-center">
          <h2 className="text-3xl font-bold mb-6">رؤيتنا المستقبلية</h2>
          <p className="text-gray-400 text-lg leading-relaxed mb-8">
            نهدف إلى أن تصبح GoLocal المنصة الأولى والموثوقة للخدمات المحلية في المنطقة، 
            حيث نعمل على تطوير حلول مستدامة تساهم في رفع مستوى المعيشة وتوفير فرص اقتصادية حقيقية 
            لآلاف الأفراد والعائلات في مجتمعاتنا.
          </p>
          <a 
            href="https://golocal-system.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 font-bold transition-all"
          >
            تعرف على الخطة الكاملة
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/5 text-center text-gray-600 text-sm">
        <p>© 2026 GoLocal - جميع الحقوق محفوظة</p>
      </footer>
    </div>
  );
};

export default Solutions;
