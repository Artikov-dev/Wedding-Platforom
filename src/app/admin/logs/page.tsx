'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminService } from '@/services/api.service';
import { useToast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/utils';
import { HistoryOutlined, SearchOutlined, ClearOutlined } from '@mui/icons-material';

export default function AdminLogsPage() {
  const { showToast } = useToast();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getLogs({ action: actionFilter || undefined, page, limit: 50 });
      if (res.data?.success) {
        setLogs(res.data.data.logs || []);
        if (res.data.data.pagination) setTotalPages(res.data.data.pagination.totalPages);
      }
    } catch {
      showToast('Loglarni yuklashda xatolik', 'error');
    } finally {
      setLoading(false);
    }
  }, [actionFilter, page, showToast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="fade-in">
      <div className="flex-between" style={{ marginBottom: 'var(--s-6)' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 'var(--s-1)' }}>Activity Log (Audit Trail)</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Tizimdagi muhim o&apos;zgarishlar tarixi</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={fetchLogs} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <HistoryOutlined sx={{ fontSize: 18 }} />
          Yangilash
        </button>
      </div>

      <div className="filters-bar">
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <SearchOutlined sx={{ fontSize: 16 }} />
            Harakat turi bo&apos;yicha
          </label>
          <select className="form-select" value={actionFilter} onChange={e => setActionFilter(e.target.value)}>
            <option value="">Barchasi</option>
            <option value="BOOKING_STATUS_CHANGED">Bron statusi o&apos;zgardi</option>
            <option value="BOOKING_UPDATED">Bron tahrirlandi</option>
            <option value="BOOKING_CANCELLED">Bron bekor qilindi</option>
            <option value="HALL_UPDATED">Zal tahrirlandi</option>
            <option value="HALL_DELETED">Zal o&apos;chirildi</option>
          </select>
        </div>
        {actionFilter && (
          <div className="form-group" style={{ justifyContent: 'flex-end' }}>
            <label className="form-label">&nbsp;</label>
            <button className="btn btn-ghost btn-sm" onClick={() => setActionFilter('')} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <ClearOutlined sx={{ fontSize: 16 }} />
              Tozalash
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="loading-page"><div className="spinner" /></div>
      ) : logs.length > 0 ? (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Sana</th>
                <th>Foydalanuvchi</th>
                <th>Harakat</th>
                <th>Ma&apos;lumot</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                    {formatDate(log.createdAt)}<br/>
                    <span style={{ color: 'var(--text-muted)' }}>
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{log.firstName} {log.lastName}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{log.email}</div>
                  </td>
                  <td>
                    <span className="badge badge-primary">{log.action}</span>
                  </td>
                  <td style={{ fontSize: '0.8rem', maxWidth: 300 }}>
                    <div style={{ color: 'var(--text-muted)' }}>Target ID: {log.targetId?.slice(0, 8)}...</div>
                    {log.oldValue?.status && log.newValue?.status && (
                      <div style={{ marginTop: 4 }}>
                        Status: <span style={{ color: 'var(--danger)', textDecoration: 'line-through' }}>{log.oldValue.status}</span> &rarr; <span style={{ color: 'var(--success)', fontWeight: 600 }}>{log.newValue.status}</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center' }}>
            <HistoryOutlined sx={{ fontSize: 64 }} />
          </div>
          <h3>Loglar topilmadi</h3>
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--s-2)', marginTop: 'var(--s-6)' }}>
          <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Oldingi</button>
          <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.9rem' }}>Sahifa {page} / {totalPages}</span>
          <button className="btn btn-ghost btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Keyingi</button>
        </div>
      )}
    </div>
  );
}
