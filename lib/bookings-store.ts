import { promises as fs } from 'node:fs';
import path from 'node:path';
import {
  addDaysISO,
  BookingRecord,
  BookingStatus,
  getTodayISO,
  ResourceCategory,
} from './bookings-types';

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'bookings.json');

let memoryFallback: BookingRecord[] | null = null;
let writeQueue: Promise<void> = Promise.resolve();

function createInitialSeed(): BookingRecord[] {
  const today = getTodayISO();
  const tomorrow = addDaysISO(today, 1);
  const dayAfter = addDaysISO(today, 2);
  const yesterday = addDaysISO(today, -1);

  return [
    {
      id: 'TMP-2401',
      nama_pemohon: 'Aiman Hakim bin Roslan',
      no_pengenalan: 'A22EC0142',
      item_tempahan: 'Makmal Komputer Sains Data 1',
      jenis: 'Makmal Komputer',
      tarikh: today,
      slot_masa: '10:00 – 12:00',
      status: 'Menunggu',
      tujuan: 'Bengkel analisis data projek tahun akhir bersama kumpulan penyelidikan.',
      created_at: `${today}T08:15:00.000Z`,
    },
    {
      id: 'TMP-2402',
      nama_pemohon: 'Nurul Izzah binti Mazlan',
      no_pengenalan: 'B21MD0089',
      item_tempahan: 'Set Kamera Sony FX3 & Lensa 24-70mm',
      jenis: 'Peralatan Studio',
      tarikh: today,
      slot_masa: '14:00 – 16:00',
      status: 'Menunggu',
      tujuan: 'Rakaman dokumentari minggu inovasi pelajar di Dewan Canselor.',
      created_at: `${today}T08:40:00.000Z`,
    },
    {
      id: 'TMP-2403',
      nama_pemohon: 'Daniel Tan Wei Ming',
      no_pengenalan: 'A23KE0215',
      item_tempahan: 'Bilik Perbincangan Aras 2 (A204)',
      jenis: 'Bilik Perbincangan',
      tarikh: today,
      slot_masa: '08:00 – 10:00',
      status: 'Diluluskan',
      tujuan: 'Mesyuarat penyelarasan projek reka bentuk mekanikal.',
      created_at: `${yesterday}T16:20:00.000Z`,
    },
    {
      id: 'TMP-2404',
      nama_pemohon: 'Siti Aisyah binti Kamaruddin',
      no_pengenalan: 'S22SP0034',
      item_tempahan: 'Gelanggang Badminton A & 4 Raket Yonex',
      jenis: 'Peralatan Sukan',
      tarikh: today,
      slot_masa: '16:00 – 18:00',
      status: 'Diluluskan',
      tujuan: 'Latihan pasukan badminton fakulti menjelang kejohanan antara kolej.',
      created_at: `${yesterday}T14:05:00.000Z`,
    },
    {
      id: 'TMP-2405',
      nama_pemohon: 'Muhammad Faris bin Zulkifli',
      no_pengenalan: 'A21EC0098',
      item_tempahan: 'Makmal Reka Bentuk CAD & Kejuruteraan',
      jenis: 'Makmal Komputer',
      tarikh: today,
      slot_masa: '14:00 – 16:00',
      status: 'Menunggu',
      tujuan: 'Simulasi struktur jambatan menggunakan perisian SolidWorks.',
      created_at: `${today}T09:05:00.000Z`,
    },
    {
      id: 'TMP-2406',
      nama_pemohon: 'Kavitha a/p Subramaniam',
      no_pengenalan: 'B23MC0117',
      item_tempahan: 'Kit Pencahayaan Studio LED Aputure (2 Unit)',
      jenis: 'Peralatan Studio',
      tarikh: today,
      slot_masa: '10:00 – 12:00',
      status: 'Ditolak',
      tujuan: 'Sesi fotografi luar kampus (peralatan studio hanya untuk kegunaan dalam kampus).',
      created_at: `${yesterday}T11:30:00.000Z`,
    },
    {
      id: 'TMP-2407',
      nama_pemohon: 'Dr. Hishamuddin bin Yusof',
      no_pengenalan: 'STF-1184',
      item_tempahan: 'Bilik Seminar Mini Cendekia (B108)',
      jenis: 'Bilik Perbincangan',
      tarikh: tomorrow,
      slot_masa: '10:00 – 12:00',
      status: 'Diluluskan',
      tujuan: 'Pembentangan cadangan penyelidikan pascasiswazah.',
      created_at: `${today}T07:50:00.000Z`,
    },
    {
      id: 'TMP-2408',
      nama_pemohon: 'Amirah Syahirah binti Halim',
      no_pengenalan: 'B22MC0051',
      item_tempahan: 'Mikrofon Podsiar Shure SM7B & Antaramuka Audio',
      jenis: 'Peralatan Studio',
      tarikh: tomorrow,
      slot_masa: '14:00 – 16:00',
      status: 'Menunggu',
      tujuan: 'Rakaman episod keempat podsiar rasmi kelab penyiaran kampus.',
      created_at: `${today}T09:22:00.000Z`,
    },
    {
      id: 'TMP-2409',
      nama_pemohon: 'Syafiq Irfan bin Azman',
      no_pengenalan: 'S21SP0102',
      item_tempahan: 'Set Bola Sepak Pertandingan & Bib Latihan',
      jenis: 'Peralatan Sukan',
      tarikh: tomorrow,
      slot_masa: '16:00 – 18:00',
      status: 'Menunggu',
      tujuan: 'Perlawanan persahabatan kelab sukan kolej kediaman.',
      created_at: `${today}T09:45:00.000Z`,
    },
    {
      id: 'TMP-2410',
      nama_pemohon: 'Chloe Wong Jia Yi',
      no_pengenalan: 'A22EC0176',
      item_tempahan: 'Pod Perbincangan Kumpulan P3',
      jenis: 'Bilik Perbincangan',
      tarikh: dayAfter,
      slot_masa: '12:00 – 14:00',
      status: 'Diluluskan',
      tujuan: 'Latihan pembentangan pertandingan inovasi teknologi.',
      created_at: `${yesterday}T17:10:00.000Z`,
    },
  ];
}

async function ensureSeedFile(): Promise<BookingRecord[]> {
  if (memoryFallback) {
    return memoryFallback;
  }

  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as BookingRecord[];
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // File does not exist or cannot be parsed yet; seed it below
  }

  const seed = createInitialSeed();
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(seed, null, 2), 'utf-8');
  } catch {
    memoryFallback = seed;
  }
  return seed;
}

async function persistBookings(bookings: BookingRecord[]): Promise<void> {
  if (memoryFallback) {
    memoryFallback = bookings;
    return;
  }

  writeQueue = writeQueue.then(async () => {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(DATA_FILE, JSON.stringify(bookings, null, 2), 'utf-8');
    } catch {
      memoryFallback = bookings;
    }
  });

  await writeQueue;
}

export async function getAllBookings(): Promise<BookingRecord[]> {
  const bookings = await ensureSeedFile();
  return [...bookings].sort((a, b) => {
    // Pending items first if same date, or sort newest date/created_at
    if (a.tarikh !== b.tarikh) {
      return a.tarikh.localeCompare(b.tarikh);
    }
    return a.slot_masa.localeCompare(b.slot_masa);
  });
}

export async function createBooking(input: {
  nama_pemohon: string;
  no_pengenalan?: string;
  item_tempahan: string;
  jenis: ResourceCategory;
  tarikh: string;
  slot_masa: string;
  tujuan?: string;
}): Promise<BookingRecord> {
  const bookings = await ensureSeedFile();
  const maxNum = bookings.reduce((max, item) => {
    const match = item.id.match(/TMP-(\d+)/);
    const num = match ? parseInt(match[1], 10) : 2400;
    return num > max ? num : max;
  }, 2400);

  const newRecord: BookingRecord = {
    id: `TMP-${maxNum + 1}`,
    nama_pemohon: input.nama_pemohon.trim(),
    no_pengenalan: input.no_pengenalan?.trim() || undefined,
    item_tempahan: input.item_tempahan.trim(),
    jenis: input.jenis,
    tarikh: input.tarikh,
    slot_masa: input.slot_masa,
    status: 'Menunggu',
    tujuan: input.tujuan?.trim() || undefined,
    created_at: new Date().toISOString(),
  };

  const updated = [newRecord, ...bookings];
  await persistBookings(updated);
  return newRecord;
}

export async function updateBookingStatus(
  id: string,
  status: BookingStatus
): Promise<BookingRecord | null> {
  const bookings = await ensureSeedFile();
  const index = bookings.findIndex((b) => b.id === id);
  if (index === -1) return null;

  const updatedRecord: BookingRecord = {
    ...bookings[index],
    status,
  };
  const updated = [...bookings];
  updated[index] = updatedRecord;
  await persistBookings(updated);
  return updatedRecord;
}

export async function deleteBooking(id: string): Promise<boolean> {
  const bookings = await ensureSeedFile();
  const filtered = bookings.filter((b) => b.id !== id);
  if (filtered.length === bookings.length) return false;
  await persistBookings(filtered);
  return true;
}

export async function resetSeedBookings(): Promise<BookingRecord[]> {
  const seed = createInitialSeed();
  if (memoryFallback) {
    memoryFallback = seed;
  } else {
    await persistBookings(seed);
  }
  return getAllBookings();
}
