import React, { useRef, useState } from 'react';

import withReactContent from 'sweetalert2-react-content';
import styles from '../customStyles/list.module.css';
import swal from 'sweetalert2';
import moment from 'moment';
import { Token } from '@mui/icons-material';
import { Grid } from '@syncfusion/ej2-react-grids';
import { Tooltip, TooltipComponent, TooltipEventArgs } from '@syncfusion/ej2-react-popups';
import { FocusInEventArgs, ChangeEventArgs as ChangeEventArgsInput, TextBoxComponent, UploaderComponent, SelectedEventArgs, FileInfo } from '@syncfusion/ej2-react-inputs';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { frmNumber, myAlertGlobal } from '@/utils/routines';
import { resExcel, resPdf, resUnknow, resWord, resZip } from '../../bm/component/resource';
import JSZip from 'jszip';
import axios from 'axios';
import Swal from 'sweetalert2';
import { cekTglTransaksiApi, getDaftarBankApi, getEntitasAllApi, getExistingTrx, getQuBank, getQuFpp, getQuPhe, getQuUangMuka, getQuVch, JurnalApi, ListDataApi, TrxBankEditApi } from '../model/api';

const swalToast = swal.mixin({
    toast: true,
    position: 'center',
    customClass: {
        popup: 'colored-toast',
    },
    showConfirmButton: false,
    timer: 3000,
    showClass: {
        popup: `
          animate__animated
          animate__zoomIn
          animate__faster
        `,
    },
    hideClass: {
        popup: `
          animate__animated
          animate__zoomOut
          animate__faster
        `,
    },
});
const roundUp = (value: number) => Math.ceil(value * 100) / 100;

const filterRecordsByDate = async (recordsTransaksi: any, tglTransaksi: any) => {
    let vtA: any[] = [];

    for (const record of tglTransaksi) {
        // console.log('record ', record);
        const filterTrxBankList = recordsTransaksi.filter((item: any) => item.tgl_transaksi === record.tgl_transaksi);
        if (filterTrxBankList.length > 0) {
            const objectVT: any = {
                kode_transaksi_1: '',
                no_transaksi_1: '',
                tgl_transaksi: record.tgl_transaksi,
                total_BRI_1: '',
                kode_transaksi_2: '',
                no_transaksi_2: '',
                total_BRI_2: '',
                kode_transaksi_3: '',
                no_transaksi_3: '',
                total_BCA_3: '',
                kode_transaksi_4: '',
                no_transaksi_4: '',
                total_BCA_4: '',
                kode_transaksi_5: '',
                no_transaksi_5: '',
                total_BCA_5: '',
                total_All: '',
                userid: filterTrxBankList[0].userid,
                status_jurnal_1: '',
                status_jurnal_2: '',
                status_jurnal_3: '',
                status_jurnal_4: '',
                status_jurnal_5: '',
                warna1: '',
                warna2: '',
                warna3: '',
                warna4: '',
                warna5: '',
            };

            let recordForDate = { ...objectVT };
            // console.log('filterTrxBankList forEach ', filterTrxBankList);

            filterTrxBankList.forEach((trx: any) => {
                if (trx.transaksi_bank === 'SETORAN CAB') {
                    if (trx.transaksi_ke === 1) {
                        recordForDate = {
                            ...recordForDate,
                            kode_transaksi_1: trx.kode_transaksi,
                            no_transaksi_1: trx.no_transaksi,
                            total_BRI_1: roundUp(trx.total_bayar),
                            status_jurnal_1: trx.status_jurnal,
                            warna1: trx.warna,
                        };
                    } else if (trx.transaksi_ke === 2) {
                        recordForDate = {
                            ...recordForDate,
                            kode_transaksi_2: trx.kode_transaksi,
                            no_transaksi_2: trx.no_transaksi,
                            total_BRI_2: roundUp(trx.total_bayar),
                            status_jurnal_2: trx.status_jurnal,
                            warna2: trx.warna,
                        };
                    }
                } else if (trx.transaksi_bank === 'BCA') {
                    if (trx.transaksi_ke === 1) {
                        recordForDate = {
                            ...recordForDate,
                            kode_transaksi_3: trx.kode_transaksi,
                            no_transaksi_3: trx.no_transaksi,
                            total_BCA_3: roundUp(trx.total_bayar),
                            status_jurnal_3: trx.status_jurnal,
                            warna3: trx.warna,
                        };
                    } else if (trx.transaksi_ke === 2) {
                        recordForDate = {
                            ...recordForDate,
                            kode_transaksi_4: trx.kode_transaksi,
                            no_transaksi_4: trx.no_transaksi,
                            total_BCA_4: roundUp(trx.total_bayar),
                            status_jurnal_4: trx.status_jurnal,
                            warna4: trx.warna,
                        };
                    } else if (trx.transaksi_ke === 3) {
                        recordForDate = {
                            ...recordForDate,
                            kode_transaksi_5: trx.kode_transaksi,
                            no_transaksi_5: trx.no_transaksi,
                            total_BCA_5: roundUp(trx.total_bayar),
                            status_jurnal_5: trx.status_jurnal,
                            warna5: trx.warna,
                        };
                    }
                }
            });

            // console.log('recordForDate ', recordForDate);

            // vtA.push(recordForDate);

            // Calculate total_All
            const total = [recordForDate.total_BRI_1 || 0, recordForDate.total_BRI_2 || 0, recordForDate.total_BCA_3 || 0, recordForDate.total_BCA_4 || 0, recordForDate.total_BCA_5 || 0].reduce(
                (sum, val) => sum + (parseFloat(val) || 0),
                0
            );

            recordForDate.total_All = roundUp(total);
            vtA.push(recordForDate);
        }
    }
    return vtA;
    // setTimeout(() => {
    //     console.log('vtA ', vtA);
    //     setRecordsDataDetailList(vtA);
    // }, 500);
    // dgTrxBankList.refresh();
};
export const handleRefreshDataList = async (
    paramList: any,
    setRecordsDataDetailList: Function,
    setRecordsTransaksi: Function,
    setCekTglTransaksi: Function,
    dsGridList: Grid,
    token: any,
    jenis: any,
    setIsLoadingProgress: Function,
    setProgressValue: Function,
    setDisplayedProgress: Function,
    setLoadingMessage: Function
) => {
    // console.log('paramList ', paramList);
    try {
        setIsLoadingProgress(true);
        setProgressValue(0);
        setDisplayedProgress(0);
        setLoadingMessage('Fetching data...');

        await ListDataApi(paramList, token, jenis, (progress: number) => {
            setProgressValue(progress);
            setDisplayedProgress(Math.round(progress));

            if (progress < 30) {
                setLoadingMessage('Initializing data quView...');
            } else if (progress < 60) {
                setLoadingMessage('Processing quView...');
            } else if (progress < 90) {
                setLoadingMessage('Almost complete quView...');
            } else {
                setLoadingMessage('Finalizing quView...');
            }
        })
            .then(async (result: any) => {
                await cekTglTransaksiApi(paramList, token).then(async (result2: any) => {
                    await filterRecordsByDate(result, result2).then((vtA: any) => {
                        // console.log('result vtA ', vtA);
                        // setRecordsDataDetailList(vtA);
                        setTimeout(() => {
                            const modifiedvtA = vtA.map((item: any, index: any) => ({
                                ...item,
                                total_All: item.total_All === '' || item.total_All === null ? 0 : item.total_All,
                                total_BCA_3: item.total_BCA_3 === '' || item.total_BCA_3 === null ? 0 : item.total_BCA_3,
                                total_BCA_4: item.total_BCA_4 === '' || item.total_BCA_4 === null ? 0 : item.total_BCA_4,
                                total_BCA_5: item.total_BCA_5 === '' || item.total_BCA_5 === null ? 0 : item.total_BCA_5,
                                total_BRI_1: item.total_BRI_1 === '' || item.total_BRI_1 === null ? 0 : item.total_BRI_1,
                                total_BRI_2: item.total_BRI_2 === '' || item.total_BRI_2 === null ? 0 : item.total_BRI_2,
                            }));
                            // console.log('modifiedvtA ', modifiedvtA);

                            setRecordsDataDetailList(modifiedvtA);
                        }, 500);
                        setCekTglTransaksi(result2);
                    });
                    // dsGridList.refresh();
                    // dsGridList.dataSource = vtA;
                    // console.log('result2 ', result2);
                    //tampung di state
                    // setCekTglTransaksi(result2);
                });

                setProgressValue(100);
                setDisplayedProgress(100);
                setLoadingMessage('Complete!');

                setTimeout(() => {
                    setIsLoadingProgress(false);
                    setProgressValue(0);
                    setDisplayedProgress(0);
                }, 500);
            })
            .catch((error) => {
                setIsLoadingProgress(false);
                setProgressValue(0);
                setDisplayedProgress(0);
                console.error('Error:', error.message);
            });

        // Hapus setTimeout kosong karena tidak diperlukan
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

export const handleCheckboxChange = (name: any, value: any, setFormListState: any) => {
    setFormListState((prevFormData: any) => ({
        ...prevFormData,
        [name]: value,
    }));
};

export const handleInputChange = (name: any, value: any, cekBoxname: any, setFormListState: Function) => {
    setFormListState((prevFormData: any) => ({
        ...prevFormData,
        [name]: value,
        [cekBoxname]: value !== '',
        // [`checked_${name}`]: value !== '',
    }));
};

export const handleEdit = async (
    setIsLoadingProgress: Function,
    setProgressValue: Function,
    setDisplayedProgress: Function,
    setLoadingMessage: Function,
    kode_entitas: string,
    masterKodeDokumen: string,
    token: string,
    setHeaderState: Function,
    setDetailState: Function,
    setBankDetailState: Function
    // dsGridDetail: Grid
) => {
    try {
        setIsLoadingProgress(true);
        setProgressValue(0);
        setDisplayedProgress(0);
        setLoadingMessage('Fetching data...');

        const paramList = {
            entitas: kode_entitas,
            param1: masterKodeDokumen,
        };

        const result = await TrxBankEditApi(paramList, token, (progress) => {
            setProgressValue(progress);
            setDisplayedProgress(Math.round(progress));

            if (progress < 30) {
                setLoadingMessage('Initializing data Edit...');
            } else if (progress < 60) {
                setLoadingMessage('Processing Edit...');
            } else if (progress < 90) {
                setLoadingMessage('Almost complete Edit...');
            } else {
                setLoadingMessage('Finalizing Edit...');
            }
        });

        const { master, detail, bankDetail } = result;

        setHeaderState(master);
        setDetailState(detail);
        setBankDetailState(bankDetail);

        setProgressValue(100);
        setDisplayedProgress(100);
        setLoadingMessage('Complete!');

        setTimeout(() => {
            setIsLoadingProgress(false);
            setProgressValue(0);
            setDisplayedProgress(0);
        }, 500);

        // if (result && result.detail && dsGridDetail) {

        //     dsGridDetail.dataSource = result.detail;
        //     dsGridDetail.refresh();
        // }

        return result;
    } catch (error) {
        setIsLoadingProgress(false);
        setProgressValue(0);
        setDisplayedProgress(0);
        console.error('Error in handleEdit:', error);
        throw error;
    }
};

export const handleJurnal = async (
    setIsLoadingProgress: Function,
    setProgressValue: Function,
    setDisplayedProgress: Function,
    setLoadingMessage: Function,
    kode_entitas: string,
    masterKodeDokumen: string,
    token: string,
    masterDataState: string,
    setHeaderState: Function,
    setDetailState: Function,
    setBankDetailState: Function,
    setJurnalState: Function,
    setJurnalDetailState: Function
    // dsGridDetail: Grid
) => {
    try {
        setIsLoadingProgress(true);
        setProgressValue(0);
        setDisplayedProgress(0);
        setLoadingMessage('Fetching data...');

        const paramList = {
            entitas: kode_entitas,
            param1: masterKodeDokumen,
        };

        const result = await JurnalApi(masterDataState, paramList, token, (progress: any) => {
            setProgressValue(progress);
            setDisplayedProgress(Math.round(progress));

            if (progress < 30) {
                setLoadingMessage('Initializing data jurnal...');
            } else if (progress < 60) {
                setLoadingMessage('Processing jurnal...');
            } else if (progress < 90) {
                setLoadingMessage('Almost complete jurnal...');
            } else {
                setLoadingMessage('Finalizing jurnal...');
            }
        });

        const { master, detail, bankDetail, jurnal, jurnalDetail } = result;

        setHeaderState(master);
        setDetailState(detail);
        setBankDetailState(bankDetail);
        setJurnalState(jurnal);
        setJurnalDetailState(jurnalDetail);

        setProgressValue(100);
        setDisplayedProgress(100);
        setLoadingMessage('Complete!');

        setTimeout(() => {
            setIsLoadingProgress(false);
            setProgressValue(0);
            setDisplayedProgress(0);
        }, 500);

        return result;
    } catch (error) {
        setIsLoadingProgress(false);
        setProgressValue(0);
        setDisplayedProgress(0);
        console.error('Error in handleEdit:', error);
        throw error;
    }
};

export const handleEntitasAll = async (kodeEntitas: any, setListEntitas: Function, token: any) => {
    try {
        const paramList = {
            entitas: kodeEntitas,
        };
        const result = await getEntitasAllApi(paramList, token); // Menghapus .then() di sini
        const kodeCabangList = result.map((entitas: any) => entitas.kodecabang); // Mengeluarkan hanya kodecabang

        const modifiedKodeCabang = kodeCabangList.map((item: any, index: any) => ({
            kodeCabang: item, // Menambahkan id_transaksi yang di-looping sesuai length responseDataList
        }));
        setListEntitas(modifiedKodeCabang); // Memindahkan setListEntitas di sini

        return modifiedKodeCabang; // Mengembalikan hanya kodecabang
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

export const handleDaftarBank = async (kodeEntitas: any, namaRelasi: any, setRecordsDaftarBank: Function, token: any) => {
    try {
        const paramList = {
            entitas: kodeEntitas,
            param1: namaRelasi,
        };

        const result = await getDaftarBankApi(paramList, token); // Menghapus .then() di sini
        setRecordsDaftarBank(result); // Memindahkan setRecordsDaftarBank di sini

        return result;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

export const handleKlikNamaBank = async (namaVendor: any) => {
    try {
        if (namaVendor !== '') {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

export const handleCekExistingTrx = async (kodeEntitas: any, jenisTransaksi: any, token: any) => {
    try {
        const paramList = {
            entitas: kodeEntitas,
            param1: jenisTransaksi,
        };

        const result = await getExistingTrx(paramList, token); // Menghapus .then() di sini

        if (jenisTransaksi === 0 && result.length > 1) {
            // return myAlertGlobal('Transaksi BRI sudah melebihi batas harian.', 'trxBankList');
            return 'false BRI';
        } else if (jenisTransaksi === 1 && result.length > 2) {
            // return myAlertGlobal('Transaksi BCA sudah melebihi batas harian.', 'trxBankList');
            return 'false BCA';
        } else if (jenisTransaksi === 0 && result.length < 2) {
            return result.length + 1;
        } else if (jenisTransaksi === 1 && result.length < 3) {
            return result.length + 1;
        }
        // else if ((jenisTransaksi === 0 || jenisTransaksi === 1) && result.length <= 0) {
        //     return result.length + 1;
        // }

        // return result;
        // Hapus setTimeout kosong karena tidak diperlukan
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

export const handleQuBank = async (
    kodeEntitas: any,
    namaBank: any,
    setDetailState: Function,
    token: any,
    setIsLoadingProgress: Function,
    setProgressValue: Function,
    setDisplayedProgress: Function,
    setLoadingMessage: Function,
    TransaksiKe: any
) => {
    try {
        setIsLoadingProgress(true);
        setProgressValue(0);
        setDisplayedProgress(0);
        setLoadingMessage('Fetching data...');
        const paramList = {
            entitas: kodeEntitas,
        };

        const item = await getEntitasAllApi(paramList, token);

        const kodeCabangList = item.map((entitas: any) => entitas.kodecabang); // Mengeluarkan hanya kodecabang

        const listBank: any[] = [];
        await Promise.all(
            kodeCabangList.map(async (kodeCabang: any) => {
                const paramList2 = {
                    entitas: kodeCabang,
                    param1: namaBank,
                };
                const result = await getQuBank(paramList2, token, TransaksiKe, (progress: number) => {
                    setProgressValue(progress);
                    setDisplayedProgress(Math.round(progress));

                    if (progress < 30) {
                        setLoadingMessage('Initializing data quBank...');
                    } else if (progress < 60) {
                        setLoadingMessage('Processing quBank...');
                    } else if (progress < 90) {
                        setLoadingMessage('Almost complete quBank...');
                    } else {
                        setLoadingMessage('Finalizing quBank...');
                    }
                });

                listBank.push(...result); // Menggunakan push untuk menyatukan data
            })
        );

        const modifiedGetQuBank = listBank.map((item: any, index: any) => ({
            ...item,
            id_transaksi: index + 1, // Menambahkan id_transaksi yang di-looping sesuai length responseDataList
        }));

        setProgressValue(100);
        setDisplayedProgress(100);
        setLoadingMessage('Complete!');

        setTimeout(() => {
            // setIsLoadingProgress(false);
            setProgressValue(0);
            setDisplayedProgress(0);
            // setIsLoadingProgress(true);
        }, 500);
        return modifiedGetQuBank; //listBank;
    } catch (error) {
        setIsLoadingProgress(false);
        setProgressValue(0);
        setDisplayedProgress(0);
        console.error('Error fetching data:', error);
    }
};

export const handleData = async (
    kodeEntitas: any,
    namaBank: any,
    setBankDetailState: Function,
    bankDetailState: any,
    token: any,
    setIsLoadingProgress: Function,
    setProgressValue: Function,
    setDisplayedProgress: Function,
    setLoadingMessage: Function,
    TransaksiKe: any,
    formDataState: any,
    dariTombol: any,
    um: boolean,
    vch: boolean,
    phe: boolean,
    fpp: boolean
) => {
    // console.log('bankDetailState ', bankDetailState);
    try {
        setIsLoadingProgress(true);
        setProgressValue(0);
        setDisplayedProgress(0);
        setLoadingMessage('Fetching data...');
        const paramList = {
            entitas: kodeEntitas,
        };

        const item = await getEntitasAllApi(paramList, token);

        // const kodeCabangList = item.map((entitas: any) => entitas.kodecabang); // Mengeluarkan hanya kodecabang

        const kodeCabangList = item
            .map((entitas: any) => entitas.kodecabang) // Mengeluarkan hanya kodecabang
            .filter((kodeCabang: any) => kodeCabang === '100' || kodeCabang === '898' || kodeCabang === '600' || kodeCabang === '698' || kodeCabang === '899'); // Filter untuk kode cabang 100 dan 898

        const kodeCabangListAll = item.map((entitas: any) => entitas.kodecabang); // Mengeluarkan hanya kodecabang

        const listBank: any[] = [];

        await Promise.all(
            kodeCabangListAll.map(async (kodeCabang: any) => {
                // setIsLoadingProgress(true);

                if (phe) {
                    const paramList4 = {
                        entitas: kodeCabang,
                    };
                    const resultPhe = await getQuPhe(paramList4, token, TransaksiKe, (progress: number) => {
                        setProgressValue(progress);
                        setDisplayedProgress(Math.round(progress));

                        // console.log('progress PHE ', progress);
                        if (progress < 30) {
                            setProgressValue(progress);
                            setDisplayedProgress(progress);
                            setLoadingMessage('Initializing data PHE 1...');
                        } else if (progress < 60) {
                            setProgressValue(progress);
                            setDisplayedProgress(progress);
                            setLoadingMessage('Processing PHE 1...');
                        } else if (progress < 90) {
                            setProgressValue(progress);
                            setDisplayedProgress(progress);
                            setLoadingMessage('Almost complete PHE 1...');
                        } else {
                            setProgressValue(progress);
                            setDisplayedProgress(progress);
                            setLoadingMessage('Finalizing PHE 1...');
                        }
                    });

                    // console.log('resultPhe 1 ', resultPhe);

                    listBank.push(...resultPhe);

                    // setProgressValue(100);
                    // setDisplayedProgress(100);
                    // setLoadingMessage('Complete PHE 1!');
                }
                if (fpp) {
                    const paramList5 = {
                        entitas: kodeCabang,
                        param1: namaBank,
                        param2: formDataState.ch1 === true ? 1 : 0,
                        param3: formDataState.ch2 === true ? 1 : 0,
                        param4: formDataState.ch3 === true ? 1 : 0,
                        param5: formDataState.ch4 === true ? 1 : 0,
                    };

                    const resultFpp = await getQuFpp(paramList5, token, (progress: number) => {
                        setProgressValue(progress);
                        setDisplayedProgress(Math.round(progress));

                        // console.log('progress FPP ', progress);
                        if (progress < 30) {
                            setProgressValue(progress);
                            setDisplayedProgress(progress);
                            setLoadingMessage('Initializing data FPP 1...');
                        } else if (progress < 60) {
                            setProgressValue(progress);
                            setDisplayedProgress(progress);
                            setLoadingMessage('Processing FPP 1...');
                        } else if (progress < 90) {
                            setProgressValue(progress);
                            setDisplayedProgress(progress);
                            setLoadingMessage('Almost complete FPP 1...');
                        } else {
                            setProgressValue(progress);
                            setDisplayedProgress(progress);
                            setLoadingMessage('Finalizing FPP 1...');
                        }
                    });
                    // console.log('resultFpp', resultFpp);

                    listBank.push(...resultFpp);

                    // setProgressValue(100);
                    // setDisplayedProgress(100);
                    // setLoadingMessage('Complete FPP 1 !');
                }
            })
        );
        await Promise.all(
            kodeCabangList.map(async (kodeCabang: any) => {
                // setIsLoadingProgress(true);

                if (vch) {
                    const paramList3 = {
                        entitas: kodeCabang,
                    };
                    const resultVch = await getQuVch(paramList3, token, TransaksiKe, (progress: number) => {
                        setProgressValue(progress);
                        setDisplayedProgress(Math.round(progress));

                        // console.log('progress VCH ', progress);
                        if (progress < 30) {
                            setProgressValue(progress);
                            setDisplayedProgress(progress);
                            setLoadingMessage('Initializing data VCH...');
                        } else if (progress < 60) {
                            setProgressValue(progress);
                            setDisplayedProgress(progress);
                            setLoadingMessage('Processing VCH...');
                        } else if (progress < 90) {
                            setProgressValue(progress);
                            setDisplayedProgress(progress);
                            setLoadingMessage('Almost complete VCH...');
                        } else {
                            setProgressValue(progress);
                            setDisplayedProgress(progress);
                            setLoadingMessage('Finalizing VCH...');
                        }
                    });

                    // console.log('resultVch', resultVch);

                    listBank.push(...resultVch);

                    // setProgressValue(100);
                    // setDisplayedProgress(100);
                    // setLoadingMessage('Complete VCH!');
                }
                if (phe) {
                    const paramList4 = {
                        entitas: kodeCabang,
                    };
                    const resultPhe = await getQuPhe(paramList4, token, TransaksiKe, (progress: number) => {
                        setProgressValue(progress);
                        setDisplayedProgress(Math.round(progress));
                        // console.log('progress PHE ', progress);
                        if (progress < 30) {
                            setProgressValue(progress);
                            setDisplayedProgress(progress);
                            setLoadingMessage('Initializing data PHE...');
                        } else if (progress < 60) {
                            setProgressValue(progress);
                            setDisplayedProgress(progress);
                            setLoadingMessage('Processing PHE...');
                        } else if (progress < 90) {
                            setProgressValue(progress);
                            setDisplayedProgress(progress);
                            setLoadingMessage('Almost complete PHE...');
                        } else {
                            setProgressValue(progress);
                            setDisplayedProgress(progress);
                            setLoadingMessage('Finalizing PHE...');
                        }
                    });

                    // console.log('resultPhe', resultPhe);

                    listBank.push(...resultPhe);

                    // setProgressValue(100);
                    // setDisplayedProgress(100);
                    // setLoadingMessage('Complete PHE!');
                }
                if (um) {
                    const paramList2 = {
                        entitas: kodeCabang,
                    };
                    const resultUangMuka = await getQuUangMuka(paramList2, token, TransaksiKe, (progress: number) => {
                        setProgressValue(progress);
                        setDisplayedProgress(Math.round(progress));
                        // console.log('progress UM ', progress);
                        if (progress < 30) {
                            setProgressValue(progress);
                            setDisplayedProgress(progress);
                            setLoadingMessage('Initializing data UM...');
                        } else if (progress < 60) {
                            setProgressValue(progress);
                            setDisplayedProgress(progress);
                            setLoadingMessage('Processing UM...');
                        } else if (progress < 90) {
                            setProgressValue(progress);
                            setDisplayedProgress(progress);
                            setLoadingMessage('Almost complete UM...');
                        } else {
                            setProgressValue(progress);
                            setDisplayedProgress(progress);
                            setLoadingMessage('Finalizing UM...');
                        }
                    });

                    // console.log('resultUangMuka', resultUangMuka);
                    listBank.push(...resultUangMuka); // Menggunakan push untuk menyatukan data

                    // setProgressValue(100);
                    // setDisplayedProgress(100);
                    // setLoadingMessage('Complete UM!');
                }
            })
        );

        // console.log('dariTombol ', dariTombol);
        if (dariTombol === '0') {
            // console.log('listBank.length ', listBank.length);

            const modifiedGetlistBank = listBank.map((item: any, index: any) => ({
                ...item,
                index: index,
                id_transaksi: index + 1, // Menambahkan id_transaksi yang di-looping sesuai length responseDataList
                proses_bayar: false,
                nominal_bayar: 0,
                // uniqId: `${item.entitas}_${index + 1}`,
                uniqId: `${index + 1}`,
                uniqeKode: `${item.entitas}_${item.kode_dokumen_sumber}`,
            }));
            // let idCounter = 0;
            // console.log('listBank.push  ', listBank);
            // const modifiedGetlistBank = listBank.map((item: any) => {
            //     const newItem = {
            //         ...item,
            //         id_transaksi: idCounter,
            //         proses_bayar: false,
            //         nominal_bayar: 0,
            //         uniqId: `${idCounter}`,
            //         uniqeKode: `${item.entitas}_${item.kode_dokumen_sumber}`,
            //     };
            //     idCounter++; // increment setelah assign
            //     return newItem;
            // });

            // console.log('modifiedGetlistBank.length ', modifiedGetlistBank.length);

            setProgressValue(100);
            setDisplayedProgress(100);
            setLoadingMessage('Complete!');

            setTimeout(() => {
                setIsLoadingProgress(false);
                setProgressValue(0);
                setDisplayedProgress(0);
            }, 500);
            // return modifiedGetlistBankUpdate;
            return modifiedGetlistBank;
        } else if (dariTombol === '1') {
            listBank.forEach((itemBaru: any) => {
                const exists = bankDetailState.some((itemLama: any) => itemLama.entitas + itemLama.no_dokumen_sumber === itemBaru.entitas + itemBaru.no_dokumen_sumber); // Cek berdasarkan id
                if (!exists) {
                    bankDetailState.push(itemBaru);
                }
            });

            const modifiedGetbankDetailState = bankDetailState.map((item: any, index: any) => ({
                ...item,
                id_transaksi: index + 1, // Menambahkan id_transaksi yang di-looping sesuai length responseDataList
                proses_bayar: false,
                nominal_bayar: 0,
                // uniqId: `${item.entitas}_${index + 1}`,
                uniqId: `${index + 1}`,
            }));

            setProgressValue(100);
            setDisplayedProgress(100);
            setLoadingMessage('Complete!');

            setTimeout(() => {
                setIsLoadingProgress(false);
                setProgressValue(0);
                setDisplayedProgress(0);
            }, 500);
            return modifiedGetbankDetailState;
        }

        // return listBank;
    } catch (error) {
        setIsLoadingProgress(false);
        setProgressValue(0);
        setDisplayedProgress(0);
        console.error('Error fetching data:', error);
    }
};
