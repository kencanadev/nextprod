const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
import axios from 'axios';
import moment from 'moment';
import { frmNumber } from '@/utils/routines';
import { log } from 'console';

let progressInterval: NodeJS.Timer;

export const DataListView = async (paramList: any, token: any) => {
    try {
        const response = await axios.get(`${apiUrl}/erp/master/daftar-lainnya/list_termin_pembayaran?`, {
            params: paramList,
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
        const response = await axios.get(`${apiUrl}/erp/master/daftar-lainnya/detail_termin_pembayaran`, {
            params: paramList,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        // console.log('response ', response.data.data);

        const cleanedData = response.data.data.map((item: any) => {
            return {
                ...item,
                hari: item.hari === null ? 0 : item.hari,
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
