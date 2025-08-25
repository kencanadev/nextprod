import axios from 'axios';
import moment from 'moment';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
export const KaryawanURL = apiUrl + '/erp/master/daftar-karyawan';
export const swalToast = Swal.mixin({
    toast: true,
    position: 'center',
    customClass: {
        popup: 'colored-toast',
    },
    showConfirmButton: false,
    timer: 5500,
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
export interface FilterDef {
    TahunBebanValue: number | null;
    NamaKaryawanValue: string;
    isNamaKaryawanChecked: boolean;
    StatusKaryawanValue: string;
}
export const styleButton = { width: 77 + 'px', height: '28px', marginBottom: '0.5em', marginTop: 0.5 + 'em', marginRight: 0.8 + 'em', backgroundColor: '#3b3f5c' };

export interface KaryawanType {
    kode_kry: string;
    nama_kry: string;
    kode_sales: any;
    kode_hrm: any;
    jabatan: string;
    userid: string;
    tgl_update: string;
    tgl_gabung: any;
    tgl_masuk: any;
    tgl_keluar: any;
    aktif: string;
    bank_account: any;
    bank_code: any;
    account_name: any;
    salesman: any;
    nilai: any;
}
export type KaryawanSingleType = {
    kode_kry: string;
    nama_kry: string;
    kode_sales: string;
    kode_hrm: any;
    jabatan: string;
    userid: string;
    tgl_update: string;
    tgl_gabung: any;
    tgl_masuk: any;
    tgl_keluar: any;
    aktif: string;
    bank_account: any;
    bank_code: any;
    account_name: any;
    nama_sales: string;
};
export const fetchDataKaryawan = async (entitas: string, token: string, params: FilterDef) => {
    try {
        const respone = await axios.get(`${KaryawanURL}/list_karyawan`, {
            params: {
                entitas: entitas,
                param1: params.TahunBebanValue ? params.TahunBebanValue : 'all',
                param2: params.isNamaKaryawanChecked ? params.NamaKaryawanValue : 'all',
                param3: params.StatusKaryawanValue,
            },
            headers: { Authorization: `Bearer ${token}` },
        });
        return respone.data.data.map((item: KaryawanType) => {
            return {
                ...item,
                nilai: parseFloat(item.nilai),
            };
        });
    } catch (error) {
        console.error('Error fetching data Akun :', error);
        withReactContent(swalToast).fire({
            icon: 'error',
            title: `<p style="font-size:12px">Gagal Mengambil Data.</p>`,
            width: '100%',
            target: '#daftarAkun',
        });
    }
};
export const fetchDataDetailKaryawan = async (entitas: string, token: string, KodeKry: string) => {
    try {
        const respone = await axios.get(`${KaryawanURL}/detail_karyawan`, {
            params: {
                entitas: entitas,
                param1: KodeKry,
            },
            headers: { Authorization: `Bearer ${token}` },
        });
        return respone.data.data.map((item: KaryawanSingleType) => {
            return {
                ...item,
                tgl_gabung: item.tgl_gabung !== null ? moment(item.tgl_gabung).format('DD-MM-YYYY') : null,
                tgl_update: item.tgl_update !== null ? moment(item.tgl_update).format('DD-MM-YYYY') : null,
            };
        });
    } catch (error) {
        console.error('Error fetching data Akun :', error);
        withReactContent(swalToast).fire({
            icon: 'error',
            title: `<p style="font-size:12px">Gagal Mengambil Data.</p>`,
            width: '100%',
            target: '#daftarAkun',
        });
    }
};
export const fecthDataJabatan = async (entitas: string, token: string) => {
    try {
        const respone = await axios.get(`${KaryawanURL}/jabatan_karyawan`, {
            params: {
                entitas: entitas,
            },
            headers: { Authorization: `Bearer ${token}` },
        });
        return respone.data.data;
    } catch (error) {
        console.error('Error fetching data Akun :', error);
        withReactContent(swalToast).fire({
            icon: 'error',
            title: `<p style="font-size:12px">Gagal Mengambil Data Jabatan.</p>`,
            width: '100%',
            target: '#daftarAkun',
        });
    }
};
export const fetchSales = async (entitas: string, token: string, KodeSales?: string, NoSales?: string, NamaSales?: string) => {
    try {
        const respone = await axios.get(`${KaryawanURL}/salesman_karyawan`, {
            params: {
                entitas: entitas,
                param1: KodeSales,
                param2: NoSales ?? 'all',
                param3: NamaSales ?? 'all',
            },
            headers: { Authorization: `Bearer ${token}` },
        });
        return respone.data.data;
    } catch (error) {
        console.error('Error fetching data Look up Akun :', error);
        withReactContent(swalToast).fire({
            icon: 'error',
            title: `<p style="font-size:12px">Gagal Mengambil Data.</p>`,
            width: '100%',
            target: '#daftarAkun',
        });
    }
};

export const postSimpanKaryawan = async (proses: string, token: string, data: any) => {
    try {
        const method = proses === 'update' ? 'patch' : 'post';
        const response = await axios[method](`${KaryawanURL}/${proses === 'update' ? 'update_karyawan' : 'simpan_karyawan'}`, data, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error: any) {
        return error.response.data;
    }
};
export const updateKaryawanHris = async (token: string, data: any) => {
    try {
        const response = await axios.post(`${KaryawanURL}/update_karyawan_hris`, data, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error: any) {
        return error.response.data;
    }
};
export const OnClickDetailBeban = (paramObject: any) => {
    let height = window.screen.availHeight - 150;
    let width = window.screen.availWidth - 200;
    let leftPosition = window.screen.width / 2 - (width / 2 + 10);
    let topPosition = window.screen.height / 2 - (height / 2 + 50);
    console.log('MASUK ONCLICK DETAIL BEBAN');
    let iframeSrc = `./daftar-karyawan/report/ReportBebanKaryawan?entitas=${paramObject.entitas}&kode_kry=${paramObject.kode_kry}&tahun=${paramObject.tahun}&token=${paramObject.token}`;

    fetch(iframeSrc)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then(() => {
            let iframe = `
            <html><head>
            <title>Laporan Detail Beban Karyawan | Next KCN Sytem</title>
            <style>body, html {width: 100%; height: 100%; margin: 0; padding: 0}</style>
            </head><body>
            <iframe src="${iframeSrc}" style="height:calc(100% - 4px);width:calc(100% - 4px)"></iframe>
            </body></html>`;

            let win = window.open(
                '',
                '_blank',
                `status=no,width=${width},height=${height},resizable=yes
                ,left=${leftPosition},top=${topPosition}
                ,screenX=${leftPosition},screenY=${topPosition}
                ,toolbar=no,menubar=no,scrollbars=no,location=no,directories=no`
            );

            if (win) {
                let link = win.document.createElement('link');
                link.type = 'image/png';
                link.rel = 'shortcut icon';
                link.href = '/favicon.png';
                win.document.getElementsByTagName('head')[0].appendChild(link);
                win.document.write(iframe);
            } else {
                console.error('Window failed to open.');
            }
        })
        .catch((error) => {
            console.error('Failed to load resource:', error);
        });
};
export const postDeleteKaryawan = async (entitas: string, token: string, KodeKry: string, userid: string) => {
    try {
        const respone = await axios.post(
            `${KaryawanURL}/hapus_karyawan`,
            {
                entitas: entitas,
                kode_kry: KodeKry,
                userid: userid,
            },
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        return respone.data;
    } catch (error) {
        withReactContent(swalToast).fire({
            icon: 'error',
            title: `<p style="font-size:12px">Gagal Mengambil Data.</p>`,
            width: '100%',
            target: '#daftarSubledger',
        });
    }
};
