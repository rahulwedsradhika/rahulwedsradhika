import React, { useState } from 'react';
import { Bed, Bus, Clock, MessageCircle, Phone, UserCheck, Utensils, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useWeddingConfig } from '../../context/WeddingConfigContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Reveal } from '../ui/Reveal';
import { SectionTitle } from '../ui/SectionTitle';

interface HelpSectionProps {
  isEntryActive?: boolean;
}

export const HelpSection: React.FC<HelpSectionProps> = ({ isEntryActive = false }) => {
  const { lang, t } = useLanguage();
  const { config } = useWeddingConfig();
  const [sheetOpen, setSheetOpen] = useState(false);

  const contacts = (config.contacts || []).filter((c) => c.visible !== false);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'travel':
        return <Bus className="w-5 h-5 text-[#D6AD62]" />;
      case 'stay':
        return <Bed className="w-5 h-5 text-[#702C43]" />;
      case 'food':
        return <Utensils className="w-5 h-5 text-[#C76B84]" />;
      default:
        return <UserCheck className="w-5 h-5 text-[#702C43]" />;
    }
  };

  return (
    <section id="help" aria-label={t('help_title')} className="py-14 sm:py-20 px-4 bg-[#FFF4F6]">
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <SectionTitle
            eyebrow={t('help_eyebrow')}
            title={t('help_title')}
            subtitle={t('help_subtitle')}
          />
        </Reveal>

        {/* Operating Hours Notice */}
        <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-[#702C43] mb-8 text-center">
          <Clock className="w-4 h-4 shrink-0 text-[#C76B84]" />
          <span>{t('help_call_hours')}</span>
        </div>

        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contacts.map((contact, idx) => {
            const contactName = lang === 'hi' ? (contact.name_hi || contact.name_en) : contact.name_en;
            const roleLabel = lang === 'hi' ? contact.role_label_hi : contact.role_label_en;
            const rawWa = contact.whatsapp?.replace(/[^0-9]/g, '') || '';
            const waUrl = rawWa ? `https://wa.me/${rawWa}` : null;

            return (
              <Reveal key={contact.id} delay={idx * 0.08}>
                <Card phulkariEdge className="h-full flex flex-col justify-between bg-white">
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <span className="p-2 rounded-xl bg-[#FFF4F6] border border-[#EBD9DE]">
                        {getRoleIcon(contact.role)}
                      </span>
                      <span className="text-xs font-semibold text-[#765F68]">
                        {contact.languages}
                      </span>
                    </div>

                    <h3 className="card-heading font-bold text-[#702C43] mb-1">
                      {contactName}
                    </h3>

                    <p className="text-xs sm:text-sm font-semibold text-[#C76B84] mb-3">
                      {roleLabel}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-3 border-t border-[#F8E3E9]">
                    <Button
                      variant="primary"
                      size="sm"
                      href={`tel:${contact.phone}`}
                      className="flex-1 min-w-[120px] shadow-xs"
                    >
                      <Phone className="w-3.5 h-3.5 mr-1.5" />
                      {t('help_btn_call')}
                    </Button>

                    {waUrl && (
                      <Button
                        variant="secondary"
                        size="sm"
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 min-w-[120px] text-emerald-800 border-emerald-200 hover:bg-emerald-50"
                      >
                        <MessageCircle className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                        {t('help_btn_wa')}
                      </Button>
                    )}
                  </div>
                </Card>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};
