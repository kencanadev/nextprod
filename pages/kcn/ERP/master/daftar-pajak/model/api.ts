const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
import axios from 'axios';
import moment from 'moment';
import { frmNumber } from '@/utils/routines';
import { log } from 'console';

let progressInterval: NodeJS.Timer;

export const DataListView = async (paramList: any, token: any) => {
    try {
        const response = await axios.get(`${apiUrl}/erp/master/daftar-lainnya/list_pajak?`, {
            params: paramList,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const cleanedData = response.data.data.map((item: any) => {
            return {
                ...item,
                nama_pajak: item.nama_pajak === null ? '' : item.nama_pajak,
                kode_akun_pajakjual: item.kode_akun_pajakjual === null ? '' : item.kode_akun_pajakjual,
                kode_akun_pajakbeli: item.kode_akun_pajakbeli === null ? '' : item.kode_akun_pajakbeli,
            };
        });
        // console.log('cleanedData ', cleanedData);
        return cleanedData; //data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

const formatFloat = (value: string | number): string => {
    const number = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(number)) return '';
    return number.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

export const DataEdit = async (paramList: any, token: any) => {
    try {
        const response = await axios.get(`${apiUrl}/erp/master/daftar-lainnya/detail_pajak`, {
            params: paramList,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        // console.log('response ', response.data.data);

        const cleanedData = response.data.data.map((item: any) => {
            return {
                ...item,
                catatan: item.catatan === null ? '' : item.catatan,
            };
        });
        // console.log('cleanedData ', cleanedData);
        return cleanedData; //data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};
