export const INVENTORY_TYPES = [
  { id: 1, text: 'Persediaan' },
  { id: 2, text: 'Non Persediaan' },
  { id: 3, text: 'Jasa/Service' },
];

export const ACTIVATION_STATUS = [
  { id: 1, text: 'Aktif' },
  { id: 2, text: 'Slow Moving' },
  { id: 3, text: 'Non Aktif' },
];

export const ITEM_STATUS = [
  { id: 1, text: 'Continue' },
  { id: 2, text: 'Insidentil' },
];

export const TAB_LIST = (tipe: string) => {
  const baseTabList = [
    { id: 1, title: 'Informasi' },
    { id: 2, title: 'Data Tambahan' },
    { id: 3, title: 'Data Akun' },
    { id: 4, title: 'Perhitungan Rumus' },
    { id: 5, title: 'Catatan' },
    { id: 6, title: 'Paket Produk' },
    { id: 7, title: 'Alternatif Produk' },
    { id: 8, title: 'Histori' },
    { id: 9, title: 'Gambar Produk' },
  ];

  // Filter tab list berdasarkan tipe
  return baseTabList.filter((tab) => {
    switch (tab.title) {
      case 'Data Akun':
      case 'Paket Produk':
      case 'Alternatif Produk':
      case 'Histori':
      case 'Gambar Produk':
        return tipe === 'Persediaan';
      default:
        return true;
    }
  });
};

export const ACTIVATION_STATUS_FILTER = [
  { label: 'Aktif', value: 'aktif' },
  { label: 'Non Aktif', value: 'non aktif' },
  { label: 'Slow Moving', value: 'slow moving' },
  { label: 'Semua', value: 'all' },
];

export const ITEM_STATUS_FILTER = [
  { label: 'Continue', value: 'continue' },
  { label: 'Insidentil', value: 'insidentil' },
  { label: 'Semua', value: 'all' },
];

export const PAKET_FILTER = [
  { label: 'Ya', value: 'Y' },
  { label: 'Tidak', value: 'N' },
  { label: 'Semua', value: 'all' },
];

export const KONSIYANSI_FILTER = [
  { label: 'Ya', value: 'Y' },
  { label: 'Tidak', value: 'N' },
  { label: 'Semua', value: 'all' },
];

export const DATA_EKSPORT_FILTER = [
  { label: 'Ya', value: 'Y' },
  { label: 'Tidak', value: 'N' },
  { label: 'Semua', value: 'all' },
];

export const BARANG_KONTRAK_PPN_FILTER = [
  { label: 'Ya', value: 'Y' },
  { label: 'Tidak', value: 'N' },
  { label: 'Semua', value: 'all' },
];

export const initialFormState = {
  // Master
  tipe: 'Persediaan',
  status: 'Aktif',
  kode_item: '',
  no_item: '',
  status_item: 'Continue',
  nama_item: '',
  no_barang_barcode: '',
  nama_supplier: '',
  kode_supp: '',
  kustom2: '', // no barang (barcode)
  nama_cetak: '', // nama item supplier
  kustom3: '', // nama barang supplier
  konsinyasi: 'N', // konsinyasi
  // Informasi Persediaan
  grp: '', // kategori
  satuan: '',
  satuan2: '',
  std2: 0,
  konversi2: 0,
  satuan3: '',
  std3: 0,
  konversi3: 0,
  kustom10: null, // kelompok
  kustom4: null, // merk
  nama_grp: null,
  harga1: 0, // harga_penjualan
  harga4: 0, // harga pembelian (PL)
  diskon: 0,
  potongan: 0,
  kode_pajak: 'N', // pajak
  text_pajak: 'N - Tanpa Pajak',
  deskripsi: '',
  minimal: 0,
  maksimal: 0,
  reorder: 0,
  estimasipo: 0,
  harga2: '', // harga pembelian
  kustom1: 0,
  hpp: 0,
  rating: 1, // Prioritas stok
  // Data Tambahan
  kustom9: '-', // jenis produk
  kustom8: '-', // gabungan
  kustom7: '-', // klasifikasi
  kustom6: '-', // warna
  kustom5: '-', // motif
  // Data Akun
  kode_akun_persediaan: 'AK0000000026',
  no_akun_persediaan: '1-10701',
  nama_akun_persediaan: 'Persediaan Barang Dagang',
  kode_akun_jual: 'AK0000000111',
  no_akun_jual: '4-10101',
  nama_akun_jual: 'Penjualan',
  kode_akun_returjual: 'AK0000000113',
  no_akun_returjual: '4-10103',
  nama_akun_returjual: 'Retur Penjualan',
  kode_akun_diskonitem: 'AK0000000112',
  no_akun_diskonitem: '4-10102',
  nama_akun_diskonitem: 'Potongan Penjualan',
  kode_akun_hpp: 'AK0000000114',
  no_akun_hpp: '5-101',
  nama_akun_hpp: 'Harga Pokok Penjualan',
  kode_akun_returbeli: 'AK0000000026',
  no_akun_returbeli: '1-10701',
  nama_akun_returbeli: 'Persediaan Barang Dagang',
  // Perhitungan Rumus
  tebal: 0, // diameter
  berat: 0, // massa
  panjang: 0,
  lebar: 0,
  berat_tabel: '',
  berat_kontrak: '',
  berat1: '', // toleransi 1
  berat2: '', // toleransi 2
  kali_harga: 'Berat',
  ppn_kontrak: 'N',
  rumus: '',
  // catatan
  tgl: '',
  catatan: '',
  // Paket Produk
  id_item: '',
  kode_itempak: '',
  satuan_paket: '',
  qty: '',
  // alternatif produk
  id_item_alt: '',
  kode_itemalt: '',
  // gambar produk
  gambar: '',
};
