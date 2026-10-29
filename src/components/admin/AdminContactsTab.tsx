import React, { useState } from 'react';
import { useWeddingConfig } from '../../context/WeddingConfigContext';
import { ContactConfigItem, LocalizedString } from '../../types/wedding';
import { Phone, Plus, Trash2, Edit2, MessageCircle, Eye, EyeOff, Globe, Check, X } from 'lucide-react';

export const AdminContactsTab: React.FC = () => {
  const { config, updateConfig } = useWeddingConfig();
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [contactDraft, setContactDraft] = useState<Partial<ContactConfigItem>>({});
  const [isAddingNew, setIsAddingNew] = useState(false);

  const handleStartAdd = () => {
    setContactDraft({
      id: `contact_${Date.now()}`,
      role: 'general',
      role_label_en: 'Guest Support',
      role_label_hi: 'अतिथि सहायता',
      name_en: '',
      name_hi: '',
      phone: '+91 98120 00000',
      whatsapp: '+919812000000',
      languages: 'Hindi, Haryanvi, English',
      visible: true,
      sortOrder: (config.contacts?.length || 0) + 1,
    });
    setIsAddingNew(true);
    setEditingContactId(null);
  };

  const handleSaveContact = () => {
    if (!contactDraft.name_en?.trim()) return;

    const saved: ContactConfigItem = {
      id: contactDraft.id || `contact_${Date.now()}`,
      role: contactDraft.role || 'general',
      role_label_en: contactDraft.role_label_en || 'Support',
      role_label_hi: contactDraft.role_label_hi || 'सहायता',
      name_en: contactDraft.name_en,
      name_hi: contactDraft.name_hi || contactDraft.name_en,
      phone: contactDraft.phone || '',
      whatsapp: contactDraft.whatsapp || contactDraft.phone?.replace(/[^0-9]/g, '') || '',
      secondaryPhone: contactDraft.secondaryPhone,
      email: contactDraft.email,
      languages: contactDraft.languages || 'Hindi, Haryanvi',
      visible: contactDraft.visible ?? true,
      sortOrder: contactDraft.sortOrder || 1,
    };

    void updateConfig((prev) => {
      const existing = prev.contacts || [];
      const updated = isAddingNew
        ? [...existing, saved]
        : existing.map((c) => (c.id === saved.id ? saved : c));
      return {
        ...prev,
        contacts: updated,
      };
    });

    setIsAddingNew(false);
    setEditingContactId(null);
    setContactDraft({});
  };

  const handleDeleteContact = (id: string) => {
    if (!confirm('Are you sure you want to remove this contact person?')) return;
    void updateConfig((prev) => ({
      ...prev,
      contacts: (prev.contacts || []).filter((c) => c.id !== id),
    }));
  };

  const handleToggleVisibility = (id: string) => {
    void updateConfig((prev) => ({
      ...prev,
      contacts: (prev.contacts || []).map((c) =>
        c.id === id ? { ...c, visible: !c.visible } : c
      ),
    }));
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur rounded-2xl p-6 border border-pink-100 dark:border-stone-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Phone className="w-5 h-5 text-burgundy" />
            Guest Helpline & Family Coordinators
          </h2>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
            Assign point-of-contact family members for route guidance, lodging, dining, and ceremonies.
          </p>
        </div>
        <button
          onClick={handleStartAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-burgundy hover:bg-burgundy/90 text-white rounded-xl text-xs font-medium transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Helpline Contact
        </button>
      </div>

      {/* Inline Form */}
      {(isAddingNew || editingContactId) && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border-2 border-burgundy/20 shadow-md space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-pink-100 dark:border-stone-800 pb-3">
            <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
              {isAddingNew ? 'Add Coordinator' : `Edit: ${contactDraft.name_en || 'Contact'}`}
            </h3>
            <button
              onClick={() => {
                setIsAddingNew(false);
                setEditingContactId(null);
              }}
              className="text-stone-400 hover:text-stone-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Category Role
              </label>
              <select
                value={contactDraft.role || 'general'}
                onChange={(e) => setContactDraft((prev) => ({ ...prev, role: e.target.value as any }))}
                className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800"
              >
                <option value="travel">Travel & Directions</option>
                <option value="stay">Stay & Accommodation</option>
                <option value="food">Catering & Feasts</option>
                <option value="general">General Help</option>
                <option value="custom">Custom Assistance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Role Label (EN)
              </label>
              <input
                type="text"
                placeholder="Travel & Route Help"
                value={contactDraft.role_label_en || ''}
                onChange={(e) => setContactDraft((prev) => ({ ...prev, role_label_en: e.target.value }))}
                className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Role Label (HI)
              </label>
              <input
                type="text"
                placeholder="रास्ता एवं मार्ग दर्शन"
                value={contactDraft.role_label_hi || ''}
                onChange={(e) => setContactDraft((prev) => ({ ...prev, role_label_hi: e.target.value }))}
                className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Coordinator Name (EN) *
              </label>
              <input
                type="text"
                placeholder="Virender Singh"
                value={contactDraft.name_en || ''}
                onChange={(e) => setContactDraft((prev) => ({ ...prev, name_en: e.target.value }))}
                className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Coordinator Name (HI)
              </label>
              <input
                type="text"
                placeholder="विरेन्द्र सिंह"
                value={contactDraft.name_hi || ''}
                onChange={(e) => setContactDraft((prev) => ({ ...prev, name_hi: e.target.value }))}
                className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                placeholder="+91 98120 12345"
                value={contactDraft.phone || ''}
                onChange={(e) => setContactDraft((prev) => ({ ...prev, phone: e.target.value }))}
                className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                WhatsApp Number (digits with country code)
              </label>
              <input
                type="text"
                placeholder="+919812012345"
                value={contactDraft.whatsapp || ''}
                onChange={(e) => setContactDraft((prev) => ({ ...prev, whatsapp: e.target.value }))}
                className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Languages Spoken
              </label>
              <input
                type="text"
                placeholder="Hindi, Haryanvi, English"
                value={contactDraft.languages || ''}
                onChange={(e) => setContactDraft((prev) => ({ ...prev, languages: e.target.value }))}
                className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-stone-100 dark:border-stone-800">
            <button
              onClick={() => {
                setIsAddingNew(false);
                setEditingContactId(null);
              }}
              className="px-4 py-2 text-xs text-stone-600 dark:text-stone-400 hover:bg-stone-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveContact}
              className="px-5 py-2 text-xs bg-burgundy hover:bg-burgundy/90 text-white font-medium rounded-xl shadow-sm"
            >
              Save Helpline Contact
            </button>
          </div>
        </div>
      )}

      {/* Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(config.contacts || []).map((contact) => {
          const rawWa = contact.whatsapp?.replace(/[^0-9]/g, '') || '';
          const waUrl = rawWa
            ? `https://wa.me/${rawWa}?text=${encodeURIComponent('Namaste! Need assistance regarding Rahul & Radhika wedding.')}`
            : null;

          return (
            <div
              key={contact.id}
              className={`bg-white dark:bg-stone-900 rounded-2xl p-5 border transition ${
                contact.visible
                  ? 'border-pink-100 dark:border-stone-800 shadow-sm'
                  : 'border-dashed border-stone-300 dark:border-stone-700 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-burgundy bg-pink-50 dark:bg-stone-800 px-2.5 py-0.5 rounded-full">
                    {contact.role_label_en} • {contact.role_label_hi}
                  </span>
                  <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100 mt-2">
                    {contact.name_en}{' '}
                    <span className="text-xs font-normal text-stone-500 font-sans">({contact.name_hi})</span>
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-stone-400" />
                    {contact.languages}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    title={contact.visible ? 'Visible' : 'Hidden'}
                    onClick={() => handleToggleVisibility(contact.id)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                  >
                    {contact.visible ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-stone-400" />}
                  </button>
                  <button
                    title="Edit"
                    onClick={() => {
                      setContactDraft(contact);
                      setEditingContactId(contact.id);
                      setIsAddingNew(false);
                    }}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-burgundy"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    title="Delete"
                    onClick={() => handleDeleteContact(contact.id)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-stone-100 dark:border-stone-800">
                <a
                  href={`tel:${contact.phone}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-xl text-xs font-medium"
                >
                  <Phone className="w-3.5 h-3.5 text-burgundy" />
                  {contact.phone}
                </a>
                {waUrl && (
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-medium"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    WhatsApp
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
