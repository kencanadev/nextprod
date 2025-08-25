import axios from 'axios';

const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

export const fetchListPengemudi = async (entitas: string, token: string) => {
    try {
        const res = await axios.get(`${apiUrl}/erp/master/daftar-lainnya/list_pengemudi`, {
            params: {
                entitas: entitas,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const data = res.data.data;

        return data.map((item: any, index: number) => {
            return {
                ...item,
                id: index + 1,
                from: 'API',
            };
        });
    } catch (error) {
        console.error('Error fetching data Pengemudi:', error);
    }
};
export const postSimpanPengemudi = async (entitas: string, token: string, data: Object) => {
    try {
        const res = await axios.post(`${apiUrl}/erp/master/daftar-lainnya/simpan_pengemudi`, data, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return res;
    } catch (error) {
        console.error('Error fetching data Pengemudi:', error);
    }
};
export const fetchDataKry = async () => {
    try {
        const res = await axios.post(`http://10.10.1.109/api/v1/hris/list_employee_dlg`, { param1: 'all', param2: 'all', param3: 'all', param4: 'all' });
        const data = res.data.data;
        return data.map((item: any) => {
            return {
                kode_kry: item.emp_id,
                nip: item.emp_no,
                nama_kry: item.Full_Name,
                jabatan: item.pos_name_en,
                nama_divisi: item.worklocation_name,
            };
        });
    } catch (error) {
        console.error('Error fetching data Pengemudi:', error);
    }
};
