const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
import axios from 'axios';
import moment from 'moment';
import { frmNumber } from '@/utils/routines';
import { log } from 'console';

let progressInterval: NodeJS.Timer;

export const DataListView = async (paramList: any, token: any) => {
    try {
        const response = await axios.get(`${apiUrl}/erp/master/daftar-lainnya/list_kurs_mata_uang`, {
            params: paramList,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        // Ganti null dengan string kosong dalam data
        // const cleanedData = {
        //     ...response.data,
        //     data: response.data.data.map((item: any) => {
        //         return Object.fromEntries(Object.entries(item).map(([key, value]) => [key, value === null ? '' : value]));
        //     }),
        // };
        // console.log(cleanedData);
        const cleanedData = response.data.data.map((item: any) => {
            return {
                ...item,
                kurs: item.kurs === null ? '' : frmNumber(item.kurs),
                kurs_pajak: item.kurs_pajak === null ? '' : frmNumber(item.kurs_pajak),
            };
        });
        return cleanedData;
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
        const response = await axios.get(`${apiUrl}/erp/master/daftar-lainnya/detail_kurs`, {
            params: paramList,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        // Ganti null dengan string kosong dalam data
        // const cleanedData = {
        //     ...response.data,
        //     data: response.data.data.map((item: any) => {
        //         return Object.fromEntries(Object.entries(item).map(([key, value]) => [key, value === null ? '' : value]));
        //     }),
        // };
        // const data = cleanedData.data[0];
        const cleanedData = response.data.data.map((item: any) => {
            return {
                ...item,
                kurs: item.kurs === null ? '' : formatFloat(item.kurs),
                kurs_pajak: item.kurs_pajak === null ? '' : formatFloat(item.kurs_pajak),
            };
        });
        return cleanedData; //data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};
