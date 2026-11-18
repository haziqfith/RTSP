import { NextRequest, NextResponse } from 'next/server';
import {
  createBooking,
  getAllBookings,
  resetSeedBookings,
} from '@/lib/bookings-store';
import {
  BookingStatus,
  RESOURCE_CATEGORIES,
  ResourceCategory,
} from '@/lib/bookings-types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const jenis = searchParams.get('jenis');
    const status = searchParams.get('status');
    const tarikh = searchParams.get('tarikh');
    const q = searchParams.get('q')?.trim().toLowerCase();

    let bookings = await getAllBookings();

    if (jenis && jenis !== 'Semua') {
      bookings = bookings.filter((b) => b.jenis === jenis);
    }

    if (status && status !== 'Semua') {
      bookings = bookings.filter((b) => b.status === (status as BookingStatus));
    }

    if (tarikh) {
      bookings = bookings.filter((b) => b.tarikh === tarikh);
    }

    if (q) {
      bookings = bookings.filter(
        (b) =>
          b.id.toLowerCase().includes(q) ||
          b.nama_pemohon.toLowerCase().includes(q) ||
          b.item_tempahan.toLowerCase().includes(q) ||
          (b.no_pengenalan?.toLowerCase().includes(q) ?? false)
      );
    }

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('GET /api/bookings error:', error);
    return NextResponse.json(
      { error: 'Gagal memuatkan senarai tempahan.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body?.action === 'reset_demo') {
      const bookings = await resetSeedBookings();
      return NextResponse.json({ bookings });
    }

    const { nama_pemohon, no_pengenalan, item_tempahan, jenis, tarikh, slot_masa, tujuan } =
      body ?? {};

    if (
      !nama_pemohon ||
      typeof nama_pemohon !== 'string' ||
      !item_tempahan ||
      typeof item_tempahan !== 'string' ||
      !jenis ||
      !RESOURCE_CATEGORIES.includes(jenis as ResourceCategory) ||
      !tarikh ||
      typeof tarikh !== 'string' ||
      !slot_masa ||
      typeof slot_masa !== 'string'
    ) {
      return NextResponse.json(
        { error: 'Sila lengkapkan semua medan wajib tempahan.' },
        { status: 400 }
      );
    }

    const booking = await createBooking({
      nama_pemohon,
      no_pengenalan,
      item_tempahan,
      jenis: jenis as ResourceCategory,
      tarikh,
      slot_masa,
      tujuan,
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    console.error('POST /api/bookings error:', error);
    return NextResponse.json(
      { error: 'Gagal mencipta rekod tempahan baharu.' },
      { status: 500 }
    );
  }
}
