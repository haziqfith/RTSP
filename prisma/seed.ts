import { prisma } from '../lib/prisma';
import { addDaysISO, getTodayISO } from '../lib/bookings-types';

async function main() {
  const today = getTodayISO();
  const tomorrow = addDaysISO(today, 1);
  const dayAfter = addDaysISO(today, 2);

  const seedBookings = [
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
    },
  ];

  for (const item of seedBookings) {
    await prisma.booking.upsert({
      where: { id: item.id },
      update: {},
      create: item,
    });
  }

  console.log(`Berjaya menyemai ${seedBookings.length} rekod tempahan kampus.`);
}

main()
  .catch((error) => {
    console.error('Ralat menyemai pangkalan data:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
