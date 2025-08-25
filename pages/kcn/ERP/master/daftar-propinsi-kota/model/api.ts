const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
import axios from 'axios';
import moment from 'moment';
import { frmNumber } from '@/utils/routines';
import { log } from 'console';

let progressInterval: NodeJS.Timer;

export const loadDataKotaByPropinsi = async (paramList: any, token: any) => {
    try {
        const response = await axios.get(`${apiUrl}/erp/master/daftar-lainnya/list_provinsi`, {
            params: paramList,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const { Provinsi, Kota } = response.data.data;
        // console.log('response.data.data ', response.data.data);
        // console.log('propinsi ', Provinsi);
        const modifiedProvinsi = Provinsi.map((item: any, index: any) => {
            return {
                ...item,
                id_referensi_prop: index + 1,
                old_nama_propinsi: item.nama_propinsi,
            };
        });
        const modifiedKota = Kota.map((item: any, index: any) => {
            return {
                ...item,
                id_referensi_kota: index + 1,
                old_nama_kota: item.nama_kota,
            };
        });
        const objekPropKota = {
            Provinsi: modifiedProvinsi,
            Kota: modifiedKota,
        };
        // // const { Kota, Provinsi } = response.data.data;
        // console.log('objekPropKota ', objekPropKota);
        return objekPropKota; //response.data.data; //data;
    } catch (error) {
        console.error('Gagal memuat data kota:', error);
    }
};
