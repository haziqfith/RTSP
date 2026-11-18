import { NextRequest, NextResponse } from 'next/server';
import { deleteBooking, updateBookingStatus } from '@/lib/bookings-store';
import { BookingStatus } from '@/lib/bookings-types';

const ALLOWED_STATUSES: BookingStatus[] = ['Menunggu', 'Diluluskan', 'Ditolak'];

export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const body = await req.json();
    const status = body?.status as BookingStatus | undefined;

    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: 'Status tidak sah. Gunakan Menunggu, Diluluskan, atau Ditolak.' },
        { status: 400 }
      );
    }

    const updated = await updateBookingStatus(id, status);
    if (!updated) {
      return NextResponse.json(
        { error: 'Rekod tempahan tidak ditemui.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ booking: updated });
  } catch (error) {
    console.error('PATCH /api/bookings/[id] error:', error);
    return NextResponse.json(
      { error: 'Gagal mengemas kini status tempahan.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const removed = await deleteBooking(id);
    if (!removed) {
      return NextResponse.json(
        { error: 'Rekod tempahan tidak ditemui.' },
        { status: 404 }
      );
    }
    return NextResponse.json({ deleted: true, id });
  } catch (error) {
    console.error('DELETE /api/bookings/[id] error:', error);
    return NextResponse.json(
      { error: 'Gagal memadam rekod tempahan.' },
      { status: 500 }
    );
  }
}
