import axios from 'axios';

export interface Divisi {
    kode_jual: string;
    nama_jual: string;
    aktif: string; // "1" atau "0", asumsi dari API
}

const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

export const getListDivisiPenjualan = async (paramList: Record<string, any>, token: string): Promise<Divisi[]> => {
    try {
        const response = await axios.get(`${apiUrl}/erp/master/divisi-penjualan/list_divisi_penjualan`, {
            params: paramList,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const rawData = response.data?.data ?? [];

        return rawData.map((item: any) => ({
            kode_jual: item.kode_jual,
            nama_jual: item.nama_jual,
            aktif: item.aktif === 'N' ? true : false,
            kode_jual_lama: item.kode_jual,

            // aktif: item.aktif ? 'Y' : 'N',
            // aktif: item.aktif !== 'Y',
        }));
    } catch (error) {
        console.error('Gagal mengambil data divisi:', error);
        throw error;
    }
};
