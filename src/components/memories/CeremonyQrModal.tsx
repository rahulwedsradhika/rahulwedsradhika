import React, { useState, useRef } from 'react';
import {
  QrCode,
  Download,
  Copy,
  Check,
  X,
  Share2,
  Printer,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { CEREMONY_ALBUMS, getCeremonyUploadUrl } from '../../lib/memories';
import { CeremonyAlbumId } from '../../types/memories';
import { useLanguage } from '../../context/LanguageContext';
import { RoyalCrestLogo } from '../common/RoyalCrestLogo';

interface CeremonyQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCeremony?: CeremonyAlbumId;
}

export const CeremonyQrModal: React.FC<CeremonyQrModalProps> = ({
  isOpen,
  onClose,
  defaultCeremony = 'all',
}) => {
  const { lang, t } = useLanguage();
  const [selectedCeremony, setSelectedCeremony] = useState<CeremonyAlbumId>(defaultCeremony);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  if (!isOpen) return null;

  const uploadUrl = getCeremonyUploadUrl(selectedCeremony);
  const ceremonyObj = CEREMONY_ALBUMS.find((a) => a.id === selectedCeremony);
  const ceremonyTitle = ceremonyObj ? ceremonyObj.name[lang] : 'All Wedding Celebrations';

  // SVG QR Code generator (Standard reliable matrix visualization)
  const qrSvgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    uploadUrl
  )}&color=70-44-67&bgcolor=FFF4F6&format=svg`;

  const handleCopyLink = () => {
    void navigator.clipboard.writeText(uploadUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadQrImage = () => {
    const a = document.createElement('a');
    a.href = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(
      uploadUrl
    )}&color=70-44-67&bgcolor=FFFFFF&format=png`;
    a.download = `rahul-radhika-${selectedCeremony}-qr.png`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrintTableCard = () => {
    window.print();
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

        {/* Modal Title */}
        <div className="text-center space-y-1">
          <div className="inline-flex p-2.5 rounded-2xl bg-[#FFF4F6] border border-[#EBD9DE] text-[#702C43] mb-1">
            <QrCode className="w-6 h-6 text-[#D6AD62]" />
          </div>
          <h3 className="font-heading font-bold text-xl text-[#702C43]">
            Ceremony QR Signs & Table Cards
          </h3>
          <p className="text-xs text-[#765F68] max-w-sm mx-auto">
            Place printed QR signs on banquet tables at Morbagh Pavilion & Dobh Haveli so guests can snap & upload moments directly!
          </p>
        </div>

        {/* Ceremony Selector Pills */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#702C43]">
            Select Ceremony Event:
          </label>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CEREMONY_ALBUMS.map((album) => (
              <button
                key={album.id}
                type="button"
                onClick={() => setSelectedCeremony(album.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                  selectedCeremony === album.id
                    ? 'bg-[#702C43] text-white border-[#702C43]'
                    : 'bg-[#FFF4F6] text-[#765F68] border-[#EBD9DE] hover:bg-[#F8E3E9]'
                }`}
              >
                {album.name[lang]}
              </button>
            ))}
          </div>
        </div>

        {/* Printable Table Sign Preview Card */}
        <div
          ref={cardRef}
          className="p-6 rounded-3xl bg-gradient-to-b from-[#FFF4F6] via-[#FFF4F6] to-[#F8E3E9] border-2 border-[#D6AD62] shadow-md text-center space-y-3 relative overflow-hidden"
        >
          {/* Tone-on-tone decorative border */}
          <div className="flex justify-center">
            <RoyalCrestLogo size="sm" variant="crest" />
          </div>

          <div>
            <h4 className="font-heading font-bold text-lg text-[#702C43]">
              Rahul & Radhika
            </h4>
            <p className="text-xs font-semibold text-[#D6AD62] tracking-widest uppercase">
              {ceremonyTitle}
            </p>
            <p className="font-heading italic text-xs text-[#765F68] mt-1">
              “Aaiyo Zaroor! Scan to share your candid celebration photos”
            </p>
          </div>

          {/* QR Box with Border */}
          <div className="relative inline-block mx-auto p-3 bg-white rounded-2xl shadow-sm border border-[#EBD9DE]">
            <img
              src={qrSvgUrl}
              alt={`QR code for ${ceremonyTitle}`}
              className="w-40 h-40 sm:w-44 sm:h-44 mx-auto rounded-lg"
            />
            <div className="mt-2 text-[10px] font-bold text-[#702C43] bg-[#F8E3E9] px-2 py-0.5 rounded-full">
              Passcode: <code className="font-mono">rohtak2026</code>
            </div>
          </div>

          <div className="text-[11px] text-[#765F68] space-y-0.5">
            <p className="font-semibold text-[#702C43]">
              Village Dobh & Morbagh Pavilion · Rohtak
            </p>
            <p className="text-[10px]">
              Uploads are reviewed by the family before appearing in the public gallery.
            </p>
          </div>
        </div>

        {/* Action Buttons: Copy Link & Download Sign */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full py-2.5 px-3 rounded-xl border border-[#EBD9DE] hover:bg-[#FFF4F6] text-[#702C43] text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Link Copied!' : 'Copy Direct Link'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadQrImage}
            className="w-full py-2.5 px-3 rounded-xl bg-[#702C43] hover:bg-[#5C2336] text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
          >
            <Download className="w-4 h-4 text-[#D6AD62]" />
            <span>Download High-Res QR (PNG)</span>
          </button>
        </div>

        {/* Security Assurance Banner */}
        <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-[11px] text-emerald-800 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            <strong>Security & Privacy Guard:</strong> This QR code routes guests to the verified upload portal with wedding passcode check and mandatory family moderation. It does not bypass upload limits.
          </span>
        </div>
      </div>
    </div>
  );
};
