import React, { useState } from 'react';
import { useWeddingConfig } from '../../context/WeddingConfigContext';
import { FamilyConfig, FamilyMember, LocalizedString } from '../../types/wedding';
import { Users, Plus, Trash2, Edit2, Check, X, Shield, Eye, EyeOff } from 'lucide-react';

export const AdminFamiliesTab: React.FC = () => {
  const { config, updateConfig } = useWeddingConfig();
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [memberDraft, setMemberDraft] = useState<Partial<FamilyMember>>({});
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Update Groom Family
  const handleGroomFamilyChange = (field: keyof FamilyConfig, val: any) => {
    void updateConfig((prev) => ({
      ...prev,
      groomFamily: {
        ...prev.groomFamily,
        [field]: val,
      },
    }));
  };

  // Update Bride Family
  const handleBrideFamilyChange = (field: keyof FamilyConfig, val: any) => {
    void updateConfig((prev) => ({
      ...prev,
      brideFamily: {
        ...prev.brideFamily,
        [field]: val,
      },
    }));
  };

  // Family Members Management
  const handleStartAddMember = () => {
    setMemberDraft({
      id: `fam_${Date.now()}`,
      name: { en: '', hi: '' },
      relation: { en: '', hi: '' },
      side: 'groom',
      honorific: 'Shri',
      description: { en: '', hi: '' },
      sortOrder: (config.familyMembers?.length || 0) + 1,
      visible: true,
    });
    setIsAddingNew(true);
    setEditingMemberId(null);
  };

  const handleSaveMember = () => {
    if (!memberDraft.name?.en?.trim()) return;
    const newMember: FamilyMember = {
      id: memberDraft.id || `fam_${Date.now()}`,
      name: memberDraft.name as LocalizedString,
      relation: memberDraft.relation || { en: 'Family Member', hi: 'परिवार सदस्य' },
      side: memberDraft.side || 'groom',
      honorific: memberDraft.honorific || '',
      description: memberDraft.description,
      sortOrder: memberDraft.sortOrder || 1,
      visible: memberDraft.visible ?? true,
    };

    void updateConfig((prev) => {
      const existing = prev.familyMembers || [];
      const updated = isAddingNew
        ? [...existing, newMember]
        : existing.map((m) => (m.id === newMember.id ? newMember : m));
      return {
        ...prev,
        familyMembers: updated,
      };
    });

    setIsAddingNew(false);
    setEditingMemberId(null);
    setMemberDraft({});
  };

  const handleDeleteMember = (id: string) => {
    if (!confirm('Are you sure you want to remove this family member?')) return;
    void updateConfig((prev) => ({
      ...prev,
      familyMembers: (prev.familyMembers || []).filter((m) => m.id !== id),
    }));
  };

  const handleToggleMemberVisibility = (id: string) => {
    void updateConfig((prev) => ({
      ...prev,
      familyMembers: (prev.familyMembers || []).map((m) =>
        m.id === id ? { ...m, visible: !m.visible } : m
      ),
    }));
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur rounded-2xl p-6 border border-pink-100 dark:border-stone-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-burgundy" />
              Family & Lineage Administration
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
              Configure parents, elders, ancestral villages, and prominent family members shown across invitations.
            </p>
          </div>
          <label className="inline-flex items-center gap-3 cursor-pointer p-2.5 rounded-xl bg-pink-50/60 dark:bg-stone-800/60 border border-pink-200/60 dark:border-stone-700">
            <input
              type="checkbox"
              checked={config.showFamiliesPublicly}
              onChange={(e) =>
                void updateConfig((prev) => ({
                  ...prev,
                  showFamiliesPublicly: e.target.checked,
                }))
              }
              className="w-4 h-4 text-burgundy rounded focus:ring-burgundy"
            />
            <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
              Display Family Section on Public Site
            </span>
          </label>
        </div>
      </div>

      {/* Two Column Family Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Groom Family Card */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-pink-100 dark:border-stone-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-pink-100 dark:border-stone-800 pb-3">
            <span className="text-xs uppercase tracking-wider font-bold text-burgundy bg-pink-50 dark:bg-stone-800 px-2.5 py-1 rounded-full">
              Groom's Lineage
            </span>
            <span className="text-xs text-stone-500">Village {config.groomFamily.village.en}</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Father's Name (English & Hindi)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="English"
                  value={config.groomFamily.father.en}
                  onChange={(e) =>
                    handleGroomFamilyChange('father', { ...config.groomFamily.father, en: e.target.value })
                  }
                  className="w-full text-sm px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800"
                />
                <input
                  type="text"
                  placeholder="Hindi"
                  value={config.groomFamily.father.hi}
                  onChange={(e) =>
                    handleGroomFamilyChange('father', { ...config.groomFamily.father, hi: e.target.value })
                  }
                  className="w-full text-sm px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Mother's Name (English & Hindi)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="English"
                  value={config.groomFamily.mother.en}
                  onChange={(e) =>
                    handleGroomFamilyChange('mother', { ...config.groomFamily.mother, en: e.target.value })
                  }
                  className="w-full text-sm px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800"
                />
                <input
                  type="text"
                  placeholder="Hindi"
                  value={config.groomFamily.mother.hi}
                  onChange={(e) =>
                    handleGroomFamilyChange('mother', { ...config.groomFamily.mother, hi: e.target.value })
                  }
                  className="w-full text-sm px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Ancestral Village & District
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={config.groomFamily.village.en}
                  onChange={(e) =>
                    handleGroomFamilyChange('village', { ...config.groomFamily.village, en: e.target.value })
                  }
                  className="w-full text-sm px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800"
                />
                <input
                  type="text"
                  value={config.groomFamily.village.hi}
                  onChange={(e) =>
                    handleGroomFamilyChange('village', { ...config.groomFamily.village, hi: e.target.value })
                  }
                  className="w-full text-sm px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bride Family Card */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-pink-100 dark:border-stone-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-pink-100 dark:border-stone-800 pb-3">
            <span className="text-xs uppercase tracking-wider font-bold text-burgundy bg-pink-50 dark:bg-stone-800 px-2.5 py-1 rounded-full">
              Bride's Lineage
            </span>
            <span className="text-xs text-stone-500">Village {config.brideFamily.village.en}</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Father's Name (English & Hindi)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="English"
                  value={config.brideFamily.father.en}
                  onChange={(e) =>
                    handleBrideFamilyChange('father', { ...config.brideFamily.father, en: e.target.value })
                  }
                  className="w-full text-sm px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800"
                />
                <input
                  type="text"
                  placeholder="Hindi"
                  value={config.brideFamily.father.hi}
                  onChange={(e) =>
                    handleBrideFamilyChange('father', { ...config.brideFamily.father, hi: e.target.value })
                  }
                  className="w-full text-sm px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Mother's Name (English & Hindi)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="English"
                  value={config.brideFamily.mother.en}
                  onChange={(e) =>
                    handleBrideFamilyChange('mother', { ...config.brideFamily.mother, en: e.target.value })
                  }
                  className="w-full text-sm px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800"
                />
                <input
                  type="text"
                  placeholder="Hindi"
                  value={config.brideFamily.mother.hi}
                  onChange={(e) =>
                    handleBrideFamilyChange('mother', { ...config.brideFamily.mother, hi: e.target.value })
                  }
                  className="w-full text-sm px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Ancestral Village & District
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={config.brideFamily.village.en}
                  onChange={(e) =>
                    handleBrideFamilyChange('village', { ...config.brideFamily.village, en: e.target.value })
                  }
                  className="w-full text-sm px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800"
                />
                <input
                  type="text"
                  value={config.brideFamily.village.hi}
                  onChange={(e) =>
                    handleBrideFamilyChange('village', { ...config.brideFamily.village, hi: e.target.value })
                  }
                  className="w-full text-sm px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Prominent Family Members Table */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-pink-100 dark:border-stone-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-pink-100 dark:border-stone-800 pb-4">
          <div>
            <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
              Honorable Elders & Key Family Members
            </h3>
            <p className="text-xs text-stone-500">
              List uncle, aunt, siblings, or grandparents featured with blessings.
            </p>
          </div>
          <button
            onClick={handleStartAddMember}
            className="inline-flex items-center gap-2 px-4 py-2 bg-burgundy hover:bg-burgundy/90 text-white rounded-xl text-xs font-medium transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Family Member
          </button>
        </div>

        {/* Member Edit / Create Form Modal or Inline */}
        {(isAddingNew || editingMemberId) && (
          <div className="p-4 rounded-xl bg-pink-50/60 dark:bg-stone-800/60 border border-pink-200 dark:border-stone-700 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-burgundy uppercase tracking-wider">
                {isAddingNew ? 'Add New Member' : 'Edit Member'}
              </span>
              <button
                onClick={() => {
                  setIsAddingNew(false);
                  setEditingMemberId(null);
                }}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Side
                </label>
                <select
                  value={memberDraft.side || 'groom'}
                  onChange={(e) =>
                    setMemberDraft((prev) => ({ ...prev, side: e.target.value as any }))
                  }
                  className="w-full text-xs px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
                >
                  <option value="groom">Groom's Side</option>
                  <option value="bride">Bride's Side</option>
                  <option value="both">Both Families</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Name (English)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Hooda"
                  value={memberDraft.name?.en || ''}
                  onChange={(e) =>
                    setMemberDraft((prev) => ({
                      ...prev,
                      name: { en: e.target.value, hi: prev.name?.hi || '' },
                    }))
                  }
                  className="w-full text-xs px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Name (Hindi Translation)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Hooda (Hindi)"
                  value={memberDraft.name?.hi || ''}
                  onChange={(e) =>
                    setMemberDraft((prev) => ({
                      ...prev,
                      name: { en: prev.name?.en || '', hi: e.target.value },
                    }))
                  }
                  className="w-full text-xs px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Relation / Role (English)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Uncle / Chacha ji"
                  value={memberDraft.relation?.en || ''}
                  onChange={(e) =>
                    setMemberDraft((prev) => ({
                      ...prev,
                      relation: { en: e.target.value, hi: prev.relation?.hi || '' },
                    }))
                  }
                  className="w-full text-xs px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Relation / Role (Hindi Translation)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chacha Ji (Hindi)"
                  value={memberDraft.relation?.hi || ''}
                  onChange={(e) =>
                    setMemberDraft((prev) => ({
                      ...prev,
                      relation: { en: prev.relation?.en || '', hi: e.target.value },
                    }))
                  }
                  className="w-full text-xs px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsAddingNew(false);
                  setEditingMemberId(null);
                }}
                className="px-3 py-1.5 text-xs text-stone-600 dark:text-stone-400 hover:bg-stone-200/50 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveMember}
                className="px-4 py-1.5 text-xs bg-burgundy text-white rounded-lg font-medium shadow-sm hover:bg-burgundy/90"
              >
                Save Member
              </button>
            </div>
          </div>
        )}

        {/* Members List */}
        <div className="divide-y divide-stone-100 dark:divide-stone-800">
          {(config.familyMembers || []).length === 0 ? (
            <p className="text-xs text-stone-500 py-6 text-center italic">
              No additional family members added yet. Tap "Add Family Member" above.
            </p>
          ) : (
            config.familyMembers.map((member) => (
              <div
                key={member.id}
                className="py-3 flex items-center justify-between gap-4 hover:bg-stone-50/50 dark:hover:bg-stone-800/40 px-3 rounded-xl transition"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      member.side === 'groom'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200'
                        : member.side === 'bride'
                        ? 'bg-pink-100 text-pink-800 dark:bg-pink-950/60 dark:text-pink-200'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200'
                    }`}
                  >
                    {member.side}
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                      {member.name.en} <span className="text-xs text-stone-500 font-normal">({member.name.hi})</span>
                    </h4>
                    <p className="text-xs text-stone-500">
                      {member.relation.en} • {member.relation.hi}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    title={member.visible ? 'Visible' : 'Hidden'}
                    onClick={() => handleToggleMemberVisibility(member.id)}
                    className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                  >
                    {member.visible ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-stone-400" />}
                  </button>
                  <button
                    title="Edit"
                    onClick={() => {
                      setMemberDraft(member);
                      setEditingMemberId(member.id);
                      setIsAddingNew(false);
                    }}
                    className="p-1.5 text-stone-400 hover:text-burgundy"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    title="Delete"
                    onClick={() => handleDeleteMember(member.id)}
                    className="p-1.5 text-stone-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
