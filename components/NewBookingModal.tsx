'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Calendar, Clock, AlertCircle } from 'lucide-react';
import {
  BookingRecord,
  RESOURCE_CATALOG,
  RESOURCE_CATEGORIES,
  ResourceCategory,
  TIME_SLOTS,
} from '@/lib/bookings-types';

interface NewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  todayISO: string;
  defaultCategory?: ResourceCategory;
  defaultItem?: string;
  onCreated: (booking: BookingRecord) => void;
}

interface NewBookingFormProps {
  onClose: () => void;
  todayISO: string;
  defaultCategory?: ResourceCategory;
  defaultItem?: string;
  onCreated: (booking: BookingRecord) => void;
}

function NewBookingForm({
  onClose,
  todayISO,
  defaultCategory,
  defaultItem,
  onCreated,
}: NewBookingFormProps) {
  const initialCategory: ResourceCategory = defaultCategory ?? 'Bilik Perbincangan';
  const matchingItems = RESOURCE_CATALOG.filter((r) => r.jenis === initialCategory);

  const [namaPemohon, setNamaPemohon] = useState('');
  const [noPengenalan, setNoPengenalan] = useState('');
  const [jenis, setJenis] = useState<ResourceCategory>(initialCategory);
  const [itemTempahan, setItemTempahan] = useState(
    defaultItem ?? matchingItems[0]?.nama ?? ''
  );
  const [tarikh, setTarikh] = useState(todayISO);
  const [slotMasa, setSlotMasa] = useState(TIME_SLOTS[1]);
  const [tujuan, setTujuan] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCategoryChange = (nextCategory: ResourceCategory) => {
    setJenis(nextCategory);
    const items = RESOURCE_CATALOG.filter((r) => r.jenis === nextCategory);
    setItemTempahan(items[0]?.nama ?? '');
  };

  const categoryItems = RESOURCE_CATALOG.filter((r) => r.jenis === jenis);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaPemohon.trim() || !itemTempahan.trim() || !tarikh || !slotMasa) {
      setErrorMsg('Sila isi nama pemohon, item tempahan, tarikh, dan slot masa.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama_pemohon: namaPemohon.trim(),
          no_pengenalan: noPengenalan.trim() || undefined,
          item_tempahan: itemTempahan.trim(),
          jenis,
          tarikh,
          slot_masa: slotMasa,
          tujuan: tujuan.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Gagal menghantar permohonan tempahan.');
      }

      onCreated(data.booking as BookingRecord);
      onClose();
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Berlaku ralat semasa menyimpan tempahan.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      {errorMsg && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <label
            htmlFor="nama_pemohon"
            className="block text-xs font-medium text-slate-700 mb-1.5"
          >
            Nama Pemohon <span className="text-red-600">*</span>
          </label>
          <input
            id="nama_pemohon"
            type="text"
            required
            value={namaPemohon}
            onChange={(e) => setNamaPemohon(e.target.value)}
            placeholder="cth. Amirul Hakim bin Zainal"
            className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
          />
        </div>
        <div>
          <label
            htmlFor="no_pengenalan"
            className="block text-xs font-medium text-slate-700 mb-1.5"
          >
            No. Matrik / Staf
          </label>
          <input
            id="no_pengenalan"
            type="text"
            value={noPengenalan}
            onChange={(e) => setNoPengenalan(e.target.value)}
            placeholder="cth. A22EC0112"
            className="w-full h-10 px-3 text-sm font-mono bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1.5">
          Kategori Ruang / Peralatan <span className="text-red-600">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {RESOURCE_CATEGORIES.map((category) => {
            const active = jenis === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => handleCategoryChange(category)}
                className={`h-10 px-3 text-xs font-medium rounded-lg border text-left transition-colors whitespace-nowrap truncate ${
                  active
                    ? 'bg-blue-50 border-blue-600 text-blue-800'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label
          htmlFor="item_tempahan"
          className="block text-xs font-medium text-slate-700 mb-1.5"
        >
          Item Tempahan <span className="text-red-600">*</span>
        </label>
        <select
          id="item_tempahan"
          value={itemTempahan}
          onChange={(e) => setItemTempahan(e.target.value)}
          className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
        >
          {categoryItems.map((item) => (
            <option key={item.id} value={item.nama}>
              {item.nama} — {item.lokasi}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="tarikh_tempahan"
            className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-1.5"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>
              Tarikh <span className="text-red-600">*</span>
            </span>
          </label>
          <input
            id="tarikh_tempahan"
            type="date"
            required
            value={tarikh}
            onChange={(e) => setTarikh(e.target.value)}
            className="w-full h-10 px-3 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
          />
        </div>
        <div>
          <label
            htmlFor="slot_masa"
            className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-1.5"
          >
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>
              Slot Masa <span className="text-red-600">*</span>
            </span>
          </label>
          <select
            id="slot_masa"
            value={slotMasa}
            onChange={(e) => setSlotMasa(e.target.value)}
            className="w-full h-10 px-3 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
          >
            {TIME_SLOTS.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="tujuan"
          className="block text-xs font-medium text-slate-700 mb-1.5"
        >
          Tujuan Penggunaan (Pilihan)
        </label>
        <textarea
          id="tujuan"
          rows={2}
          value={tujuan}
          onChange={(e) => setTujuan(e.target.value)}
          placeholder="cth. Sesi latihan pembentangan projek atau rakaman video tugasan."
          className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 resize-none"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="h-10 px-4 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 h-10 px-4 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{submitting ? 'Menghantar...' : 'Hantar Permohonan'}</span>
        </button>
      </div>
    </form>
  );
}

export default function NewBookingModal({
  isOpen,
  onClose,
  todayISO,
  defaultCategory,
  defaultItem,
  onCreated,
}: NewBookingModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-tempahan-title"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px]"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-lg bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h2
                  id="modal-tempahan-title"
                  className="text-lg font-semibold text-slate-900"
                >
                  Permohonan Tempahan Baharu
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Rekod akan didaftarkan dengan status Menunggu untuk semakan pentadbir.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup tetingkap"
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <NewBookingForm
              key={`${defaultCategory ?? 'default'}-${defaultItem ?? 'default'}`}
              onClose={onClose}
              todayISO={todayISO}
              defaultCategory={defaultCategory}
              defaultItem={defaultItem}
              onCreated={onCreated}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
