import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import {
  Save, Plus, Trash2, ChevronDown, ChevronUp,
  User, Heart, Users, Globe, Award, Upload, Loader2,
  BookOpen, Eye, Target, Handshake, Info
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────
interface CoreValue {
  icon: string;
  title: string;
  description: string;
}

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image: string;
}

interface SectionState {
  hero: { title: string; subtitle: string };
  mission: { title: string; text: string };
  vision: { title: string; text: string };
  values: { title: string; items: CoreValue[] };
  team: { title: string; members: TeamMember[] };
  join_mission: { title: string; text: string };
}

const ICON_OPTIONS = ['Heart', 'Users', 'Award', 'Globe', 'BookOpen', 'Target', 'Handshake', 'Info'];
const ICON_MAP: Record<string, React.ReactNode> = {
  Heart: <Heart className="w-5 h-5" />,
  Users: <Users className="w-5 h-5" />,
  Award: <Award className="w-5 h-5" />,
  Globe: <Globe className="w-5 h-5" />,
  BookOpen: <BookOpen className="w-5 h-5" />,
  Target: <Target className="w-5 h-5" />,
  Handshake: <Handshake className="w-5 h-5" />,
  Info: <Info className="w-5 h-5" />,
};

const defaultState: SectionState = {
  hero: { title: 'About Faith Amplifiers', subtitle: 'Empowering Christians worldwide with innovative solutions for ministry and community building.' },
  mission: { title: 'Our Mission', text: 'To amplify the reach and impact of Christian ministry through innovative technology and professional services.' },
  vision: { title: 'Our Vision', text: 'To be the leading platform that connects and empowers the global Christian community.' },
  values: {
    title: 'Our Core Values',
    items: [
      { icon: 'Heart', title: 'Faith-Centered', description: 'Everything we do is rooted in our commitment to spreading the Gospel.' },
      { icon: 'Users', title: 'Community-Driven', description: 'We foster meaningful relationships within the Christian community.' },
      { icon: 'Award', title: 'Excellence', description: 'We strive for excellence in all our services.' },
      { icon: 'Globe', title: 'Global Impact', description: 'Our mission extends beyond borders.' },
    ]
  },
  team: {
    title: 'Meet Our Team',
    members: [
      { name: 'Pastor Michael Johnson', role: 'Founder & CEO', bio: 'With over 20 years of ministry experience.', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
      { name: 'Sarah Williams', role: 'Head of Content', bio: 'Sarah leads our content strategy.', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80' },
      { name: 'David Thompson', role: 'Technical Director', bio: 'David oversees all technical aspects.', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80' },
    ]
  },
  join_mission: { title: 'Join Our Mission', text: 'Be part of our growing community and help us amplify the message of faith across the globe.' }
};

// ─── Section Collapse Wrapper ─────────────────────────────────────
const SectionCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, icon, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex items-center gap-3 text-gray-900 dark:text-white font-semibold">
          <span className="text-secondary">{icon}</span>
          {title}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && <div className="px-6 pb-6 border-t border-gray-100 dark:border-gray-700 pt-5 space-y-4">{children}</div>}
    </div>
  );
};

// ─── Input helpers ─────────────────────────────────────────────────
const inputCls = "w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-secondary focus:border-transparent transition-all text-sm";
const labelCls = "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5";

// ─── Main Component ────────────────────────────────────────────────
const AboutPageEditor: React.FC = () => {
  const queryClient = useQueryClient();
  const [sections, setSections] = useState<SectionState>(defaultState);
  const [saving, setSaving] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null); // tracks which member image is uploading

  const { data: rows, isLoading } = useQuery({
    queryKey: ['about_page'],
    queryFn: async () => {
      const { data, error } = await supabase.from('about_page').select('*');
      if (error) throw error;
      return data;
    }
  });

  // Hydrate form state from DB rows
  useEffect(() => {
    if (!rows) return;
    const map: Record<string, any> = {};
    rows.forEach(r => { map[r.section] = r.content; });

    setSections(prev => ({
      hero: map.hero || prev.hero,
      mission: map.mission || prev.mission,
      vision: map.vision || prev.vision,
      values: map.values || prev.values,
      team: map.team || prev.team,
      join_mission: map.join_mission || prev.join_mission,
    }));
  }, [rows]);

  // ── Upsert a section ──────────────────────────────────────────────
  const saveSection = async (section: keyof SectionState) => {
    setSaving(section);
    try {
      const { error } = await supabase
        .from('about_page')
        .upsert({ section, content: (sections as any)[section] }, { onConflict: 'section' });

      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['about_page'] });
      toast.success(`"${section.replace('_', ' ')}" section saved!`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save section');
    } finally {
      setSaving(null);
    }
  };

  // ── Team member image upload ───────────────────────────────────────
  const handleMemberImageUpload = async (index: number, file: File) => {
    setUploading(`member-${index}`);
    try {
      const ext = file.name.split('.').pop();
      const path = `about-team/${Date.now()}-${index}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from('content').upload(path, file, { upsert: true });
      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage.from('content').getPublicUrl(path);
      const url = urlData.publicUrl;

      setSections(prev => {
        const members = [...prev.team.members];
        members[index] = { ...members[index], image: url };
        return { ...prev, team: { ...prev.team, members } };
      });
      toast.success('Image uploaded!');
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(null);
    }
  };

  const addTeamMember = () => {
    setSections(prev => ({
      ...prev,
      team: {
        ...prev.team,
        members: [...prev.team.members, { name: '', role: '', bio: '', image: '' }]
      }
    }));
  };

  const removeTeamMember = (index: number) => {
    setSections(prev => ({
      ...prev,
      team: {
        ...prev.team,
        members: prev.team.members.filter((_, i) => i !== index)
      }
    }));
  };

  const addCoreValue = () => {
    setSections(prev => ({
      ...prev,
      values: {
        ...prev.values,
        items: [...prev.values.items, { icon: 'Heart', title: '', description: '' }]
      }
    }));
  };

  const removeCoreValue = (index: number) => {
    setSections(prev => ({
      ...prev,
      values: {
        ...prev.values,
        items: prev.values.items.filter((_, i) => i !== index)
      }
    }));
  };

  // ── Save All ───────────────────────────────────────────────────────
  const saveAll = async () => {
    setSaving('all');
    try {
      const upserts = Object.keys(sections).map(section => ({
        section,
        content: (sections as any)[section]
      }));

      const { error } = await supabase
        .from('about_page')
        .upsert(upserts, { onConflict: 'section' });

      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['about_page'] });
      toast.success('All sections saved successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">About Page Editor</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage all content displayed on the public About page</p>
        </div>
        <button
          onClick={saveAll}
          disabled={saving === 'all'}
          className="btn btn-secondary flex items-center gap-2 shadow-lg shadow-secondary/20"
        >
          {saving === 'all' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save All
        </button>
      </div>

      {/* ── Hero Section ─────────────────────────────────────────── */}
      <SectionCard title="Hero Banner" icon={<Eye className="w-5 h-5" />} defaultOpen>
        <div>
          <label className={labelCls}>Page Title</label>
          <input
            type="text"
            className={inputCls}
            value={sections.hero.title}
            onChange={e => setSections(p => ({ ...p, hero: { ...p.hero, title: e.target.value } }))}
            placeholder="About Faith Amplifiers"
          />
        </div>
        <div>
          <label className={labelCls}>Subtitle / Description</label>
          <textarea
            rows={3}
            className={inputCls}
            value={sections.hero.subtitle}
            onChange={e => setSections(p => ({ ...p, hero: { ...p.hero, subtitle: e.target.value } }))}
            placeholder="A short description shown in the hero banner..."
          />
        </div>
        <SaveBtn section="hero" saving={saving} onSave={() => saveSection('hero')} />
      </SectionCard>

      {/* ── Mission ──────────────────────────────────────────────── */}
      <SectionCard title="Our Mission" icon={<Target className="w-5 h-5" />}>
        <div>
          <label className={labelCls}>Section Title</label>
          <input
            type="text"
            className={inputCls}
            value={sections.mission.title}
            onChange={e => setSections(p => ({ ...p, mission: { ...p.mission, title: e.target.value } }))}
          />
        </div>
        <div>
          <label className={labelCls}>Mission Text</label>
          <textarea
            rows={5}
            className={inputCls}
            value={sections.mission.text}
            onChange={e => setSections(p => ({ ...p, mission: { ...p.mission, text: e.target.value } }))}
          />
        </div>
        <SaveBtn section="mission" saving={saving} onSave={() => saveSection('mission')} />
      </SectionCard>

      {/* ── Vision ───────────────────────────────────────────────── */}
      <SectionCard title="Our Vision" icon={<Eye className="w-5 h-5" />}>
        <div>
          <label className={labelCls}>Section Title</label>
          <input
            type="text"
            className={inputCls}
            value={sections.vision.title}
            onChange={e => setSections(p => ({ ...p, vision: { ...p.vision, title: e.target.value } }))}
          />
        </div>
        <div>
          <label className={labelCls}>Vision Text</label>
          <textarea
            rows={5}
            className={inputCls}
            value={sections.vision.text}
            onChange={e => setSections(p => ({ ...p, vision: { ...p.vision, text: e.target.value } }))}
          />
        </div>
        <SaveBtn section="vision" saving={saving} onSave={() => saveSection('vision')} />
      </SectionCard>

      {/* ── Core Values ──────────────────────────────────────────── */}
      <SectionCard title="Core Values" icon={<Heart className="w-5 h-5" />}>
        <div>
          <label className={labelCls}>Section Title</label>
          <input
            type="text"
            className={inputCls}
            value={sections.values.title}
            onChange={e => setSections(p => ({ ...p, values: { ...p.values, title: e.target.value } }))}
          />
        </div>

        <div className="space-y-4 mt-2">
          {sections.values.items.map((val, i) => (
            <div key={i} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600 relative">
              <button
                onClick={() => removeCoreValue(i)}
                className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <div>
                  <label className={labelCls}>Icon</label>
                  <select
                    className={inputCls}
                    value={val.icon}
                    onChange={e => {
                      const items = [...sections.values.items];
                      items[i] = { ...items[i], icon: e.target.value };
                      setSections(p => ({ ...p, values: { ...p.values, items } }));
                    }}
                  >
                    {ICON_OPTIONS.map(ic => (
                      <option key={ic} value={ic}>{ic}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Title</label>
                  <input
                    type="text"
                    className={inputCls}
                    value={val.title}
                    placeholder="e.g. Faith-Centered"
                    onChange={e => {
                      const items = [...sections.values.items];
                      items[i] = { ...items[i], title: e.target.value };
                      setSections(p => ({ ...p, values: { ...p.values, items } }));
                    }}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>Description</label>
                <textarea
                  rows={2}
                  className={inputCls}
                  value={val.description}
                  placeholder="Short description..."
                  onChange={e => {
                    const items = [...sections.values.items];
                    items[i] = { ...items[i], description: e.target.value };
                    setSections(p => ({ ...p, values: { ...p.values, items } }));
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addCoreValue}
          className="flex items-center gap-2 text-sm text-secondary hover:text-secondary/80 font-semibold transition-colors mt-1"
        >
          <Plus className="w-4 h-4" />
          Add Core Value
        </button>

        <SaveBtn section="values" saving={saving} onSave={() => saveSection('values')} />
      </SectionCard>

      {/* ── Team Members ─────────────────────────────────────────── */}
      <SectionCard title="Meet Our Team" icon={<Users className="w-5 h-5" />}>
        <div>
          <label className={labelCls}>Section Title</label>
          <input
            type="text"
            className={inputCls}
            value={sections.team.title}
            onChange={e => setSections(p => ({ ...p, team: { ...p.team, title: e.target.value } }))}
          />
        </div>

        <div className="space-y-6 mt-2">
          {sections.team.members.map((member, i) => (
            <div key={i} className="p-5 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600 relative">
              <button
                onClick={() => removeTeamMember(i)}
                className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="flex items-start gap-4 mb-4">
                {/* Avatar preview + upload */}
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-600 border-2 border-dashed border-gray-300 dark:border-gray-500 relative group">
                    {member.image ? (
                      <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full">
                        <User className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    {uploading === `member-${i}` && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-white" />
                      </div>
                    )}
                  </div>
                  <label className="mt-2 flex items-center gap-1 cursor-pointer text-xs text-secondary hover:text-secondary/80 font-medium">
                    <Upload className="w-3 h-3" />
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) handleMemberImageUpload(i, file);
                      }}
                    />
                  </label>
                </div>

                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Full Name</label>
                      <input
                        type="text"
                        className={inputCls}
                        value={member.name}
                        placeholder="e.g. John Doe"
                        onChange={e => {
                          const members = [...sections.team.members];
                          members[i] = { ...members[i], name: e.target.value };
                          setSections(p => ({ ...p, team: { ...p.team, members } }));
                        }}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Role / Position</label>
                      <input
                        type="text"
                        className={inputCls}
                        value={member.role}
                        placeholder="e.g. Head of Media"
                        onChange={e => {
                          const members = [...sections.team.members];
                          members[i] = { ...members[i], role: e.target.value };
                          setSections(p => ({ ...p, team: { ...p.team, members } }));
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Image URL (or upload above)</label>
                    <input
                      type="url"
                      className={inputCls}
                      value={member.image}
                      placeholder="https://..."
                      onChange={e => {
                        const members = [...sections.team.members];
                        members[i] = { ...members[i], image: e.target.value };
                        setSections(p => ({ ...p, team: { ...p.team, members } }));
                      }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className={labelCls}>Biography / Short Description</label>
                <textarea
                  rows={3}
                  className={inputCls}
                  value={member.bio}
                  placeholder="A brief description of this team member..."
                  onChange={e => {
                    const members = [...sections.team.members];
                    members[i] = { ...members[i], bio: e.target.value };
                    setSections(p => ({ ...p, team: { ...p.team, members } }));
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addTeamMember}
          className="flex items-center gap-2 text-sm text-secondary hover:text-secondary/80 font-semibold transition-colors mt-1"
        >
          <Plus className="w-4 h-4" />
          Add Team Member
        </button>

        <SaveBtn section="team" saving={saving} onSave={() => saveSection('team')} />
      </SectionCard>

      {/* ── Join Our Mission ─────────────────────────────────────── */}
      <SectionCard title="Join Our Mission (CTA)" icon={<Handshake className="w-5 h-5" />}>
        <div>
          <label className={labelCls}>Headline</label>
          <input
            type="text"
            className={inputCls}
            value={sections.join_mission.title}
            onChange={e => setSections(p => ({ ...p, join_mission: { ...p.join_mission, title: e.target.value } }))}
          />
        </div>
        <div>
          <label className={labelCls}>Body Text</label>
          <textarea
            rows={4}
            className={inputCls}
            value={sections.join_mission.text}
            onChange={e => setSections(p => ({ ...p, join_mission: { ...p.join_mission, text: e.target.value } }))}
          />
        </div>
        <SaveBtn section="join_mission" saving={saving} onSave={() => saveSection('join_mission')} />
      </SectionCard>

      {/* Bottom Save All */}
      <div className="flex justify-end pb-6">
        <button
          onClick={saveAll}
          disabled={saving === 'all'}
          className="btn btn-primary flex items-center gap-2 shadow-xl shadow-primary/30 px-8 py-3 text-base"
        >
          {saving === 'all' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Save All Changes
        </button>
      </div>
    </div>
  );
};

// ─── Save Button Helper ────────────────────────────────────────────
const SaveBtn: React.FC<{ section: string; saving: string | null; onSave: () => void }> = ({ section, saving, onSave }) => (
  <div className="flex justify-end pt-2">
    <button
      onClick={onSave}
      disabled={!!saving}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/10 text-secondary hover:bg-secondary hover:text-white font-semibold text-sm transition-all"
    >
      {saving === section ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
      Save Section
    </button>
  </div>
);

export default AboutPageEditor;
