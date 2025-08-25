import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import axios from 'axios';
import { myAlertGlobal } from '@/utils/routines';
const apiUrl = process.env.NEXT_PUBLIC_LOGIN_API || '';
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
export const styleButton = { width: 77 + 'px', height: '28px', marginBottom: '0.5em', marginTop: 0.5 + 'em', marginRight: 0.8 + 'em', backgroundColor: '#3b3f5c' };
export interface DepartementType {
    kode_dept: string;
    no_dept: string;
    nama_dept: string;
    aktif: string;
    personal: any;
    catatan: any;
    userid: string;
    tgl_update: string;
}
export const CheckControlEditor = (departemenData: DepartementType): boolean => {
    let isChecked = true;
    if (departemenData.no_dept === '') {
        myAlertGlobal('No. Departemen belum diisi', 'FrmDepartemenDlg', 'warning');
        isChecked = false;
    } else if (departemenData.nama_dept === '') {
        myAlertGlobal('Nama Departemen belum diisi', 'FrmDepartemenDlg', 'warning');
        isChecked = false;
    }
    return isChecked;
};
export const fetchDepartemenData = async (entitas: string, token: string) => {
    try {
        const respone = await axios.get(`${apiUrl}/erp/master/departement/list_departement`, {
            params: {
                entitas: entitas,
            },
            headers: { Authorization: `Bearer ${token}` },
        });
        return respone.data.data;
    } catch (error) {
        console.error('Error fetching data Subledger :', error);
        withReactContent(swalToast).fire({
            icon: 'error',
            title: `<p style="font-size:12px">Gagal Mengambil Data.</p>`,
            width: '100%',
            target: '#daftarSubledger',
        });
    }
};
export const fetchSingleDepartemenData = async (entitas: string, token: string, kodeDept: string) => {
    try {
        const respone = await axios.get(`${apiUrl}/erp/master/departement/detail_departement`, {
            params: {
                entitas: entitas,
                param1: kodeDept,
            },
            headers: { Authorization: `Bearer ${token}` },
        });
        return respone.data.data[0];
    } catch (error) {
        console.error('Error fetching data Subledger :', error);
        withReactContent(swalToast).fire({
            icon: 'error',
            title: `<p style="font-size:12px">Gagal Mengambil Data.</p>`,
            width: '100%',
            target: '#daftarSubledger',
        });
    }
};
export const postSimpanDepartemen = async (entitas: string, token: string, params: DepartementType) => {
    try {
        const newJSON = {
            entitas: entitas,
            ...params,
        };
        const respone = await axios.post(`${apiUrl}/erp/master/departement/simpan_departement`, newJSON, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return respone.data;
    } catch (error: any) {
        const response: string = error.response.data.error;
        const message = response.includes('Duplicate') ? `Departemen ${params.nama_dept} sudah ada` : 'Gagal Menyimpan Data';
        withReactContent(swalToast).fire({
            icon: 'error',
            title: `<p style="font-size:12px">${message}.</p>`,
            width: '100%',
            target: '#FrmDepartemenDlg',
        });
    }
};
export const postUpdateDepartemen = async (entitas: string, token: string, params: DepartementType) => {
    try {
        const newJSON = {
            entitas: entitas,
            ...params,
        };
        const respone = await axios.patch(`${apiUrl}/erp/master/departement/update_departement`, newJSON, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return respone.data;
    } catch (error: any) {
        const response: string = error.response.data.error;
        const message = response.includes('Duplicate') ? `Departemen ${params.nama_dept} sudah ada` : 'Gagal Menyimpan Data';
        withReactContent(swalToast).fire({
            icon: 'error',
            title: `<p style="font-size:12px">${message}.</p>`,
            width: '100%',
            target: '#FrmDepartemenDlg',
        });
    }
};
export const postDeleteDepartemen = async (entitas: string, token: string, kodeDept: string) => {
    try {
        const respone = await axios.post(
            `${apiUrl}/erp/master/departement/delete_departement`,
            {
                entitas: entitas,
                kode_dept: kodeDept,
            },
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        return respone.data.data;
    } catch (error) {
        withReactContent(swalToast).fire({
            icon: 'error',
            title: `<p style="font-size:12px">Gagal Mengambil Data.</p>`,
            width: '100%',
            target: '#daftarSubledger',
        });
    }
};
