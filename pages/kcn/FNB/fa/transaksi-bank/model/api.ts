const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
import axios from 'axios';
import moment from 'moment';
import { frmNumber } from '@/utils/routines';
import { log } from 'console';
import { Grid } from '@syncfusion/ej2-react-grids';

let progressInterval: NodeJS.Timer;

export const ListDataApi = async (paramsList: any, token: any, jenis: any, onProgress: (progress: number) => void) => {
    let progressValue = 0;

    try {
        progressInterval = setInterval(() => {
            if (progressValue < 90) {
                progressValue += 1;
                onProgress(progressValue);
            }
        }, 20);

        const responseData = await axios.get(`${apiUrl}/erp/list_transaksi_bank?`, {
            params: paramsList,
            headers: { Authorization: `Bearer ${token}` },
            onDownloadProgress: (progressEvent: any) => {
                if (progressEvent.total) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percentCompleted);
                }
            },
        });

        // Bersihkan interval progress
        clearInterval(progressInterval);

        // Set progress ke 100% setelah data selesai diproses
        onProgress(100);

        const responseDataList: any[] = responseData.data.data.map((field: any) => ({
            ...field,
            // tgl_transaksi: moment(field.tgl_transaksi).format('DD-MM-YYYY'),
            nominal_ready: parseFloat(field.nominal_ready),
            // total_bayar: Math.ceil(parseFloat(field.total_bayar) * 10000) / 10000,
            total_bayar: parseFloat(field.total_bayar),
            status_form: field.status_form === null ? '' : field.status_form,
        }));

        return responseDataList;
    } catch (error) {
        // Bersihkan interval progress jika terjadi error
        clearInterval(progressInterval);
        console.error('Error fetching data:', error);
        throw error;
    }
};

export const cekTglTransaksiApi = async (paramsList: any, token: any) => {
    let progressValue = 0;

    try {
        const responseData = await axios.get(`${apiUrl}/erp/check_tgl_transaksi?`, {
            params: paramsList,
            headers: { Authorization: `Bearer ${token}` },
        });

        const responseDataList: any[] = responseData.data.data;

        return responseDataList;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

export const TrxBankEditApi = async (paramList: any, token: any, onProgress: (progress: number) => void) => {
    try {
        const responseData = await axios.get(`${apiUrl}/erp/detail_transaksi_bank?`, {
            params: paramList,
            headers: {
                Authorization: `Bearer ${token}`,
            },
            onDownloadProgress: (progressEvent: any) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onProgress(percentCompleted);
            },
        });

        const { master, detail, bankDetail } = responseData.data.data;

        let idTransaksiDetail = 0;
        let idTransaksiBankDetail = 0;

        const modifiedMaster = {
            ...master,
            tgl_transaksi: master.tgl_transaksi,
            total_bayar: parseFloat(master.total_bayar),
        };

        const modifiedDetail = detail.map((item: any) => {
            return {
                ...item,
                // id_transaksi: idTransaksiDetail++,
                saldo_endap: item.saldo_endap === null || item.saldo_endap === '' ? 0 : parseFloat(item.saldo_endap),
                saldo_akhir: item.saldo_akhir === null || item.saldo_akhir === '' ? 0 : parseFloat(item.saldo_akhir),
                saldo_real: item.saldo_real === null || item.saldo_real === '' ? 0 : parseFloat(item.saldo_real),
                nominal_ready: item.nominal_ready === null || item.nominal_ready === '' ? 0 : parseFloat(item.nominal_ready),
                nominal1: item.nominal1 === null || item.nominal1 === '' ? 0 : parseFloat(item.nominal1),
                nominal2: item.nominal2 === null || item.nominal2 === '' ? 0 : parseFloat(item.nominal2),
                nominal3: item.nominal3 === null || item.nominal3 === '' ? 0 : parseFloat(item.nominal3),
                nominal4: item.nominal4 === null || item.nominal4 === '' ? 0 : parseFloat(item.nominal4),
                nominal5: item.nominal5 === null || item.nominal5 === '' ? 0 : parseFloat(item.nominal5),
                // uniqId: `${item.entitas}_${item.kode_transaksi}_${item.id_transaksi}`,
                // uniqId: `${item.entitas}_${item.id_transaksi}`,
                uniqId: `${item.id_transaksi}`,
            };
        });

        const modifiedBankDetail = bankDetail.map((item: any) => {
            return {
                ...item,
                // id_transaksi: idTransaksiBankDetail++,
                // tgl_jtp: moment(item.tgl_jtp).format('DD-MM-YYYY'),
                tgl_jtp: moment(item.tgl_jtp).format('YYYY-MM-DD'),
                // proses_bayar: item.proses_bayar === 'Y' ? true : item.proses_bayar === true ? true : item.proses_bayar === false ? false : 'N',
                proses_bayar: item.proses_bayar === 'Y' ? true : false,
                nominal_tagihan: item.nominal_tagihan === null || item.nominal_tagihan === '' ? 0 : parseFloat(item.nominal_tagihan),
                nominal_bayar: item.nominal_bayar === null || item.nominal_bayar === '' ? 0 : parseFloat(item.nominal_bayar),
                nominal_sisa: item.nominal_sisa === null || item.nominal_sisa === '' ? 0 : parseFloat(item.nominal_sisa),
                nominal1: item.nominal1 === null || item.nominal1 === '' ? 0 : parseFloat(item.nominal1),
                nominal2: item.nominal2 === null || item.nominal2 === '' ? 0 : parseFloat(item.nominal2),
                nominal3: item.nominal3 === null || item.nominal3 === '' ? 0 : parseFloat(item.nominal3),
                nominal4: item.nominal4 === null || item.nominal4 === '' ? 0 : parseFloat(item.nominal4),
                nominal5: item.nominal5 === null || item.nominal5 === '' ? 0 : parseFloat(item.nominal5),
                // uniqId: `${item.entitas}_${item.kode_transaksi}_${item.id_transaksi}`,
                // uniqId: `${item.entitas}_${item.id_transaksi}`,
                uniqId: `${item.id_transaksi}`,
            };
        });

        // dsGridDetail.dataSource = modifiedDetail;
        // dsGridDetail.refresh();

        const objPraBkkEdit = {
            master: modifiedMaster,
            detail: modifiedDetail,
            bankDetail: modifiedBankDetail,
        };

        return objPraBkkEdit;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

export const JurnalApi = async (masterDataState: any, paramList: any, token: any, onProgress: (progress: number) => void) => {
    try {
        let modifiedJurnal: any[] = [];
        let modifiedJurnalDetail: any[] = [];

        const responseData = await axios.get(`${apiUrl}/erp/master_detail_jurnal_trx_bank?`, {
            params: paramList,
            headers: {
                Authorization: `Bearer ${token}`,
            },
            onDownloadProgress: (progressEvent: any) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onProgress(percentCompleted);
            },
        });

        const { master, detail, bankDetail, jurnal, jurnalDetail } = responseData.data.data;

        const modifiedMaster = {
            ...master,
            // tgl_transaksi: moment(master.tgl_transaksi).format('DD-MM-YYYY'),
            nominal_ready: parseFloat(master.nominal_ready),
            total_bayar: parseFloat(master.total_bayar),
        };

        const modifiedDetail = detail.map((item: any) => {
            return {
                ...item,
                // id_transaksi: idTransaksiDetail++,
                saldo_endap: parseFloat(item.saldo_endap),
                saldo_akhir: parseFloat(item.saldo_akhir),
                saldo_real: parseFloat(item.saldo_real),
                nominal_ready: item.nominal_ready === null ? 0 : parseFloat(item.nominal_ready),
                nominal1: item.nominal1 === null ? 0 : parseFloat(item.nominal1),
                nominal2: item.nominal2 === null ? 0 : parseFloat(item.nominal2),
                nominal3: item.nominal3 === null ? 0 : parseFloat(item.nominal3),
                nominal4: item.nominal4 === null ? 0 : parseFloat(item.nominal4),
                nominal5: item.nominal5 === null ? 0 : parseFloat(item.nominal5),
                // uniqId: `${item.entitas}_${item.kode_transaksi}_${item.id_transaksi}`,
                // uniqId: `${item.entitas}_${item.id_transaksi}`,
                uniqId: `${item.id_transaksi}`,
            };
        });

        const modifiedBankDetail = bankDetail.map((item: any) => {
            return {
                ...item,
                // id_transaksi: idTransaksiBankDetail++,
                // tgl_jtp: moment(item.tgl_jtp).format('DD-MM-YYYY'),
                tgl_jtp: moment(item.tgl_jtp).format('YYYY-MM-DD'),
                proses_bayar: item.proses_bayar === 'Y' ? true : item.proses_bayar === true ? true : item.proses_bayar === false ? false : 'N',
                nominal_tagihan: parseFloat(item.nominal_tagihan),
                nominal_bayar: parseFloat(item.nominal_bayar),
                nominal_sisa: parseFloat(item.nominal_sisa),
                nominal1: parseFloat(item.nominal1),
                nominal2: parseFloat(item.nominal2),
                nominal3: parseFloat(item.nominal3),
                nominal4: parseFloat(item.nominal4),
                nominal5: parseFloat(item.nominal5),
                // uniqId: `${item.entitas}_${item.kode_transaksi}_${item.id_transaksi}`,
                // uniqId: `${item.entitas}_${item.id_transaksi}`,
                uniqId: `${item.id_transaksi}`,
            };
        });

        if (masterDataState === 'EDIT') {
            modifiedJurnal = jurnal.map((item: any) => {
                return {
                    ...item,
                    tgl_jurnal: moment(item.tgl_jurnal).format('YYYY-MM-DD'),
                    nominal1: item.nominal1 === null ? 0 : parseFloat(item.nominal1),
                    nominal2: item.nominal2 === null ? 0 : parseFloat(item.nominal2),
                    nominal3: item.nominal3 === null ? 0 : parseFloat(item.nominal3),
                    nominal4: item.nominal4 === null ? 0 : parseFloat(item.nominal4),
                    nominal5: item.nominal5 === null ? 0 : parseFloat(item.nominal5),
                    uniqId: `${item.id_transaksi}`,
                };
            });

            modifiedJurnalDetail = jurnalDetail.map((item: any) => {
                return {
                    ...item,
                    tgl_jurnal: moment(item.tgl_jurnal).format('YYYY-MM-DD'),
                    nominal_tagihan: parseFloat(item.nominal_tagihan),
                    nominal_bayar: parseFloat(item.nominal_bayar),
                    nominal_sisa: parseFloat(item.nominal_sisa),
                    nominal1: parseFloat(item.nominal1),
                    nominal2: parseFloat(item.nominal2),
                    nominal3: parseFloat(item.nominal3),
                    nominal4: parseFloat(item.nominal4),
                    nominal5: parseFloat(item.nominal5),
                    uniqId: `${item.id_transaksi}`,
                };
            });
        } else if (masterDataState === 'BARU') {
            modifiedJurnal = detail.map((item: any) => {
                return {
                    // ...item,
                    kode_transaksi: item.kode_transaksi,
                    id_transaksi: item.id_transaksi,
                    entitas: item.entitas,
                    no_rekening: item.no_rekening,
                    nama_rekening: item.nama_rekening,
                    nama_bank: item.nama_bank,
                    tgl_jurnal: moment(item.tgl_jtp).format('YYYY-MM-DD'),
                    nominal1: item.nominal1 === null ? 0 : parseFloat(item.nominal1),
                    nominal2: item.nominal2 === null ? 0 : parseFloat(item.nominal2),
                    nominal3: item.nominal3 === null ? 0 : parseFloat(item.nominal3),
                    nominal4: item.nominal4 === null ? 0 : parseFloat(item.nominal4),
                    nominal5: item.nominal5 === null ? 0 : parseFloat(item.nominal5),
                    jurnal_ho: '',
                    jurnal_cabang: '',
                    keterangan_jurnal: '',
                    userid: '',
                    uniqId: `${item.id_transaksi}`,
                };
            });

            modifiedJurnalDetail = bankDetail.map((item: any) => {
                return {
                    // ...item,
                    jenis_pengeluaran: '',
                    nama_bank: '',
                    no_rekening: '',
                    nama_rekening: '',
                    jurnal_ho: '',
                    jurnal_cabang: '',
                    keterangan_jurnal: '',
                    userid: '',
                    kode_eBranch1: '',
                    kode_eBranch2: '',
                    kode_eBranch3: '',
                    kode_eBranch4: '',
                    kode_eBranch5: '',
                    kode_transaksi: item.kode_transaksi,
                    id_transaksi: item.id_transaksi,
                    entitas: item.entitas,
                    deskripsi: item.keterangan,
                    sumber: item.sumber,
                    kode_dokumen_sumber: item.kode_dokumen_sumber,
                    no_dokumen_sumber: item.no_dokumen_sumber,
                    kode_vendor: item.kode_vendor,
                    nama_vendor: item.nama_vendor,
                    nama_bank1: item.nama_bank1,
                    no_rekening1: item.no_rekening1,
                    nama_rekening1: item.nama_rekening1,
                    nama_bank2: item.nama_bank2,
                    no_rekening2: item.no_rekening2,
                    nama_rekening2: item.nama_rekening2,
                    nama_bank3: item.nama_bank3,
                    no_rekening3: item.no_rekening3,
                    nama_rekening3: item.nama_rekening3,
                    nama_bank4: item.nama_bank4,
                    no_rekening4: item.no_rekening4,
                    nama_rekening4: item.nama_rekening4,
                    nama_bank5: item.nama_bank5,
                    no_rekening5: item.no_rekening5,
                    nama_rekening5: item.nama_rekening5,
                    tgl_jurnal: moment().format('YYYY-MM-DD'),
                    nominal_tagihan: parseFloat(item.nominal_tagihan),
                    nominal_bayar: parseFloat(item.nominal_bayar),
                    nominal_sisa: parseFloat(item.nominal_sisa),
                    nominal1: parseFloat(item.nominal1),
                    nominal2: parseFloat(item.nominal2),
                    nominal3: parseFloat(item.nominal3),
                    nominal4: parseFloat(item.nominal4),
                    nominal5: parseFloat(item.nominal5),
                    uniqId: `${item.id_transaksi}`,
                };
            });
        }

        // dsGridDetail.dataSource = modifiedDetail;
        // dsGridDetail.refresh();

        const objekJurnal = {
            master: modifiedMaster,
            detail: modifiedDetail,
            bankDetail: modifiedBankDetail,
            jurnal: modifiedJurnal,
            jurnalDetail: modifiedJurnalDetail,
        };

        return objekJurnal;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

export const getEntitasAllApi = async (paramsList: any, token: any) => {
    try {
        const responseData = await axios.get(`${apiUrl}/erp/entitas_transaksi_bank?`, {
            params: paramsList,
            headers: { Authorization: `Bearer ${token}` },
        });

        const responseDataList: any[] = responseData.data.data;

        return responseDataList;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

export const getDaftarBankApi = async (paramsList: any, token: any) => {
    try {
        const responseData = await axios.get(`${apiUrl}/erp/daftar_bank_supplier?`, {
            params: paramsList,
            headers: { Authorization: `Bearer ${token}` },
        });

        const responseDataList: any[] = responseData.data.data.map((item: any) => ({
            ...item,
            tgl_update: moment(item.tgl_update).format('DD-MM-YYYY'), // Format tgl_update
        }));

        return responseDataList;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

export const getExistingTrx = async (paramsList: any, token: any) => {
    try {
        const responseData = await axios.get(`${apiUrl}/erp/check_exist_transaksi_bank?`, {
            params: paramsList,
            headers: { Authorization: `Bearer ${token}` },
        });

        const responseDataList: any[] = responseData.data.data;

        return responseDataList;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

export const getQuBank = async (paramsList: any, token: any, TransaksiKe: any, onProgress: (progress: number) => void) => {
    let progressValue = 0;
    try {
        progressInterval = setInterval(() => {
            if (progressValue < 90) {
                progressValue += 1;
                onProgress(progressValue);
            }
        }, 20);
        const responseData = await axios.get(`${apiUrl}/erp/list_rekening_trx_bank?`, {
            params: paramsList,
            headers: { Authorization: `Bearer ${token}` },
            onDownloadProgress: (progressEvent: any) => {
                if (progressEvent.total) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percentCompleted);
                }
            },
        });

        clearInterval(progressInterval);
        onProgress(100);
        let id_transaksi = 1;
        const responseDataList: any[] = responseData.data.data.map((field: any) => ({
            ...field,
            kode_transaksi: '',
            // id_transaksi: id_transaksi++,
            id_tab: TransaksiKe,
            entitas: paramsList.entitas,
            tgl_update: moment(field.tgl_update).format('YYYY-MM-DD'),
            saldo_endap: parseFloat(field.saldo_endap),
            saldo_akhir: parseFloat(field.saldo_akhir),
            saldo_real: parseFloat(field.saldo_real),
            nominal_ready: parseFloat(field.saldo_real) < 100000000 ? 0 : parseFloat(field.nominal_ready),
            kode_eBranch1: '',
            nominal1: 0,
            kode_eBranch2: '',
            nominal2: 0,
            kode_eBranch3: '',
            nominal3: 0,
            kode_eBranch4: '',
            nominal4: 0,
            kode_eBranch5: '',
            nominal5: 0,
        }));

        return responseDataList;
        // return modifiedGetQuBank; //responseDataList;
    } catch (error) {
        clearInterval(progressInterval);
        console.error('Error fetching data:', error);
        throw error;
    }
};

export const getQuUangMuka = async (paramsList: any, token: any, TransaksiKe: any, onProgress: (progress: number) => void) => {
    let progressValue = 0;
    try {
        progressInterval = setInterval(() => {
            if (progressValue < 90) {
                progressValue += 1;
                onProgress(progressValue);
            }
        }, 20);
        const responseData = await axios.get(`${apiUrl}/erp/transaksi_bank_um?`, {
            params: paramsList,
            headers: { Authorization: `Bearer ${token}` },
            onDownloadProgress: (progressEvent: any) => {
                if (progressEvent.total) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percentCompleted);
                }
            },
        });

        clearInterval(progressInterval);
        onProgress(100);

        const responseDataList: any[] = responseData.data.data.map((field: any) => ({
            // ...field,
            // tgl_dokumen: moment(field.tgl_dokumen).format('YYYY-MM-DD'),
            // tgl_dok: moment(field.tgl_dok).format('YYYY-MM-DD'),
            // total_rp: parseFloat(field.total_rp),
            // sudah_dibayar_rp: parseFloat(field.sudah_dibayar_rp),
            // belum_dibayar_rp: parseFloat(field.belum_dibayar_rp),
            // sudah_diambil_rp: parseFloat(field.sudah_diambil_rp),
            // sisa_rp: parseFloat(field.sisa_rp),
            kode_transaksi: '',
            sumber: 'UM',
            entitas: paramsList.entitas,
            kode_dokumen_sumber: field.kode_um,
            no_dokumen_sumber: field.no_um,
            nama_bank1: '',
            no_rekening1: '',
            nama_rekening1: '',
            nama_bank2: '',
            no_rekening2: '',
            nama_rekening2: '',
            nama_bank3: '',
            no_rekening3: '',
            nama_rekening3: '',
            nama_bank4: '',
            no_rekening4: '',
            nama_rekening4: '',
            nama_bank5: '',
            no_rekening5: '',
            nama_rekening5: '',
            kode_vendor: '0',
            nama_vendor: field.nama_relasi,
            nominal_tagihan: field.belum_dibayar_rp === null ? 0 : parseFloat(field.belum_dibayar_rp),
            keterangan: '',
            nominal_sisa: field.sisa_rp === null ? 0 : parseFloat(field.belum_dibayar_rp),
            kode_eBranch1: '',
            nominal1: 0,
            kode_eBranch2: '',
            nominal2: 0,
            kode_eBranch3: '',
            nominal3: 0,
            kode_eBranch4: '',
            nominal4: 0,
            kode_eBranch5: '',
            nominal5: 0,
        }));

        return responseDataList;
    } catch (error) {
        clearInterval(progressInterval);
        console.error('Error fetching data:', error);
        throw error;
    }
};

export const getQuVch = async (paramsList: any, token: any, TransaksiKe: any, onProgress: (progress: number) => void) => {
    let progressValue = 0;
    try {
        progressInterval = setInterval(() => {
            if (progressValue < 90) {
                progressValue += 1;
                onProgress(progressValue);
            }
        }, 20);
        const responseData = await axios.get(`${apiUrl}/erp/transaksi_bank_vch?`, {
            params: paramsList,
            headers: { Authorization: `Bearer ${token}` },
            onDownloadProgress: (progressEvent: any) => {
                if (progressEvent.total) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percentCompleted);
                }
            },
        });

        clearInterval(progressInterval);
        onProgress(100);

        const responseDataList: any[] = responseData.data.data.map((field: any) => ({
            // ...field,
            // nominal_sisa: parseFloat(field.nominal_sisa),
            // tgl_vch: moment(field.tgl_vch).format('YYYY-MM-DD'),
            // tgl_bayar: moment(field.tgl_bayar).format('YYYY-MM-DD'),
            // jumlah_mu: parseFloat(field.jumlah_mu),
            // tgl_update: moment(field.tgl_update).format('YYYY-MM-DD'),
            // entitas: paramsList.entitas,
            // nominal1: field.nominal1 === null ? 0 : parseFloat(field.nominal1),
            // nominal2: field.nominal2 === null ? 0 : parseFloat(field.nominal2),
            // nominal3: field.nominal3 === null ? 0 : parseFloat(field.nominal3),
            // nominal4: field.nominal4 === null ? 0 : parseFloat(field.nominal4),
            // nominal5: field.nominal5 === null ? 0 : parseFloat(field.nominal5),
            kode_transaksi: '',
            sumber: 'VCH',
            entitas: paramsList.entitas,
            kode_dokumen_sumber: field.kode_vch,
            no_dokumen_sumber: field.no_vch,
            nama_bank1: '',
            no_rekening1: '',
            nama_rekening1: '',
            nama_bank2: '',
            no_rekening2: '',
            nama_rekening2: '',
            nama_bank3: '',
            no_rekening3: '',
            nama_rekening3: '',
            nama_bank4: '',
            no_rekening4: '',
            nama_rekening4: '',
            nama_bank5: '',
            no_rekening5: '',
            nama_rekening5: '',
            kode_vendor: '0',
            nama_vendor: field.nama_relasi,
            tgl_jtp: moment(field.tgl_bayar).format('YYYY-MM-DD'),
            keterangan: '',
            nominal_sisa: field.nominal_sisa === null ? 0 : parseFloat(field.nominal_sisa),
            nominal_tagihan: field.nominal_sisa === null ? 0 : parseFloat(field.nominal_sisa),
            kode_eBranch1: '',
            nominal1: 0, //field.nominal1 === null ? 0 : parseFloat(field.nominal1),
            kode_eBranch2: '',
            nominal2: 0, //field.nominal2 === null ? 0 : parseFloat(field.nominal2),
            kode_eBranch3: '',
            nominal3: 0, //field.nominal3 === null ? 0 : parseFloat(field.nominal3),
            kode_eBranch4: '',
            nominal4: 0, //field.nominal4 === null ? 0 : parseFloat(field.nominal4),
            kode_eBranch5: '',
            nominal5: 0, //field.nominal5 === null ? 0 : parseFloat(field.nominal5),
        }));

        return responseDataList;
    } catch (error) {
        clearInterval(progressInterval);
        console.error('Error fetching data:', error);
        throw error;
    }
};

export const getQuPhe = async (paramsList: any, token: any, TransaksiKe: any, onProgress: (progress: number) => void) => {
    let progressValue = 0;

    try {
        progressInterval = setInterval(() => {
            if (progressValue < 90) {
                progressValue += 1;
                onProgress(progressValue);
            }
        }, 20);
        const responseData = await axios.get(`${apiUrl}/erp/transaksi_bank_phe?`, {
            params: paramsList,
            headers: { Authorization: `Bearer ${token}` },
            onDownloadProgress: (progressEvent: any) => {
                if (progressEvent.total) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percentCompleted);
                }
            },
        });

        clearInterval(progressInterval);
        onProgress(100);
        // console.log('responseData', responseData.data.data);

        const responseDataList: any[] = responseData.data.data.map((field: any) => ({
            // ...field,
            kode_transaksi: '',
            sumber: 'PHE',
            entitas: paramsList.entitas,
            kode_dokumen_sumber: field.kode_phe,
            no_dokumen_sumber: field.no_phe,
            nama_bank1: '',
            no_rekening1: '',
            nama_rekening1: '',
            nama_bank2: '',
            no_rekening2: '',
            nama_rekening2: '',
            nama_bank3: '',
            no_rekening3: '',
            nama_rekening3: '',
            nama_bank4: '',
            no_rekening4: '',
            nama_rekening4: '',
            nama_bank5: '',
            no_rekening5: '',
            nama_rekening5: '',
            kode_vendor: '0',
            nama_vendor: field.via,
            tgl_jtp: moment(field.tgl_phe).format('YYYY-MM-DD'),
            nominal_tagihan: field.total_mu === null ? 0 : parseFloat(field.total_mu),
            keterangan: field.keterangan,
            nominal_sisa: field.nominal_sisa === null ? parseFloat(field.total_mu) : parseFloat(field.nominal_sisa),
            kode_eBranch1: '',
            nominal1: 0,
            kode_eBranch2: '',
            nominal2: 0,
            kode_eBranch3: '',
            nominal3: 0,
            kode_eBranch4: '',
            nominal4: 0,
            kode_eBranch5: '',
            nominal5: 0,
            proses_bayar: field.proses_bayar === 'Y' ? true : false,
        }));

        // console.log('responseDataList', responseDataList);
        return responseDataList;
    } catch (error) {
        clearInterval(progressInterval);
        console.error('Error fetching data:', error);
        throw error;
    }
};

export const getQuFpp = async (paramsList: any, token: any, onProgress: (progress: number) => void) => {
    let progressValue = 0;
    try {
        progressInterval = setInterval(() => {
            if (progressValue < 90) {
                progressValue += 1;
                onProgress(progressValue);
            }
        }, 20);
        const responseData = await axios.get(`${apiUrl}/erp/transaksi_bank_fpp?`, {
            params: paramsList,
            headers: { Authorization: `Bearer ${token}` },
            onDownloadProgress: (progressEvent: any) => {
                if (progressEvent.total) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percentCompleted);
                }
            },
        });

        clearInterval(progressInterval);
        onProgress(100);

        const responseDataList: any[] = responseData.data.data.map((field: any) => ({
            // ...field,
            kode_transaksi: '',
            sumber: 'FPP',
            entitas: field.kode_entitas,
            kode_dokumen_sumber: field.kode_fpp,
            no_dokumen_sumber: field.no_fpp,
            nama_bank1: field.nama_bank,
            no_rekening1: field.no_rekening,
            nama_rekening1: field.nama_rekening,
            nama_bank2: '',
            no_rekening2: '',
            nama_rekening2: '',
            nama_bank3: '',
            no_rekening3: '',
            nama_rekening3: '',
            nama_bank4: '',
            no_rekening4: '',
            nama_rekening4: '',
            nama_bank5: '',
            no_rekening5: '',
            nama_rekening5: '',
            kode_vendor: '0',
            nama_vendor: field.nama_rekening,
            tgl_jtp: moment(field.tgl_harus_bayar).format('YYYY-MM-DD'),
            nominal_tagihan: field.total_rp === null ? 0 : parseFloat(field.total_rp),
            keterangan: field.keterangan,
            nominal_sisa: field.nominal_sisa === null ? parseFloat(field.total_rp) : parseFloat(field.nominal_sisa),
            kode_eBranch1: field.kode_eBranch1,
            nominal1: 0,
            kode_eBranch2: field.kode_eBranch2,
            nominal2: 0,
            kode_eBranch3: field.kode_eBranch3,
            nominal3: 0,
            kode_eBranch4: field.kode_eBranch4,
            nominal4: 0,
            kode_eBranch5: field.kode_eBranch5,
            nominal5: 0,
        }));

        return responseDataList;
    } catch (error) {
        clearInterval(progressInterval);
        console.error('Error fetching data:', error);
        throw error;
    }
};
