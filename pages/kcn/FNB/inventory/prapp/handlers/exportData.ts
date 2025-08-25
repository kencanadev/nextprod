import axios from 'axios';
import { entitaspajak, generateNU, myAlertGlobal2, myAlertGlobal3, sendTelegramMessage, settingTelegram } from '@/utils/routines';
import { checkAlasan, handleResetData } from './praPpHandlers';
import moment from 'moment';
import { handleRefreshPraPpList } from './praPpListRefreshHandlers';
import { exit, exitCode } from 'process';

let sNoPraPP: string;

export const handleKirimTele = async (currentGrid: any, token: any) => {
    // console.log('handleKirimTele currentGrid', currentGrid);
    // const filteredItems = (currentGrid.dataSource as any[]).filter((item) => item.pilih === 'Y' && item.tolak === 'Y');
    // console.log('filteredItems', filteredItems);
    // throw exitCode;
    // Use Promise.all to handle multiple asynchronous operations concurrently
    await Promise.all(
        currentGrid.map(async (item: any) => {
            const teleSettings: any[] = await settingTelegram(item.entitas, token);
            // console.log('teleSettings', teleSettings[0].token5);
            if (teleSettings) {
                // Prepare telegram message
                const message =
                    `Informasi PRE ORDER Penolakan HO :\n\n` +
                    `Terdapat barang Pre Order cabang ${item.entitas} yang Ditolak !\n` +
                    `Tanggal : ${moment(item.tgl_preorder).format('DD-MM-YYYY')}\n` +
                    `Nomor Pre Order : ${item.no_preorder}\n` +
                    `No. Barang : ${item.no_item}\n` +
                    `Nama Barang : ${item.diskripsi}\n` +
                    `Alasan : ${item.alasan_tolak}\n\n` +
                    `Segera lakukan pengecekan.\n`;

                // Send messages based on available settings
                const sendMessages = [
                    teleSettings[0].tele_regional && sendTelegramMessage(teleSettings[0].token5, teleSettings[0].tele_regional, `tele_regional ${message}`),
                    teleSettings[0].tele_manager && sendTelegramMessage(teleSettings[0].token5, teleSettings[0].tele_manager, `tele_manager ${message}`),
                ].filter(Boolean); // Filter out any undefined promises
                const results = await Promise.all(sendMessages);
                // console.log('send results', results); // Wait for all messages to be sent
            }
        })
    );
};
// Function to filter and map selected items
const getSelectedItems = async (currentGrid: any, gridPraPp: any, vtbreak: any, entitasLogin: any, isPusat: boolean, userIdLogin: any) => {
    // console.log('vtBreak', vtbreak);
    if (isPusat) {
        // console.log('currentGrid currentGrid', currentGrid);
        const filteredItems = (gridPraPp.dataSource as any[]).filter((item) => item.pilih === 'Y');
        //REVISI
        const filteredItemsBreakDetail = vtbreak; //(vtbreak.dataSource as any[]).filter((item) => item.pilih === 'Y');

        const filteredItemsTolak = (currentGrid.dataSource as any[]).filter((item) => item.pilih === 'Y' && item.tolak === 'Y');
        console.log('filteredItems', filteredItems);
        // let sKodePraPP = GenerateUCode(DOK_PRAPP);
        sNoPraPP = await generateNU(entitasLogin, '', '89', moment().format('YYYYMM'));
        const totalBerat = filteredItems.reduce((sum: any, item: any) => sum + (item.berat_order || 0), 0);
        return {
            entitas: entitasLogin,
            data: {
                kode_prapp: '',
                no_prapp: sNoPraPP, // Updated to match new structure
                tgl_prapp: moment().format('YYYY-MM-DD HH:mm:ss'), // Updated to match new structure
                total_berat: totalBerat, // Updated to match new structure
                keterangan: '', // Updated to match new structure
                status: 'Terbuka', // Updated to match new structure
                userid: userIdLogin, // Updated to match new structure
                tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'), // Updated to match new structure
                detail: isPusat
                    ? filteredItems.map((item: any, index: any) => {
                          const qty = Math.round(item.berat_order / (item.berat || 1)); // Calculate qty
                          return {
                              kode_prapp: '',
                              id_prapp: index + 1, // Set id_prapp based on the order of filteredItems
                              kode_item: item.kode_item,
                              diskripsi: item.diskripsi,
                              berat_order: item.berat_order,
                              berat_sisa: item.berat_sisa,
                              qty: qty, // Set qty
                              qty_sisa: qty, // Set qty_sisa equal to qty
                              qty_batal: 0,
                          };
                      })
                    : [],
                break: filteredItemsBreakDetail.map((item: any, index: any) => ({
                    kode_prapp: '',
                    id_prapp: filteredItems.findIndex((filteredItem) => filteredItem.kode_item === item.kode_item) + 1, // Updated to use index from filteredItems index + 1, // Updated to match new structure
                    entitas: item.entitas,
                    kode_preorder: item.kode_preorder,
                    id_preorder: item.id_preorder,
                    kode_item: item.kode_item,
                    berat_order: item.berat_order,
                    berat_sisa: item.berat_sisa,
                    berat_acc: item.berat_acc,
                    export: isPusat ? 'N' : 'Y',
                })),
                tolakan: filteredItemsTolak.map((item: any, index: any) => {
                    if ((item.tolak = 'Y')) {
                        return {
                            pilih: item.pilih,
                            entitas: item.entitas,
                            kode_preorder: item.kode_preorder,
                            id_preorder: item.id_preorder,
                            tolak: 'Y',
                            userid_tolak: userIdLogin,
                            tgl_update_tolak: moment().format('YYYY-MM-DD HH:mm:ss'),
                            alasan_tolak: item.alasan_tolak,
                        };
                    }
                }),
            },
        };
    } else {
        // console.log('currentGrid currentGrid', currentGrid);
        const filteredItems = (gridPraPp.dataSource as any[]).filter((item) => item.pilih === 'Y');
        const filteredItemsBreakDetail = vtbreak; //dgBreak.filter((item: any) => item.pilih === 'Y' && item.tolak === 'N');
        // console.log('filteredItems else', filteredItems);

        const filteredItemsTolak = (currentGrid.dataSource as any[]).filter((item) => item.pilih === 'Y' && item.tolak === 'Y');
        // console.log('filteredItems else', filteredItems);

        return {
            //   filteredItems.map((item) => {
            detail: filteredItems.map((item: any, index: any) => {
                return {
                    entitas: item.entitas,
                    kode_preorder: item.kode_preorder,
                    id_preorder: item.id_preorder,
                    berat_sisa: item.berat_acc > item.berat_sisa ? 0 : item.berat_acc - item.berat_sisa,
                };
            }),
            entitas: entitasLogin, // Static value for entitas
            break: filteredItemsBreakDetail.map((item: any, index: any) => {
                return {
                    entitas: item.entitas,
                    kode_preorder: item.kode_preorder,
                    id_preorder: item.id_preorder,
                    Export: 'Y',
                };
            }),
            tolakan: filteredItemsTolak.map((item: any, index: any) => {
                if ((item.tolak = 'Y')) {
                    return {
                        pilih: item.pilih,
                        entitas: item.entitas,
                        kode_preorder: item.kode_preorder,
                        id_preorder: item.id_preorder,
                        tolak: 'Y',
                        userid_tolak: userIdLogin,
                        tgl_update_tolak: moment().format('YYYY-MM-DD HH:mm:ss'),
                        alasan_tolak: item.alasan_tolak,
                    };
                }
            }),
            // });
        };
    }
};

export const exportToCabang = async (currentGrid: any, gridPraPp: any, vtbreak: any, entitasLogin: any, userIdLogin: any, token: any) => {
    let responseAPI: any;
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
    // console.log('vtBreak', vtbreak);
    // throw exitCode;

    const selectedItems = await getSelectedItems(currentGrid, gridPraPp, vtbreak, entitasLogin, false, userIdLogin);

    // console.log('exportToCabang', selectedItems);
    // await handleKirimTele(selectedItems.tolakan, token);
    // throw exitCode;
    await axios
        .post(`${apiUrl}/erp/export_to_cabang_prapp`, selectedItems, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        .then((result) => {
            responseAPI = result.data;
            // setProgressValue(50);
        })
        .catch((e: any) => {
            responseAPI = e.response.data;
        });

    console.log('responseAPI', responseAPI);

    if (responseAPI.status === true) {
        await handleKirimTele(selectedItems.tolakan, token);
        await handleResetData(currentGrid, gridPraPp, 'auto');

        currentGrid.refresh();
        // await handleRefreshPraPpList;
        await myAlertGlobal2('sukses Generate Data.', 'frmPraPp');
        // return true;
        return responseAPI;
    } else {
        return responseAPI;
    }
};

// New reusable function to handle export logic
export const exportToPusat = async (currentGrid: any, gridPraPp: any, vtbreak: any, entitasLogin: any, userIdLogin: any, token: any) => {
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

    if (checkAlasan(currentGrid)) {
        return false;
    }

    // Check if gridPraPp.dataSource is an array before using some
    if (!Array.isArray(gridPraPp.dataSource)) {
        myAlertGlobal2('gridPraPp.dataSource is not a valid array!', 'frmPraPp');
        gridPraPp.dataSource = [];
    }

    const hasSelectedItems = (gridPraPp.dataSource as any[]).some((item: any) => item.pilih === 'Y');
    const hasSelectedItemsTolak = (currentGrid.dataSource as any[]).some((item: any) => item.tolak === 'Y');

    if (!hasSelectedItems) {
        myAlertGlobal2('Data Order Pre Order Cabang belum dipilih / dipindahkan!', 'frmPraPp');
        return;
    }

    if (hasSelectedItemsTolak) {
        myAlertGlobal2('Ada data Tolak', 'frmPraPp');
    }

    const selectedItems = await getSelectedItems(currentGrid, gridPraPp, vtbreak, entitasLogin, true, userIdLogin);
    // console.log('exportToPusat', selectedItems);
    // Confirm refresh
    if (await myAlertGlobal3('Apakah data akan di Generate sekarang ?', 'frmPraPp')) {
        // return;

        const res = await exportToCabang(currentGrid, gridPraPp, vtbreak, entitasLogin, userIdLogin, token);
        // console.log('res', res.status);
        // throw exitCode;
        if (res.status) {
            let responseAPI: any;
            await axios
                .post(`${apiUrl}/erp/export_to_prapp_pusat`, selectedItems, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                .then((result) => {
                    responseAPI = result.data;
                    // setProgressValue(50);
                })
                .catch((e: any) => {
                    responseAPI = e.response.data;
                });

            if (responseAPI.status === true) {
                await generateNU(entitasLogin, sNoPraPP, '89', moment().format('YYYYMM'));
                const res = await exportToCabang(currentGrid, gridPraPp, vtbreak, entitasLogin, userIdLogin, token);
                return res;
            }
        } else {
            myAlertGlobal2(
                `DATA GAGAL DI GENERATE.
                Error : ${res.error}
                message : ${res.message}`,
                'frmPraPp'
            );
        }
    }
};
