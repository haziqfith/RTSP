import { getAllBookings } from '@/lib/bookings-store';
import { getTodayISO } from '@/lib/bookings-types';
import BookingWorkspace from '@/components/BookingWorkspace';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const initialBookings = await getAllBookings();
  const todayISO = getTodayISO();

  return (
    <BookingWorkspace initialBookings={initialBookings} todayISO={todayISO} />
  );
}
