import axios, { AxiosResponse } from 'axios';
const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';

const getListKonsolidasiRba = async (paramObject: any) => {
    if (paramObject.kode_entitas || paramObject.token) {
        const response = await axios.get(`${apiUrl}/erp/list_rba_konsolidasi?`, {
            params: {
                entitas: paramObject.kode_entitas,
                param1: paramObject.tglAwal,
                param2: paramObject.tglAkhir,
                param3: paramObject.noBa,
                param4: paramObject.namaEkspedisi,
                param5: paramObject.namaSupplier,
                param6: paramObject.noReff,
                param7: paramObject.noFbm,
                param8: paramObject.noFj,
                param9: paramObject.status,
                param10: paramObject.lunas,
            },
            headers: {
                Authorization: `Bearer ${paramObject.token}`,
            },
        });

        const listKonsolidasiRba = response.data.data;
        return listKonsolidasiRba;
    } else {
        return [];
    }
};

const GetAllEntitas = async (kode_entitas: any, token: any) => {
    if (kode_entitas || token) {
        const response = await axios.get(`${apiUrl}/erp/entitas_pajak?`, {
            params: {
                // Belum Sesuai Jumlah Data yang Muncul = [Semua, A-F]
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const filteredData = response.data.data.filter((item: any) => item.tampil === 'Y' && item.kodecabang !== '898');
        const temp = filteredData.filter((item: any) => item.tampil === 'Y' && item.kodecabang !== '899');
        return temp;
    } else {
        return [];
    }
};

const PostUpdateCatatan = async (jsonData: any, token: any, kode_entitas: any) => {
    if (kode_entitas || token) {
        const response = await axios.post(`${apiUrl}/erp/update_rba_konsolidasi`, jsonData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response;
    } else {
        return null;
    }
};

const GetListDetailKonsolidasiRba = async (paramObject: any) => {
    if (paramObject.kode_entitas || paramObject.token) {
        const response = await axios.get(`${apiUrl}/erp/detail_rba_konsolidasi?`, {
            params: {
                entitas: paramObject.kode_entitas,
                param1: paramObject.kode_rpeba,
            },
            headers: {
                Authorization: `Bearer ${paramObject.token}`,
            },
        });

        const GetListDetailKonsolidasiRba = response.data;
        return GetListDetailKonsolidasiRba;
    } else {
        return [];
    }
};

const GetListNoRekCabang = async (kode_entitas: any, token: any) => {
    if (kode_entitas || token) {
        const response = await axios.get(`${apiUrl}/erp/list_norek_cabang?`, {
            params: {
                entitas: kode_entitas,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data.data;
    } else {
        return [];
    }
};

const GetCekAppRba = async (kode_entitas: any, token: any, kode_user: any) => {
    if (kode_entitas || token) {
        const response = await axios.get(`${apiUrl}/erp/cek_blacklist_app?`, {
            params: {
                entitas: kode_entitas,
                param1: kode_user,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data.data;
    } else {
        return [];
    }
};

// API yang digunakan untuk menganbil respone Imgaes
const GetTbImagesRPEBA = async (kode_entitas: string, kode_rpeba: any) => {
    if (kode_entitas) {
        const response = await axios.get(`${apiUrl}/erp/load_fileGambar`, {
            params: {
                entitas: kode_entitas,
                param1: `${kode_entitas}RPEBA${kode_rpeba}`,
            },
        });
        const get_tb_images = response.data.data;
        return get_tb_images;
    } else {
        return [];
    }
};

// API yang digunakan untuk menganbil respone Imgaes
const GetCekDataReportRBA = async (kode_entitas: string, kode_rpeba: any, token: any) => {
    if (kode_entitas) {
        const response = await axios.get(`${apiUrl}/erp/report_rba_fix`, {
            params: {
                entitas: kode_entitas,
                param1: kode_rpeba,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const GetCekDataReportRBA = response.data;
        return GetCekDataReportRBA;
    } else {
        return [];
    }
};

const getListRba = async (paramObject: any) => {
    if (paramObject.kode_entitas || paramObject.token) {
        const response = await axios.get(`${apiUrl}/erp/list_realisasi_berita_acara?`, {
            params: {
                entitas: paramObject.kode_entitas,
                param1: paramObject.noRba,
                param2: paramObject.namaEkspedisi,
                param3: paramObject.tglAwal,
                param4: paramObject.tglAkhir,
                param5: paramObject.namaSupplier,
                param6: paramObject.noReff,
                param7: paramObject.noFbm,
                param8: paramObject.noFj,
                param9: paramObject.status,
            },
            headers: {
                Authorization: `Bearer ${paramObject.token}`,
            },
        });

        const listRba = response.data.data;
        return listRba;
    } else {
        return [];
    }
};

const getListDaftarFbm = async (paramObject: any) => {
    if (paramObject.kode_entitas || paramObject.token) {
        const response = await axios.get(`${apiUrl}/erp/dialog_fbm_rba_konsolidasi?`, {
            params: {
                entitas: paramObject.kode_entitas,
            },
            headers: {
                Authorization: `Bearer ${paramObject.token}`,
            },
        });

        const listDaftarFbm = response.data.data;
        return listDaftarFbm;
    } else {
        return [];
    }
};

//=================================================================
// API yang digunakan untuk menganbil respone Imgaes
const GetDetailFbm = async (kode_entitas: string, kode_fbm: any, tipe: any, token: any) => {
    if (kode_entitas || token) {
        const getImage = await axios.get(`${apiUrl}/erp/detail_realisasi_berita_acara?`, {
            params: {
                entitas: kode_entitas,
                param1: kode_fbm,
                param2: tipe,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const get_tb_images = getImage.data.data;
        return get_tb_images;
    } else {
        return [];
    }
};

// perubahaan / penambahan API
// 2025-05-26
const GetSettingAC = async (kode_entitas: string, token: any) => {
    if (kode_entitas || token) {
        const getSettingAc = await axios.get(`${apiUrl}/erp/setting_ac?`, {
            params: {
                entitas: kode_entitas,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const respSettingAc = getSettingAc.data.data;
        return respSettingAc;
    } else {
        return [];
    }
};

const GetHargaKontrak = async (entitasPusat: string, kode_item: any, no_kontrak: any, token: any) => {
    if (entitasPusat || token) {
        const GetHargaKontrak = await axios.get(`${apiUrl}/erp/get_harga_kontrak?`, {
            params: {
                entitas: entitasPusat,
                param1: kode_item,
                param2: no_kontrak,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const respHargaKontrakPusat = GetHargaKontrak.data.data;
        return respHargaKontrakPusat;
    } else {
        return [];
    }
};
//====

export {
    GetSettingAC,
    GetHargaKontrak,
    GetDetailFbm,
    getListDaftarFbm,
    getListRba,
    GetCekDataReportRBA,
    GetTbImagesRPEBA,
    GetCekAppRba,
    GetListNoRekCabang,
    GetListDetailKonsolidasiRba,
    PostUpdateCatatan,
    GetAllEntitas,
    getListKonsolidasiRba,
};
