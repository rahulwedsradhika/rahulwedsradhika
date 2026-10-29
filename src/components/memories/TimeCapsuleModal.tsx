import React, { useState, useEffect } from 'react';
import {
  Clock,
  Lock,
  Send,
  Sparkles,
  CheckCircle2,
  X,
  AlertCircle,
  Calendar,
  Heart,
  KeyRound,
} from 'lucide-react';
import {
  ANNIVERSARY_UNLOCK_ISO,
  fetchTimeCapsuleStatus,
  submitTimeCapsuleMessage,
  isTimeCapsuleUnlocked,
} from '../../lib/memories';
import { RoyalCrestLogo } from '../common/RoyalCrestLogo';
import { useLanguage } from '../../context/LanguageContext';

interface TimeCapsuleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TimeCapsuleModal: React.FC<TimeCapsuleModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { lang } = useLanguage();
  const [authorName, setAuthorName] = useState('');
  const [authorSide, setAuthorSide] = useState<'groom' | 'bride' | 'friend'>('groom');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Status state
  const [status, setStatus] = useState<{
    totalCount: number;
    isUnlocked: boolean;
    unlockDateISO: string;
    messages: Array<{
      id: string;
      authorName: string;
      authorSide: 'groom' | 'bride' | 'friend';
      createdAt: string;
      message?: string;
    }>;
  }>({
    totalCount: 0,
    isUnlocked: false,
    unlockDateISO: ANNIVERSARY_UNLOCK_ISO,
    messages: [],
  });

  const loadStatus = async () => {
    try {
      const data = await fetchTimeCapsuleStatus();
      setStatus(data);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    if (isOpen) {
      void loadStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !message.trim()) {
      setError('Please provide your name and your anniversary blessing message.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const res = await submitTimeCapsuleMessage(authorName, authorSide, message);
      if (!res.success) {
        setError(res.error || 'Failed to seal message into capsule.');
        return;
      }

      setSuccess(true);
      await loadStatus();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setAuthorName('');
    setMessage('');
    setSuccess(false);
    setError(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-pink-100 space-y-5 relative max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 p-2 text-stone-400 hover:text-stone-700 rounded-xl cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex p-3 rounded-2xl bg-[#FFF4F6] border border-[#EBD9DE] text-[#702C43] mb-1 shadow-inner">
            <Lock className="w-6 h-6 text-[#D6AD62]" />
          </div>
          <h3 className="font-heading font-bold text-xl sm:text-2xl text-[#702C43]">
            1st Anniversary Wedding Time Capsule
          </h3>
          <p className="text-xs text-[#765F68] max-w-sm mx-auto leading-relaxed">
            Leave a sealed prophecy, blessing, or heartfelt memory for Rahul & Radhika. All messages are securely locked until their 1st anniversary on <strong>28 November 2027</strong>!
          </p>
        </div>

        {/* Sealed Status Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FFF4F6] via-[#F8E3E9] to-[#FFF4F6] border border-[#D6AD62] flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#702C43] text-[#D6AD62] flex items-center justify-center shrink-0 shadow-md">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#702C43] flex items-center gap-1.5">
                <span>Anniversary Unlock Date</span>
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-[#D6AD62] text-stone-950">
                  Sealed
                </span>
              </div>
              <p className="text-xs text-[#765F68] font-medium">
                28 November 2027 (365 Days of Companionship)
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="font-heading text-lg font-bold text-[#702C43]">
              {status.totalCount}
            </span>
            <p className="text-[10px] text-[#765F68] font-semibold">Sealed Wishes</p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="font-heading font-bold text-lg text-[#702C43]">
                Your Message has been Sealed!
              </h4>
              <p className="text-xs text-[#765F68] max-w-sm mx-auto leading-relaxed">
                Thank you! Your wish is locked in the wedding time capsule and will be unveiled to Rahul & Radhika on their first wedding anniversary.
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 rounded-xl border border-[#EBD9DE] text-xs font-semibold text-[#702C43] hover:bg-[#FFF4F6] transition"
              >
                Write Another Message
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-[#702C43] text-white text-xs font-semibold shadow-md hover:bg-[#5C2336] transition"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#702C43] mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="e.g. Sumitra Buaji / Rohit"
                  className="w-full min-h-[42px] px-3.5 text-xs sm:text-sm rounded-xl border border-[#EBD9DE] bg-white text-[#33252B] focus:border-[#702C43] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#702C43] mb-1">
                  Relationship / Side
                </label>
                <select
                  value={authorSide}
                  onChange={(e) => setAuthorSide(e.target.value as any)}
                  className="w-full min-h-[42px] px-3.5 text-xs sm:text-sm rounded-xl border border-[#EBD9DE] bg-white text-[#33252B] focus:border-[#702C43] focus:outline-none"
                >
                  <option value="groom">Ladkewale (Groom Side)</option>
                  <option value="bride">Ladkiwale (Bride Side)</option>
                  <option value="friend">Friends & Colleagues</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#702C43] mb-1">
                Anniversary Message for 2027 *
              </label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What do you hope Rahul & Radhika are celebrating on their 1st anniversary? A favorite memory from today, advice for year one, or a blessing..."
                className="w-full p-3 text-xs sm:text-sm rounded-xl border border-[#EBD9DE] bg-white text-[#33252B] focus:border-[#702C43] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-[#702C43] hover:bg-[#5C2336] text-white text-xs sm:text-sm font-semibold shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Locking in Capsule...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-[#D6AD62]" />
                  <span>Seal in 1st Anniversary Capsule</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* List of Sealed Contributors */}
        <div className="pt-3 border-t border-[#EBD9DE] space-y-2">
          <div className="flex items-center justify-between text-xs text-[#765F68]">
            <span className="font-bold text-[#702C43]">Sealed Messages in Capsule:</span>
            <span>Unlocks 28 Nov 2027</span>
          </div>

          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {status.messages.map((item) => (
              <div
                key={item.id}
                className="p-2.5 rounded-xl bg-[#FFF4F6] border border-[#EBD9DE] flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#702C43]/10 text-[#702C43] flex items-center justify-center text-[10px]">
                    🔒
                  </div>
                  <span className="font-semibold text-[#702C43]">
                    {item.authorName} ({item.authorSide})
                  </span>
                </div>
                <span className="text-[10px] text-[#765F68] italic bg-white px-2 py-0.5 rounded-full border border-[#EBD9DE]">
                  Confidential & Sealed
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
