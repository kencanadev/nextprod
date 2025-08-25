import React from 'react'

const api = () => {
  return (
    <div>api</div>
  )
}

export default api

const categories = [
    { id: 1, tipe: '70100', value: 'Pembelian' },
    { id: 2, tipe: '70200', value: 'Hutang Usaha dan Supplier' },
    { id: 3, tipe: '70300', value: 'Penjualan' },
    { id: 4, tipe: '70400', value: 'Piutang Usaha dan Customer' },
    { id: 5, tipe: '70500', value: 'Buku Besar' },
    { id: 6, tipe: '70600', value: 'Laporan Keuangan' },
    { id: 7, tipe: '70700', value: 'Persediaan' },
    { id: 8, tipe: '70800', value: 'Performa Salesman' },
    { id: 9, tipe: '70900', value: 'Laporan Lain-Lain' },
    { id: 10, tipe: '71000', value: 'Aktiva Tetap' },
];

// Category Report untuk Buku Besar
const categoriesBukuBesar = [
    { id: 7501, value: 'Ringkasan Daftar Akun' },
    { id: 7502, value: 'Detail Buku Besar' },
    { id: 7503, value: 'Detail Subsidiary Ledger' },
    { id: 7504, value: 'Neraca Saldo (Trial Balance)' },
    { id: 7505, value: 'Rekap Saldo Subsidiary Ledger' },
];
// END

// Category Report untuk Laporan Keuangan
const categoriesLaporanKeuangan = [
    { id: 7601, value: 'Neraca Standar', nama_komponen: 'rpNeraca' }, // bener
    { id: 7602, value: 'Neraca Bentuk Skontro', nama_komponen: 'rpSkontro' }, // bener
    { id: 7603, value: 'Laba Rugi Standar', nama_komponen: 'rpLrNew' }, // rpLrNew
    { id: 7604, value: 'Arus Kas', nama_komponen: 'rpCashFlowNew' }, // bener
    { id: 7605, value: 'Neraca Komparasi', nama_komponen: 'rpNK' }, //  bener
    { id: 7606, value: 'Laba Rugi Komparasi', nama_komponen: 'rpLRG,rpLRK' }, // rpLRG // rpLRK
    { id: 7607, value: 'Harian Kas dan Warkat', nama_komponen: 'rpKas' }, // bener
    { id: 7608, value: 'Laba Rugi Divisi Penjualan', nama_komponen: 'rpLrNew' }, // kurang tau
];

// Category Report untuk Laporan Hutang Usaha dan Supplier
const categoriesHutangUsahaDanSupplier = [
  { id: 7201, value: 'Daftar Supplier', nama_komponen: 'rpSupp' },
  { id: 7202, value: 'Daftar Hutang Dagang Supplier', nama_komponen: 'rpHutang' },
  { id: 7203, value: 'Daftar Pengakuan Hutang Dagang Supplier', nama_komponen: 'rpPengakuanHutang' },
  { id: 7204, value: 'Rekapitulasi Hutang Supplier Berdasarkan Umurnya', nama_komponen: 'rpAgHtgDagang' },
  { id: 7205, value: 'Rekapitulasi Hutang Warkat Berdasarkan Umurnya', nama_komponen: 'rpAgHtgBG' },
  { id: 7206, value: 'Rekapitulasi Hutang Supplier + Warkat Berdasarkan Umurnya', nama_komponen: 'rpAgHtgGabung' },
  { id: 7207, value: 'Detail Hutang Supplier Berdasarkan Umurnya', nama_komponen: 'rpAgHtgDagangDetail' },
  { id: 7208, value: 'Detail Hutang Warkat Berdasarkan Umurnya', nama_komponen: 'rpAgHtgBGDetail' },
  { id: 7209, value: 'Detail Hutang Supplier + Warkat Berdasarkan Umurnya', nama_komponen: 'rpAgHtgGabungDetail' },
];

export { categoriesHutangUsahaDanSupplier, categories, categoriesBukuBesar, categoriesLaporanKeuangan };
