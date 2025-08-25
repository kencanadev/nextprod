import axios from 'axios';
import moment from 'moment';

import React from 'react';

const api = () => {
    return <div>api</div>;
};

export default api;
const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

export const DlgHargaItemTerakhir = async (entitas: string, kode_item: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

    try {
        const response = await axios.get(`${apiUrl}/erp/harga_item_terakhir`, {
            params: {
                entitas: entitas,
                kode_item: kode_item,
            },
        });
        const responseData = response.data.data;
        const interfaceData = responseData.map((item: any) => ({
            no_dok: item.no_dok,
            tgl: item.tgl,
            nama_relasi: item.nama_relasi,
            harga_mu: item.harga_mu,
        }));

        return interfaceData;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

export const HargaPembelianPerSupp = async (entitas: string, kode_item: string, kode_relasi: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

    try {
        const response = await axios.get(`${apiUrl}/erp/harga_per_supp`, {
            params: {
                entitas: entitas,
                kode_item: kode_item,
                kode_relasi: kode_relasi,
            },
        });
        const responseData = response.data.data;
        let interfaceData = [];

        if (responseData.length > 0) {
            interfaceData = responseData.map((item: any) => ({
                harga: item.harga,
                diskon: item.diskon,
                potongan: item.potongan,
            }));
        } else {
            interfaceData = responseData.map((item: any) => ({
                harga: '',
                diskon: '',
                potongan: '',
            }));
        }

        return interfaceData;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

export const HargaPembelianPoSupp = async (entitas: string, kode_item: string, kode_supp: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

    try {
        const response = await axios.get(`${apiUrl}/erp/harga_po_supp`, {
            params: {
                entitas: entitas,
                kode_item: kode_item,
                kode_supp: kode_supp,
            },
        });
        const responseData = response.data.data;
        let interfaceData = [];

        if (responseData.length > 0) {
            interfaceData = responseData.map((item: any) => ({
                harga: item.harga_mu,
                diskon: item.diskon,
                diskon_mu: item.diskon_mu,
                potongan: item.potongan_mu,
                pajak: item.pajak,
            }));
        } else {
            interfaceData = responseData.map((item: any) => ({
                harga: '',
                diskon: '',
                diskon_mu: '',
                potongan: '',
                pajak: '',
            }));
        }

        return interfaceData;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

export const HargaPembelianPerItem = async (entitas: string, kode_item: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

    try {
        const response = await axios.get(`${apiUrl}/erp/harga_per_item`, {
            params: {
                entitas: entitas,
                kode_item: kode_item,
            },
        });
        const responseData = response.data.data;
        let interfaceData = [];

        if (responseData.length > 0) {
            interfaceData = responseData.map((item: any) => ({
                harga: item.harga_mu,
                diskon: item.diskon,
            }));
        } else {
            interfaceData = responseData.map((item: any) => ({
                harga: '',
                diskon: '',
            }));
        }

        return interfaceData;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

export const AccDireksi = async (kode_sp: string, kode_entitas: any, nip: any) => {
    let jsonData;
    const response = await axios.get(`${apiUrl}/erp/list_cetakttd?`, {
        params: {
            entitas: kode_entitas,
            kode_sp: kode_sp,
        },
    });

    const cetakTtd = response.data.data;
    if (cetakTtd.length > 0) {
        if (cetakTtd[0].nip2 === null || cetakTtd[0].nip2 === '') {
            console.log(`Update dengan Nip User ${nip}`);
            jsonData = {
                entitas: kode_entitas,
                kode_dokumen: kode_sp,
                nip2: nip,
            };
            const response = await axios.patch(`${apiUrl}/erp/update_cetakttd`, jsonData);
            const result = response.data;
            const status = result.status;
            const errormsg = result.serverMessage;
            if (status === true) {
                const sts = status;
                const msg = 'success';
                const psn = 'Update';
                return { sts, msg, psn };
            } else {
                const sts = status;
                const msg = errormsg;
                const psn = 'Update';
                return { sts, msg, psn };
            }
        } else {
            console.log('Update jadi NULL');
            jsonData = {
                entitas: kode_entitas,
                kode_dokumen: kode_sp,
                nip2: '',
            };
            var jsonString = JSON.stringify(jsonData);
            console.log(jsonData);
            console.log(jsonString);

            const response = await axios.patch(`${apiUrl}/erp/update_cetakttd`, jsonData);
            const result = response.data;
            const status = result.status;
            const errormsg = result.serverMessage;
            if (status === true) {
                const sts = status;
                const msg = 'success';
                const psn = 'Update';
                return { sts, msg, psn };
            } else {
                const sts = status;
                const msg = errormsg;
                const psn = 'Update';
                return { sts, msg, psn };
            }
        }
    } else {
        jsonData = {
            entitas: kode_entitas,
            kode_dokumen: kode_sp,
            nip1: '',
            nip2: nip,
            nip3: '',
            nip4: '',
            nip5: '',
            nip6: '',
        };
        const response = await axios.post(`${apiUrl}/erp/simpan_cetakttd`, jsonData);
        const result = response.data;
        const status = result.status;
        const errormsg = result.serverMessage;
        if (status === true) {
            const sts = status;
            const msg = 'success';
            const psn = 'Simpan';
            return { sts, msg, psn };
        } else {
            const sts = status;
            const msg = errormsg;
            const psn = 'Simpan';
            return { sts, msg, psn };
        }
    }
};

export const dataDetailDok = async (kode_sp: any, kode_entitas: any): Promise<any[]> => {
    const response = await axios.get(`${apiUrl}/erp/list_detail_dok?`, {
        params: {
            entitas: kode_entitas,
            kode_sp: kode_sp,
        },
    });

    const listDetailDok = response.data.data;
    return listDetailDok;
    // setDetailDok(listDetailDok);
    // console.log(listDetailDok);
};

export const listPo = async (
    isTanggalChecked: any,
    isTanggalberlakuChecked: any,
    isTanggalkirimChecked: any,
    date1: any,
    date2: any,
    dateberlaku1: any,
    dateberlaku2: any,
    datekirim1: any,
    datekirim2: any,
    kode_entitas: any,
    tipeDokumen: any,
    isNoPOChecked: any,
    noPOValue: any,
    isNamaSuppChecked: any,
    namaSuppValue: any,
    isNamaBarangChecked: any,
    namaBarangValue: any,
    isStatusDokChecked: any,
    statusDokValue: any,
    isStatusAppChecked: any,
    statusAppValue: any,

    isPoKontrakChecked: any,
    isPoNonKontrakChecked: any,
    isPoBarangProduksiChecked: any,
    isPoDenganPajakChecked: any,
    isKirimanLangsungChecked: any,
    isPembatalanOrderChecked: any,
    isBelumAccDireksiChecked: any,
    isSudahAccDireksiChecked: any
) => {
    try {
        // Penamaan Variabel di awali dengan 'v'
        let vNoPo = isNoPOChecked ? noPOValue : 'all';
        let vTglAwal = isTanggalChecked ? moment(date1).format('YYYY-MM-DD') : 'all';
        let vTglAkhir = isTanggalChecked ? moment(date2).format('YYYY-MM-DD') : 'all';
        let vTglBerlakuAwal = isTanggalberlakuChecked ? moment(dateberlaku1).format('YYYY-MM-DD') : 'all';
        let vTglBerlakuAkhir = isTanggalberlakuChecked ? moment(dateberlaku2).format('YYYY-MM-DD') : 'all';
        let vTglKirimAwal = isTanggalkirimChecked ? moment(datekirim1).format('YYYY-MM-DD') : 'all';
        let vTglKirimAkhir = isTanggalkirimChecked ? moment(datekirim2).format('YYYY-MM-DD') : 'all';
        let vNamaSupp = isNamaSuppChecked ? namaSuppValue : 'all';
        let vNamaBarang = isNamaBarangChecked ? namaBarangValue : 'all';
        let vStatusDokumen = isStatusDokChecked ? statusDokValue : 'all';
        let vStatusApproval = isStatusAppChecked ? statusAppValue : 'all';
        let vKelSupplier = 'all';
        let vPoKontak = isPoKontrakChecked ? 'Y' : 'all';
        let vPoNonKontrak = isPoNonKontrakChecked ? 'Y' : 'all';
        let vPoBarangProduksi = isPoBarangProduksiChecked ? 'Y' : 'all';
        let vPoDenganPajak = isPoDenganPajakChecked ? 'Y' : 'all';
        let vKirimLangsung = isKirimanLangsungChecked ? 'Y' : 'all';
        let vPembatalanOrder = isPembatalanOrderChecked ? 'Y' : 'all';
        let vBelumAccDireksi = isBelumAccDireksiChecked ? 'Y' : 'all';
        let vSudahAccDireksi = isSudahAccDireksiChecked ? 'Y' : 'all';
        let vTipeDokumen = tipeDokumen === 'tipeAll' ? 'all' : tipeDokumen === 'yes' ? 'Persediaan' : 'Non Persediaan';
        let vLimit = '10000';

        const response = await axios.get(`${apiUrl}/erp/list_po_filter?`, {
            params: {
                entitas: kode_entitas,
                param1: vNoPo, // no_po
                param2: vTglAwal, // Tanggal Start
                param3: vTglAkhir, // Tanggal End
                param4: vTglBerlakuAwal, // Tanggal Berlaku Start
                param5: vTglBerlakuAkhir, // Tanggal Berlaku End
                param6: vTglKirimAwal, // Tanggal Kirim Start
                param7: vTglKirimAkhir, // Tanggal Kirim End
                param8: vNamaSupp, // Nama Supplier
                param9: vNamaBarang, // Nama Barang
                param10: vStatusDokumen, // Status Dokumen
                param11: vStatusApproval, // Status Approval
                param12: vKelSupplier, // Kelompok Supplier A B N V
                param13: vPoKontak, // PO Kontrak Y N all
                param14: vPoNonKontrak, // PO Non Kontrak Y N !== Y
                param15: vPoBarangProduksi, // PO Barang Produksi
                param16: vPoDenganPajak, // PO Dengan Pajak I E N / all
                param17: vKirimLangsung, // Kiriman Langsung Y/N/all
                param18: vPembatalanOrder, // Pembatalan Order all/Y
                param19: vBelumAccDireksi, // Belum Acc Direksi Y/all
                param20: vSudahAccDireksi, // Sudah Acc Direksi Y/all
                param21: vLimit,
                param22: vTipeDokumen,
            },
        });

        const responseData = response.data.data;
        return { responseData };
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

export const refreshListData = async (dataObject: any) => {
    const {
        kode_entitas,
        vNoPo,
        vTglAwal,
        vTglAkhir,
        vTglBerlakuAwal,
        vTglBerlakuAkhir,
        vTglKirimAwal,
        vTglKirimAkhir,
        vNamaSupp,
        vNamaBarang,
        vStatusDokumen,
        vStatusApproval,
        vKelSupplier,
        vPoKontak,
        vPoNonKontrak,
        vPoBarangProduksi,
        vPoDenganPajak,
        vKirimLangsung,
        vPembatalanOrder,
        vBelumAccDireksi,
        vSudahAccDireksi,
        vLimit,
        vTipeDokumen,
    } = dataObject;
    try {
        const response = await axios.get(`${apiUrl}/erp/list_po_filter?`, {
            params: {
                entitas: kode_entitas,
                param1: vNoPo, // no_po
                param2: vTglAwal, // Tanggal Start
                param3: vTglAkhir, // Tanggal End
                param4: vTglBerlakuAwal, // Tanggal Berlaku Start
                param5: vTglBerlakuAkhir, // Tanggal Berlaku End
                param6: vTglKirimAwal, // Tanggal Kirim Start
                param7: vTglKirimAkhir, // Tanggal Kirim End
                param8: vNamaSupp, // Nama Supplier
                param9: vNamaBarang, // Nama Barang
                param10: vStatusDokumen, // Status Dokumen
                param11: vStatusApproval, // Status Approval
                param12: vKelSupplier, // Kelompok Supplier A B N V
                param13: vPoKontak, // PO Kontrak Y N all
                param14: vPoNonKontrak, // PO Non Kontrak Y N !== Y
                param15: vPoBarangProduksi, // PO Barang Produksi
                param16: vPoDenganPajak, // PO Dengan Pajak I E N / all
                param17: vKirimLangsung, // Kiriman Langsung Y/N/all
                param18: vPembatalanOrder, // Pembatalan Order all/Y
                param19: vBelumAccDireksi, // Belum Acc Direksi Y/all
                param20: vSudahAccDireksi, // Sudah Acc Direksi Y/all
                param21: vLimit,
                param22: vTipeDokumen,
            },
        });

        const responseData = response.data.data;
        return responseData;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

export const loadFileGambarById = async (kode_entitas: any, kodeSp: any, totActiveTab: any) => {
    const response = await axios.get(`${apiUrl}/erp/load_fileGambar_byId`, {
        params: {
            entitas: kode_entitas,
            param1: kodeSp,
            param2: totActiveTab + 1,
        },
    });
    const fileGambarById = response.data.data;
    return fileGambarById;
};
