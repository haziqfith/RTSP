'use client';

import React, { useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  Layers,
  Menu,
  Plus,
  RotateCcw,
  Search,
  Building2,
  X,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import {
  BookingRecord,
  BookingStatus,
  formatMalayDate,
  RESOURCE_CATEGORIES,
  ResourceCategory,
} from '@/lib/bookings-types';
import NewBookingModal from './NewBookingModal';
import BookingDetailDrawer from './BookingDetailDrawer';
import ResourceCatalogView from './ResourceCatalogView';

interface BookingWorkspaceProps {
  initialBookings: BookingRecord[];
  todayISO: string;
}

type WorkspaceView = 'all' | 'pending' | 'today' | 'catalog';

interface ToastState {
  id: string;
  message: string;
  previousStatus?: BookingStatus;
  bookingId?: string;
}

export default function BookingWorkspace({
  initialBookings,
  todayISO,
}: BookingWorkspaceProps) {
  const [bookings, setBookings] = useState<BookingRecord[]>(initialBookings);
  const [activeView, setActiveView] = useState<WorkspaceView>('all');
  const [categoryFilter, setCategoryFilter] = useState<'Semua' | ResourceCategory>(
    'Semua'
  );
  const [statusFilter, setStatusFilter] = useState<'Semua' | BookingStatus>('Semua');
  const [onlyToday, setOnlyToday] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [modalDefaultCategory, setModalDefaultCategory] = useState<
    ResourceCategory | undefined
  >(undefined);
  const [modalDefaultItem, setModalDefaultItem] = useState<string | undefined>(
    undefined
  );

  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [updatingIds, setUpdatingIds] = useState<Record<string, boolean>>({});
  const [isResetting, setIsResetting] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastSeqRef = useRef(0);

  const nextToastId = (prefix: string) => {
    toastSeqRef.current += 1;
    return `${prefix}-${toastSeqRef.current}`;
  };

  const selectedBooking = useMemo(
    () => bookings.find((b) => b.id === selectedBookingId) ?? null,
    [bookings, selectedBookingId]
  );

  // Summary metrics
  const summary = useMemo(() => {
    const todayBookings = bookings.filter((b) => b.tarikh === todayISO);
    const todayRooms = todayBookings.filter(
      (b) => b.jenis === 'Bilik Perbincangan' || b.jenis === 'Makmal Komputer'
    ).length;
    const todayEquipment = todayBookings.length - todayRooms;

    const pendingCount = bookings.filter((b) => b.status === 'Menunggu').length;
    const approvedCount = bookings.filter((b) => b.status === 'Diluluskan').length;
    const rejectedCount = bookings.filter((b) => b.status === 'Ditolak').length;

    return {
      todayCount: todayBookings.length,
      todayRooms,
      todayEquipment,
      pendingCount,
      approvedCount,
      rejectedCount,
    };
  }, [bookings, todayISO]);

  // Category counts (reflecting active view/date/status except category itself)
  const categoryCounts = useMemo(() => {
    const base = bookings.filter((b) => {
      if (onlyToday && b.tarikh !== todayISO) return false;
      if (statusFilter !== 'Semua' && b.status !== statusFilter) return false;
      return true;
    });

    const counts: Record<'Semua' | ResourceCategory, number> = {
      Semua: base.length,
      'Bilik Perbincangan': 0,
      'Makmal Komputer': 0,
      'Peralatan Studio': 0,
      'Peralatan Sukan': 0,
    };

    for (const item of base) {
      counts[item.jenis] += 1;
    }
    return counts;
  }, [bookings, onlyToday, statusFilter, todayISO]);

  // Filtered table rows
  const filteredBookings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return bookings.filter((b) => {
      if (categoryFilter !== 'Semua' && b.jenis !== categoryFilter) return false;
      if (statusFilter !== 'Semua' && b.status !== statusFilter) return false;
      if (onlyToday && b.tarikh !== todayISO) return false;
      if (q) {
        const hit =
          b.id.toLowerCase().includes(q) ||
          b.nama_pemohon.toLowerCase().includes(q) ||
          b.item_tempahan.toLowerCase().includes(q) ||
          (b.no_pengenalan?.toLowerCase().includes(q) ?? false);
        if (!hit) return false;
      }
      return true;
    });
  }, [bookings, categoryFilter, statusFilter, onlyToday, todayISO, searchQuery]);

  const hasActiveFilters =
    categoryFilter !== 'Semua' ||
    statusFilter !== 'Semua' ||
    onlyToday ||
    searchQuery.trim().length > 0;

  const showToast = (nextToast: ToastState) => {
    setToast(nextToast);
  };

  const handleSelectView = (view: WorkspaceView) => {
    setActiveView(view);
    setMobileNavOpen(false);
    if (view === 'all') {
      setStatusFilter('Semua');
      setOnlyToday(false);
    } else if (view === 'pending') {
      setStatusFilter('Menunggu');
      setOnlyToday(false);
    } else if (view === 'today') {
      setStatusFilter('Semua');
      setOnlyToday(true);
    }
  };

  const handleResetFilters = () => {
    setCategoryFilter('Semua');
    setStatusFilter('Semua');
    setOnlyToday(false);
    setSearchQuery('');
    setActiveView('all');
  };

  const handleUpdateStatus = async (
    id: string,
    nextStatus: BookingStatus,
    skipToast?: boolean
  ) => {
    const existing = bookings.find((b) => b.id === id);
    if (!existing || existing.status === nextStatus) return;

    const previousStatus = existing.status;
    setErrorBanner(null);
    setUpdatingIds((prev) => ({ ...prev, [id]: true }));

    // Optimistic update
    setBookings((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: nextStatus } : item))
    );

    try {
      const res = await fetch(`/api/bookings/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Gagal mengemas kini status.');
      }

      if (!skipToast) {
        showToast({
          id: nextToastId(id),
          message: `Tempahan ${id} dikemas kini kepada ${nextStatus}.`,
          previousStatus,
          bookingId: id,
        });
      }
    } catch (err) {
      // Revert optimistic update
      setBookings((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: previousStatus } : item
        )
      );
      setErrorBanner(
        err instanceof Error ? err.message : 'Gagal mengemas kini status tempahan.'
      );
    } finally {
      setUpdatingIds((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }
  };

  const handleDeleteBooking = async (id: string) => {
    setErrorBanner(null);
    setUpdatingIds((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`/api/bookings/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Gagal memadam rekod tempahan.');
      }
      setBookings((prev) => prev.filter((item) => item.id !== id));
      setSelectedBookingId(null);
      showToast({
        id: nextToastId(`del-${id}`),
        message: `Rekod tempahan ${id} telah dipadam.`,
      });
    } catch (err) {
      setErrorBanner(
        err instanceof Error ? err.message : 'Gagal memadam rekod tempahan.'
      );
    } finally {
      setUpdatingIds((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }
  };

  const handleResetDemoData = async () => {
    setIsResetting(true);
    setErrorBanner(null);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_demo' }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Gagal memulihkan data contoh.');
      }
      setBookings(data.bookings as BookingRecord[]);
      handleResetFilters();
      showToast({
        id: nextToastId('reset'),
        message: 'Senarai tempahan contoh telah dipulihkan.',
      });
    } catch (err) {
      setErrorBanner(
        err instanceof Error ? err.message : 'Gagal memulihkan data contoh.'
      );
    } finally {
      setIsResetting(false);
    }
  };

  const openNewBooking = (category?: ResourceCategory, itemName?: string) => {
    setModalDefaultCategory(category);
    setModalDefaultItem(itemName);
    setIsNewModalOpen(true);
  };

  const viewBreadcrumbLabel =
    activeView === 'pending'
      ? 'Menunggu Kelulusan'
      : activeView === 'today'
      ? 'Jadual Hari Ini'
      : activeView === 'catalog'
      ? 'Katalog Ruang & Peralatan'
      : 'Semua Tempahan';

  const renderStatusCell = (status: BookingStatus) => {
    if (status === 'Diluluskan') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 whitespace-nowrap">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          Diluluskan
        </span>
      );
    }
    if (status === 'Ditolak') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 whitespace-nowrap">
          <XCircle className="w-3.5 h-3.5 shrink-0" />
          Ditolak
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 whitespace-nowrap">
        <Clock className="w-3.5 h-3.5 shrink-0" />
        Menunggu
      </span>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      <div className="h-16 px-6 flex items-center border-b border-slate-200">
        <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
          RuangKampus
        </span>
      </div>

      <nav className="flex-1 p-4 space-y-1" aria-label="Navigasi Utama">
        <button
          type="button"
          onClick={() => handleSelectView('all')}
          className={`w-full flex items-center justify-between gap-3 h-10 px-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            activeView === 'all'
              ? 'bg-blue-50 text-blue-800'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <span className="inline-flex items-center gap-2.5 truncate">
            <Layers className="w-4 h-4 shrink-0" />
            <span>Semua Tempahan</span>
          </span>
          <span className="text-xs font-mono tabular-nums text-slate-500">
            {bookings.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectView('pending')}
          className={`w-full flex items-center justify-between gap-3 h-10 px-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            activeView === 'pending'
              ? 'bg-blue-50 text-blue-800'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <span className="inline-flex items-center gap-2.5 truncate">
            <Clock className="w-4 h-4 shrink-0" />
            <span>Menunggu Kelulusan</span>
          </span>
          <span
            className={`text-xs font-mono tabular-nums ${
              summary.pendingCount > 0 ? 'font-semibold text-amber-700' : 'text-slate-500'
            }`}
          >
            {summary.pendingCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectView('today')}
          className={`w-full flex items-center justify-between gap-3 h-10 px-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            activeView === 'today'
              ? 'bg-blue-50 text-blue-800'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <span className="inline-flex items-center gap-2.5 truncate">
            <Calendar className="w-4 h-4 shrink-0" />
            <span>Tempahan Hari Ini</span>
          </span>
          <span className="text-xs font-mono tabular-nums text-slate-500">
            {summary.todayCount}
          </span>
        </button>

        <div className="pt-3 mt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => handleSelectView('catalog')}
            className={`w-full flex items-center justify-between gap-3 h-10 px-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeView === 'catalog'
                ? 'bg-blue-50 text-blue-800'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <span className="inline-flex items-center gap-2.5 truncate">
              <Building2 className="w-4 h-4 shrink-0" />
              <span>Katalog Fasiliti</span>
            </span>
          </button>
        </div>
      </nav>

      <div className="p-4 border-t border-slate-200 space-y-3">
        <div>
          <p className="text-xs font-semibold text-slate-900">Pentadbir Fasiliti</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Unit Pengurusan Ruang Kampus
          </p>
        </div>
        <button
          type="button"
          disabled={isResetting}
          onClick={handleResetDemoData}
          className="w-full inline-flex items-center justify-center gap-1.5 h-9 px-3 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 transition-colors whitespace-nowrap"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{isResetting ? 'Memulihkan...' : 'Pulihkan Data Contoh'}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setMobileNavOpen(false)}
              className="fixed inset-0 bg-slate-900/40"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 w-64 h-full"
            >
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Bar Contract: Breadcrumb on left, 1 primary action on right */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Buka menu navigasi"
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm min-w-0">
              <span className="text-slate-500 hidden sm:inline whitespace-nowrap">
                Kampus Utama
              </span>
              <span className="text-slate-300 hidden sm:inline" aria-hidden="true">
                /
              </span>
              <span className="font-semibold text-slate-900 truncate">
                {viewBreadcrumbLabel}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => openNewBooking()}
            className="inline-flex items-center gap-2 h-10 px-4 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tempahan Baharu</span>
          </button>
        </header>

        <main className="flex-1 w-full max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Page Intro */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 text-balance">
                Sistem Tempahan Ruang & Peralatan
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Urus permohonan bilik perbincangan, makmal komputer, peralatan studio dan sukan kampus.
              </p>
            </div>
            <p className="text-xs font-mono tabular-nums text-slate-500 whitespace-nowrap">
              Tarikh hari ini: {formatMalayDate(todayISO)}
            </p>
          </div>

          {/* Error Banner if API call fails */}
          {errorBanner && (
            <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorBanner}</span>
              </div>
              <button
                type="button"
                onClick={() => setErrorBanner(null)}
                className="text-xs font-semibold text-red-700 hover:underline whitespace-nowrap"
              >
                Tutup
              </button>
            </div>
          )}

          {/* Summary Cards Strip */}
          <section
            aria-label="Ringkasan Tempahan"
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
          >
            <button
              type="button"
              onClick={() => {
                setActiveView('today');
                setOnlyToday(true);
                setStatusFilter('Semua');
              }}
              className={`text-left bg-white border rounded-xl p-5 transition-colors hover:border-slate-300 ${
                onlyToday && statusFilter === 'Semua' && activeView !== 'catalog'
                  ? 'border-blue-600 ring-1 ring-blue-600/20'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-slate-500">
                  Jumlah Tempahan Hari Ini
                </span>
                <Calendar className="w-4 h-4 text-blue-700 shrink-0" />
              </div>
              <p className="text-3xl font-bold font-mono tabular-nums text-slate-900 mt-2">
                {summary.todayCount}
              </p>
              <p className="text-xs text-slate-500 mt-2 font-mono tabular-nums">
                {summary.todayRooms} ruang · {summary.todayEquipment} peralatan
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveView('pending');
                setStatusFilter('Menunggu');
                setOnlyToday(false);
              }}
              className={`text-left bg-white border rounded-xl p-5 transition-colors hover:border-slate-300 ${
                statusFilter === 'Menunggu' && !onlyToday && activeView !== 'catalog'
                  ? 'border-amber-600 ring-1 ring-amber-600/20'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-slate-500">
                  Belum Diluluskan
                </span>
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              </div>
              <p className="text-3xl font-bold font-mono tabular-nums text-amber-700 mt-2">
                {summary.pendingCount}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Menunggu semakan pentadbir
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveView('all');
                setStatusFilter('Diluluskan');
                setOnlyToday(false);
              }}
              className={`text-left bg-white border rounded-xl p-5 transition-colors hover:border-slate-300 ${
                statusFilter === 'Diluluskan' && !onlyToday && activeView !== 'catalog'
                  ? 'border-emerald-600 ring-1 ring-emerald-600/20'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-slate-500">
                  Permohonan Diluluskan
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              </div>
              <p className="text-3xl font-bold font-mono tabular-nums text-slate-900 mt-2">
                {summary.approvedCount}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Disahkan untuk kegunaan
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveView('all');
                setStatusFilter('Ditolak');
                setOnlyToday(false);
              }}
              className={`text-left bg-white border rounded-xl p-5 transition-colors hover:border-slate-300 ${
                statusFilter === 'Ditolak' && !onlyToday && activeView !== 'catalog'
                  ? 'border-red-600 ring-1 ring-red-600/20'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-slate-500">
                  Permohonan Ditolak
                </span>
                <XCircle className="w-4 h-4 text-red-600 shrink-0" />
              </div>
              <p className="text-3xl font-bold font-mono tabular-nums text-slate-900 mt-2">
                {summary.rejectedCount}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Tidak memenuhi syarat tempahan
              </p>
            </button>
          </section>

          {activeView === 'catalog' ? (
            <ResourceCatalogView
              bookings={bookings}
              todayISO={todayISO}
              onQuickBook={(cat, item) => openNewBooking(cat, item)}
            />
          ) : (
            <section
              aria-label="Senarai Jadual Tempahan"
              className="bg-white border border-slate-200 rounded-xl overflow-hidden"
            >
              {/* Filter Toolbar */}
              <div className="p-4 sm:p-5 border-b border-slate-200 space-y-4">
                {/* Penapis mengikut jenis ruang/peralatan */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div
                    className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200"
                    role="tablist"
                    aria-label="Penapis jenis ruang dan peralatan"
                  >
                    <button
                      type="button"
                      role="tab"
                      aria-selected={categoryFilter === 'Semua'}
                      onClick={() => setCategoryFilter('Semua')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                        categoryFilter === 'Semua'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Semua Jenis ({categoryCounts['Semua']})
                    </button>
                    {RESOURCE_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        role="tab"
                        aria-selected={categoryFilter === cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                          categoryFilter === cat
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {cat} ({categoryCounts[cat]})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search + Status + Date Filter Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari ID, nama pemohon, atau item tempahan..."
                      aria-label="Cari tempahan"
                      className="w-full h-10 pl-9 pr-3 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <label className="sr-only" htmlFor="status-filter">
                      Tapis Status
                    </label>
                    <select
                      id="status-filter"
                      value={statusFilter}
                      onChange={(e) => {
                        const val = e.target.value as 'Semua' | BookingStatus;
                        setStatusFilter(val);
                        if (val === 'Menunggu' && !onlyToday) {
                          setActiveView('pending');
                        } else if (activeView === 'pending' && val !== 'Menunggu') {
                          setActiveView('all');
                        }
                      }}
                      className="h-10 px-3 text-xs font-medium bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                    >
                      <option value="Semua">Semua Status</option>
                      <option value="Menunggu">Menunggu Sahaja</option>
                      <option value="Diluluskan">Diluluskan</option>
                      <option value="Ditolak">Ditolak</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => {
                        const next = !onlyToday;
                        setOnlyToday(next);
                        if (next && statusFilter === 'Semua') {
                          setActiveView('today');
                        } else if (!next && activeView === 'today') {
                          setActiveView('all');
                        }
                      }}
                      className={`inline-flex items-center gap-1.5 h-10 px-3 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
                        onlyToday
                          ? 'bg-blue-50 border-blue-600 text-blue-800'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Hari Ini Sahaja</span>
                    </button>

                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="inline-flex items-center gap-1.5 h-10 px-3 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap shrink-0"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Set Semula</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Data Table */}
              {filteredBookings.length === 0 ? (
                <div className="px-6 py-16 text-center max-w-md mx-auto">
                  <p className="text-base font-semibold text-slate-900">
                    Tiada rekod tempahan ditemui
                  </p>
                  <p className="text-sm text-slate-500 mt-1.5">
                    Tiada permohonan yang sepadan dengan penapis jenis ruang, status, atau carian semasa.
                  </p>
                  <div className="mt-5 flex items-center justify-center gap-3">
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="h-10 px-4 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
                      >
                        Set Semula Penapis
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => openNewBooking()}
                      className="inline-flex items-center gap-1.5 h-10 px-4 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors whitespace-nowrap"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Tempahan Baharu</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-600">
                        <th className="py-3 pl-5 pr-3 whitespace-nowrap">ID</th>
                        <th className="py-3 px-3 whitespace-nowrap">Nama Pemohon</th>
                        <th className="py-3 px-3 whitespace-nowrap">Item Tempahan</th>
                        <th className="py-3 px-3 whitespace-nowrap">Tarikh</th>
                        <th className="py-3 px-3 whitespace-nowrap">Slot Masa</th>
                        <th className="py-3 px-3 whitespace-nowrap">Status</th>
                        <th className="py-3 pl-3 pr-5 text-right whitespace-nowrap">
                          Tindakan Pantas
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {filteredBookings.map((booking) => {
                        const isBusy = Boolean(updatingIds[booking.id]);
                        const isToday = booking.tarikh === todayISO;

                        return (
                          <tr
                            key={booking.id}
                            className="hover:bg-slate-50/80 transition-colors group"
                          >
                            <td className="py-3.5 pl-5 pr-3 align-middle whitespace-nowrap">
                              <span className="font-mono tabular-nums text-xs font-medium text-slate-600">
                                {booking.id}
                              </span>
                            </td>

                            <td className="py-3.5 px-3 align-middle min-w-[180px]">
                              <div className="font-medium text-slate-900 leading-snug">
                                {booking.nama_pemohon}
                              </div>
                              {booking.no_pengenalan && (
                                <div className="text-xs font-mono text-slate-500 mt-0.5">
                                  {booking.no_pengenalan}
                                </div>
                              )}
                            </td>

                            <td className="py-3.5 px-3 align-middle min-w-[230px]">
                              <div className="font-medium text-slate-900 leading-snug">
                                {booking.item_tempahan}
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5">
                                {booking.jenis}
                              </div>
                            </td>

                            <td className="py-3.5 px-3 align-middle whitespace-nowrap">
                              <div className="font-mono tabular-nums text-xs text-slate-800">
                                {formatMalayDate(booking.tarikh)}
                              </div>
                              {isToday && (
                                <div className="text-xs font-medium text-blue-700 mt-0.5">
                                  Hari Ini
                                </div>
                              )}
                            </td>

                            <td className="py-3.5 px-3 align-middle whitespace-nowrap">
                              <span className="font-mono tabular-nums text-xs text-slate-700">
                                {booking.slot_masa}
                              </span>
                            </td>

                            <td className="py-3.5 px-3 align-middle whitespace-nowrap">
                              {renderStatusCell(booking.status)}
                            </td>

                            <td className="py-3.5 pl-3 pr-5 align-middle text-right whitespace-nowrap">
                              <div className="inline-flex items-center justify-end gap-1.5">
                                {booking.status !== 'Diluluskan' && (
                                  <button
                                    type="button"
                                    disabled={isBusy}
                                    onClick={() =>
                                      handleUpdateStatus(booking.id, 'Diluluskan')
                                    }
                                    title="Luluskan permohonan"
                                    className="inline-flex items-center gap-1 h-9 px-2.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Diluluskan</span>
                                  </button>
                                )}

                                {booking.status !== 'Ditolak' && (
                                  <button
                                    type="button"
                                    disabled={isBusy}
                                    onClick={() =>
                                      handleUpdateStatus(booking.id, 'Ditolak')
                                    }
                                    title="Tolak permohonan"
                                    className="inline-flex items-center gap-1 h-9 px-2.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                    <span>Ditolak</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => setSelectedBookingId(booking.id)}
                                  aria-label={`Lihat butiran ${booking.id}`}
                                  title="Lihat butiran penuh"
                                  className="inline-flex items-center justify-center w-9 h-9 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Table Footer Summary */}
              <div className="px-5 py-3 border-t border-slate-200 bg-slate-50/50 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <span className="font-mono tabular-nums">
                  Menunjukkan {filteredBookings.length} daripada {bookings.length}{' '}
                  rekod tempahan
                </span>
                <span>
                  Klik butang tindakan pantas untuk mengemas kini status serta-merta.
                </span>
              </div>
            </section>
          )}
        </main>
      </div>

      {/* Modals & Drawers */}
      <NewBookingModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        todayISO={todayISO}
        defaultCategory={modalDefaultCategory}
        defaultItem={modalDefaultItem}
        onCreated={(created) => {
          setBookings((prev) => [created, ...prev]);
          showToast({
            id: nextToastId(`create-${created.id}`),
            message: `Tempahan baharu ${created.id} berjaya didaftarkan.`,
          });
        }}
      />

      <BookingDetailDrawer
        booking={selectedBooking}
        todayISO={todayISO}
        isUpdating={
          selectedBooking ? Boolean(updatingIds[selectedBooking.id]) : false
        }
        onClose={() => setSelectedBookingId(null)}
        onUpdateStatus={(id, status) => handleUpdateStatus(id, status)}
        onDelete={handleDeleteBooking}
      />

      {/* Action Feedback Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-5 right-5 z-50 max-w-sm bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 text-xs"
            role="status"
            aria-live="polite"
          >
            <span className="flex-1 leading-snug">{toast.message}</span>
            {toast.bookingId && toast.previousStatus && (
              <button
                type="button"
                onClick={() => {
                  const targetId = toast.bookingId!;
                  const prevStatus = toast.previousStatus!;
                  setToast(null);
                  handleUpdateStatus(targetId, prevStatus, true);
                }}
                className="font-semibold text-blue-300 hover:text-blue-200 whitespace-nowrap shrink-0"
              >
                Buat Asal
              </button>
            )}
            <button
              type="button"
              onClick={() => setToast(null)}
              aria-label="Tutup notifikasi"
              className="text-slate-400 hover:text-white shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
