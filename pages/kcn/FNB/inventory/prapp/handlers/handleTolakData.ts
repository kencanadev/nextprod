import axios from 'axios';
import { myAlertGlobal2 } from '@/utils/routines';
import { handleRefreshPraPpList } from './praPpListRefreshHandlers';
import { checkAlasan, handleResetData } from './praPpHandlers';
import moment from 'moment';
import { handleKirimTele } from './exportData';
// import { handleRefreshList } from './handleRefreshList';

export const handleGenerateTolakData = async (currentGrid: any, gridPraPp: any, entitasLogin: any, userIdLogin: any, token: any) => {
    // console.log('currentGrid', currentGrid);
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
    try {
        if (!currentGrid || !currentGrid.dataSource) {
            myAlertGlobal2('currentGrid tidak valid!', 'frmPraPp');
            return;
        }

        if (checkAlasan(currentGrid)) {
            return false;
        }

        const selectedItems = {
            entitas: entitasLogin,
            data: (currentGrid.dataSource as any[])
                .filter((item) => item.pilih === 'Y')
                .map((item) => ({
                    pilih: item.pilih,
                    entitas: item.entitas,
                    kode_preorder: item.kode_preorder,
                    id_preorder: item.id_preorder,
                    tolak: 'Y',
                    userid_tolak: userIdLogin,
                    tgl_update_tolak: moment().format('YYYY-MM-DD HH:mm:ss'),
                    alasan_tolak: item.alasan_tolak,
                })),
        };

        if (selectedItems.data.length === 0) {
            // Updated to check selectedItems.data
            myAlertGlobal2('Pilih data yang akan ditolak!', 'frmPraPp');
            return;
        }

        const missingReason = selectedItems.data.some((item: any) => !item.alasan_tolak); // Updated to check selectedItems.data

        if (missingReason) {
            myAlertGlobal2('Isi alasan penolakan terlebih dahulu!', 'frmPraPp');
            return false;
        }
        // console.log('Update Tolak', selectedItems);

        let responseAPI: any;
        await axios
            .post(`${apiUrl}/erp/generate_tolak_prapp`, selectedItems, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((result) => {
                responseAPI = result.data;
                // setProgressValue(50);
                // console.log('progressValue 50', progressValue);
                // console.log('displayedProgress 50', displayedProgress);
            })
            .catch((e: any) => {
                responseAPI = e.response.data;
            });

        if (responseAPI.status === true) {
            // await handleResetData(currentGrid, gridPraPp, 'auto');
            // currentGrid.refresh();

            // await handleRefreshPraPpList;
            await handleKirimTele(selectedItems.data, token);
            myAlertGlobal2('sukses Generate Tolak Data.', 'frmPraPp');
            return true;
            // await generateNU(entitasLogin, sNoPraPP, '89', moment().format('YYYYMM'));
        }
    } catch (error) {
        console.error('Error in handleGenerateTolakData:', error);
        myAlertGlobal2('Gagal menolak data', 'frmPraPp');
    }
};
