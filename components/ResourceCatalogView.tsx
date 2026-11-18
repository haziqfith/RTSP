'use client';

import React, { useState } from 'react';
import { Building2, Monitor, Camera, Trophy, Plus } from 'lucide-react';
import {
  BookingRecord,
  RESOURCE_CATALOG,
  RESOURCE_CATEGORIES,
  ResourceCategory,
} from '@/lib/bookings-types';

interface ResourceCatalogViewProps {
  bookings: BookingRecord[];
  todayISO: string;
  onQuickBook: (category: ResourceCategory, itemName: string) => void;
}

const CATEGORY_ICONS: Record<ResourceCategory, React.ComponentType<{ className?: string }>> = {
  'Bilik Perbincangan': Building2,
  'Makmal Komputer': Monitor,
  'Peralatan Studio': Camera,
  'Peralatan Sukan': Trophy,
};

export default function ResourceCatalogView({
  bookings,
  todayISO,
  onQuickBook,
}: ResourceCatalogViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<'Semua' | ResourceCategory>(
    'Semua'
  );

  const items =
    selectedCategory === 'Semua'
      ? RESOURCE_CATALOG
      : RESOURCE_CATALOG.filter((item) => item.jenis === selectedCategory);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Katalog Ruang & Peralatan Kampus
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Pilih mana-mana ruang atau peralatan untuk membuat tempahan terus.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setSelectedCategory('Semua')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              selectedCategory === 'Semua'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua ({RESOURCE_CATALOG.length})
          </button>
          {RESOURCE_CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                selectedCategory === category
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map((resource) => {
          const Icon = CATEGORY_ICONS[resource.jenis];
          const todayCount = bookings.filter(
            (b) =>
              b.item_tempahan === resource.nama &&
              b.tarikh === todayISO &&
              b.status !== 'Ditolak'
          ).length;
          const pendingCount = bookings.filter(
            (b) => b.item_tempahan === resource.nama && b.status === 'Menunggu'
          ).length;

          return (
            <div
              key={resource.id}
              className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-4 hover:border-slate-300 transition-colors"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1.5 font-medium text-slate-600">
                    <Icon className="w-3.5 h-3.5 text-slate-500" />
                    {resource.jenis}
                  </span>
                  <span className="font-mono tabular-nums text-slate-400">
                    {resource.id}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-slate-900 leading-snug">
                  {resource.nama}
                </h3>

                <div className="text-xs text-slate-500 space-y-1">
                  <p>{resource.lokasi}</p>
                  <p>{resource.kapasiti_unit}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <div className="text-xs text-slate-500 font-mono tabular-nums">
                  <span>{todayCount} slot hari ini</span>
                  {pendingCount > 0 && (
                    <>
                      <span className="mx-1.5">·</span>
                      <span className="text-amber-700 font-medium">
                        {pendingCount} menunggu
                      </span>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onQuickBook(resource.jenis, resource.nama)}
                  className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tempah</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
