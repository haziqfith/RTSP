import { getAllBookings } from '@/lib/bookings-store';
import {
  BookingStatus,
  getTodayISO,
  RESOURCE_CATEGORIES,
  ResourceCategory,
} from '@/lib/bookings-types';
import BookingWorkspace from '@/components/BookingWorkspace';

export const dynamic = 'force-dynamic';

interface HomePageProps {
  searchParams: Promise<{
    jenis?: string;
    status?: string;
  }>;
}

const VALID_STATUSES: BookingStatus[] = ['Menunggu', 'Diluluskan', 'Ditolak'];

export default async function HomePage(props: HomePageProps) {
  const { jenis, status } = await props.searchParams;
  const initialBookings = await getAllBookings();
  const todayISO = getTodayISO();

  const initialCategoryFilter: 'Semua' | ResourceCategory =
    jenis && RESOURCE_CATEGORIES.includes(jenis as ResourceCategory)
      ? (jenis as ResourceCategory)
      : 'Semua';

  const initialStatusFilter: 'Semua' | BookingStatus =
    status && VALID_STATUSES.includes(status as BookingStatus)
      ? (status as BookingStatus)
      : 'Semua';

  return (
    <BookingWorkspace
      initialBookings={initialBookings}
      todayISO={todayISO}
      initialCategoryFilter={initialCategoryFilter}
      initialStatusFilter={initialStatusFilter}
    />
  );
}
