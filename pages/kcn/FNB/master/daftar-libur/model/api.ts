const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
import axios from 'axios';
import moment from 'moment';
import { frmNumber } from '@/utils/routines';
import { log } from 'console';

let progressInterval: NodeJS.Timer;

export const DataListView = async (paramList: any, token: any) => {
    try {
        const response = await axios.get(`${apiUrl}/erp/master/daftar-lainnya/list_libur?`, {
            params: paramList,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const modifiedData = response.data.data.map((item: any, index: any) => {
            return {
                ...item,
                id_referensi: index + 1,
                tgl_libur_lama: item.tgl_libur,
            };
        });

        return modifiedData;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

export const fetchHariLibur = async (tahun: any) => {
    try {
        // const response = await axios.get(`https://api.fazriansyah.eu.org/?year=${tahun}`);
        const response = await axios.get(`https://libur.deno.dev/api?year=${tahun}`);

        const cleanedData = response.data.map((item: any, index: any) => {
            //   return {
            //       ...item,
            //       id_libur: index + 1,
            //       tgl_libur: item.Tanggal, //item.date,
            //       keterangan: item.Keterangan, //item.name,
            //       userid: 'otomatis',
            //       tgl_update: moment().format('YYYY-MM-DD hh:mm:ss'),
            //   };
            return {
                ...item,
                id_referensi: index + 1,
                tgl_libur: item.date,
                tgl_libur_lama: item.date,
                keterangan: item.name,
                userid: 'otomatis',
                tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
            };
        });
        return cleanedData; // Array of { Tanggal: '2025-01-01', Keterangan: 'Tahun Baru Masehi' }
    } catch (error) {
        console.error('Gagal mengambil data hari libur:', error);
        return [];
    }
};
