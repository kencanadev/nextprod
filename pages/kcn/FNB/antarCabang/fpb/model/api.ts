import axios from 'axios';
import moment from 'moment';
import { frmNumber } from '@/utils/routines';
import { log } from 'console';
import { Grid } from '@syncfusion/ej2/grids';

const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

// const FetchDataListFpb = async (paramList: any, dsGridList: Grid, token: any, onProgress?: (progress: number) => void) => {
//     // console.log('paramList', paramList);
//     try {
//         // console.log('token', token);
//         onProgress?.(10);
//         const responseData = await axios.get(`${apiUrl}/erp/list_fpb?`, {
//             params: paramList,
//             headers: { Authorization: `Bearer ${token}` },
//             onDownloadProgress: (progressEvent) => {
//                 if (progressEvent.total) {
//                     const progress = Math.round((progressEvent.loaded * 80) / progressEvent.total) + 10;
//                     onProgress?.(progress);
//                 }
//             },
//         });
//         // console.log(responseData.data);
//         onProgress?.(90);

//         const responseDataListFpb: any[] = responseData?.data.data.map((field: any) => ({
//             ...field,
//             netto_mu: parseFloat(field.netto_mu),
//             total_berat: parseFloat(field.total_berat),
//         }));
//         // console.log('yyy', responseDataListFpb);
//         dsGridList.dataSource = responseDataListFpb;
//         // dsGridList.refresh();
//         // return responseDataListFpb;
//     } catch (error) {
//         console.error('Error fetching data:', error);
//         throw error;
//     }
// };
const FetchDataListFpb = async (paramList: any, dsGridList: Grid, token: any, onProgress: (progress: number) => void) => {
    try {
        onProgress?.(10);
        const responseData = await axios.get(`${apiUrl}/erp/list_fpb?`, {
            params: paramList,
            headers: { Authorization: `Bearer ${token}` },
            onDownloadProgress: (progressEvent: any) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onProgress(percentCompleted);
            },
        });
        onProgress?.(90);

        const responseDataListFpb: any[] = responseData?.data.data.map((field: any) => ({
            ...field,
            netto_mu: parseFloat(field.netto_mu),
            total_berat: parseFloat(field.total_berat),
        }));
        dsGridList.dataSource = responseDataListFpb;
        // dsGridList.setProperties({ dataSource: responseDataListFpb });
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

const FetchDetailDok = async (kode_dok: any, jenisTab: any, kode_entitas: any, token: any): Promise<any[]> => {
    const response = await axios.get(`${apiUrl}/erp/detail_dok_fpb?`, {
        params: {
            entitas: kode_entitas,
            param1: kode_dok,
            param2: 'all',
        },
        headers: { Authorization: `Bearer ${token}` },
    });
    const listDetailDokumen = response.data.data;
    // console.log(listDetailDokumen);

    return listDetailDokumen;
};

const FetchQtyMaksimum = async (kodeEntitas: any, grup: any, kelompok: any, tgl: any, token: any) => {
    const response = await axios.get(`${apiUrl}/erp/cek_quantity_maksimum`, {
        params: {
            entitas: kodeEntitas,
            param1: grup,
            param2: kelompok,
            param3: moment(tgl).format('YYYY-MM-DD'),
        },
        headers: { Authorization: `Bearer ${token}` },
    });
    // console.log('paramccc', {
    //     params: {
    //         entitas: kodeEntitas,
    //         param1: grup,
    //         param2: kelompok,
    //         param3: moment(tgl).format('YYYY-MM-DD'),
    //     },
    // });
    // console.log({});

    const listDetailDokumen = response.data.data;
    // console.log('listDetailDokumen ', listDetailDokumen);

    return listDetailDokumen;
};

const FetchDataFpb = async (paramList: any, token: any) => {
    try {
        const responseData = await axios.get(`${apiUrl}/erp/master_detail_fpb?`, {
            params: paramList,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        // console.log(responseData);

        const { master, detail } = responseData.data.data;
        const modifiedMaster = master.map((item: any) => {
            return {
                ...item,
                kurs: frmNumber(parseFloat(item.kurs).toFixed(2)),
                kurs_pajak: frmNumber(parseFloat(item.kurs_pajak).toFixed(2)),
                total_mu: frmNumber(parseFloat(item.total_mu)),
                diskon_dok_mu: frmNumber(parseFloat(item.diskon_dok_mu)),
                total_diskon_mu: frmNumber(parseFloat(item.total_diskon_mu)),
                total_pajak_mu: frmNumber(parseFloat(item.total_pajak_mu)),
                kirim_mu: frmNumber(parseFloat(item.kirim_mu)),
                netto_mu: frmNumber(parseFloat(item.netto_mu)),
                total_rp: frmNumber(parseFloat(item.total_rp)),
                diskon_dok_rp: frmNumber(parseFloat(item.diskon_dok_rp)),
                total_diskon_rp: frmNumber(parseFloat(item.total_diskon_rp)),
                total_pajak_rp: frmNumber(parseFloat(item.total_pajak_rp)),
                kirim_rp: frmNumber(parseFloat(item.kirim_rp)),
                netto_rp: frmNumber(parseFloat(item.netto_rp)),
                // total_berat: 1611.5999755859375,
            };
        });
        const modifiedDetail = detail.map((item: any) => {
            return {
                ...item,
                harga_mu: parseFloat(item.harga_mu),
                jumlah_mu: parseFloat(item.jumlah_mu),
                jumlah_rp: parseFloat(item.jumlah_mu),
                harga_jual_mu: parseFloat(item.harga_jual_mu),
                harga_beli_mu: parseFloat(item.harga_beli_mu),
                harga5: parseFloat(item.harga5),
                brt: parseFloat(item.brt),
                berat: parseFloat(item.berat),
                outstanding: parseFloat(item.outstanding),
            };
        });

        const objFpb = {
            master: modifiedMaster,
            detail: modifiedDetail,
        };

        return objFpb;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

const FetchCustomerMapping = async (kode_entitas_pusat: any, kode_entitas_beli: any, token: any): Promise<any[]> => {
    const response = await axios.get(`${apiUrl}/erp/customer_mapping?`, {
        params: {
            entitas: kode_entitas_pusat,
            param1: kode_entitas_beli,
        },
        headers: { Authorization: `Bearer ${token}` },
    });
    const listDetailDokumen = response.data.data;
    // console.log(listDetailDokumen);

    return listDetailDokumen;
};

const FetchDepartemen = async (kode_entitas_pusat: any): Promise<any[]> => {
    const response = await axios.get(`${apiUrl}/erp/get_kode_kerja?`, {
        params: {
            entitas: kode_entitas_pusat,
        },
    });
    const listDetailDokumen = response.data.data;
    // console.log(listDetailDokumen);

    return listDetailDokumen;
};

export { FetchDataListFpb, FetchDetailDok, FetchDataFpb, FetchQtyMaksimum, FetchCustomerMapping, FetchDepartemen };
