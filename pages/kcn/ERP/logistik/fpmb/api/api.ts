import { Grid } from '@syncfusion/ej2/grids';
import axios from 'axios';
import moment from 'moment';
// import { prisma } from '@/lib/prisma';

const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

export const FetchDataListFpmb = async (paramList: any, dsGridList: Grid, token: any, onProgress: (progress: number) => void) => {
    // console.log('paramList', paramList);
    try {
        // console.log('token', token);
        onProgress?.(10);
        const responseData = await axios.get(`${apiUrl}/erp/list_fpmb?`, {
            params: paramList,
            headers: { Authorization: `Bearer ${token}` },
            onDownloadProgress: (progressEvent: any) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onProgress(percentCompleted);
            },
        });
        // console.log(responseData.data);
        onProgress?.(90);
        const responseDataListFpb: any[] = responseData?.data.data.map((field: any) => ({
            ...field,
            tgl_fpmb: moment(field.tgl_fpmb).format('YYYY-MM-DD HH:mm:ss'),
            tgl_approval: moment(field.tgl_approval).format('YYYY-MM-DD HH:mm:ss'),
            pengajuan: field.pengajuan === '0' ? 'Batal' : field.pengajuan === '1' ? 'Baru' : field.pengajuan === '2' ? 'Koreksi' : field.pengajuan === '3' ? '-' : field.pengajuan,
        }));
        // console.log('yyy', responseDataListFpb);
        dsGridList.dataSource = responseDataListFpb;
        // dsGridList.refresh();
        // return responseDataListFpb;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

export const fetchFilterItems = async (setFilterItems: any, kode_entitas: any, jenis_dialog: any, token: any) => {
    try {
        const paramList = {
            entitas: kode_entitas,
            param1: jenis_dialog,
        };

        // console.log('paramList ', paramList);

        const responseData = await axios.get(`${apiUrl}/erp/dialog_daftar_rencek_fpmb?`, {
            params: paramList,
            headers: { Authorization: `Bearer ${token}` },
            onDownloadProgress: (progressEvent: any) => {
                //     const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                //     onProgress(percentCompleted);
            },
        });

        const data = responseData.data.data;
        // console.log('data ', data);
        setFilterItems(data); // Asumsikan data yang diterima adalah array
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

export const selectFilterItems = async (kode_entitas: any, no_mb: any, token: any) => {
    try {
        const paramList = {
            entitas: kode_entitas,
            param1: no_mb,
        };
        const responseData = await axios.get(`${apiUrl}/erp/detail_dialog_fpmb?`, {
            params: paramList,
            headers: { Authorization: `Bearer ${token}` },
            onDownloadProgress: (progressEvent: any) => {
                //     const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                //     onProgress(percentCompleted);
            },
        });

        const data = await responseData.data.data;
        // console.log('data dari fungsi', data);
        return data;
        // setSelectedItem(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

export const fetchDataFromDlg = async (kode_entitas: any, jenisFpmb: any, kode_mb: any, token: any) => {
    try {
        const paramList = {
            entitas: kode_entitas,
            param1: jenisFpmb,
            param2: kode_mb,
        };
        // console.log('paramList ', paramList);
        const responseData = await axios.get(`${apiUrl}/erp/detail_fpmb?`, {
            params: paramList,
            headers: { Authorization: `Bearer ${token}` },
            onDownloadProgress: (progressEvent: any) => {
                //     const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                //     onProgress(percentCompleted);
            },
        });

        const data = responseData.data.data;

        // const modifiedData: any[] = data.map((field: any) => ({
        //     ...field,
        //     timbang: parseFloat(field.timbang),
        // }));

        // console.log('data dari fungsi', data);
        // dsGridList.dataSource = data;
        return data;
        // setSelectedItem(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

export const fetchDataRencekBasedOnSelected = async (kode_entitas: any, kode_mb: any, id_mb: any, token: any) => {
    try {
        const paramList = {
            entitas: kode_entitas,
            param1: kode_mb,
            param2: id_mb,
        };

        // console.log('paramList ', paramList);

        const responseData = await axios.get(`${apiUrl}/erp/rencek_fbm?`, {
            params: paramList,
            headers: { Authorization: `Bearer ${token}` },
            onDownloadProgress: (progressEvent: any) => {
                //     const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                //     onProgress(percentCompleted);
            },
        });

        const data = responseData.data.data;
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

export const fetchDataRencekPatahBasedOnSelected = async (kode_entitas: any, kode_rencek: any, token: any) => {
    try {
        const paramList = {
            entitas: kode_entitas,
            param1: kode_rencek,
        };
        // console.log('paramList', paramList);
        const responseData = await axios.get(`${apiUrl}/erp/rencek_patah_fpmb?`, {
            params: paramList,
            headers: { Authorization: `Bearer ${token}` },
            onDownloadProgress: (progressEvent: any) => {
                //     const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                //     onProgress(percentCompleted);
            },
        });

        const data = responseData.data.data;
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

export const fetchListTimbang = async (kode_entitas: any, no_mb: any, token: any) => {
    try {
        const paramList = {
            entitas: kode_entitas,
            param1: no_mb,
        };
        // console.log('paramList', paramList);
        const responseData = await axios.get(`${apiUrl}/erp/list_timbang_fbm?`, {
            params: paramList,
            headers: { Authorization: `Bearer ${token}` },
            onDownloadProgress: (progressEvent: any) => {
                //     const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                //     onProgress(percentCompleted);
            },
        });

        const data = responseData.data.data;

        const modifiedData: any[] = data.map((field: any) => ({
            ...field,
            tgl_timbang: moment(field.tgl_timbang).format('DD-MM-YYYY'),
        }));

        // console.log('modifiedData ', modifiedData);
        return modifiedData;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

export const fetchDataFpmb = async (kode_entitas: any, kode_mb: any, token: any) => {
    try {
        const paramList = {
            entitas: kode_entitas,
            param1: kode_mb,
        };
        // console.log('paramList ', paramList);
        const responseData = await axios.get(`${apiUrl}/erp/rencek_fpmb?`, {
            params: paramList,
            headers: { Authorization: `Bearer ${token}` },
            onDownloadProgress: (progressEvent: any) => {
                //     const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                //     onProgress(percentCompleted);
            },
        });

        const data = responseData.data.data;

        const modifiedData: any[] = data.map((field: any) => ({
            ...field,
            tgl_fpmb: moment(field.tgl_fpmb).format('DD-MM-YYYY HH:mm:ss'),
            tgl_pengajuan: moment(field.tgl_pengajuan).format('DD-MM-YYYY HH:mm:ss'),
            tgl_approval: field.tgl_approval === null || field.tgl_approval === 'null' || field.tgl_approval === '' ? null : moment(field.tgl_approval, 'YYYY-MM-DD HH:mm:ss').format('DD-MM-YYYY'),
        }));

        // console.log('data dari fungsi', data);
        // console.log('modifiedData dari fungsi', modifiedData);

        // dsGridList.dataSource = data;
        return data; //data;
        // setSelectedItem(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

export const cekAvailableData = async (entitas: string, kodeMb: string, token: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

    try {
        const response = await axios.get(`${apiUrl}/erp/rencek_fpmb`, {
            params: {
                entitas,
                param1: kodeMb,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const dataCek = response.data.data;
        if (dataCek.length > 0) {
            return {
                dataCek,
                available: true,
            };
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error get data all entitas pajak:', error);
    }
};

// export const checkExistingFPMB = async (kodeMB: string) => {
//     const fpmb = await prisma.tb_rencek_fpmb.findFirst({
//         where: {
//             kode_mb: kodeMB,
//         },
//         select: {
//             no_fpmb: true,
//         },
//     });
//     return fpmb;
// };

// export const updateFPMBApproval = async ({ kodeMB, approval, userId, date }: { kodeMB: string; approval: 'Y' | 'N'; userId: string; date: Date }) => {
//     await prisma.$transaction([
//         // Update MB table
//         prisma.tb_m_mb.update({
//             where: { kode_mb: kodeMB },
//             data: {
//                 approval,
//                 tgl_update_app: date,
//                 user_approval: userId,
//             },
//         }),
//         // Update FPMB table
//         prisma.tb_rencek_fpmb.update({
//             where: { kode_mb: kodeMB },
//             data: {
//                 approval,
//                 tgl_approval: date,
//                 user_approval: userId,
//             },
//         }),
//     ]);
// };

// export const updateMBStatus = async ({ kodeMB, pengajuan, userId }: { kodeMB: string; pengajuan: string; userId: string }) => {
//     await prisma.tb_m_mb.update({
//         where: { kode_mb: kodeMB },
//         data: {
//             pengajuan,
//             tgl_pengajuan: new Date(),
//             user_pengajuan: userId,
//         },
//     });
// };
