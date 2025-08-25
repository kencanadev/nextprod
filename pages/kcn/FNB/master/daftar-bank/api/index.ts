import axios from 'axios';
import moment from 'moment';
const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
export const fetchBankData = async (entitas: string, token: string) => {
    try {
        const response = await axios.get(`${apiUrl}/erp/master/daftar-lainnya/list_bank?`, {
            params: {
                entitas: entitas,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const BankList = response.data.data.NamaBank;
        const DetaikBankList = response.data.data.detailBank;
        return {
            BankList,
            DetaikBankList,
        };
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};
export const fetchAkunData = async (entitas: string, token: string) => {
    try {
        const response = await axios.get(`${apiUrl}/erp/list_akun_global?`, {
            params: {
                entitas: entitas,
                param1: 'SQLAkunKasBank',
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};
export const postSimpanBank = async (token: string, data: any) => {
    try {
        const response = await axios.post(`${apiUrl}/erp/master/daftar-lainnya/simpan_bank?`, data, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error Simpan data:', error);
        throw error;
    }
};
const supportData = async (params: any, entitas: string, token: string) => {
    try {
        const response = await axios.get(`${apiUrl}/erp/master/daftar-lainnya/update_informasi_bank`, {
            params: {
                entitas: entitas,
                param1: params['param1'],
                param2: params['param2'],
                param3: params['param3'],
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data.data;
    } catch (error) {
        throw new Error('Terjadi Kesalahan, Mohon Ulangi lagi dalam beberapa saat!');
    }
};
function dateToIndo(date: Date): string {
    const bulan: string[] = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const day: number = date.getDate();
    const month: number = date.getMonth() + 1; // getMonth() returns 0–11
    const year: number = date.getFullYear();

    return `${day} ${bulan[month]} ${year}`;
}

function incDay(date: Date, delta: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + delta);
    return result;
}

export const UpdateInformasiRekening = async (data: any[], token: string, entitas: string): Promise<{ status: boolean; data: any[]; jurnal: any[] }> => {
    try {
        let DB = 0,
            KR = 0,
            cDB = 0,
            cKR = 0;
        let Kumulatif = 0;
        const vtJurnal: any[] = [];
        for (const item of data) {
            // 1. Ambil saldo akhir
            const saldoAkhir = await supportData({ param1: 'quSaldoAkhir', param2: item.no_rekening }, entitas, token);
            if (saldoAkhir.length > 0) {
                item.saldo_akhir = saldoAkhir[0]?.balance;
            }

            // 2. Ambil tanggal buka rekening
            const BBLstAwal = await supportData({ param1: 'quBBLstAwal', param2: item.kode_akun }, entitas, token);
            if (BBLstAwal.length > 0) {
                item.tgl_buka_rek = BBLstAwal[0]?.tgl_dokumen;
            }
            // 3. Ambil transaksi kumulatif
            const BBKumulatif = await supportData({ param1: 'quBBKumulatif', param2: item.kode_akun }, entitas, token);
            // 4. Ambil total saldo awal
            const TotalBB = await supportData(
                {
                    param1: 'quTotalBB',
                    param2: item.kode_akun,
                    param3: BBLstAwal[0]?.tgl_dokumen ?? '1899-12-30',
                },
                entitas,
                token
            );

            // Inisialisasi jurnal pertama: saldo awal
            const saldoAwal = parseFloat(TotalBB[0]?.saldoawal) ?? 0;
            vtJurnal.push({
                id: 0,
                catatan: `Saldo sampai dengan ${dateToIndo(incDay(new Date(), -1))}`,
                balance: saldoAwal,
            });

            // 5. Iterasi BBKumulatif untuk jurnal
            Kumulatif = saldoAwal;
            for (const row of BBKumulatif) {
                DB += row.debet;
                KR += row.kredit;
                if (row.debet > 0) cDB++;
                if (row.kredit > 0) cKR++;

                Kumulatif += row.debet - row.kredit;

                vtJurnal.push({
                    ...row,
                    id: 1,
                    balance: Kumulatif,
                });
            }

            // 6. Cek apakah balance 0 → set tgl_tutup_rek
            const isZeroBalance = parseFloat(Kumulatif.toFixed(2)) === 0;
            if (isZeroBalance) {
                const BBLast = await supportData({ param1: 'quBBLstAkhir', param2: item.kode_akun }, entitas, token);
                item.tgl_tutup_rek = BBLast[0]?.tgl_dokumen ?? null;
            }
        }

        return {
            status: true,
            data,
            jurnal: vtJurnal,
        };
    } catch (error) {
        console.error(error);
        throw new Error('Terjadi Kesalahan, Mohon ulangi lagi dalam beberapa saat!');
    }
};

export const keteranganList = [
    { keterangan: 'Rekening Customer' },
    { keterangan: 'Rekening BDC' },
    { keterangan: 'Rekening Tampungan' },
    { keterangan: 'Rekening PKP' },
    { keterangan: 'Rekening Lainnya' },
];
