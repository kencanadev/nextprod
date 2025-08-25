import { Dispatch, SetStateAction } from 'react';
import moment from 'moment';
import { generateNU, myAlertGlobal2, myAlertGlobal3 } from '@/utils/routines';
import { exitCode } from 'process';
import axios from 'axios';
import { handleRefreshPraPpList } from './praPpListRefreshHandlers';
import { handleRefreshList } from '../functions/praPpFunctions';

interface PraPpListHandlerProps {
    setSelectedOption: Dispatch<SetStateAction<string>>;
    setDate1PraPpList: Dispatch<SetStateAction<moment.Moment>>;
    setDate2PraPpList: Dispatch<SetStateAction<moment.Moment>>;
    setNamaBarangPraPpList: Dispatch<SetStateAction<string>>;
    setIsNamaBarangPraPpChecked: Dispatch<SetStateAction<boolean>>;
    setNoPraPpList: Dispatch<SetStateAction<string>>;
    setIsNoPraPpListChecked: Dispatch<SetStateAction<boolean>>;
}

// const API_URL = 'https://your-api-endpoint.com/api/prapp-break'; // Replace with your actual API endpoint
const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

export const createPraPpListHandlers = ({
    setSelectedOption,
    setDate1PraPpList,
    setDate2PraPpList,
    setNamaBarangPraPpList,
    setIsNamaBarangPraPpChecked,
    setNoPraPpList,
    setIsNoPraPpListChecked,
}: PraPpListHandlerProps) => {
    const handleOptionChange = (value: string) => {
        setSelectedOption(value);
    };

    const handleTgl = async (date: any, tipe: string, setIsTanggalPraPpListChecked: Function) => {
        if (tipe === 'tanggalAwal') {
            setDate1PraPpList(date);
            setIsTanggalPraPpListChecked(true);
        } else {
            setDate2PraPpList(date);
            setIsTanggalPraPpListChecked(true);
        }
    };

    const handleNamaBarangPraPpInputChange = (value: any) => {
        setNamaBarangPraPpList(value);
        setIsNamaBarangPraPpChecked(value.length > 0);
    };

    const handleNoInputChange = (value: any) => {
        setNoPraPpList(value);
        setIsNoPraPpListChecked(value.length > 0);
    };

    const exportToGrouping = async (selectedItems: any, token: any, entitasLogin: any, userId: any, filters: any, setIsLoadingPraPpList: any, setProgressValue: any) => {
        // Show progress
        const progress = { max: 0, position: 0 }; // Replace with actual progress handling
        // console.log('Export To Pusat...');

        try {
            let sTotalBeratAcc = 0;
            let scek = 0;
            let sKodePraPP = '';
            let sidprapp = 0;
            let sKodePreOrder = '';
            let sidPreOrder = 0;
            let sket = '';
            let reqBody: any;
            let data = [];

            for (const item of selectedItems.dataSource as any[]) {
                // Update progress
                progress.position += 1;
                // console.log(`Processing item ${progress.position}`);
                if (item.pilih === 'Y') {
                    // Implement your database logic here
                    data.push(item);
                }
            }
            reqBody = {
                userid: userId,
                records: data,
                entitas: entitasLogin,
            };
            const existingRecords = await axios.post(`${apiUrl}/erp/grouping_prapplist`, reqBody, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            // console.log('Export successful', existingRecords.status);

            if (existingRecords.data.status === true) {
                // handleRefreshPraPpList;
                await handleRefreshList('praPpList', selectedItems, apiUrl, token, filters, setIsLoadingPraPpList, setProgressValue).then(async (_) => {
                    setTimeout(async () => {
                        await myAlertGlobal2('Data berhasil di grouping', 'frmPraPp');
                    }, 2000);
                });
            } else {
                myAlertGlobal2(`Data gagal di grouping ${existingRecords.data.message}`, 'frmPraPp');
            }
        } catch (error) {
            console.error('Data Pra PP Gagal di Export ke Pusat!', error);
        } finally {
            // Close progress
            console.log('Progress closed');
        }
    };

    const handleGroupingClick = async (currentGrid: any, token: any, entitasLogin: any, userId: any, filters: any, setIsLoadingPraPpList: any, setProgressValue: any) => {
        // console.log('currentGrid tab PraPP List', currentGrid);

        const confirmed = await myAlertGlobal3('Apakah data akan di Grouping sekarang?', 'frmPraPp');

        // console.log('confirmed', confirmed);
        if (!confirmed) return;

        let sAda = 0;
        let sItem = 0;
        let sBeratPO = 0;
        let sNoItem = '';

        for (const item of currentGrid.dataSource as any[]) {
            if (item.pilih === 'Y') {
                sAda += 1;
                if (item.berat_sp > 0) {
                    sBeratPO = 1;
                }
            }

            if (sAda === 1 && item.pilih === 'Y') {
                sNoItem = item.no_item;
            } else if (sAda > 1 && item.pilih === 'Y') {
                if (sNoItem !== item.no_item) {
                    sItem = 1;
                }
            }
        }

        // throw exitCode;
        if (sBeratPO === 1) {
            // showMessage('Data sudah dialokasi PO Pusat!');
            myAlertGlobal2('Data sudah dialokasi PO Pusat!', 'frmPraPp');

            return;
        }

        if (sItem === 1) {
            // showMessage('No Barang Pra PP harus sama..!');
            myAlertGlobal2('No Barang Pra PP harus sama..!', 'frmPraPp');

            return;
        }

        if (sAda === 1) {
            // showMessage('Data yang dipilih harus lebih dari satu.!');
            myAlertGlobal2('Data yang dipilih harus lebih dari satu.!', 'frmPraPp');

            return;
        }

        if (sAda === 0) {
            // showMessage('Data Pra PP belum dipilih..!');
            myAlertGlobal2('Data Pra PP belum dipilih..!', 'frmPraPp');

            return;
        } else {
            exportToGrouping(currentGrid, token, entitasLogin, userId, filters, setIsLoadingPraPpList, setProgressValue); // Implement this function as needed
        }
    };

    const exportToPPPusat = async (selectedItems: any, token: any, entitasLogin: any, userId: any, filters: any, setIsLoadingPraPpList: any, setProgressValue: any) => {
        // Show progress
        const progress = { max: 0, position: 0 }; // Replace with actual progress handling
        // console.log('exportToPPPusat...', selectedItems);

        try {
            // Initialize variables
            let sKodePP = ''; // Generate unique code for PP
            let sNoPP = ''; // Generate unique number for PP
            let sKodeDept = ''; // Department code
            let sKodeKerja = ''; // Work code
            let sno = 0; // Counter for detail records
            let data = [];
            let reqBody: any;
            let responseAPI: any;

            // Show progress for header export
            // progress.max = 1; // Set max for header export
            // progress.position = 0;

            const response = await axios.get(`${apiUrl}/erp/get_kode_kerja?`, {
                params: {
                    entitas: entitasLogin,
                },
            });
            const listDeptKerja = response.data.data;

            // Generate unique codes
            // sKodePP = await generateUniqueCode(); // Replace with actual function to generate code
            sNoPP = await generateNU(entitasLogin, '', '01', moment().format('YYYYMM')); // Replace with actual function to generate number
            console.log('sNoPP', sNoPP);

            // Fetch department and work codes
            // const { dept, kerja } = await listDetailDokumen(); // Replace with actual function to fetch codes
            sKodeDept = listDeptKerja[0].dept;
            sKodeKerja = listDeptKerja[0].kerja;

            const filteredItems = (selectedItems.dataSource as any[]).filter((item) => item.pilih === 'Y');
            // console.log('filteredItems', filteredItems);
            progress.max = filteredItems.length; // Set max for detail export
            progress.position = 0;

            for (const item of selectedItems.dataSource as any[]) {
                // Update progress
                sno += 1;
                // console.log(`Processing item ${progress.position}`);
                if (item.pilih === 'Y') {
                    // Implement your database logic here
                    data.push({
                        kode_pp: '', // Corrected syntax for object property
                        id_pp: sno,
                        id: sno,
                        id_ket: sno,
                        stok: 'Y',
                        kode_item: item.kode_item,
                        diskripsi: item.diskripsi,
                        satuan: item.satuan,
                        qty: Math.round((Math.round(item.berat_order / item.berat) * 110) / 100),
                        sat_std: item.satuan,
                        qty_std: Math.round((Math.round(item.berat_order / item.berat) * 110) / 100), // Added missing definition for qty_std
                        qty_sisa: Math.round((Math.round(item.berat_order / item.berat) * 110) / 100), // Added missing definition for qty_sisa
                        qty_batal: 0,
                        tgl_butuh: moment().format('YYYY-MM-DD HH:mm:ss'), // Added definition for now
                        kode_prapp: item.kode_prapp,
                        id_prapp: item.id_prapp,
                        fpp_qty: item.berat_order,
                        fpp_diameter: item.tebal.toFixed(2),
                        // fpp_diameter: Math.round(item.tebal),
                        fpp_kg: item.berat,
                        fpp_btg: Math.round(item.berat_order / item.berat),
                    });
                }
                progress.position += 1;
            }

            reqBody = {
                entitas: entitasLogin,
                kode_pp: '',
                no_pp: sNoPP,
                tgl_pp: moment().format('YYYY-MM-DD HH:mm:ss'),
                dokumen: 'persediaan',
                peminta: userId,
                kode_dept: sKodeDept,
                keterangan: '[PRA PP]',
                status: 'Terbuka',
                userid: userId,
                tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
                produksi: 'Y',
                detail: data,
            };

            // console.log('approved', reqBody);
            // throw exitCode;

            await axios
                .post(`${apiUrl}/erp/approval_prapp`, reqBody, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                .then((result) => {
                    responseAPI = result.data;
                    setProgressValue(50);
                    // console.log('progressValue 50', progressValue);
                    // console.log('displayedProgress 50', displayedProgress);
                })
                .catch((e: any) => {
                    responseAPI = e.response.data;
                });

            if (responseAPI.status === true) {
                await generateNU(entitasLogin, sNoPP, '01', moment().format('YYYYMM')); // Replace with actual function to generate number
                // handleRefreshPraPpList;
                await handleRefreshList('praPpList', selectedItems, apiUrl, token, filters, setIsLoadingPraPpList, setProgressValue).then(async (_) => {
                    setTimeout(async () => {
                        await myAlertGlobal2('Data berhasil di approved', 'frmPraPp');
                    }, 2000);
                });
            } else {
                myAlertGlobal2(
                    `DATA GAGAL DIAPPROVED !
                    Response ${responseAPI.error}
                    Response Message : ${responseAPI.message}`,
                    'frmPraPp'
                );
            }
        } catch (error) {
            console.error('Data Gagal di Export ke PP Pusat!', error);
            // Rollback transaction
            // await rollbackTransaction();
        } finally {
            // Close progress
            console.log('Progress closed');
        }
    };

    const handleApprovalClick = async (currentGrid: any, token: any, entitasLogin: any, userId: any, filters: any, setIsLoadingPraPpList: any, setProgressValue: any) => {
        const confirmed = await myAlertGlobal3('Apakah data akan di Approve sekarang?', 'frmPraPp');

        if (!confirmed) return;

        let sAda = 0;

        for (const item of currentGrid.dataSource as any[]) {
            if (item.pilih === 'Y') {
                sAda = 1;
                break;
            }
        }

        if (sAda === 0) {
            myAlertGlobal2('Data Pra PP belum dipilih..!', 'frmPraPp');
            return;
        } else {
            await exportToPPPusat(currentGrid, token, entitasLogin, userId, filters, setIsLoadingPraPpList, setProgressValue); // Implement this function as needed
        }
    };

    return {
        handleOptionChange,
        handleTgl,
        handleNamaBarangPraPpInputChange,
        handleNoInputChange,
        handleGroupingClick,
        handleApprovalClick,
    };
};
