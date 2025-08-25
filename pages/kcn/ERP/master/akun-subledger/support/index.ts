import { myAlertGlobal } from '@/utils/routines';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
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
export interface FilterDef {
    noSubledgerValue: string;
    keteranganValue: string;
    akunBukuBesarValue: string;
    nonAktifValue: string;
    isNoSubledgerChecked: boolean;
    isKeteranganChecked: boolean;
    isAkunBukuBesarChecked: boolean;
}

export interface SettingsType {
    kode: string;
    reminder: string;
    reminder_piutang: string;
    hari_piutang: number;
    reminder_diskon_piutang: string;
    reminder_hutang: string;
    hari_diskon_piutang: number;
    hari_hutang: number;
    reminder_diskon_hutang: string;
    hari_diskon_hutang: number;
    reminder_warkat: string;
    hari_warkat: number;
    hari_opname: number;
    reminder_pp: string;
    reminder_po: string;
    reminder_pb: string;
    reminder_so: string;
    reminder_spm: string;
    reminder_sj: string;
    reminder_reorder: string;
    plafond_kredit: string;
    kode_termin_jual: any;
    kode_termin_beli: any;
    kode_akun_piutang: string;
    kode_akun_piutang_bg: string;
    kode_akun_persediaan: string;
    kode_akun_jual: string;
    kode_akun_retjual: string;
    kode_akun_diskon_jual: string;
    kode_akun_diskon_item: string;
    kode_akun_hpp: string;
    kode_akun_retbeli: string;
    kode_akun_biaya: string;
    kode_akun_hutang: string;
    kode_akun_hutang_bg: string;
    kode_akun_diskon_beli: string;
    kode_akun_rl_berjalan: string;
    kode_akun_rl_ditahan: string;
    kode_akun_rl_kurs: any;
    kode_akun_rl_pembulatan: string;
    kode_akun_pengiriman: string;
    kode_akun_uangmukabeli: string;
    kode_akun_uangmukajual: string;
    kode_akun_kerusakan_barang: string;
    kode_akun_kas: string;
    kode_akun_kastunai: string;
    kode_akun_penjualan_cabang: string;
    kode_akun_modal: string;
    kode_gudang: string;
    kode_mu: string;
    item_kustom1: string;
    item_tampil1: string;
    item_kustom2: string;
    item_tampil2: string;
    item_kustom3: string;
    item_tampil3: string;
    item_kustom4: string;
    item_tampil4: string;
    item_kustom5: string;
    item_tampil5: string;
    item_kustom6: string;
    item_tampil6: string;
    item_kustom7: string;
    item_tampil7: string;
    item_kustom8: string;
    item_tampil8: string;
    item_kustom9: string;
    item_tampil9: string;
    item_kustom10: string;
    item_tampil10: string;
    skip_persediaan: string;
    skip_plafond: string;
    multiproduk: string;
    audittrail: string;
    showbi: string;
    idletime: number;
    kode_akun_debet: string;
    kode_akun_dtunai: string;
    kode_akun_kredit: string;
    kode_akun_kdiskon: string;
    kode_akun_kbiaya: string;
    kode_akun_voucher: string;
    kode_akun_bulat: string;
    pesanpos: any;
    kode_akun_fnp: string;
    pesanstruk1: any;
    pesanstruk2: any;
    pesanstruk3: any;
    savetiming: string;
    smspiutangcust: string;
    smspiutangsales: string;
    smskontakkonfirm: string;
    kode_jual: string;
    showmenu: string;
    voip: string;
    kode_jualpos: string;
    kode_akun_bebbulat: string;
    kode_akun_pendbulat: string;
    wa_piutangcust: string;
    wa_ordercust: string;
    wa_ordersales: string;
    wa_proseskirim: string;
    wa_sales: string;
    wa_logistik: string;
    wa_keuangan: string;
    wa_hormatkami: string;
    wa_manager: string;
    wa_regional: string;
    wa_direktur: string;
    hari_nonaktif: number;
    wa_po: string;
    wa_comm1: string;
    wa_comm2: string;
    wa_comm3: string;
    wa_comm4: string;
    wa_comm5: string;
    wa_comm6: string;
    wa_comm7: string;
    wa_comm8: string;
    wa_comm9: string;
    wa_comm10: string;
    wa_comm11: string;
    wa_comm12: string;
    wa_comm13: string;
    wa_comm14: string;
    wa_comm15: string;
    wa_comm16: string;
    wa_comm17: string;
    wa_comm18: string;
    wa_comm19: string;
    wa_comm20: string;
    wa_akunting: string;
    nama_manager: string;
    max_validasi_ppi2: number;
    max_validasi_ppi3: number;
    nama_bank1: string;
    nama_bank2: any;
    nama_bank3: any;
    nama_bank4: any;
    nama_bank5: any;
    nama_bank6: any;
    target_call: number;
    bonus_call: string;
    min_call: string;
    efektif_outlet: number;
    bonus_efektif: string;
    min_efektif: string;
    hari_overdue: number;
    block_kas_negatif: string;
    block_backdate: string;
    total_kunjungan_harian: number;
    tarif_uang_saku: number;
    persentase_ach_uang_saku: string;
    nama_comm1: string;
    nama_comm2: string;
    nama_comm3: string;
    nama_comm4: string;
    nama_comm5: string;
    nama_comm6: string;
    nama_comm7: string;
    nama_comm8: string;
    nama_comm9: string;
    nama_comm10: string;
    nama_comm11: string;
    nama_comm12: string;
    nama_comm13: string;
    nama_comm14: string;
    nama_comm15: any;
    nama_comm16: any;
    nama_comm17: any;
    nama_comm18: any;
    nama_comm19: any;
    nama_comm20: string;
    nama_sales_wa: string;
    nama_logistik_wa: string;
    nama_sku: string;
    nama_rm: string;
    nama_dir: string;
    kode_akun_dbaset: string;
    kode_akun_craset: string;
    kode_akun_dbeks: string;
    kode_akun_creks: string;
    kode_akun_crrpe: string;
    kode_akun_pika: string;
    kode_akun_creksho: any;
    toleransi_arod: number;
    kode_termin: string;
    hari_blacklist: number;
    kode_akun_piutangsales: string;
    kode_sub_pika: string;
    profit_minso: string;
    oprs_nip: string;
    oprs_manager: string;
    oprs_tanggal: string;
    komisi_bulanan: string;
    nilai_kali_komisi: string;
    bulan_opname_asset: number;
    kode_akun_transfer: string;
    tutup_menu: string;
    kode_akun_non_persediaan: any;
    kode_akun_non_beban_perlengkapan: any;
    no_hutang: string;
    nama_hutang: string;
    tipe_hutang: string;
    no_diskon_beli: string;
    nama_diskon_beli: string;
    tipe_diskon_beli: string;
    no_kirim: string;
    nama_kirim: string;
    tipe_kirim: string;
    no_beban: string;
    nama_beban: string;
    tipe_beban: string;
    no_retbeli: string;
    nama_retbeli: string;
    tipe_retbeli: string;
    no_piutang: string;
    nama_piutang: string;
    tipe_piutang: string;
    no_diskon_item: string;
    nama_diskon_item: string;
    tipe_diskon_item: string;
    no_persediaan: string;
    nama_persediaan: string;
    tipe_persediaan: string;
    no_uangmukabeli: string;
    nama_uangmukabeli: string;
    tipe_uangmukabeli: string;
    no_penjualan: string;
    nama_penjualan: string;
    tipe_penjualan: string;
    no_retjual: string;
    nama_retjual: string;
    tipe_retjual: string;
    no_diskon_jual: string;
    nama_diskon_jual: string;
    tipe_diskon_jual: string;
    no_hpp: string;
    nama_hpp: string;
    tipe_hpp: string;
    no_rl_berjalan: string;
    nama_rl_berjalan: string;
    tipe_rl_berjalan: string;
    no_rl_ditahan: string;
    nama_rl_ditahan: string;
    tipe_rl_ditahan: string;
    no_rl_kurs: any;
    nama_rl_kurs: any;
    tipe_rl_kurs: any;
    no_uangmukajual: string;
    nama_uangmukajual: string;
    tipe_uangmukajual: string;
    isledger_uangmukajual: string;
    no_termin_jual: any;
    nama_termin_jual: any;
    tipe_termin_jual: any;
    no_termin_beli: any;
    nama_termin_beli: any;
    tipe_termin_beli: any;
    no_kerusakan_barang: string;
    nama_kerusakan_barang: string;
    tipe_kerusakan_barang: string;
    no_kas: string;
    nama_kas: string;
    tipe_kas: string;
    no_kastunai: string;
    nama_kastunai: string;
    tipe_kastunai: string;
    no_hutang_bg: string;
    nama_hutang_bg: string;
    tipe_hutang_bg: string;
    no_piutang_bg: string;
    nama_piutang_bg: string;
    tipe_piutang_bg: string;
    nama_gudang: string;
    alamat_gudang: string;
    alamat_gudang2: any;
    no_rl_pembulatan: string;
    nama_rl_pembulatan: string;
    tipe_rl_pembulatan: string;
    no_penjualan_cabang: string;
    nama_penjualan_cabang: string;
    no_modal: string;
    nama_modal: string;
    no_transfer: string;
    nama_transfer: string;
    no_debet: string;
    nama_debet: string;
    no_dtunai: string;
    nama_dtunai: string;
    no_kredit: string;
    nama_kredit: string;
    no_kdiskon: string;
    nama_kdiskon: string;
    no_kbiaya: string;
    nama_kbiaya: string;
    no_voucher: string;
    nama_voucher: string;
    no_bulat: string;
    nama_bulat: string;
    no_fnp: string;
    nama_fnp: string;
    no_beban_bulat: string;
    nama_beban_bulat: string;
    tipe_beban_bulat: string;
    no_pend_bulat: string;
    nama_pend_bulat: string;
    tipe_pend_bulat: string;
    no_debet_aset: string;
    nama_debet_aset: string;
    tipe_debet_aset: string;
    no_kredit_aset: string;
    nama_kredit_aset: string;
    tipe_kredit_aset: string;
    no_debet_eks: string;
    nama_debet_eks: string;
    tipe_debet_eks: string;
    no_kredit_eks: string;
    nama_kredit_eks: string;
    tipe_kredit_eks: string;
    no_akun_pika: string;
    nama_akun_pika: string;
    tipe_akun_pika: string;
    no_kredit_rpe: string;
    nama_kredit_rpe: string;
    tipe_kredit_rpe: string;
    no_kredit_eksho: any;
    nama_kredit_eksho: any;
    tipe_kredit_eksho: any;
    no_piutang_sales: string;
    nama_piutang_sales: string;
    tipe_piutang_sales: string;
    nama_termin: string;
    hari: number;
    persen: string;
    tempo: number;
    cod: string;
    sub_pika: string;
}

export interface SubledgerType {
    kode_subledger: string;
    kode_akun: string;
    no_subledger: string;
    nama_subledger: string;
    aktif: string;
    catatan: any;
    userid: string;
    tgl_update: string;
    kode_relasi: any;
    no_akun: string;
    nama_akun: string;
    normal: string;
    namaakun: string;
    balance: string;
}
export interface SubledgerSingleType {
    kode_subledger: string;
    kode_akun: string;
    no_subledger: string;
    nama_subledger: string;
    aktif: string;
    catatan: any;
    userid: string;
    tgl_update: string;
    kode_relasi: any;
    Old_kode_akun?: string;
    Old_no_subledger?: string | null;
}
export const CheckControlEditor = (subledgerData: SubledgerSingleType): boolean => {
    let isChecked = true;
    if (subledgerData.kode_akun === '') {
        myAlertGlobal('Akun Buku Besar belum diisi', 'FrmDialogSubledger', 'warning');
        isChecked = false;
    } else if (subledgerData.no_subledger === '') {
        myAlertGlobal('No. Subledger belum diisi', 'FrmDialogSubledger', 'warning');
        isChecked = false;
    } else if (subledgerData.nama_subledger === '') {
        myAlertGlobal('Nama belum diisi', 'FrmDialogSubledger', 'warning');
        isChecked = false;
    }
    return isChecked;
};
export const fetchSubledgerData = async (entitas: string, token: string, params: FilterDef) => {
    try {
        const respone = await axios.get(`${apiUrl}/erp/master/akun-subledger/list_akun_subledger`, {
            params: {
                entitas: entitas,
                param1: params.isNoSubledgerChecked ? params.noSubledgerValue : 'all',
                param2: params.isKeteranganChecked ? params.keteranganValue : 'all',
                param3: params.isAkunBukuBesarChecked ? params.akunBukuBesarValue : 'all',
                param4: params.nonAktifValue === '' ? 'all' : params.nonAktifValue,
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
export const fetchSubledgerSingleData = async (entitas: string, token: string, kodeSubledger: string) => {
    try {
        const respone = await axios.get(`${apiUrl}/erp/master/akun-subledger/detail_subledger`, {
            params: {
                entitas: entitas,
                param1: kodeSubledger,
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
export const fecthLookupAkun = async (entitas: string, token: string) => {
    try {
        const respone = await axios.get(`${apiUrl}/erp/master/akun-subledger/lookup_akun`, {
            params: {
                entitas: entitas,
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
export const fetchSetting = async (entitas: string, token: string) => {
    try {
        const respone = await axios.get(`${apiUrl}/erp/setting`, {
            params: {
                entitas: entitas,
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
export const fetchKaryawan = async (entitas: string, token: string) => {
    try {
        const respone = await axios.post(`http://10.10.1.109/api/v1/hris/list_employee_dlg`, {
            entitas: entitas,
            param1: 'all',
            param2: parseInt(entitas),
            param3: 'all',
            param4: 'all',
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
export const fetchCustomer = async (entitas: string, token: string, params: any) => {
    try {
        const respone = await axios.get(`${apiUrl}/erp/master/akun-subledger/list_customer`, {
            params: {
                entitas: entitas,
                param1: params.param1 === '' ? 'all' : params.param1,
                param2: params.param2 === '' ? 'all' : params.param2,
                param3: params.param3 === '' ? 'all' : params.param3,
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
export const fetchSales = async (entitas: string, token: string) => {
    try {
        const respone = await axios.get(`${apiUrl}/erp/master/akun-subledger/list_salesman`, {
            params: {
                entitas: entitas,
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

export const postSimpanSubledger = async (entitas: string, token: string, JSON: any) => {
    try {
        const respone = await axios.post(`${apiUrl}/erp/master/akun-subledger/simpan_subledger`, JSON, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return respone.data;
    } catch (error) {
        withReactContent(swalToast).fire({
            icon: 'error',
            title: `<p style="font-size:12px">Gagal Mengambil Data.</p>`,
            width: '100%',
            target: '#FrmDialogSubledger',
        });
    }
};
export const postHapusSubledger = async (entitas: string, token: string, JSON: any) => {
    try {
        const respone = await axios.post(
            `${apiUrl}/erp/master/akun-subledger/hapus_subledger`,
            {
                entitas: entitas,
                ...JSON,
            },
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        return respone.data;
    } catch (error) {
        withReactContent(swalToast).fire({
            icon: 'error',
            title: `<p style="font-size:12px">Terjadi Kesahalahan.</p>`,
            width: '100%',
            target: '#FrmDialogSubledger',
        });
    }
};
