import { ArrowLeft, Copy, Trash2, Plus, Check, Gift, DollarSign } from 'lucide-react';
import { useState } from 'react';

interface GiftVoucher {
  id: string;
  code: string;
  amount: number;
  createdAt: string;
  expiryDate: string;
  redeemed: boolean;
  redeemedBy?: string;
  redeemedDate?: string;
}

interface GiftVoucherScreenProps {
  onBack: () => void;
}

export function GiftVoucherScreen({ onBack }: GiftVoucherScreenProps) {
  const [giftVouchers, setGiftVouchers] = useState<GiftVoucher[]>([
    {
      id: '1',
      code: 'GIFT2024001',
      amount: 50,
      createdAt: '2024-01-15',
      expiryDate: '2025-01-15',
      redeemed: false
    },
    {
      id: '2',
      code: 'GIFT2024002',
      amount: 100,
      createdAt: '2024-01-10',
      expiryDate: '2025-01-10',
      redeemed: true,
      redeemedBy: 'Ahmed Al-Mansouri',
      redeemedDate: '2024-02-20'
    }
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [voucherAmount, setVoucherAmount] = useState<number>(50);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Generate random code
  const generateCode = (): string => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `GIFT${timestamp}${random}`;
  };

  // Create new voucher
  const handleCreateVoucher = () => {
    const newVoucher: GiftVoucher = {
      id: Date.now().toString(),
      code: generateCode(),
      amount: voucherAmount,
      createdAt: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      redeemed: false
    };
    setGiftVouchers([newVoucher, ...giftVouchers]);
    setShowCreateModal(false);
    setVoucherAmount(50);
  };

  // Copy code to clipboard
  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Delete voucher
  const handleDeleteVoucher = (id: string) => {
    setGiftVouchers(giftVouchers.filter(v => v.id !== id));
  };

  const unredeemed = giftVouchers.filter(v => !v.redeemed);
  const redeemed = giftVouchers.filter(v => v.redeemed);

  return (
    <div className="size-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-500 px-6 pt-6 pb-8 shadow-lg">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={onBack}
            className="flex items-center text-white hover:bg-white/10 rounded-full p-2 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <div className="flex-1">
            <h1 className="text-white text-2xl font-bold">Gift Vouchers</h1>
            <p className="text-white/90 text-sm">Create and manage gift codes</p>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Gift className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-xs text-gray-500 mb-1">Total Vouchers</p>
              <p className="text-lg font-bold text-gray-800">{giftVouchers.length}</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-xs text-gray-500 mb-1">Active</p>
              <p className="text-lg font-bold text-gray-800">{unredeemed.length}</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-xs text-gray-500 mb-1">Redeemed</p>
              <p className="text-lg font-bold text-gray-800">{redeemed.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 pb-32">
        {/* Create Button */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 mb-6"
        >
          <Plus className="w-5 h-5" />
          Create New Voucher
        </button>

        {/* Active Vouchers */}
        {unredeemed.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-700 uppercase mb-4 px-1 flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Active Vouchers ({unredeemed.length})
            </h3>
            <div className="space-y-3">
              {unredeemed.map((voucher) => (
                <div key={voucher.id} className="bg-white rounded-2xl shadow-md p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">Gift Code</p>
                      <p className="font-bold text-gray-800 text-lg font-mono">{voucher.code}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-600">BD {voucher.amount.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">Value</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                    <div>
                      <p className="text-gray-500">Created</p>
                      <p className="text-gray-800 font-medium">{voucher.createdAt}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500">Expires</p>
                      <p className="text-gray-800 font-medium">{voucher.expiryDate}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopyCode(voucher.code, voucher.id)}
                      className={`flex-1 py-2 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 ${
                        copiedId === voucher.id
                          ? 'bg-green-100 text-green-700'
                          : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                      }`}
                    >
                      {copiedId === voucher.id ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy Code
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteVoucher(voucher.id)}
                      className="py-2 px-4 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-colors flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Redeemed Vouchers */}
        {redeemed.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-gray-700 uppercase mb-4 px-1 flex items-center gap-2">
              <Check className="w-4 h-4" />
              Redeemed Vouchers ({redeemed.length})
            </h3>
            <div className="space-y-3">
              {redeemed.map((voucher) => (
                <div key={voucher.id} className="bg-white rounded-2xl shadow-md p-4 opacity-75">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">Gift Code</p>
                      <p className="font-bold text-gray-800 font-mono">{voucher.code}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-600">BD {voucher.amount.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                    <div>
                      <p className="text-gray-500">Redeemed by</p>
                      <p className="text-gray-800 font-medium">{voucher.redeemedBy}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500">Date</p>
                      <p className="text-gray-800 font-medium">{voucher.redeemedDate}</p>
                    </div>
                  </div>

                  <div className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                    ✓ Redeemed
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {giftVouchers.length === 0 && (
          <div className="text-center py-12">
            <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-800 mb-2">No Gift Vouchers Yet</h3>
            <p className="text-gray-600 mb-6">Create your first gift voucher to share with friends and family!</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-block py-3 px-6 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Create First Voucher
            </button>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="w-full bg-white rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Gift Voucher</h2>

            {/* Amount Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Select Voucher Amount (BD)
              </label>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[25, 50, 100].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setVoucherAmount(amount)}
                    className={`py-3 px-4 rounded-xl font-bold transition-all ${
                      voucherAmount === amount
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    BD {amount}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 mb-4">
                <input
                  type="number"
                  min="5"
                  max="500"
                  value={voucherAmount}
                  onChange={(e) => setVoucherAmount(Number(e.target.value))}
                  placeholder="Custom amount"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
                <button
                  onClick={() => setVoucherAmount(voucherAmount)}
                  className="px-4 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
                >
                  Set
                </button>
              </div>

              <p className="text-sm text-gray-600 bg-purple-50 p-3 rounded-xl">
                💡 You're creating a gift voucher worth <span className="font-bold">BD {voucherAmount.toFixed(2)}</span>
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-800 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateVoucher}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create Voucher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
