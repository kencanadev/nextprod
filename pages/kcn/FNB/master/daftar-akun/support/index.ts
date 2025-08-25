import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
export const swalToast = Swal.mixin({
    toast: true,
    position: 'center',
    customClass: {
        popup: 'colored-toast',
    },
    showConfirmButton: false,
    timer: 5500,
    showClass: {
        popup: `
              animate__animated
              animate__zoomIn
              animate__faster
            `,
    },
    hideClass: {
        popup: `
              animate__animated
              animate__zoomOut
              animate__faster
            `,
    },
});

export interface FilterDef {
    noAkunValue: string;
    keteranganValue: string;
    tipeValue: string;
    nonAktifValue: string;
    levelAkunValue: string;
    isNoAkunChecked: boolean;
    isKeteranganChecked: boolean;
    isTipeChecked: boolean;
}
export interface AkunType {
    kode_akun: string;
    no_akun: string;
    nama_akun: string;
    tipe: string;
    subtipe: string;
    aktif: string;
    header: string | null;
    grp: string;
    kode_grp: any;
    tingkat: number;
    normal: string;
    kode_mu: string;
    catatan: string | null;
    userid: string;
    tgl_update: string;
    kas: string;
    limit_bkk: string;
    jenis: string;
    noakun: string;
    namaakun: string;
    balance: string;
}
export const tipeValue = [
    'Kas',
    'Piutang Dagang',
    'Persediaan',
    'Aktiva Lancar Lainnya',
    'Aktiva Tetap',
    'Akumulasi Penyusutan',
    'Aktiva Lain-Lain',
    'Hutang Dagang',
    'Hutang Lancar Lainnya',
    'Hutang Jangka Panjang',
    'Ekuitas',
    'Pendapatan Usaha',
    'HPP',
    'Beban Usaha',
    'Beban Adm dan Umum',
    'Pendapatan Usaha Lain',
    'Beban Usaha Lain',
    'Beban Lain-Lain',
    'Pendapatan Lain-Lain',
];
export const swalDialog = Swal.mixin({
    customClass: {
        confirmButton: 'btn btn-primary btn-sm ml-3',
        cancelButton: 'btn btn-dark btn-sm ltr:mr-3 rtl:ml-3',
        popup: 'sweet-alerts',
    },
    buttonsStyling: false,
    showClass: {
        popup: `
          animate__animated
          animate__zoomIn
          animate__faster
        `,
    },
    hideClass: {
        popup: `
          animate__animated
          animate__zoomOut
          animate__faster
        `,
    },
});
export const fetchAkunData = async (entitas: string, token: string, params: FilterDef) => {
    try {
        const respone = await axios.get(`${apiUrl}/erp/master/daftar-akun/list_akun`, {
            params: {
                entitas: entitas,
                param1: params.isNoAkunChecked ? params.noAkunValue : 'all',
                param2: params.isKeteranganChecked ? params.keteranganValue : 'all',
                param3: params.isTipeChecked ? params.tipeValue : 'all',
                param4: params.nonAktifValue === '' ? 'all' : params.nonAktifValue,
                param5: params.levelAkunValue === '' ? 'all' : params.levelAkunValue,
            },
            headers: { Authorization: `Bearer ${token}` },
        });
        return respone.data.data;
    } catch (error) {
        console.error('Error fetching data Akun :', error);
        withReactContent(swalToast).fire({
            icon: 'error',
            title: `<p style="font-size:12px">Gagal Mengambil Data.</p>`,
            width: '100%',
            target: '#daftarAkun',
        });
    }
};
export const fecthLookupAkun = async (entitas: string, token: string, params?: any) => {
    try {
        const respone = await axios.get(`${apiUrl}/erp/master/daftar-akun/lookup_akun`, {
            params: {
                entitas: entitas,
                ...params,
            },
            headers: { Authorization: `Bearer ${token}` },
        });
        return respone.data.data;
    } catch (error) {
        console.error('Error fetching data Look up Akun :', error);
        withReactContent(swalToast).fire({
            icon: 'error',
            title: `<p style="font-size:12px">Gagal Mengambil Data.</p>`,
            width: '100%',
            target: '#daftarAkun',
        });
    }
};
export const fetchCheckSaldoAkun = async (entitas: string, token: string, kodeAkun: string) => {
    try {
        const respone = await axios.get(`${apiUrl}/erp/master/daftar-akun/cek_saldo_akun`, {
            params: {
                entitas: entitas,
                param1: kodeAkun,
            },
            headers: { Authorization: `Bearer ${token}` },
        });
        return respone.data.data;
    } catch (error) {
        console.error('Error fetching data Look up Akun :', error);
        withReactContent(swalToast).fire({
            icon: 'error',
            title: `<p style="font-size:12px">Gagal Pengecekan Saldo Akun.</p>`,
            width: '100%',
            target: '#daftarAkun',
        });
    }
};

export const postSimpanAkun = async (entitas: string, token: string, data: AkunType) => {
    try {
        const respone = await axios.post(`${apiUrl}/erp/master/daftar-akun/simpan_akun`, data, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return respone.data;
    } catch (error) {
        console.error('Error fetching data Look up Akun :', error);
        withReactContent(swalToast).fire({
            icon: 'error',
            title: `<p style="font-size:12px">Gagal Menyimpan Data.</p>`,
            width: '100%',
            target: '#daftarAkun',
        });
    }
};
export const postHapusAkun = async (token: string, data: { kode_akun: string; entitas: string; userid: string; no_akun: string }) => {
    try {
        const respone = await axios.post(`${apiUrl}/erp/master/daftar-akun/hapus_akun`, data, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return respone.data;
    } catch (error) {
        withReactContent(swalToast).fire({
            icon: 'error',
            title: `<p style="font-size:12px">Gagal Menghapus Akun.</p>`,
            width: '100%',
            target: '#daftarAkun',
        });
    }
};

export const ExportToCustomExcel = async (data: any[], fileName: any, kode_entitas: string) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    // Add header
    worksheet.mergeCells('A1:G1');
    worksheet.getCell('A1').value = 'DAFTAR AKUN';
    worksheet.getCell('A1').style = {
        font: { size: 14, bold: true },
        alignment: { horizontal: 'center' },
    };

    worksheet.mergeCells('A2:G2');
    worksheet.getCell('A2').value = `${kode_entitas}`;
    worksheet.getCell('A2').style = {
        font: { size: 16, bold: true, color: { argb: 'FFFF0000' } }, // Warna teks merah },
        alignment: { horizontal: 'center' },
    };

    // Add table headers
    const headers = ['No. Akun', 'Keterangan', 'Tipe'];
    worksheet.addRow(headers);
    worksheet.getRow(3).eachCell((cell) => {
        cell.style = {
            font: { bold: true },
            alignment: { horizontal: 'center' },
            border: {
                bottom: { style: 'thin' },
            },
        };
    });

    data.forEach((item) => {
        const row = worksheet.addRow([item.no_akun, item.nama_akun, item.tipe]);

        // Mengatur style font untuk setiap sel di baris data
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            cell.style = {
                font: {
                    size: 10, // Ukuran font
                    color: { argb: 'FF000000' }, // Warna teks hitam
                },
                alignment: colNumber >= 5 ? { horizontal: 'right' } : { horizontal: 'left' }, // Rata kanan untuk kolom Debet, Kredit, dan Saldo Kumulatif
            };
        });
    });

    // Set column widths
    worksheet.columns = [
        { width: 20 }, // Column A
        { width: 40 }, // Column B
        { width: 40 }, // Column C
    ];

    // Write file to buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Save file
    saveAs(new Blob([buffer]), `${fileName}.xlsx`);
    return true;
};
