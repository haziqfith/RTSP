export type ResourceCategory =
  | 'Bilik Perbincangan'
  | 'Makmal Komputer'
  | 'Peralatan Studio'
  | 'Peralatan Sukan';

export type BookingStatus = 'Menunggu' | 'Diluluskan' | 'Ditolak';

export interface BookingRecord {
  id: string;
  nama_pemohon: string;
  no_pengenalan?: string;
  item_tempahan: string;
  jenis: ResourceCategory;
  tarikh: string; // YYYY-MM-DD
  slot_masa: string;
  status: BookingStatus;
  tujuan?: string;
  created_at: string;
}

export interface ResourceCatalogItem {
  id: string;
  nama: string;
  jenis: ResourceCategory;
  lokasi: string;
  kapasiti_unit: string;
}

export const RESOURCE_CATEGORIES: ResourceCategory[] = [
  'Bilik Perbincangan',
  'Makmal Komputer',
  'Peralatan Studio',
  'Peralatan Sukan',
];

export const TIME_SLOTS: string[] = [
  '08:00 – 10:00',
  '10:00 – 12:00',
  '12:00 – 14:00',
  '14:00 – 16:00',
  '16:00 – 18:00',
  '20:00 – 22:00',
];

export const RESOURCE_CATALOG: ResourceCatalogItem[] = [
  {
    id: 'RES-BP01',
    nama: 'Bilik Perbincangan Aras 2 (A204)',
    jenis: 'Bilik Perbincangan',
    lokasi: 'Perpustakaan Utama, Aras 2',
    kapasiti_unit: '8 orang · Papan putih & TV HDMI',
  },
  {
    id: 'RES-BP02',
    nama: 'Bilik Seminar Mini Cendekia (B108)',
    jenis: 'Bilik Perbincangan',
    lokasi: 'Blok Akademik B, Aras 1',
    kapasiti_unit: '16 orang · Projektor & Audio',
  },
  {
    id: 'RES-BP03',
    nama: 'Pod Perbincangan Kumpulan P3',
    jenis: 'Bilik Perbincangan',
    lokasi: 'Pusat Pelajar, Aras Bawah',
    kapasiti_unit: '6 orang · Kalis bunyi',
  },
  {
    id: 'RES-MK01',
    nama: 'Makmal Komputer Sains Data 1',
    jenis: 'Makmal Komputer',
    lokasi: 'Fakulti Komputeran, Blok D',
    kapasiti_unit: '32 unit PC · GPU RTX & Python/R',
  },
  {
    id: 'RES-MK02',
    nama: 'Makmal Reka Bentuk CAD & Kejuruteraan',
    jenis: 'Makmal Komputer',
    lokasi: 'Blok Kejuruteraan 2, Aras 3',
    kapasiti_unit: '28 unit Workstation · AutoCAD/SolidWorks',
  },
  {
    id: 'RES-MK03',
    nama: 'Makmal Multimedia & Suntingan Video',
    jenis: 'Makmal Komputer',
    lokasi: 'Pusat Media Digital, Aras 2',
    kapasiti_unit: '20 unit iMac · Final Cut & Premiere',
  },
  {
    id: 'RES-PS01',
    nama: 'Set Kamera Sony FX3 & Lensa 24-70mm',
    jenis: 'Peralatan Studio',
    lokasi: 'Kaunter Pinjaman Studio Media',
    kapasiti_unit: '1 set lengkap · Bateri & Kad SD 128GB',
  },
  {
    id: 'RES-PS02',
    nama: 'Kit Pencahayaan Studio LED Aputure (2 Unit)',
    jenis: 'Peralatan Studio',
    lokasi: 'Kaunter Pinjaman Studio Media',
    kapasiti_unit: '1 beg softbox · Kaki lampu & diffuser',
  },
  {
    id: 'RES-PS03',
    nama: 'Mikrofon Podsiar Shure SM7B & Antaramuka Audio',
    jenis: 'Peralatan Studio',
    lokasi: 'Bilik Rakaman Audio Kampus',
    kapasiti_unit: '2 mikrofon · Lengan boom & kabel XLR',
  },
  {
    id: 'RES-SK01',
    nama: 'Gelanggang Badminton A & 4 Raket Yonex',
    jenis: 'Peralatan Sukan',
    lokasi: 'Kompleks Sukan Kampus',
    kapasiti_unit: '1 gelanggang · 1 tiub bulu tangkis',
  },
  {
    id: 'RES-SK02',
    nama: 'Set Bola Sepak Pertandingan & Bib Latihan',
    jenis: 'Peralatan Sukan',
    lokasi: 'Stor Pusat Sukan, Padang Utama',
    kapasiti_unit: '5 bola saiz 5 · 14 bib pasukan',
  },
  {
    id: 'RES-SK03',
    nama: 'Papan Skor Elektronik & Set Bola Jaring',
    jenis: 'Peralatan Sukan',
    lokasi: 'Dewan Serbaguna Kompleks Sukan',
    kapasiti_unit: '1 unit papan skor · 3 bola latihan',
  },
];

export function getTodayISO(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDaysISO(baseISO: string, days: number): string {
  const [y, m, d] = baseISO.split('-').map(Number);
  const dt = new Date(y, m - 1, d + days);
  const year = dt.getFullYear();
  const month = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const MALAY_MONTHS = [
  'Jan',
  'Feb',
  'Mac',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Ogos',
  'Sep',
  'Okt',
  'Nov',
  'Dis',
];

export function formatMalayDate(isoDate: string): string {
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  const [y, m, d] = parts;
  const monthIdx = parseInt(m, 10) - 1;
  const monthName = MALAY_MONTHS[monthIdx] ?? m;
  return `${parseInt(d, 10)} ${monthName} ${y}`;
}
