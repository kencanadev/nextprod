const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
import axios from 'axios';
import moment from 'moment';
import { frmNumber } from '@/utils/routines';
import { log } from 'console';

let progressInterval: NodeJS.Timer;

export const DataListView = async (paramList: any, token: any) => {
    try {
        const response = await axios.get(`${apiUrl}/erp/master/daftar-lainnya/list_alasan`, {
            params: paramList,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        // console.log('response ', response);
        const modifiedData = response.data.data.map((item: any, index: any) => {
            return {
                ...item,
                id_daftar: index + 1,
                alasan_lama: item.alasan,
            };
        });

        // console.log('modifiedData ', modifiedData);
        return modifiedData;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};
