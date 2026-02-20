'use client';

import React, { useState, useEffect } from 'react';
import { Save, Shield, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    maxProductImages: 6,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (err) {
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleUpdateSetting = async (key: string, value: any) => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });
      if (res.ok) {
        toast.success('Setting updated');
        setSettings(prev => ({ ...prev, [key]: value }));
      } else {
        toast.error('Failed to update');
      }
    } catch (err) {
      toast.error('Update error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="animate-pulse text-slate-500">Loading configurations...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-black text-white">System Settings<span className="text-cyan-400">_</span></h1>
        <p className="text-slate-400 mt-1">Configure global application parameters</p>
      </header>

      <div className="max-w-2xl space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
              <ImageIcon size={20} />
            </div>
            <h2 className="text-xl font-bold text-white">Product Images</h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-white font-bold">Max Images per Product</p>
                <p className="text-sm text-slate-500">Limits how many pictures can be uploaded for a single component.</p>
              </div>
              <div className="flex items-center gap-3">
                <input 
                  type="number"
                  min="1"
                  max="20"
                  className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-center focus:border-cyan-500 outline-none transition-colors"
                  value={settings.maxProductImages}
                  onChange={(e) => setSettings({ ...settings, maxProductImages: Number(e.target.value) })}
                />
                <button 
                  disabled={saving}
                  onClick={() => handleUpdateSetting('maxProductImages', settings.maxProductImages)}
                  className="p-2 bg-cyan-500 hover:bg-cyan-400 text-black rounded-lg transition-all active:scale-95 disabled:opacity-50"
                >
                  <Save size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 opacity-50 cursor-not-allowed">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
              <Shield size={20} />
            </div>
            <h2 className="text-xl font-bold text-white">Security (Coming Soon)</h2>
          </div>
          <div className="space-y-4">
             <div className="h-4 bg-slate-800 rounded w-full"></div>
             <div className="h-4 bg-slate-800 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
