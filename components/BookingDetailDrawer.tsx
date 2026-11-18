'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Check,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  User,
  Package,
  Trash2,
} from 'lucide-react';
import {
  BookingRecord,
  BookingStatus,
  formatMalayDate,
} from '@/lib/bookings-types';

interface BookingDetailDrawerProps {
  booking: BookingRecord | null;
  todayISO: string;
  isUpdating: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, status: BookingStatus) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function BookingDetailDrawer({
  booking,
  todayISO,
  isUpdating,
  onClose,
  onUpdateStatus,
  onDelete,
}: BookingDetailDrawerProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const renderStatusLabel = (status: BookingStatus) => {
    if (status === 'Diluluskan') {
      return (
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
          <CheckCircle2 className="w-4 h-4" />
          Diluluskan
        </span>
      );
    }
    if (status === 'Ditolak') {
      return (
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-700">
          <XCircle className="w-4 h-4" />
          Ditolak
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-700">
        <Clock className="w-4 h-4" />
        Menunggu
      </span>
    );
  };

  return (
    <AnimatePresence>
      {booking && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-labelledby="drawer-booking-title"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => {
              setConfirmDelete(false);
              onClose();
            }}
            className="fixed inset-0 bg-slate-900/35 backdrop-blur-[1px]"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-md bg-white border-l border-slate-200 h-full flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <p className="text-xs font-mono tabular-nums text-slate-500">
                  {booking.id}
                </p>
                <h2
                  id="drawer-booking-title"
                  className="text-base font-semibold text-slate-900 mt-0.5"
                >
                  Butiran Permohonan Tempahan
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setConfirmDelete(false);
                  onClose();
                }}
                aria-label="Tutup panel butiran"
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <span className="text-xs font-medium text-slate-500">
                  Status Semasa
                </span>
                {renderStatusLabel(booking.status)}
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Nama Pemohon</p>
                    <p className="text-sm font-semibold text-slate-900 mt-0.5">
                      {booking.nama_pemohon}
                    </p>
                    {booking.no_pengenalan && (
                      <p className="text-xs font-mono text-slate-500 mt-0.5">
                        ID: {booking.no_pengenalan}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Package className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Item Tempahan</p>
                    <p className="text-sm font-semibold text-slate-900 mt-0.5">
                      {booking.item_tempahan}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{booking.jenis}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Tarikh & Slot Masa</p>
                    <p className="text-sm font-mono tabular-nums text-slate-900 mt-0.5">
                      {formatMalayDate(booking.tarikh)}
                      {booking.tarikh === todayISO ? ' (Hari Ini)' : ''}
                    </p>
                    <p className="text-xs font-mono tabular-nums text-slate-600 mt-0.5">
                      {booking.slot_masa}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs font-medium text-slate-500 mb-1.5">
                  Catatan / Tujuan Penggunaan
                </p>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {booking.tujuan || 'Tiada catatan tambahan disertakan oleh pemohon.'}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3">
                <p className="text-xs font-medium text-slate-500">
                  Tindakan Pentadbir
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    disabled={isUpdating || booking.status === 'Diluluskan'}
                    onClick={() => onUpdateStatus(booking.id, 'Diluluskan')}
                    className="inline-flex items-center justify-center gap-1.5 h-10 px-3 text-xs font-semibold rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 disabled:opacity-45 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Diluluskan</span>
                  </button>
                  <button
                    type="button"
                    disabled={isUpdating || booking.status === 'Ditolak'}
                    onClick={() => onUpdateStatus(booking.id, 'Ditolak')}
                    className="inline-flex items-center justify-center gap-1.5 h-10 px-3 text-xs font-semibold rounded-lg border border-red-200 bg-red-50 text-red-800 hover:bg-red-100 disabled:opacity-45 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Ditolak</span>
                  </button>
                </div>

                {booking.status !== 'Menunggu' && (
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => onUpdateStatus(booking.id, 'Menunggu')}
                    className="w-full h-9 px-3 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    Kembalikan kepada Status Menunggu
                  </button>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
              {!confirmDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Padam rekod tempahan ini</span>
                </button>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-700 font-medium">
                    Sahkan padam rekod?
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="h-8 px-3 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-100"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={async () => {
                        await onDelete(booking.id);
                        setConfirmDelete(false);
                      }}
                      className="h-8 px-3 text-xs font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                      Ya, Padam
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
