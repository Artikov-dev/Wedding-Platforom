'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/services/api.service';
import { useToast } from '@/components/ui/Toast';
import { SettingsOutlined, SaveOutlined } from '@mui/icons-material';

export default function AdminSettingsPage() {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<Record<string, string>>({
    platformFeePercent: '',
    supportEmail: '',
    supportPhone: '',
    contactAddress: '',
    socialInstagram: '',
    socialTelegram: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await adminService.getSettings();
        if (res.data?.success && res.data.data) {
          setSettings(prev => ({ ...prev, ...res.data.data }));
        }
      } catch {
        showToast('Sozlamalarni yuklashda xatolik', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [showToast]);

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await adminService.updateSettings(settings);
      if (res.data?.success) {
        showToast('Tizim sozlamalari saqlandi', 'success');
      }
    } catch {
      showToast('Saqlashda xatolik yuz berdi', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div className="fade-in" style={{ maxWidth: 800 }}>
      <div className="flex-between" style={{ marginBottom: 'var(--s-6)' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 'var(--s-1)' }}>Tizim Sozlamalari</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Saytning umumiy parametrlari va komissiya foizlari</p>
        </div>
      </div>

      <div className="card" style={{ padding: 'var(--s-6)', marginBottom: 'var(--s-6)' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--s-4)', color: 'var(--burgundy)' }}>
          <SettingsOutlined /> Asosiy Sozlamalar
        </h3>
        
        <div className="form-group" style={{ marginBottom: 'var(--s-4)' }}>
          <label className="form-label">Platforma komissiyasi (%)</label>
          <input 
            type="number" 
            className="form-input" 
            placeholder="Masalan: 5" 
            value={settings.platformFeePercent}
            onChange={(e) => handleChange('platformFeePercent', e.target.value)}
          />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sayt orqali bron qilinganda ushlab qolinadigan foiz</span>
        </div>

        <div className="form-group" style={{ marginBottom: 'var(--s-4)' }}>
          <label className="form-label">Qo&apos;llab-quvvatlash Email manzili</label>
          <input 
            type="email" 
            className="form-input" 
            value={settings.supportEmail}
            onChange={(e) => handleChange('supportEmail', e.target.value)}
          />
        </div>

        <div className="form-group" style={{ marginBottom: 'var(--s-4)' }}>
          <label className="form-label">Qo&apos;llab-quvvatlash Telefon raqami</label>
          <input 
            type="text" 
            className="form-input" 
            value={settings.supportPhone}
            onChange={(e) => handleChange('supportPhone', e.target.value)}
          />
        </div>

        <div className="form-group" style={{ marginBottom: 'var(--s-4)' }}>
          <label className="form-label">Asosiy ofis manzili</label>
          <input 
            type="text" 
            className="form-input" 
            value={settings.contactAddress}
            onChange={(e) => handleChange('contactAddress', e.target.value)}
          />
        </div>

        <div className="form-group" style={{ marginBottom: 'var(--s-4)' }}>
          <label className="form-label">Instagram havolasi</label>
          <input 
            type="text" 
            className="form-input" 
            value={settings.socialInstagram}
            onChange={(e) => handleChange('socialInstagram', e.target.value)}
          />
        </div>

        <div className="form-group" style={{ marginBottom: 'var(--s-6)' }}>
          <label className="form-label">Telegram havolasi</label>
          <input 
            type="text" 
            className="form-input" 
            value={settings.socialTelegram}
            onChange={(e) => handleChange('socialTelegram', e.target.value)}
          />
        </div>

        <button 
          className="btn btn-primary" 
          onClick={handleSave} 
          disabled={saving}
          style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: 8 }}
        >
          {saving ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : <><SaveOutlined /> Saqlash</>}
        </button>
      </div>
    </div>
  );
}
