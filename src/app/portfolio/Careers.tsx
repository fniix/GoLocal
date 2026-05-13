import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  ArrowRight,
  Heart,
  Users,
  Zap,
  Trophy,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface CareersProps {
  onBack: () => void;
}

const Careers: React.FC<CareersProps> = ({ onBack }) => {
  const [showComingSoon, setShowComingSoon] = useState(false);

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    },
  };

  const benefits = [
    {
      icon: <Heart size={32} />,
      title: 'بيئة عمل إنسانية',
      description: 'نقدر كل فرد من فريقنا ونوفر بيئة عمل صحية ومحفزة'
    },
    {
      icon: <Zap size={32} />,
      title: 'فرص النمو',
      description: 'تطور مهاراتك وانطلق نحو مسار وظيفي مميز'
    },
    {
      icon: <Trophy size={32} />,
      title: 'مكافآت عادلة',
      description: 'رواتب تنافسية وحوافز تشجع الإنجاز والابتكار'
    },
    {
      icon: <Users size={32} />,
      title: 'فريق متعاون',
      description: 'اعمل بجانب خبراء في المجال يشاركون شغفك'
    }
  ];

  const positions = [
    {
      title: 'مهندس تطبيقات موبايل',
      type: 'دوام كامل',
      location: 'البحرين',
      requirements: ['React Native', 'JavaScript/TypeScript', 'REST APIs']
    },
    {
      title: 'مهندس Backend',
      type: 'دوام كامل',
      location: 'البحرين',
      requirements: ['Node.js', 'Database Design', 'Cloud Services']
    },
    {
      title: 'مسؤول تسويق رقمي',
      type: 'دوام كامل',
      location: 'البحرين',
      requirements: ['Social Media', 'Analytics', 'Content Creation']
    },
    {
      title: 'مسؤول دعم العملاء',
      type: 'دوام كامل/جزئي',
      location: 'البحرين',
      requirements: ['Customer Service', 'Communication', 'Problem Solving']
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white font-sans overflow-x-hidden">
      {/* Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-orange-900/20 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md border-b border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-orange-400" />
            <span className="text-lg font-bold">الوظائف والتقديم</span>
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
            className="inline-block mb-6 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-medium"
          >
            انضم إلى فريقنا 🚀
          </motion.div>
          
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-extrabold mb-4"
          >
            ابحث عن فرصة عمل معنا
          </motion.h1>

          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto"
          >
            نحن نبحث عن أفراد موهوبين ومبدعين يشاركوننا حلمنا في تطوير المنطقة
          </motion.p>
        </div>
      </section>

      {/* Coming Soon Message */}
      {showComingSoon && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowComingSoon(false)}
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-gradient-to-br from-white/10 to-transparent border border-white/20 rounded-3xl p-12 max-w-md text-center backdrop-blur-xl"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center mx-auto mb-6">
              <Clock className="w-12 h-12 text-white" />
            </div>
            
            <h2 className="text-3xl font-bold mb-4">قريباً جداً! 🎉</h2>
            <p className="text-gray-300 mb-8 leading-relaxed">
              شكراً لاهتمامك بالانضمام إلى فريق GoLocal! 
              نحن في طور تطوير بوابة التقديم الخاصة بنا وسيتم فتحها قريباً جداً.
            </p>
            
            <div className="mb-8 p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-sm text-gray-400">
                الاطلاع على الوظائف والتقديم عليها سيكون متاحاً قريباً على منصة GoLocal
              </p>
            </div>

            <button
              onClick={() => setShowComingSoon(false)}
              className="w-full px-6 py-3 rounded-full bg-orange-600 hover:bg-orange-700 font-bold transition-all"
            >
              شكراً لك ✨
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* Benefits */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12">لماذا تنضم معنا؟</h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="p-8 rounded-3xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-white/20 transition-all"
              >
                <div className="w-16 h-16 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-400 mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                <p className="text-gray-400">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-16 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12">الوظائف المتاحة</h2>
          
          <div className="space-y-4">
            {positions.map((position, i) => (
              <motion.button
                key={i}
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                onClick={() => setShowComingSoon(true)}
                whileHover={{ x: 8 }}
                className="w-full p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all text-left group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold group-hover:text-orange-400 transition-colors">{position.title}</h3>
                    <p className="text-gray-400 text-sm">{position.location} • {position.type}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-orange-400 transition-colors flex-shrink-0" />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {position.requirements.map((req, j) => (
                    <span key={j} className="text-xs bg-white/5 px-3 py-1 rounded-full">
                      {req}
                    </span>
                  ))}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 rounded-3xl p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">لم تجد وظيفتك؟</h2>
          <p className="text-gray-400 mb-8">
            أرسل لنا سيرتك الذاتية والمجالات التي تهتم بها
          </p>
          <button
            onClick={() => setShowComingSoon(true)}
            className="px-8 py-3 rounded-full bg-orange-600 hover:bg-orange-700 font-bold transition-all flex items-center gap-2 mx-auto"
          >
            تقدم الآن
            <CheckCircle2 size={20} />
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

export default Careers;
