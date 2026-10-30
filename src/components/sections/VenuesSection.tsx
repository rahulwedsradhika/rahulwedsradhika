import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Check, Copy, ExternalLink, Navigation, Phone, Share2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useWeddingConfig } from '../../context/WeddingConfigContext';
import { copyToClipboard, getWhatsAppShareUrl } from '../../lib/share';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Reveal } from '../ui/Reveal';
import { SectionTitle } from '../ui/SectionTitle';

export const VenuesSection: React.FC = () => {
  const { lang, t } = useLanguage();
  const { config } = useWeddingConfig();
  const [searchParams, setSearchParams] = useSearchParams();

  // Stable memoized visible venues list
  const visibleVenues = useMemo(() => {
    return (config.venues || []).filter((v) => v.visible !== false);
  }, [config.venues]);

  const venueParam = searchParams.get('venue');

  // Derive active venue ID directly from URL parameter or fallback gracefully to first visible venue
  const activeVenueId = useMemo(() => {
    if (venueParam && visibleVenues.some((v) => v.id === venueParam)) {
      return venueParam;
    }
    return visibleVenues[0]?.id || 'haveli_dobh';
  }, [venueParam, visibleVenues]);

  const activeVenue = useMemo(() => {
    return visibleVenues.find((v) => v.id === activeVenueId) || visibleVenues[0];
  }, [visibleVenues, activeVenueId]);

  const handleSelectVenue = (venueId: string) => {
    if (venueId === activeVenueId) return;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('venue', venueId);
        return next;
      },
      { replace: false }
    );
  };

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!activeVenue) return null;

  const handleCopyAddress = async (venue: typeof visibleVenues[0]) => {
    const textToCopy = `${venue.name[lang]}\n${venue.address[lang]}\n${venue.landmark[lang]}\nPlus Code: ${venue.plusCode}`;
    const ok = await copyToClipboard(textToCopy);
    if (ok) {
      setToastMessage(t('common_copied'));
      window.setTimeout(() => setToastMessage(null), 2500);
    }
  };

  const handleShareOnWhatsApp = (venue: typeof visibleVenues[0]) => {
    const msg = `Ram Ram! Here is the location for ${venue.name[lang]} (${venue.landmark[lang]}): ${venue.mapsUrl}`;
    const url = getWhatsAppShareUrl(msg);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="venue" aria-label={t('venue_title')} className="py-14 sm:py-20 px-4 bg-[#FFF4F6]">
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <SectionTitle
            eyebrow={t('venue_eyebrow')}
            title={t('venue_title')}
            subtitle={t('venue_subtitle')}
          />
        </Reveal>

        {/* Venue Switcher Tabs */}
        {visibleVenues.length > 1 && (
          <div className="flex justify-center mb-8">
            <div
              role="group"
              aria-label="Select venue"
              className="inline-flex rounded-full bg-[#F8E3E9] p-1 border border-[#EBD9DE]"
            >
              {visibleVenues.map((venue) => (
                <button
                  key={venue.id}
                  type="button"
                  onClick={() => handleSelectVenue(venue.id)}
                  aria-pressed={activeVenueId === venue.id}
                  className={`min-h-[40px] px-5 rounded-full text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                    activeVenueId === venue.id
                      ? 'bg-[#702C43] text-white shadow-xs'
                      : 'text-[#765F68] hover:text-[#702C43]'
                  }`}
                >
                  {venue.name[lang]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Active Venue Detail Card */}
        <div id={`venue-${activeVenue.id}`}>
          <Reveal>
            <Card phulkariEdge className="p-6 sm:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Details Column */}
                <div className="space-y-4">
                  <div>
                    <h3 className="card-heading font-bold text-[#702C43] text-xl sm:text-2xl mb-1">
                      {activeVenue.name[lang]}
                    </h3>
                    <p className="text-xs sm:text-sm font-semibold text-[#C76B84]">
                      {activeVenue.landmark[lang]}
                    </p>
                  </div>

                  <div className="text-xs sm:text-sm text-[#33252B] space-y-1">
                    <p className="font-medium">{activeVenue.address[lang]}</p>
                    <p className="text-[#765F68] text-xs">Plus Code: {activeVenue.plusCode}</p>
                    <p className="text-emerald-700 text-xs font-medium">🚗 {activeVenue.parking[lang]}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2.5 pt-2">
                    <Button
                      variant="primary"
                      size="sm"
                      href={activeVenue.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shadow-xs"
                    >
                      <Navigation className="w-3.5 h-3.5 mr-1.5" />
                      {t('venue_btn_open_maps')}
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleCopyAddress(activeVenue)}
                    >
                      <Copy className="w-3.5 h-3.5 mr-1.5" />
                      {t('venue_btn_copy_address')}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShareOnWhatsApp(activeVenue)}
                      className="text-emerald-700 hover:bg-emerald-50"
                    >
                      <Share2 className="w-3.5 h-3.5 mr-1.5" />
                      {t('venue_btn_share_wa')}
                    </Button>
                  </div>

                  {toastMessage && (
                    <p className="text-xs font-semibold text-emerald-700 animate-fade-in flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> {toastMessage}
                    </p>
                  )}
                </div>

                {/* Map Embed or Visual Illustration */}
                <div className="rounded-2xl overflow-hidden border border-[#EBD9DE] aspect-[4/3] bg-[#FFF4F6] relative shadow-inner flex items-center justify-center">
                  {activeVenue.embedUrl ? (
                    <iframe
                      title={activeVenue.name[lang]}
                      src={activeVenue.embedUrl}
                      width="100%"
                      height="100%"
                      loading="lazy"
                      className="border-0 w-full h-full"
                    />
                  ) : (
                    <div className="p-6 text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-[#F8E3E9] text-[#702C43] mx-auto flex items-center justify-center">
                        <Navigation className="w-6 h-6" />
                      </div>
                      <h4 className="font-serif font-bold text-base text-[#702C43]">
                        {activeVenue.name[lang]}
                      </h4>
                      <p className="text-xs text-[#765F68] max-w-xs mx-auto">
                        {activeVenue.address[lang]}
                      </p>
                      <a
                        href={activeVenue.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-[#702C43] font-bold underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Open Google Maps Live Navigation
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </Reveal>
        </div>
      </div>
    </section>
  );
};
