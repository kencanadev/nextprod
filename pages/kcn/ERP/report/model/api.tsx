import axios from 'axios';
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

const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

const categoriesPembelian = [
    { id: 7101, value: 'Daftar Permintaan Pembelian', nama_komponen: 'rpMSpp' },
    { id: 7102, value: 'Permintaan Pembelian Outstanding', nama_komponen: 'rpppStd' },
    { id: 7103, value: 'Rincian Daftar Permintaan Pembelian', nama_komponen: 'rpRincianSpp' },
    { id: 7104, value: 'Daftar Permintaan Pembelian Per Peminta', nama_komponen: 'rpSppPerPeminta' },

    { id: 7105, value: 'Daftar Order Pembelian', nama_komponen: 'rpMpo' },
    { id: 7106, value: 'Order Pembelian Outstanding', nama_komponen: 'rpSpStd' },
    { id: 7107, value: 'Rincian Daftar Order Pembelian', nama_komponen: 'rpRincianPo' },
    { id: 7108, value: 'Daftar Order Pembelian Per Supplier', nama_komponen: 'rpPoPerSupp' },
    { id: 7109, value: 'Rekapitulasi Penerimaan Barang', nama_komponen: 'rpMLpb' },
    { id: 7110, value: 'Daftar Penerimaan Barang Outstanding', nama_komponen: 'rpMLpb' },

    { id: 7111, value: 'Rincian Daftar Penerimaan Barang', nama_komponen: 'rpRcLpb' },
    { id: 7112, value: 'Daftar Penerimaan Barang Per Supplier', nama_komponen: 'rpLpbPerSupp' },
    { id: 7113, value: 'Daftar Memo Pengembalian Barang', nama_komponen: 'rpMmpb' },
    { id: 7114, value: 'Daftar Memo Pengembalian Barang Outstanding', nama_komponen: 'rpMmpb' },
    { id: 7115, value: 'Rincian Daftar Memo Pengembalian Barang', nama_komponen: 'rpRincianMpb' },

    { id: 7116, value: 'Daftar Memo Pengembalian Barang Per Supplier', nama_komponen: 'rpmpbPerSupp' },
    { id: 7117, value: 'Daftar Faktur Pembelian', nama_komponen: 'rpMfb' },
    { id: 7118, value: 'Daftar Faktur Pembelian Outstanding', nama_komponen: 'rpMfb' },
    { id: 7119, value: 'Rincian Daftar Faktur Pembelian', nama_komponen: 'rpRincianFb' },
    { id: 7120, value: 'Daftar Faktur Pembelian Per Supplier', nama_komponen: 'rpFbPerSupp' },

    { id: 7121, value: 'Laporan Pembelian Per Kelompok Barang Tahun Berjalan ( Komparasi Target )', nama_komponen: 'rpBeliPerKelBrg' },
    { id: 7122, value: 'Laporan Pembelian Per Kelompok Barang Periode Berjalan ( Komparasi Target )', nama_komponen: 'rpbeliklpperiod' },
    { id: 7123, value: 'Rekap Pembelian Per Kelompok Barang ( Komparasi Target )', nama_komponen: 'rpPerKelPerPeriod' },
    { id: 7124, value: 'Laporan Pembelian Per Supplier', nama_komponen: 'rpBeliPerSupp' },
    { id: 7125, value: 'Laporan Pembelian Per Cabang', nama_komponen: 'rpBeliPerCabang' },
    { id: 7126, value: 'Laporan Rincian Pembelian Per Item', nama_komponen: 'rpBeliPerJnsBrg' },
    { id: 7127, value: 'Laporan Pembelian', nama_komponen: 'rpBeliAll' },
    { id: 7128, value: 'Laporan Pembelian Per Item Per Supplier', nama_komponen: 'rpPerBrgPerSupp' },
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

const GetItem = async (kode_entitas: any, token: any) => {
    if (kode_entitas || token) {
        const response = await axios.get(`${apiUrl}/erp/filter_laporan?`, {
            params: {
                entitas: kode_entitas,
                param1: 'ITEM',
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const GetItem = response.data.data;
        return GetItem;
    } else {
        return [];
    }
};

const GetListData = async (kode_entitas: any, token: any, id: any, idCategory: any) => {
    let response: any;
    let idResp: any;
    if (kode_entitas || token) {
        if (id === 1 || id === 6) {
            console.log('idCategory = ', idCategory, id);

            if (idCategory === 7101 || idCategory === 7102 || idCategory === 7103 || idCategory === 7104) {
                response = await axios.get(`${apiUrl}/erp/get_peminta?`, {
                    params: {
                        entitas: kode_entitas,
                    },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            } else if (
                idCategory === 7105 ||
                idCategory === 7106 ||
                idCategory === 7107 ||
                idCategory === 7109 ||
                idCategory === 7110 ||
                idCategory === 7111 ||
                idCategory === 7120 ||
                idCategory === 7124 ||
                idCategory === 7125 ||
                idCategory === 7126 ||
                idCategory === 7127 ||
                idCategory === 7128
            ) {
                idResp = 'SP';
                const suppliers = await axios.get(`${apiUrl}/erp/m_supplier`, {
                    params: {
                        entitas: kode_entitas,
                    },
                });

                response = suppliers.data.data.map((item: any) => ({
                    ...item,
                    peminta: item.nama_relasi,
                }));
            }
        } else if (id === 2) {
            response = await axios.get(`${apiUrl}/erp/kategori?`, {
                params: {
                    entitas: kode_entitas,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        } else if (id === 3) {
            response = await axios.get(`${apiUrl}/erp/kelompok?`, {
                params: {
                    entitas: kode_entitas,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        }

        const GetKategori = idResp === 'SP' ? response : response.data.data;
        console.log('GetKategori = ', GetKategori);
        return GetKategori;
    } else {
        return [];
    }
};

export { categoriesHutangUsahaDanSupplier, categories, categoriesBukuBesar, categoriesLaporanKeuangan, GetItem,
GetListData, categoriesPembelian };
