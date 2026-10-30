import React, { useState, useEffect } from 'react';
import { Check, CheckCircle2, ChevronRight, Edit3, Heart, Loader2, Send, Share2, Sparkles, Users } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useWeddingConfig } from '../../context/WeddingConfigContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Reveal } from '../../components/ui/Reveal';
import { SectionTitle } from '../../components/ui/SectionTitle';
import {
  RsvpRecord,
  submitRsvpToSupabase,
  getCachedRsvp,
  getRsvpDraft,
  saveRsvpDraft,
  clearRsvpDraft,
} from '../../lib/supabaseClient';
import { getWhatsAppShareUrl } from '../../lib/share';

export const RsvpPage: React.FC = () => {
  const { lang, t } = useLanguage();
  const { config } = useWeddingConfig();

  const events = (config.events || []).filter((e) => e.visible !== false);

  const [confirmedRsvp, setConfirmedRsvp] = useState<RsvpRecord | null>(() => getCachedRsvp());
  const [isEditing, setIsEditing] = useState<boolean>(!confirmedRsvp);

  // Form State initialized from Draft or Confirmed RSVP or Defaults
  const [formData, setFormData] = useState<RsvpRecord>(() => {
    const draft = getRsvpDraft();
    const existing = confirmedRsvp;
    return {
      full_name: draft?.full_name || existing?.full_name || '',
      phone: draft?.phone || existing?.phone || '',
      attending: draft?.attending || existing?.attending || 'yes',
      guest_count: draft?.guest_count || existing?.guest_count || 2,
      events: draft?.events || existing?.events || events.map((e) => e.id),
      side: draft?.side || existing?.side || 'both',
      diet: draft?.diet || existing?.diet || 'veg',
      needs_stay: draft?.needs_stay ?? existing?.needs_stay ?? false,
      needs_pickup: draft?.needs_pickup ?? existing?.needs_pickup ?? false,
      arrival_info: draft?.arrival_info || existing?.arrival_info || '',
      message: draft?.message || existing?.message || '',
      lang,
    };
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Sync draft to local storage on changes
  useEffect(() => {
    if (isEditing) {
      saveRsvpDraft(formData);
    }
  }, [formData, isEditing]);

  const handleToggleEvent = (eventId: string) => {
    setFormData((prev) => {
      const exists = prev.events.includes(eventId);
      return {
        ...prev,
        events: exists ? prev.events.filter((id) => id !== eventId) : [...prev.events, eventId],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.full_name.trim()) {
      setErrorMessage(lang === 'hi' ? 'कृपया अपना नाम दर्ज करें।' : 'Please enter your name.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await submitRsvpToSupabase({
        ...formData,
        lang,
      });

      if (res.success) {
        setConfirmedRsvp(formData);
        setIsEditing(false);
        clearRsvpDraft();
      } else {
        setErrorMessage(res.error || t('common_error'));
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : t('common_error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShareConfirmation = () => {
    const text = `Ram Ram! We have confirmed our RSVP for the wedding of Rahul & Radhika on 28 November 2026 in Rohtak, Haryana. See you there!`;
    const url = getWhatsAppShareUrl(text);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="py-12 sm:py-16 px-4 bg-[#FFF4F6] min-h-[70vh]">
      <div className="max-w-2xl mx-auto">
        <Reveal>
          <SectionTitle
            eyebrow={t('rsvp_eyebrow')}
            title={t('rsvp_title')}
            subtitle={t('rsvp_subtitle')}
          />
        </Reveal>

        {confirmedRsvp && !isEditing ? (
          <Reveal delay={0.1}>
            <Card phulkariEdge className="bg-white p-6 sm:p-8 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h3 className="font-heading font-bold text-2xl text-[#702C43]">
                  {t('rsvp_success_title')}
                </h3>
                <p className="text-sm text-[#765F68] mt-1 max-w-md mx-auto leading-relaxed">
                  {t('rsvp_success_message')}
                </p>
              </div>

              {/* Summary of Response */}
              <div className="p-4 rounded-2xl bg-[#FFF4F6] border border-[#EBD9DE] text-left text-xs sm:text-sm space-y-2 max-w-md mx-auto">
                <div className="flex justify-between items-center py-1 border-b border-[#EBD9DE]/50">
                  <span className="text-[#765F68]">Guest Name:</span>
                  <span className="font-bold text-[#702C43]">{confirmedRsvp.full_name}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[#EBD9DE]/50">
                  <span className="text-[#765F68]">Status:</span>
                  <span className="font-bold uppercase tracking-wider text-emerald-800">
                    {confirmedRsvp.attending === 'yes'
                      ? 'Attending (हाँ, ज़रूर)'
                      : confirmedRsvp.attending === 'no'
                      ? 'Regrets (सादर क्षमा)'
                      : 'Maybe (शीघ्र निश्चित)'}
                  </span>
                </div>
                {confirmedRsvp.attending === 'yes' && (
                  <div className="flex justify-between items-center py-1 border-b border-[#EBD9DE]/50">
                    <span className="text-[#765F68]">Total Members:</span>
                    <span className="font-bold text-[#702C43]">{confirmedRsvp.guest_count}</span>
                  </div>
                )}
                {confirmedRsvp.message && (
                  <div className="pt-2">
                    <span className="text-[#765F68] block mb-1">Your Blessing:</span>
                    <p className="italic text-[#33252B] bg-white p-2.5 rounded-xl border border-[#EBD9DE]">
                      "{confirmedRsvp.message}"
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Button variant="primary" size="md" onClick={handleShareConfirmation}>
                  <Share2 className="w-4 h-4 mr-1.5" />
                  {t('rsvp_btn_share_wa')}
                </Button>
                <Button variant="secondary" size="md" onClick={() => setIsEditing(true)}>
                  <Edit3 className="w-4 h-4 mr-1.5" />
                  {t('rsvp_btn_edit')}
                </Button>
              </div>
            </Card>
          </Reveal>
        ) : (
          <Reveal delay={0.1}>
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EBD9DE] shadow-xl space-y-6">
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-800 font-medium">
                  {errorMessage}
                </div>
              )}

              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-bold text-[#702C43]">
                  {t('rsvp_field_name')}
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder={t('rsvp_field_name_placeholder')}
                  className="w-full min-h-[46px] rounded-xl border border-[#EBD9DE] bg-[#FFF4F6]/50 px-3.5 py-2.5 text-sm text-[#33252B] focus:border-[#702C43] focus:bg-white focus:outline-none transition shadow-2xs"
                />
              </div>

              {/* Phone / WhatsApp */}
              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-bold text-[#702C43]">
                  {t('rsvp_field_phone')}
                </label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder={t('rsvp_field_phone_placeholder')}
                  className="w-full min-h-[46px] rounded-xl border border-[#EBD9DE] bg-[#FFF4F6]/50 px-3.5 py-2.5 text-sm text-[#33252B] focus:border-[#702C43] focus:bg-white focus:outline-none transition shadow-2xs"
                />
              </div>

              {/* Attending Status Radio Cards */}
              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-bold text-[#702C43]">
                  {t('rsvp_field_attending')}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'yes', label: t('rsvp_attending_yes'), color: 'emerald' },
                    { id: 'maybe', label: t('rsvp_attending_maybe'), color: 'amber' },
                    { id: 'no', label: t('rsvp_attending_no'), color: 'stone' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, attending: opt.id as any })}
                      className={`min-h-[46px] p-3 rounded-2xl border text-xs sm:text-sm font-bold flex items-center justify-center text-center transition cursor-pointer ${
                        formData.attending === opt.id
                          ? 'border-[#702C43] bg-[#702C43] text-white shadow-xs'
                          : 'border-[#EBD9DE] bg-[#FFF4F6]/60 text-[#33252B] hover:border-[#702C43]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {formData.attending !== 'no' && (
                <>
                  {/* Guest Count */}
                  <div className="space-y-1.5">
                    <label className="block text-xs sm:text-sm font-bold text-[#702C43]">
                      {t('rsvp_field_guests')}
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setFormData({ ...formData, guest_count: num })}
                          className={`w-10 h-10 rounded-xl text-sm font-bold border transition cursor-pointer ${
                            formData.guest_count === num
                              ? 'bg-[#702C43] text-white border-[#702C43]'
                              : 'bg-[#FFF4F6]/60 border-[#EBD9DE] text-[#702C43] hover:border-[#702C43]'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Ceremonies Attending */}
                  <div className="space-y-2">
                    <label className="block text-xs sm:text-sm font-bold text-[#702C43]">
                      {t('rsvp_field_events')}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {events.map((ev) => {
                        const isChecked = formData.events.includes(ev.id);
                        return (
                          <button
                            key={ev.id}
                            type="button"
                            onClick={() => handleToggleEvent(ev.id)}
                            className={`p-3 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                              isChecked
                                ? 'bg-[#F8E3E9] border-[#702C43] text-[#702C43]'
                                : 'bg-[#FFF4F6]/50 border-[#EBD9DE] text-[#765F68]'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <span>{ev.emoji}</span>
                              <span>{ev.name[lang]}</span>
                            </span>
                            {isChecked && <Check className="w-4 h-4 text-[#702C43]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Side of family */}
                  <div className="space-y-1.5">
                    <label className="block text-xs sm:text-sm font-bold text-[#702C43]">
                      {t('rsvp_field_side')}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'groom', label: t('rsvp_side_groom') },
                        { id: 'bride', label: t('rsvp_side_bride') },
                        { id: 'both', label: t('rsvp_side_both') },
                      ].map((side) => (
                        <button
                          key={side.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, side: side.id as any })}
                          className={`min-h-[42px] px-2 py-2 rounded-xl border text-xs font-semibold text-center transition cursor-pointer truncate ${
                            formData.side === side.id
                              ? 'bg-[#702C43] text-white border-[#702C43]'
                              : 'bg-[#FFF4F6]/60 border-[#EBD9DE] text-[#702C43]'
                          }`}
                        >
                          {side.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Accommodation & Pickup Toggles */}
                  <div className="pt-2 space-y-3 border-t border-[#EBD9DE]">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.needs_stay}
                        onChange={(e) => setFormData({ ...formData, needs_stay: e.target.checked })}
                        className="w-4 h-4 accent-[#702C43] rounded"
                      />
                      <span className="text-xs sm:text-sm font-medium text-[#33252B]">
                        {t('rsvp_toggle_stay')}
                      </span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.needs_pickup}
                        onChange={(e) => setFormData({ ...formData, needs_pickup: e.target.checked })}
                        className="w-4 h-4 accent-[#702C43] rounded"
                      />
                      <span className="text-xs sm:text-sm font-medium text-[#33252B]">
                        {t('rsvp_toggle_pickup')}
                      </span>
                    </label>
                  </div>
                </>
              )}

              {/* Message & Blessings */}
              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-bold text-[#702C43]">
                  {t('rsvp_field_message')}
                </label>
                <textarea
                  rows={3}
                  value={formData.message || ''}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder={t('rsvp_field_message_placeholder')}
                  className="w-full rounded-xl border border-[#EBD9DE] bg-[#FFF4F6]/50 p-3 text-sm text-[#33252B] focus:border-[#702C43] focus:bg-white focus:outline-none transition shadow-2xs"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                      <span>{t('rsvp_submitting')}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-1.5" />
                      <span>{t('rsvp_btn_submit')}</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Reveal>
        )}
      </div>
    </div>
  );
};
