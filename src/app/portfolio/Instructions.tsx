import React from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  ArrowRight,
  Play,
  CheckCircle2,
  Settings,
  HelpCircle,
  Zap
} from 'lucide-react';

interface InstructionsProps {
  onBack: () => void;
}

const Instructions: React.FC<InstructionsProps> = ({ onBack }) => {
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    },
  };

  const tutorials = [
    {
      title: 'كيفية البدء مع GoLocal',
      description: 'تعرف على خطوات التسجيل والتحقق من بيانات حسابك',
      icon: <Play size={24} />,
      duration: '5 دقائق'
    },
    {
      title: 'حجز رحلة - خطوة بخطوة',
      description: 'تعلم كيفية حجز رحلة وتتبعها في الوقت الفعلي',
      icon: <Zap size={24} />,
      duration: '8 دقائق'
    },
    {
      title: 'فهم نظام الأسعار',
      description: 'اقرأ عن كيفية حساب الأسعار والعروض المتاحة',
      icon: <Settings size={24} />,
      duration: '6 دقائق'
    },
    {
      title: 'الدفع والفواتير',
      description: 'طرق الدفع المتاحة وكيفية الحصول على فواتيسك',
      icon: <CheckCircle2 size={24} />,
      duration: '7 دقائق'
    }
  ];

  const faqs = [
    {
      q: 'ما هو تطبيق GoLocal؟',
      a: 'GoLocal هي منصة متكاملة لخدمات التنقل والخدمات المحلية تربط المستخدمين بالسائقين والخدمات الموثوقة في مناطقهم'
    },
    {
      q: 'كم رسوم الاشتراك؟',
      a: 'تطبيق GoLocal مجاني للتحميل والاستخدام. تدفع فقط عند حجز خدمة معينة'
    },
    {
      q: 'هل بياناتي آمنة؟',
      a: 'نعم، نستخدم أحدث تقنيات التشفير لحماية بيانات المستخدمين وخصوصيتهم'
    },
    {
      q: 'ماذا لو واجهت مشكلة؟',
      a: 'فريق الدعم الخاص بنا متاح 24/7 للمساعدة من خلال تطبيقنا وتذاكر الدعم المباشرة'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white font-sans overflow-x-hidden">
      {/* Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md border-b border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-purple-400" />
            <span className="text-lg font-bold">التعليمات والإرشادات</span>
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
            className="inline-block mb-6 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium"
          >
            مركز التعليم والدعم 📚
          </motion.div>
          
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-extrabold mb-4"
          >
            اتعلم استخدام GoLocal بكفاءة
          </motion.h1>

          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto"
          >
            شروحات تفصيلية وخطوات سهلة لتحقيق أقصى استفادة من منصة GoLocal
          </motion.p>
        </div>
      </section>

      {/* Tutorials */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12">الدروس التعليمية</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {tutorials.map((tutorial, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="p-8 rounded-3xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-white/20 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                    {tutorial.icon}
                  </div>
                  <span className="text-sm text-gray-500 bg-white/5 px-3 py-1 rounded-full">{tutorial.duration}</span>
                </div>
                
                <h3 className="text-xl font-bold mb-2 group-hover:text-purple-400 transition-colors">{tutorial.title}</h3>
                <p className="text-gray-400 mb-6">{tutorial.description}</p>
                
                <div className="flex items-center gap-2 text-purple-400 text-sm font-semibold group-hover:translate-x-2 transition-transform">
                  <span>ابدأ الدرس</span>
                  <ArrowRight size={16} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-12">الأسئلة الشائعة</h2>
          
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
              >
                <div className="flex items-start gap-4">
                  <HelpCircle className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-bold text-lg mb-2">{faq.q}</h4>
                    <p className="text-gray-400 leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">هل تحتاج لمساعدة إضافية؟</h2>
          <p className="text-gray-400 mb-8">فريقنا جاهز للمساعدة طوال الوقت</p>
          <button className="px-8 py-3 rounded-full bg-purple-600 hover:bg-purple-700 font-bold transition-all">
            تواصل مع الدعم
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/5 text-center text-gray-600 text-sm">
        <p>© 2026 GoLocal - جميع الحقوق محفوظة</p>
      </footer>
    </div>
  );
};

export default Instructions;
