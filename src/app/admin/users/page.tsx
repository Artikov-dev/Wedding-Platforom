'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminService, bookingsService } from '@/services/api.service';
import { useToast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/utils';
import { 
  PeopleOutlined, 
  SearchOutlined, 
  BlockOutlined, 
  CheckCircleOutlined,
  CalendarMonthOutlined,
  CloseOutlined
} from '@mui/icons-material';

export default function AdminUsersPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal State
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userBookings, setUserBookings] = useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsers({ search: search || undefined, role: roleFilter || undefined, page, limit: 20 });
      if (res.data?.success) {
        setUsers(res.data.data.users || []);
        if (res.data.data.pagination) setTotalPages(res.data.data.pagination.pages);
      }
    } catch {
      showToast('Foydalanuvchilarni yuklashda xatolik', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, page, showToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleBlock = async (user: any) => {
    const newStatus = user.status === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED';
    if (!window.confirm(`Siz rostan ham ushbu foydalanuvchini ${newStatus === 'BLOCKED' ? 'bloklamoqchimisiz' : 'faollashtirmoqchimisiz'}?`)) return;

    try {
      const res = await adminService.updateUser(user.id, { status: newStatus });
      if (res.data?.success) {
        showToast(`Foydalanuvchi holati o'zgartirildi`, 'success');
        fetchUsers();
      }
    } catch {
      showToast('Xatolik yuz berdi', 'error');
    }
  };

  const openUserBookings = async (user: any) => {
    setSelectedUser(user);
    setBookingsLoading(true);
    try {
      const res = await bookingsService.list({ userId: user.id, limit: 50 });
      if (res.data?.success) {
        setUserBookings(res.data.data.bookings || []);
      }
    } catch {
      showToast('Bronlarni yuklashda xatolik', 'error');
    } finally {
      setBookingsLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <div className="flex-between" style={{ marginBottom: 'var(--s-6)' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 'var(--s-1)' }}>Mijozlar boshqaruvi</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Barcha ro&apos;yxatdan o&apos;tgan foydalanuvchilar</p>
        </div>
      </div>

      <div className="filters-bar">
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <SearchOutlined sx={{ fontSize: 16 }} />
            Qidiruv
          </label>
          <input 
            type="text" 
            className="form-input" 
            placeholder="Ism, familiya yoki email..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="form-group" style={{ width: 200 }}>
          <label className="form-label">Rol</label>
          <select className="form-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">Barchasi</option>
            <option value="CUSTOMER">Mijoz (Customer)</option>
            <option value="HALL_OWNER">To&apos;yxona Egasi</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-page"><div className="spinner" /></div>
      ) : users.length > 0 ? (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Foydalanuvchi</th>
                <th>Rol / Holat</th>
                <th>Ro&apos;yxatdan o&apos;tgan</th>
                <th>Bronlari</th>
                <th>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{user.firstName} {user.lastName}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{user.email}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{user.phone}</div>
                  </td>
                  <td>
                    <span className={`badge ${user.role === 'ADMIN' ? 'badge-primary' : user.role === 'HALL_OWNER' ? 'badge-secondary' : 'badge-light'}`} style={{ marginBottom: 4 }}>
                      {user.role}
                    </span>
                    <br/>
                    <span className={`badge ${user.status === 'BLOCKED' ? 'badge-danger' : 'badge-success'}`}>
                      {user.status || 'ACTIVE'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>
                    {formatDate(user.createdAt)}
                  </td>
                  <td>
                    <button 
                      className="btn btn-ghost btn-sm" 
                      onClick={() => openUserBookings(user)}
                      style={{ color: 'var(--primary)', fontWeight: 600 }}
                    >
                      {user._count?.bookings || 0} ta bron
                    </button>
                  </td>
                  <td>
                    {user.role !== 'ADMIN' && (
                      <button 
                        className={`btn btn-sm ${user.status === 'BLOCKED' ? 'btn-outline' : 'btn-danger'}`} 
                        onClick={() => handleToggleBlock(user)}
                        title={user.status === 'BLOCKED' ? "Faollashtirish" : "Bloklash"}
                        style={{ padding: '6px' }}
                      >
                        {user.status === 'BLOCKED' ? <CheckCircleOutlined sx={{ fontSize: 18 }} /> : <BlockOutlined sx={{ fontSize: 18 }} />}
                      </button>
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
            <PeopleOutlined sx={{ fontSize: 64 }} />
          </div>
          <h3>Foydalanuvchilar topilmadi</h3>
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--s-2)', marginTop: 'var(--s-6)' }}>
          <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Oldingi</button>
          <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.9rem' }}>Sahifa {page} / {totalPages}</span>
          <button className="btn btn-ghost btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Keyingi</button>
        </div>
      )}

      {/* Bookings Modal */}
      {selectedUser && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '100%', maxWidth: 700, maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex-between" style={{ marginBottom: 'var(--s-4)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--burgundy)' }}>
                {selectedUser.firstName} {selectedUser.lastName} ning bronlari
              </h3>
              <button className="btn btn-ghost" onClick={() => setSelectedUser(null)} style={{ padding: 4 }}>
                <CloseOutlined />
              </button>
            </div>

            {bookingsLoading ? (
              <div style={{ textAlign: 'center', padding: 'var(--s-6)' }}>Yuklanmoqda...</div>
            ) : userBookings.length > 0 ? (
              <div className="table-wrapper" style={{ boxShadow: 'none', border: '1px solid var(--border-light)' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>To&apos;yxona</th>
                      <th>Sana</th>
                      <th>Status</th>
                      <th>To&apos;lov</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userBookings.map(b => (
                      <tr key={b.id}>
                        <td style={{ fontWeight: 600 }}>{b.hall?.name || 'O\'chirilgan to\'yxona'}</td>
                        <td>{formatDate(b.eventDate)}</td>
                        <td>
                           <span className={`badge ${b.status === 'CONFIRMED' ? 'badge-success' : b.status === 'PENDING' ? 'badge-warning' : 'badge-danger'}`}>
                            {b.status}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{b.totalAmount} so&apos;m</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 'var(--s-6)', color: 'var(--text-muted)' }}>
                <CalendarMonthOutlined sx={{ fontSize: 48, opacity: 0.2, marginBottom: 'var(--s-2)' }} /><br/>
                Ushbu mijozda bronlar mavjud emas
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
