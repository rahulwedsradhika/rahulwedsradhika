import React, { useState } from 'react';
import { useWeddingConfig } from '../../context/WeddingConfigContext';
import { FileText, Search, Plus, Trash2, RotateCcw, Check } from 'lucide-react';
import { LocalizedString } from '../../types/wedding';

const STANDARD_CONTENT_KEYS: Array<{
  key: string;
  category: string;
  label: string;
  defaultEn: string;
  defaultHi: string;
}> = [
  {
    key: 'hero_tagline',
    category: 'Hero Header',
    label: 'Hero Ceremony Subtitle',
    defaultEn: 'Village Dobh, Rohtak, Haryana • 28 November 2026',
    defaultHi: 'गाँव डोभ, रोहतक, हरियाणा • २८ नवंबर २०२६',
  },
  {
    key: 'hero_invitation_tag',
    category: 'Hero Header',
    label: 'Hero Badge Tag',
    defaultEn: 'Cordially Invite You to the Wedding of',
    defaultHi: 'के पावन शुभ विवाह में आपका हार्दिक अभिनन्दन है',
  },
  {
    key: 'invitation_salutation',
    category: 'Invitation Letter',
    label: 'Opening Auspicious Inscription',
    defaultEn: '|| Shri Ganeshaya Namah ||',
    defaultHi: '॥ श्री गणेशाय नमः ॥',
  },
  {
    key: 'invitation_blessing',
    category: 'Invitation Letter',
    label: 'Ancestral Blessing Quote',
    defaultEn: 'With the blessings of our revered ancestors and elders...',
    defaultHi: 'परम पूज्य पूर्वजों एवं कुलदेवता के पावन आशीर्वाद से...',
  },
  {
    key: 'footer_blessing',
    category: 'Footer',
    label: 'Footer Traditional Greeting',
    defaultEn: 'Ram Ram Ji! We eagerly look forward to welcoming you to Village Dobh.',
    defaultHi: 'राम राम जी! गाँव डोभ में आप सभी का स्नेहपूर्ण स्वागत है।',
  },
  {
    key: 'footer_copyright',
    category: 'Footer',
    label: 'Footer Family Signature',
    defaultEn: 'With warm regards from Hooda & Sangwan Families',
    defaultHi: 'हुड्डा एवं सांगवान परिवार की ओर से सस्नेह न्योता',
  },
];

export const AdminContentTab: React.FC = () => {
  const { config, updateConfig } = useWeddingConfig();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [customKey, setCustomKey] = useState('');
  const [customEn, setCustomEn] = useState('');
  const [customHi, setCustomHi] = useState('');
  const [showAddCustom, setShowAddCustom] = useState(false);

  const overrides = config.contentOverrides || {};

  const handleUpdateOverride = (key: string, enVal: string, hiVal: string) => {
    void updateConfig((prev) => ({
      ...prev,
      contentOverrides: {
        ...(prev.contentOverrides || {}),
        [key]: { en: enVal, hi: hiVal },
      },
    }));
  };

  const handleResetOverride = (key: string) => {
    void updateConfig((prev) => {
      const next = { ...(prev.contentOverrides || {}) };
      delete next[key];
      return {
        ...prev,
        contentOverrides: next,
      };
    });
  };

  const handleAddCustomOverride = () => {
    if (!customKey.trim() || !customEn.trim()) return;
    const sanitizedKey = customKey.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
    handleUpdateOverride(sanitizedKey, customEn.trim(), customHi.trim() || customEn.trim());
    setCustomKey('');
    setCustomEn('');
    setCustomHi('');
    setShowAddCustom(false);
  };

  const categories = ['all', 'Hero Header', 'Invitation Letter', 'Footer', 'Custom Overrides'];

  const filteredItems = STANDARD_CONTENT_KEYS.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch =
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.defaultEn.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur rounded-2xl p-6 border border-pink-100 dark:border-stone-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-burgundy" />
            Content & Language Overrides (भाषा एवं संदेश)
          </h2>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
            Edit text phrases, headings, and traditional Haryanvi phrases in English & Hindi simultaneously.
          </p>
        </div>
        <button
          onClick={() => setShowAddCustom(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-burgundy hover:bg-burgundy/90 text-white rounded-xl text-xs font-medium shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Add Custom String Override
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur rounded-2xl p-4 border border-pink-100 dark:border-stone-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search text keys or labels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeCategory === cat
                  ? 'bg-burgundy text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Add Custom Override Modal */}
      {showAddCustom && (
        <div className="p-5 bg-white dark:bg-stone-900 rounded-2xl border-2 border-burgundy/20 shadow-md space-y-4">
          <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
            Define New String Override
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Unique Key identifier
              </label>
              <input
                type="text"
                placeholder="e.g. sangeet_announcement"
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                English Text
              </label>
              <input
                type="text"
                placeholder="English translation..."
                value={customEn}
                onChange={(e) => setCustomEn(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Hindi Text (हिन्दी)
              </label>
              <input
                type="text"
                placeholder="हिन्दी अनुवाद..."
                value={customHi}
                onChange={(e) => setCustomHi(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setShowAddCustom(false)}
              className="px-3 py-1.5 text-xs text-stone-500 hover:bg-stone-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleAddCustomOverride}
              className="px-4 py-1.5 text-xs bg-burgundy text-white font-medium rounded-xl shadow-sm"
            >
              Save Custom String
            </button>
          </div>
        </div>
      )}

      {/* List of Strings */}
      <div className="space-y-4">
        {filteredItems.map((item) => {
          const currentVal: LocalizedString = overrides[item.key] || {
            en: item.defaultEn,
            hi: item.defaultHi,
          };
          const isModified = Boolean(overrides[item.key]);

          return (
            <div
              key={item.key}
              className={`bg-white dark:bg-stone-900 rounded-2xl p-5 border transition ${
                isModified
                  ? 'border-burgundy/40 shadow-sm ring-1 ring-burgundy/10'
                  : 'border-pink-100 dark:border-stone-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                    {item.label}
                  </span>
                  <span className="text-[10px] font-mono text-stone-400 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded">
                    {item.key}
                  </span>
                </div>

                {isModified && (
                  <button
                    onClick={() => handleResetOverride(item.key)}
                    className="inline-flex items-center gap-1 text-[11px] text-stone-400 hover:text-burgundy"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset to Default
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-medium text-stone-500 mb-1">
                    English Text (EN)
                  </label>
                  <textarea
                    rows={2}
                    value={currentVal.en}
                    onChange={(e) =>
                      handleUpdateOverride(item.key, e.target.value, currentVal.hi)
                    }
                    className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-stone-500 mb-1">
                    Hindi Text (हिन्दी)
                  </label>
                  <textarea
                    rows={2}
                    value={currentVal.hi}
                    onChange={(e) =>
                      handleUpdateOverride(item.key, currentVal.en, e.target.value)
                    }
                    className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
