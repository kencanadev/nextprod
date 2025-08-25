import axios from 'axios';
import { Divisi, getListDivisiPenjualan } from '../model/api';

export const loadDataDivisi = async (entitas: string, token: string): Promise<Divisi[]> => {
    try {
        const paramList = { entitas };
        const list = await getListDivisiPenjualan(paramList, token);
        return list;
    } catch (error) {
        console.error('loadDataDivisi error:', error);
        return [];
    }
};

interface DivisiPenjualan {
    kode_jual: string;
    nama_jual: string;
    aktif: boolean;
}
export const simpanDataDivisi = async (data: DivisiPenjualan[], token: string, userid: string): Promise<void> => {
    try {
        const response = await axios.post(
            '/master/divisi-penjualan/simpan_divisi_penjualan',
            {
                data,
                userid,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (response.data?.success !== true) {
            throw new Error(response.data?.message || 'Gagal menyimpan data divisi');
        }

        // console.log('✅ Data divisi berhasil disimpan:', response.data);
    } catch (error: any) {
        console.error('❌ Gagal simpan data divisi:', error);
        throw error;
    }
};
