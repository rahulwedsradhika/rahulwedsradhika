import React, { useState } from 'react';
import { Download, FileText, Image as ImageIcon, Loader2, Share2, Sparkles } from 'lucide-react';
import { WEDDING_CONFIG } from '../../config/wedding';
import { useLanguage } from '../../context/LanguageContext';
import { downloadInvitationPdf, generatePersonalizedCardBlob } from '../../lib/cardGenerator';
import { copyToClipboard, getWhatsAppShareUrl, shareViaWebShareApi } from '../../lib/share';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Reveal } from '../ui/Reveal';
import { SectionTitle } from '../ui/SectionTitle';

export const InvitationSection: React.FC = () => {
  const { lang, t } = useLanguage();
  const [guestName, setGuestName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingPng, setIsDownloadingPng] = useState(false);
  const [generatedBlobUrl, setGeneratedBlobUrl] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    window.setTimeout(() => setToastMsg(null), 3000);
  };

  const handleCreatePersonalizedCard = async () => {
    setIsGenerating(true);
    try {
      const blob = await generatePersonalizedCardBlob({
        guestName,
        lang,
      });
      const url = URL.createObjectURL(blob);
      setGeneratedBlobUrl(url);
    } catch {
      showToast(t('common_error'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadOfficialPng = async () => {
    setIsDownloadingPng(true);
    try {
      const blob = await generatePersonalizedCardBlob({
        guestName: '',
        lang,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'rahul-radhika-official-wedding-card.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      showToast(t('common_error'));
    } finally {
      setIsDownloadingPng(false);
    }
  };

  const handleDownloadOfficialPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      await downloadInvitationPdf({
        guestName: guestName.trim() || undefined,
        lang,
      });
    } catch {
      showToast(t('common_error'));
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleDownloadCard = () => {
    if (!generatedBlobUrl) return;
    const a = document.createElement('a');
    a.href = generatedBlobUrl;
    a.download = `rahul-radhika-invite-${guestName.trim() || 'guest'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShareCard = async () => {
    if (!generatedBlobUrl) return;
    try {
      const res = await fetch(generatedBlobUrl);
      const blob = await res.blob();
      const file = new File([blob], 'rahul-radhika-invitation.png', { type: 'image/png' });

      const shared = await shareViaWebShareApi({
        title: t('nav_brand'),
        text: WEDDING_CONFIG.whatsappShareText[lang],
        url: WEDDING_CONFIG.siteUrl,
        files: [file],
      });

      if (!shared) {
        handleDownloadCard();
        window.open(
          getWhatsAppShareUrl(WEDDING_CONFIG.whatsappShareText[lang], WEDDING_CONFIG.siteUrl),
          '_blank',
          'noopener,noreferrer'
        );
      }
    } catch {
      handleDownloadCard();
    }
  };

  const handleCopyLink = async () => {
    const ok = await copyToClipboard(WEDDING_CONFIG.siteUrl);
    if (ok) {
      showToast(t('common_copied'));
    }
  };

  return (
    <section id="invitation" aria-label={t('invitation_title')} className="py-14 sm:py-20 px-4 bg-[#FFF4F6]">
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <SectionTitle
            eyebrow={t('invitation_eyebrow')}
            title={t('invitation_title')}
            subtitle={t('invitation_subtitle')}
          />
        </Reveal>

        {/* Toast */}
        {toastMsg && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#702C43] text-white px-5 py-2.5 rounded-full text-xs font-semibold shadow-lg animate-fade-in">
            {toastMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Static / Official Invitation Downloads */}
          <div className="lg:col-span-5 space-y-6">
            <Reveal>
              <Card phulkariEdge className="bg-white">
                <div className="flex items-center gap-2 mb-3 text-[#702C43]">
                  <ImageIcon className="w-5 h-5 text-[#C76B84]" />
                  <h3 className="card-heading font-bold text-[#702C43]">
                    {lang === 'hi' ? 'आधिकारिक विवाह पत्रिका' : 'Official Invitation'}
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-[#765F68] leading-relaxed mb-6">
                  {lang === 'hi'
                    ? 'परिवार की ओर से संपूर्ण विवाह पत्रिका (PNG एवं PDF) सहेजें या रिश्तेदारों को भेजें।'
                    : 'Download the complete wedding card bundle for easy printing and sharing.'}
                </p>

                <div className="space-y-3">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleDownloadOfficialPng}
                    disabled={isDownloadingPng}
                    className="w-full text-xs"
                  >
                    {isDownloadingPng ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    {t('invitation_static_download')} (PNG)
                  </Button>

                  <Button
                    variant="ghost"
                    size="md"
                    onClick={handleDownloadOfficialPdf}
                    disabled={isDownloadingPdf}
                    className="w-full text-xs"
                  >
                    {isDownloadingPdf ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <FileText className="w-4 h-4 text-[#702C43]" />
                    )}
                    {t('invitation_static_pdf')} (PDF)
                  </Button>
                </div>

                {/* WhatsApp Status tip */}
                <div className="mt-6 pt-4 border-t border-[#EBD9DE] flex items-center justify-between text-xs text-[#765F68]">
                  <span>📱 WhatsApp Status Ready</span>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="text-[#702C43] font-semibold hover:underline cursor-pointer"
                  >
                    Copy Link
                  </button>
                </div>
              </Card>
            </Reveal>
          </div>

          {/* Personalized Card Generator */}
          <div className="lg:col-span-7">
            <Reveal delay={0.15}>
              <Card className="bg-[#F8E3E9]/50 border-[#EBD9DE]">
                <div className="flex items-center gap-2 mb-2 text-[#702C43]">
                  <Sparkles className="w-5 h-5 text-[#D6AD62]" />
                  <h3 className="card-heading font-bold text-[#702C43]">
                    {t('card_generator_title')}
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-[#765F68] mb-6 leading-relaxed">
                  {t('card_generator_desc')}
                </p>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="card-guest-name" className="block text-xs font-semibold text-[#702C43] mb-1.5">
                      {t('card_name_label')}
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="card-guest-name"
                        type="text"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder={t('card_name_placeholder')}
                        className="flex-1 min-h-[46px] rounded-full bg-white px-4 text-sm text-[#33252B] border border-[#EBD9DE] focus:border-[#702C43] focus:outline-none"
                      />
                      <Button
                        variant="primary"
                        size="md"
                        disabled={isGenerating}
                        onClick={handleCreatePersonalizedCard}
                      >
                        {isGenerating ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          t('card_btn_generate')
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Rendered Card Preview */}
                  {generatedBlobUrl && (
                    <div className="pt-4 border-t border-[#EBD9DE] animate-fade-in text-center">
                      <div className="inline-block rounded-2xl overflow-hidden border-2 border-[#D6AD62]/60 shadow-[0_12px_32px_rgba(112,44,67,0.12)] max-w-[240px] sm:max-w-[280px] mb-4">
                        <img
                          src={generatedBlobUrl}
                          alt="Personalized Card Preview"
                          className="w-full h-auto object-cover"
                        />
                      </div>

                      <div className="flex flex-wrap items-center justify-center gap-3">
                        <Button variant="primary" size="md" onClick={handleDownloadCard}>
                          <Download className="w-4 h-4" />
                          {t('card_btn_download')}
                        </Button>
                        <Button variant="secondary" size="md" onClick={handleShareCard}>
                          <Share2 className="w-4 h-4" />
                          {t('card_btn_share')}
                        </Button>
                        <Button variant="ghost" size="md" onClick={handleDownloadOfficialPdf}>
                          <FileText className="w-4 h-4 text-[#702C43]" />
                          Download PDF
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};
