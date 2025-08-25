import axios from 'axios';
const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
export const fetchKecamatanKelurahanData = async (entitas: string, token: string) => {
    try {
        const response = await axios.get(`${apiUrl}/erp/master/daftar-lainnya/list_kecamatan_kelurahan`, {
            params: {
                entitas: entitas,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const KecamatanList = response.data.data.Kecamatan;
        const KelurahanList = response.data.data.Kelurahan;
        return {
            KecamatanList,
            KelurahanList,
        };
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

export const fetchCheckData = async (entitas: string, token: string, type: string, value: string) => {
    try {
        const response = await axios.get(`${apiUrl}/erp/master/daftar-lainnya/check_kecamatan_kelurahan`, {
            params: {
                entitas: entitas,
                param1: type,
                param2: value,
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

export const postSimpanKecamatanKelurahan = async (token: string, data: any) => {
    try {
        const response = await axios.post(`${apiUrl}/erp/master/daftar-lainnya/simpan_kecamatan_kelurahan`, data, {
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
