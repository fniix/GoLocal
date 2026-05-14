import fs from "fs";
const p = "src/app/components/SmartPaymentScreen.tsx";
let s = fs.readFileSync(p, "utf8");
const cardOld = `        <div className="bg-gradient-to-r from-purple-600 to-blue-500 px-6 pt-6 pb-8">
          <button onClick={() => setStep('summary')} className="text-white mb-4">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-white">Card Details</h1>`;
const cardNew = `        <div className="bg-gradient-to-r from-purple-600 to-blue-500 px-6 pt-6 pb-8">
          <div className="flex items-center justify-between mb-4">
            <button type="button" onClick={() => setStep('summary')} className="text-white hover:bg-white/10 rounded-full p-2">
              <ArrowLeft className="w-6 h-6" />
            </button>
            {onNavigateHome && (
              <button type="button" onClick={onNavigateHome} className="text-white hover:bg-white/10 rounded-full p-2" aria-label="Go to home">
                <Home className="w-6 h-6" />
              </button>
            )}
          </div>
          <h1 className="text-2xl font-bold text-white">Card Details</h1>`;
const otpOld = `        <div className="bg-gradient-to-r from-purple-600 to-blue-500 px-6 pt-6 pb-8">
          <button onClick={() => setStep('card-form')} className="text-white mb-4">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-white">Verify Payment</h1>`;
const otpNew = `        <div className="bg-gradient-to-r from-purple-600 to-blue-500 px-6 pt-6 pb-8">
          <div className="flex items-center justify-between mb-4">
            <button type="button" onClick={() => setStep('card-form')} className="text-white hover:bg-white/10 rounded-full p-2">
              <ArrowLeft className="w-6 h-6" />
            </button>
            {onNavigateHome && (
              <button type="button" onClick={onNavigateHome} className="text-white hover:bg-white/10 rounded-full p-2" aria-label="Go to home">
                <Home className="w-6 h-6" />
              </button>
            )}
          </div>
          <h1 className="text-2xl font-bold text-white">Verify Payment</h1>`;
if (!s.includes(cardOld)) throw new Error("card block not found");
if (!s.includes(otpOld)) throw new Error("otp block not found");
s = s.replace(cardOld, cardNew).replace(otpOld, otpNew);
fs.writeFileSync(p, s);
console.log("patched");
