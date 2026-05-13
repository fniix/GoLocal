import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  ArrowRight,
  Shield,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

interface TermsProps {
  onBack: () => void;
}

const Terms: React.FC<TermsProps> = ({ onBack }) => {
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    },
  };

  const sections = [
    {
      title: 'تعريف الخدمة',
      icon: <Shield size={24} />,
      content: `GoLocal هي منصة رقمية متكاملة لتقديم خدمات التنقل والخدمات المحلية في المنطقة. الخدمة تتضمن:
      • حجز رحلات التنقل
      • توصيل الخدمات والسلع
      • الدفع الإلكتروني الآمن
      • نظام التقييم والمراجعات`
    },
    {
      title: 'التزامات المستخدم',
      icon: <CheckCircle2 size={24} />,
      content: `التزام المستخدم بما يلي:
      • تقديم معلومات صحيحة وكاملة عند التسجيل
      • عدم استخدام الحساب لأغراض غير قانونية
      • الالتزام بقوانين المملكة والتعليمات المحلية
      • عدم السلوك الفظ أو المسيء تجاه السائقين والخدماتيين
      • الدفع الكامل للخدمات المقدمة`
    },
    {
      title: 'سياسة الدفع والاسترجاع',
      icon: <AlertCircle size={24} />,
      content: `قوانين الدفع والاسترجاع:
      • الدفع يجب أن يتم قبل بدء الخدمة
      • الاسترجاع متاح في حالة إلغاء الطلب قبل قبول السائق
      • رسوم إلغاء تطبق حسب سياستنا
      • نحتفظ بحق رفض الخدمة للعملاء الذين ينتهكون السياسات
      • جميع المعاملات آمنة ومشفرة`
    },
    {
      title: 'الخصوصية والبيانات',
      icon: <Shield size={24} />,
      content: `حماية بيانات المستخدم:
      • لا نشارك بيانات المستخدم مع جهات خارجية
      • نستخدم تشفير عالي المستوى لحماية المعلومات
      • نجمع بيانات الموقع فقط لغرض تقديم الخدمة
      • للمستخدم الحق في طلب حذف بيانات الحساب
      • نلتزم بقوانين حماية البيانات الدولية`
    },
    {
      title: 'السلامة والأمان',
      icon: <AlertCircle size={24} />,
      content: `التزاماتنا بسلامة المستخدمين:
      • التحقق الشامل من كل السائقين والخدماتيين
      • نظام تقييم صارم للحفاظ على جودة الخدمة
      • التعامل السريع مع الشكاوى والمشاكل
      • توفر رقم طواريء وقنوات تواصل آمنة
      • حماية خصوصية المستخدمات الإناث
      • نظام تتبع حي لكل رحلة`
    },
    {
      title: 'المسؤولية والتعويضات',
      icon: <FileText size={24} />,
      content: `حدود المسؤولية:
      • GoLocal غير مسؤولة عن تأخر الخدمة بسبب ظروف قاهرة
      • التعويض يكون بحد أقصى مبلغ الخدمة المدفوعة
      • المستخدم هو المسؤول عن الأشياء الثمينة والشخصية
      • لا نتحمل مسؤولية الأضرار غير المباشرة
      • التفاهم بين الطرفين يحكم أي نزاع`
    },
    {
      title: 'الإلغاء والإنهاء',
      icon: <AlertCircle size={24} />,
      content: `حقوق الإلغاء والإنهاء:
      • يحق للمستخدم إلغاء الحساب في أي وقت
      • GoLocal يحق لها إنهاء الحساب عند انتهاك السياسات
      • الإنهاء قد يكون مؤقتاً أو دائماً حسب الانتهاك
      • المبالغ المرجعة تعود للحساب البنكي خلال 5-7 أيام
      • البيانات تحذف تماماً بعد 30 يوم من الإنهاء`
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white font-sans overflow-x-hidden">
      {/* Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-red-900/20 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md border-b border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-red-400" />
            <span className="text-lg font-bold">شروط الاستخدام</span>
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
            className="inline-block mb-6 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium"
          >
            المسؤولية والالتزام ⚖️
          </motion.div>
          
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-extrabold mb-4"
          >
            شروط الاستخدام والقوانين
          </motion.h1>

          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto"
          >
            يرجى قراءة هذه الشروط بعناية قبل استخدام منصة GoLocal
          </motion.p>
        </div>
      </section>

      {/* Warning Banner */}
      <section className="px-6 py-8">
        <div className="max-w-4xl mx-auto p-6 rounded-2xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 flex gap-4">
          <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold mb-2">تنبيه مهم</h3>
            <p className="text-gray-300 text-sm">
              باستخدام منصة GoLocal، أنت توافق على جميع الشروط والأحكام المدرجة أدناه. 
              عدم الموافقة يعني عدم استخدام الخدمة.
            </p>
          </div>
        </div>
      </section>

      {/* Terms Sections */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {sections.map((section, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="rounded-3xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 p-8 hover:border-white/20 transition-all"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400 flex-shrink-0">
                    {section.icon}
                  </div>
                  <h2 className="text-2xl font-bold">{section.title}</h2>
                </div>

                <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                  {section.content}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact for Questions */}
      <section className="py-16 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">هل لديك أي استفسار؟</h2>
          <p className="text-gray-400 mb-8">
            إذا كان لديك أي سؤال أو تحفظ على شروط الاستخدام، لا تتردد في التواصل معنا
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="font-bold mb-2">البريد الإلكتروني</h3>
              <p className="text-gray-400">support@golocal.com</p>
            </div>
            
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="font-bold mb-2">الهاتف</h3>
              <p className="text-gray-400">+973 1234 5678</p>
            </div>
          </div>
        </div>
      </section>

      {/* Acknowledgement */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 rounded-3xl p-12 text-center">
          <CheckCircle2 className="w-16 h-16 mx-auto mb-6 text-green-400" />
          <h2 className="text-2xl font-bold mb-4">شكراً لفهمك والتزامك</h2>
          <p className="text-gray-400 mb-8">
            نحن ملتزمون بتقديم خدمة آمنة وموثوقة لكل مستخدمينا. 
            شروطنا موضوعة لحماية جميع الأطراف وضمان أفضل تجربة.
          </p>
          <button
            onClick={onBack}
            className="px-8 py-3 rounded-full bg-green-600 hover:bg-green-700 font-bold transition-all"
          >
            فهمت وأوافق
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/5 text-center text-gray-600 text-sm">
        <p>© 2026 GoLocal - جميع الحقوق محفوظة | آخر تحديث: يناير 2026</p>
      </footer>
    </div>
  );
};

export default Terms;
