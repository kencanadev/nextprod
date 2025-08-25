import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { GridComponent, ColumnsDirective, ColumnDirective, Inject, Edit, Toolbar, Grid, ContextMenu } from '@syncfusion/ej2-react-grids';
import React, { Fragment, useEffect, useRef, useState } from 'react';
import { fetchBankData, keteranganList, postSimpanBank, UpdateInformasiRekening } from './api';
import { Dialog, Transition } from '@headlessui/react';
import { DataManager } from '@syncfusion/ej2/data';
import DialogAKunBank from './AkunDialog';
import { TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import moment from 'moment';
const swalToast = swal.mixin({
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
interface Props {
    isOpen: boolean;
    onClose: () => void;
    entitas: string;
    token: string;
    userid: string;
}
interface BankListType {
    id: number;
    nama_bank: string;
    userid: string;
    tgl_update: string;
}
interface DetailBankType {
    id: number;
    kode_akun: string;
    nama_bank: string;
    no_rekening: string;
    nama_rekening: string;
    aktif: boolean;
    tgl_update: string;
    userid: string;
    keterangan: string | null;
    saldo_endap: string;
    saldo_akhir: string;
    saldo_real: string;
    nominal_ready: string;
    tgl_buka_rek: moment.Moment | null;
    tgl_tutup_rek: moment.Moment | null;
    no_akun: string;
    nama_akun: string;
}
const BankDialog = ({ isOpen, onClose, entitas, token, userid }: Props) => {
    // Definisi or State
    const gridMasterRef = useRef<GridComponent | null>(null);
    const gridDetailRef = useRef<GridComponent | null>(null);
    const [bankMaster, setBankMaster] = useState<BankListType[]>([]);
    const [bankDetails, setBankDetails] = useState<DetailBankType[]>([]);
    const [selectedNamaBankRow, setSelectedNamaBankRow] = useState<string>('');
    const [showAkunDialog, setShowAkunDialog] = useState(false);
    const [indexSelected, setIndexSelected] = useState(0);
    const [loadingButton, setLoadingButton] = useState(false);
    const [loadingUpdateButton, setLoadingUpdateButton] = useState(false);
    const [loading, setLoading] = useState(false);
    const [afterUpdate, setAfterUpdate] = useState(false);
    const [loadingText, setLoadingText] = useState('Mohon Tunggu');
    // Fungsi
    const footerTemplate = () => {
        return (
            <div className="mx-auto flex items-center justify-between">
                <div className="flex items-center justify-between ">
                    <button
                        disabled={loadingButton || loadingUpdateButton}
                        type="button"
                        id="btnUpdateInformasi"
                        className={`inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700 ${
                            loadingButton || loadingUpdateButton ? 'cursor-not-allowed opacity-50' : ''
                        }`}
                        onClick={async () => {
                            const dataUpdate = bankDetails
                                .filter((item: any) => item.nama_bank === selectedNamaBankRow)
                                .map((item: any) => {
                                    return {
                                        ...item,
                                        aktif: item.aktif ? 'Y' : 'N',
                                    };
                                });
                            if (dataUpdate.length > 0) {
                                setLoadingText('Mohon tunggu, sedang memproses update informasi data Bank ' + selectedNamaBankRow + '...');
                                setLoading(true);
                                setLoadingUpdateButton(true);

                                await UpdateInformasiRekening(dataUpdate, token, entitas)
                                    .then((response: any) => {
                                        if (response.status === true) {
                                            withReactContent(swalToast).fire({
                                                icon: 'success',
                                                title: `<p style="font-size:12px">Berhasil Update Informasi Rekening</p>`,
                                                width: '100%',
                                                target: '#BankDialog',
                                            });
                                            setBankDetails(
                                                response.data.map((item: any) => {
                                                    return {
                                                        ...item,
                                                        aktif: item.aktif === 'Y' ? true : false,
                                                    };
                                                })
                                            );
                                            setAfterUpdate(true);
                                            setLoading(false);
                                            setLoadingUpdateButton(false);
                                            setLoadingText('Mohon Tunggu');
                                        }
                                    })
                                    .catch((error: any) => {
                                        withReactContent(swalToast).fire({
                                            icon: 'error',
                                            title: `<p style="font-size:12px">${error.message}</p>`,
                                            width: '100%',
                                            target: '#BankDialog',
                                        });
                                        setLoading(false);
                                        setLoadingUpdateButton(false);
                                        setLoadingText('Mohon Tunggu');
                                    });
                            } else {
                                setLoadingText('Mohon Tunggu');
                                swalToast.fire({
                                    icon: 'error',
                                    title: `<p style="font-size:12px">Tidak ada data yang akan diupdate</p>`,
                                    width: '100%',
                                    target: '#BankDialog',
                                });
                                return;
                            }
                        }}
                    >
                        {loadingUpdateButton ? (
                            <svg
                                aria-hidden="true"
                                role="status"
                                className="me-3 inline h-4 w-4 animate-spin text-gray-200 dark:text-gray-600"
                                viewBox="0 0 100 101"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                    fill="currentColor"
                                />
                                <path
                                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                    fill="#1C64F2"
                                />
                            </svg>
                        ) : (
                            <svg className="h-4 w-4 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 12H5m14 0-4 4m4-4-4-4" />
                            </svg>
                        )}
                        Update Informasi Rekening
                    </button>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            if (bankDetails.length > 0) {
                                simpanBank();
                            } else {
                                swalToast.fire({
                                    icon: 'error',
                                    title: `<p style="font-size:12px">Tidak ada data yang akan diupdate</p>`,
                                    width: '100%',
                                    target: '#BankDialog',
                                });
                                return;
                            }
                        }}
                        disabled={loadingButton || loadingUpdateButton}
                        type="button"
                        className={`rounded-md bg-[#3b3f5c] px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 ${
                            loadingButton || loadingUpdateButton ? 'cursor-not-allowed opacity-50' : ''
                        }`}
                    >
                        {loadingButton && (
                            <svg
                                aria-hidden="true"
                                role="status"
                                className="me-3 inline h-4 w-4 animate-spin text-gray-200 dark:text-gray-600"
                                viewBox="0 0 100 101"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                    fill="currentColor"
                                />
                                <path
                                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                    fill="#1C64F2"
                                />
                            </svg>
                        )}
                        {loadingButton ? 'Simpan... ' : 'Simpan'}
                    </button>

                    <button
                        onClick={() => {
                            if (afterUpdate) {
                                swal.fire({
                                    title: 'Confirm',
                                    text: 'Informasi update rekening belum disimpan, Apakah akan Keluar?',
                                    icon: 'question',
                                    confirmButtonText: 'Yes',
                                    showCancelButton: true,
                                    cancelButtonText: 'No',
                                    target: '#BankDialog',
                                }).then((result) => {
                                    if (result.isConfirmed) {
                                        onClose();
                                    }
                                });
                            } else {
                                onClose();
                            }
                        }}
                        disabled={loadingButton || loadingUpdateButton}
                        type="button"
                        className={`rounded-md bg-[#3b3f5c] px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 ${
                            loadingButton || loadingUpdateButton ? 'cursor-not-allowed opacity-50' : ''
                        }`}
                    >
                        Batal
                    </button>
                </div>
            </div>
        );
    };
    const actionBeginMaster = (args: any): void => {
        if (args.requestType === 'save') {
            const data = args.data as BankListType;

            const nama = data.nama_bank?.trim();
            if (!nama) {
                alert('Nama bank tidak boleh kosong.');
                args.cancel = true;
                return;
            }

            const isDuplicate = bankMaster.some((item) => item.nama_bank.trim().toLowerCase() === nama.toLowerCase() && item.id !== data.id);

            if (isDuplicate) {
                alert(`Nama bank "${nama}" sudah ada.`);
                args.cancel = true;
                return;
            }

            // Tetapkan ID baru jika belum ada
            if (!data.id || isNaN(Number(data.id))) {
                const nextId = Math.max(...bankMaster.map((x) => Number(x.id) || 0)) + 1;
                args.data.id = nextId;
            } else {
                args.data.id = Number(data.id); // Pastikan ID berupa number
            }
        }

        if (args.requestType === 'add') {
            const nextId = Math.max(...bankMaster.map((x) => Number(x.id) || 0)) + 1;

            args.data.id = nextId;
        }
        if (args.requestType === 'delete') {
            const deletedData = args.data;
            const dataToDelete = Array.isArray(deletedData) ? deletedData : [deletedData];

            for (const bank of dataToDelete) {
                const hasDetail = bankDetails.some((d) => d.nama_bank === bank.nama_bank);
                if (hasDetail) {
                    args.cancel = true;
                    alert(`Masih terdapat data rekening bank, tidak bisa dihapus.`);
                    break;
                }
            }
        }
    };

    const actionCompleteMaster = (args: any): void => {
        const data = args.data as BankListType;

        if (args.requestType === 'save') {
            // Tambah / Edit
            if (args.action === 'add' || args.action === 'edit') {
                const now = new Date().toISOString();
                const updatedData = {
                    ...data,
                    tgl_update: now,
                    userid: userid.toUpperCase(), // atau ambil dari auth context
                };

                setBankMaster((prev) => {
                    const exists = prev.some((item) => item.id === data.id);
                    const updated = exists ? prev.map((item) => (item.id === data.id ? updatedData : item)) : [...prev, updatedData];

                    return updated.sort((a, b) => a.id - b.id); // ✅ Urut berdasarkan ID
                });
            }
            if (args.action === 'edit' && args.previousData?.nama_bank && args.previousData.nama_bank !== data.nama_bank) {
                const oldNamaBank = args.previousData.nama_bank;
                const newNamaBank = data.nama_bank;

                setBankDetails((prevDetails) => prevDetails.map((detail) => (detail.nama_bank === oldNamaBank ? { ...detail, nama_bank: newNamaBank } : detail)));

                if (selectedNamaBankRow === oldNamaBank) {
                    setSelectedNamaBankRow(newNamaBank);
                }
            }
        }

        if (args.requestType === 'delete') {
            const toDelete = args.data as BankListType[];
            setBankMaster((prev) => prev.filter((item) => !toDelete.some((del) => del.id === item.id)));

            // Hapus pilihan jika yang terpilih terhapus
            if (toDelete.some((d) => d.id.toString() === selectedNamaBankRow)) {
                setSelectedNamaBankRow('');
            }
        }
    };
    const defaultBankDetail = {
        id: 0,
        kode_akun: '',
        nama_bank: '',
        no_rekening: '',
        nama_rekening: '',
        aktif: true,
        tgl_update: '',
        userid: '',
        keterangan: null,
        saldo_endap: '0.00',
        saldo_akhir: '0.00',
        saldo_real: '0.00',
        nominal_ready: '0.00',
        tgl_buka_rek: null,
        tgl_tutup_rek: null,
        no_akun: '',
        nama_akun: '',
    };
    const actionBeginDetail = (args: any) => {
        if (!args.data) {
            console.warn('args.data is undefined in actionBeginDetail, initializing to {}');
            args.data = {};
        }
        if (args.requestType === 'save') {
            args.data.userid = userid ? userid.toUpperCase() : '';
            args.data.tgl_update = moment().utcOffset('+07:00').format('YYYY-MM-DD HH:mm:ss');
            args.data.nama_bank = selectedNamaBankRow || args.data.nama_bank || '';
            args.data.tgl_buka_rek =
                args.data.tgl_buka_rek && moment(args.data.tgl_buka_rek).isValid()
                    ? moment(args.data.tgl_buka_rek).utcOffset('+07:00').format('YYYY-MM-DD') + ' ' + moment().utcOffset('+07:00').format('HH:mm:ss')
                    : null;
            args.data.tgl_tutup_rek =
                args.data.tgl_tutup_rek && moment(args.data.tgl_tutup_rek).isValid()
                    ? moment(args.data.tgl_tutup_rek).utcOffset('+07:00').format('YYYY-MM-DD') + ' ' + moment().utcOffset('+07:00').format('HH:mm:ss')
                    : null;
        }
        if (args.requestType === 'add') {
            if (!selectedNamaBankRow) {
                args.cancel = true;
                alert('Silakan pilih bank terlebih dahulu sebelum menambahkan rekening.');
                return;
            }
            const maxId = Math.max(...bankDetails.map((d) => Number(d.id) || 0), 0);
            const newId = maxId + 1;
            args.data = {
                ...defaultBankDetail,
                id: newId,
                nama_bank: selectedNamaBankRow,
                userid: userid ? userid.toUpperCase() : '',
                tgl_update: moment().utcOffset('+07:00').format('YYYY-MM-DD HH:mm:ss'),
                tgl_buka_rek: null,
            };

            // Persiapkan data baru
            const newData = {
                ...defaultBankDetail,
                ...args.data,
                id: newId,
                nama_bank: selectedNamaBankRow,
                userid: userid ? userid.toUpperCase() : '',
                tgl_update: moment().utcOffset('+07:00').format('YYYY-MM-DD HH:mm:ss'),
                tgl_buka_rek: null,
            };

            if (gridDetailRef.current) {
                setTimeout(() => {
                    // Tambahkan record baru
                    gridDetailRef.current?.addRecord(newData);

                    // Tunggu sedikit agar record benar-benar ditambahkan
                    setTimeout(() => {
                        const viewRecords = gridDetailRef.current?.getCurrentViewRecords();
                        const index = viewRecords?.findIndex((item: any) => item.id === newId);
                        if (index !== undefined && index >= 0) {
                            gridDetailRef.current?.selectRow(index);
                            gridDetailRef.current?.startEdit();
                        }
                    }, 100); // Atur timing ini sesuai kebutuhan
                }, 0);
            }
        }
        if (args.requestType === 'cancel') {
            const cancelledId = args.data?.id;
            if (cancelledId) {
                args.data.cancelledId = cancelledId;
            }
        }
    };
    const actionCompleteDetail = (args: any) => {
        if (!args.data) {
            console.warn('args.data is undefined in actionCompleteDetail');
            return;
        }
        if (args.requestType === 'save' || args.requestType === 'add') {
            const data = {
                ...defaultBankDetail,
                ...args.data,
                no_rekening: args.data.no_rekening || '',
                nama_rekening: args.data.nama_rekening || '',
                nama_bank: args.data.nama_bank || selectedNamaBankRow || '',
                tgl_buka_rek:
                    args.data.tgl_buka_rek && moment(args.data.tgl_buka_rek).isValid()
                        ? moment(args.data.tgl_buka_rek).utcOffset('+07:00').format('YYYY-MM-DD') + ' ' + moment().utcOffset('+07:00').format('HH:mm:ss')
                        : null,
                tgl_tutup_rek:
                    args.data.tgl_tutup_rek && moment(args.data.tgl_tutup_rek).isValid()
                        ? moment(args.data.tgl_tutup_rek).utcOffset('+07:00').format('YYYY-MM-DD') + ' ' + moment().utcOffset('+07:00').format('HH:mm:ss')
                        : null,
            };
            setBankDetails((prev) => {
                const index = prev.findIndex((d) => d.id === data.id);
                let updated;
                if (index !== -1) {
                    updated = [...prev];
                    updated[index] = {
                        ...updated[index],
                        ...data,
                        no_rekening: data.no_rekening || updated[index].no_rekening || '',
                        nama_rekening: data.nama_rekening || updated[index].nama_rekening || '',
                        tgl_buka_rek: data.tgl_buka_rek || updated[index].tgl_buka_rek,
                        tgl_tutup_rek: data.tgl_tutup_rek || updated[index].tgl_tutup_rek,
                    };
                } else {
                    updated = [...prev, data];
                    if (args.requestType === 'add' && data.id) {
                        setIndexSelected(data.id);
                    }
                }

                if (gridDetailRef.current) {
                    const filteredData = selectedNamaBankRow ? updated.filter((item) => item.nama_bank === selectedNamaBankRow) : updated;

                    if (filteredData.length === 0) {
                        console.warn('No data matches selectedNamaBankRow:', selectedNamaBankRow);
                    }
                    gridDetailRef.current.dataSource = filteredData;
                    setTimeout(() => {
                        gridDetailRef.current?.dataBind();
                        gridDetailRef.current?.refresh();
                        if (args.requestType === 'save' || args.requestType === 'add') {
                            gridDetailRef.current?.clearSelection();
                        }
                    }, 0);
                }
                return updated || prev;
            });
        }
        if (args.requestType === 'delete' || args.requestType === 'cancel') {
            const deletedData = args.data;
            const deletedIds = deletedData ? (Array.isArray(deletedData) ? deletedData.map((item) => item.id || item.cancelledId) : [deletedData.id || deletedData.cancelledId]) : [];
            if (deletedIds.length > 0) {
                setBankDetails((prev) => {
                    const updated = prev.filter((item) => !deletedIds.includes(item.id));

                    if (gridDetailRef.current) {
                        const filteredData = selectedNamaBankRow ? updated.filter((item) => item.nama_bank === selectedNamaBankRow) : updated;

                        gridDetailRef.current.dataSource = filteredData;
                        setTimeout(() => {
                            gridDetailRef.current?.dataBind();
                            gridDetailRef.current?.refresh();
                        }, 0);
                    }
                    return updated;
                });
            }
        }
    };

    const onMasterRowSelected = (args: any) => {
        setSelectedNamaBankRow(args.data.nama_bank);

        if (gridDetailRef.current) {
            const filteredData = bankDetails.filter((item) => item.nama_bank === args.data.nama_bank);
            gridDetailRef.current.dataSource = filteredData;
            gridDetailRef.current.dataBind();
            gridDetailRef.current.refresh();
        }
    };
    const noAkunTemplate = (props: any) => {
        return (
            <div className="col-xs-6 col-sm-6 col-lg-6 col-md-6" style={{ paddingRight: '20px' }}>
                <TextBoxComponent id={`no_akun_${props.id}`} name={`no_akun_${props.id}`} value={props.no_akun} readOnly={true} showClearButton={false} />
                <ButtonComponent
                    type="button"
                    cssClass="e-primary e-small e-round"
                    iconCss="e-icons e-small e-search"
                    onClick={() => {
                        if (gridDetailRef.current && gridDetailRef.current.isEdit) {
                            const currentRow = (gridDetailRef.current.getCurrentViewRecords() as DetailBankType[]).find((row: any) => row.id === props.id);

                            if (currentRow) {
                                setBankDetails((prev: any) => {
                                    const updated = prev.map((item: any) =>
                                        item.id === props.id
                                            ? {
                                                  ...item,
                                                  no_rekening: currentRow.no_rekening || item.no_rekening || '',
                                                  nama_rekening: currentRow.nama_rekening || item.nama_rekening || '',
                                                  tgl_buka_rek:
                                                      currentRow.tgl_buka_rek && moment(currentRow.tgl_buka_rek).isValid()
                                                          ? moment(currentRow.tgl_buka_rek).utcOffset('+07:00').format('YYYY-MM-DD') + ' ' + moment().utcOffset('+07:00').format('HH:mm:ss')
                                                          : null,
                                                  tgl_tutup_rek:
                                                      currentRow.tgl_tutup_rek && moment(currentRow.tgl_tutup_rek).isValid()
                                                          ? moment(currentRow.tgl_tutup_rek).utcOffset('+07:00').format('YYYY-MM-DD') + ' ' + moment().utcOffset('+07:00').format('HH:mm:ss')
                                                          : null,
                                              }
                                            : item
                                    );
                                    return updated;
                                });
                                gridDetailRef.current.endEdit();
                            }
                        }
                        setIndexSelected(props.id);
                        setShowAkunDialog(true);
                    }}
                    style={{ backgroundColor: '#3b3f5c' }}
                />
            </div>
        );
    };
    const toolbarClickDetail = (args: any) => {
        if (args.item.id.includes('BankDetailGrid_add')) {
            if (!selectedNamaBankRow) {
                args.cancel = true;
                alert('Silakan pilih bank terlebih dahulu sebelum menambahkan rekening.');
                return;
            }
            if (gridDetailRef.current) {
                if ((gridDetailRef.current?.dataSource as DetailBankType[])?.some((row: DetailBankType) => row.no_rekening?.trim() === '')) {
                    args.cancel = true;
                    alert('No. Rekening belum diisi.');
                    return;
                }
                if ((gridDetailRef.current?.dataSource as DetailBankType[])?.some((row: DetailBankType) => row.nama_rekening?.trim() === '')) {
                    args.cancel = true;
                    alert('Nama Rekening belum diisi.');
                    return;
                }
                if (
                    (gridDetailRef.current?.dataSource as DetailBankType[])?.some((row: DetailBankType) => row.no_akun?.trim() === '' || row.nama_akun?.trim() === '' || row.kode_akun?.trim() === '')
                ) {
                    args.cancel = true;
                    alert('No. Akun belum diisi.');
                    return;
                }
            }
        }
    };

    const simpanBank = async () => {
        setLoadingText('Mohon tunggu, sedang menyimpan data...');
        const grouped = (gridDetailRef.current?.dataSource as DetailBankType[])?.reduce((acc, curr) => {
            acc[curr.kode_akun] = acc[curr.kode_akun] || [];
            acc[curr.kode_akun].push(curr);
            return acc;
        }, {} as Record<string, DetailBankType[]>);

        const onlyDuplicates = Object.values(grouped).filter((group) => group.length > 1);
        if (onlyDuplicates.length > 0) {
            alert('Sudah Ada Data Dengan No. Akun ' + onlyDuplicates[0][0].no_akun);
            setLoadingText('');
            return;
        }
        if ((gridDetailRef.current?.dataSource as DetailBankType[])?.some((row: DetailBankType) => row.no_rekening?.trim() === '')) {
            alert('No. Rekening belum diisi.');
            setLoadingText('');
            return;
        }
        if ((gridDetailRef.current?.dataSource as DetailBankType[])?.some((row: DetailBankType) => row.nama_rekening?.trim() === '')) {
            alert('Nama Rekening belum diisi.');
            setLoadingText('');
            return;
        }
        if ((gridDetailRef.current?.dataSource as DetailBankType[])?.some((row: DetailBankType) => row.no_akun?.trim() === '' || row.nama_akun?.trim() === '' || row.kode_akun?.trim() === '')) {
            alert('No. Akun belum diisi.');
            setLoadingText('');
            return;
        }

        setLoading(true);
        setLoadingButton(true);
        try {
            if (!loadingButton) {
                const newObject = {
                    entitas: entitas,
                    NamaBank: bankMaster.map((item) => {
                        return {
                            ...item,
                            tgl_update: moment(item.tgl_update).format('YYYY-MM-DD HH:mm:ss'),
                        };
                    }),
                    detailBank: bankDetails.map((item: any) => {
                        return {
                            ...item,
                            aktif: item.aktif ? 'Y' : 'N',
                            saldo_endap: typeof item.saldo_endap === 'number' ? item.saldo_endap.toString() : '',
                            tgl_update: moment(item.tgl_update).format('YYYY-MM-DD HH:mm:ss'),
                        };
                    }),
                };
                const response = await postSimpanBank(token, newObject);

                if (response.status === true) {
                    withReactContent(swalToast).fire({
                        icon: 'success',
                        title: `<p style="font-size:12px">${response.message}</p>`,
                        width: '100%',
                        // target: '#BankDialog',
                    });
                    setBankMaster([]);
                    setBankDetails([]);
                    setSelectedNamaBankRow('');
                    setIndexSelected(0);
                    onClose();
                    setLoading(false);
                    setLoadingButton(false);
                    setLoadingText('Mohon Tunggu');
                } else {
                    alert('Terjadi kesalahan saat menyimpan data.');
                    setLoading(false);
                    setLoadingButton(false);
                    setLoadingText('Mohon Tunggu');
                }
            }
        } catch (error) {
            setLoadingText('Mohon Tunggu');
            setLoading(false);
            setLoadingButton(false);
            alert('Terjadi kesalahan saat menyimpan data.');
        }
    };
    // UseEffect
    useEffect(() => {
        setLoading(true);
        const fetchViewData = async () => {
            try {
                const resultData = await fetchBankData(entitas, token);
                setTimeout(() => {
                    setBankMaster(
                        resultData.BankList.map((item: any, index: number) => ({
                            ...item,
                            id: index + 1,
                        }))
                    );
                    const bankDetailData = resultData.DetaikBankList.map((item: any, index: number) => ({
                        ...item,
                        id: index + 1,
                        saldo_endap: item.saldo_endap === null ? null : parseFloat(item.saldo_endap),
                        aktif: item.aktif === 'Y' ? true : false,
                    }));
                    setBankDetails(bankDetailData);
                    setLoading(false);
                }, 1000);
            } catch (error) {
                setLoading(false);
                console.error('Error fetching data Pengemudi:', error);
            }
        };
        fetchViewData();
    }, [isOpen]);
    //content
    return (
        <>
            <DialogComponent
                id="BankDialog"
                name="BankDialog"
                target="#master-layout"
                header={'Bank'}
                visible={isOpen}
                isModal={true}
                animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
                width="80%"
                height="75%"
                position={{ X: 'center', Y: 'center' }}
                style={{ position: 'fixed' }}
                footerTemplate={footerTemplate}
                showCloseIcon={false}
                open={(args: any) => {
                    args.preventFocus = true;
                }}
                allowDragging={true}
                enableResize={true}
            >
                <div className="relative block  rounded-lg border border-gray-100 bg-white  dark:border-gray-800 dark:bg-gray-800">
                    <div className="flex items-center justify-between border border-l-[#c4c7c5] border-r-[#c4c7c5] border-t-[#c4c7c5] bg-[#EEEEEE] p-[0.4em] px-2 text-[#5d676e]">
                        <h2 className="text-[11px] font-bold text-[#5d676e]">Daftar Bank</h2>
                    </div>
                    <div className={`${loading && 'opacity-20'}`}>
                        {/* Content */}
                        <div className="grid grid-cols-12">
                            <div className="col-span-2">
                                <GridComponent
                                    id="BankListGrid"
                                    name="BankListGrid"
                                    dataSource={bankMaster}
                                    selectionSettings={{ mode: 'Row', type: 'Single' }}
                                    editSettings={{ allowEditing: true, allowAdding: true, allowDeleting: true, mode: 'Normal', newRowPosition: 'Bottom' }}
                                    actionBegin={actionBeginMaster}
                                    actionComplete={actionCompleteMaster}
                                    gridLines={'Both'}
                                    loadingIndicator={{ indicatorType: 'Shimmer' }}
                                    height={470}
                                    // sortSettings={{ columns: [] }}
                                    autoFit={true}
                                    sortSettings={{ columns: [{ field: 'id', direction: 'Ascending' }] }}
                                    rowHeight={22}
                                    selectedRowIndex={0}
                                    rowSelected={onMasterRowSelected}
                                    allowSorting={false}
                                    toolbar={['Add', 'Edit', 'Delete', 'Update', 'Cancel']}
                                    contextMenuItems={['Edit', 'Delete']}
                                >
                                    <ColumnsDirective>
                                        <ColumnDirective field="id" headerText="No" headerTextAlign="Center" isPrimaryKey={true} width={30} visible={false} />
                                        <ColumnDirective field="nama_bank" headerText="Nama Bank" headerTextAlign="Center" />
                                    </ColumnsDirective>
                                    <Inject services={[Edit, Toolbar, ContextMenu]} />
                                </GridComponent>
                            </div>
                            <div className="col-span-10">
                                <GridComponent
                                    id="BankDetailGrid"
                                    ref={gridDetailRef}
                                    dataSource={bankDetails.filter((item) => item.nama_bank === selectedNamaBankRow)}
                                    selectionSettings={{ mode: 'Row', type: 'Single' }}
                                    editSettings={{ allowEditing: true, allowAdding: true, allowDeleting: true, mode: 'Normal', newRowPosition: 'Bottom' }}
                                    toolbar={['Add', 'Edit', 'Delete', 'Update', 'Cancel']}
                                    actionBegin={actionBeginDetail}
                                    actionComplete={actionCompleteDetail}
                                    gridLines="Both"
                                    loadingIndicator={{ indicatorType: 'Shimmer' }}
                                    height={470}
                                    sortSettings={{ columns: [] }}
                                    allowSorting={false}
                                    autoFit={true}
                                    toolbarClick={toolbarClickDetail}
                                    rowHeight={22}
                                    contextMenuItems={['Edit', 'Delete']}
                                >
                                    <ColumnsDirective>
                                        <ColumnDirective field="id" headerText="ID" width="100" isPrimaryKey={true} textAlign="Center" visible={false} />
                                        <ColumnDirective field="nama_bank" headerText="Nama Bank" visible={false} />
                                        <ColumnDirective field="no_rekening" headerTextAlign="Center" headerText="No Rekening" width="150" />
                                        <ColumnDirective field="nama_rekening" headerTextAlign="Center" headerText="Nama Rekening" width="180" />
                                        <ColumnDirective field="no_akun" headerText="No Akun" headerTextAlign="Center" width="150" textAlign="Left" editTemplate={noAkunTemplate} />
                                        <ColumnDirective field="aktif" displayAsCheckBox={true} headerTextAlign="Center" headerText="Aktif" width="80" textAlign="Center" editType="booleanedit" />
                                        <ColumnDirective
                                            field="keterangan"
                                            headerTextAlign="Center"
                                            headerText="Keterangan"
                                            width="180"
                                            editType="dropdownedit"
                                            edit={{ params: { dataSource: new DataManager(keteranganList), fields: { text: 'keterangan', value: 'keterangan' } } }}
                                        />
                                        <ColumnDirective
                                            field="saldo_endap"
                                            headerTextAlign="Center"
                                            headerText="Saldo Endap"
                                            width="130"
                                            format="N2"
                                            textAlign="Right"
                                            editType="numericedit"
                                            edit={{
                                                params: {
                                                    format: 'N2',
                                                    decimals: 2,
                                                    showSpinButton: false,
                                                },
                                            }}
                                            template={(props: any) => {
                                                return <span>{props.saldo_endap ? props.saldo_endap.toLocaleString('en-US', { minimumFractionDigits: 2 }) : ''}</span>;
                                            }}
                                        />
                                        <ColumnDirective
                                            field="tgl_buka_rek"
                                            headerTextAlign="Center"
                                            headerText="Tanggal Buka Rekening"
                                            width="130"
                                            type="date"
                                            format="dd-MM-yyyy"
                                            editType="datepickeredit"
                                            textAlign="Center"
                                        />
                                        <ColumnDirective
                                            field="tgl_tutup_rek"
                                            headerTextAlign="Center"
                                            headerText="Tanggal Tutup Rekening"
                                            width="130"
                                            type="date"
                                            format="dd-MM-yyyy"
                                            editType="datepickeredit"
                                            textAlign="Center"
                                        />
                                    </ColumnsDirective>
                                    <Inject services={[Edit, Toolbar, ContextMenu]} />
                                </GridComponent>
                            </div>
                        </div>
                    </div>
                    {loading && (
                        <div
                            role="status"
                            className="absolute left-1/2 top-2/4 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-4 rounded-lg border bg-white p-4 shadow-lg"
                        >
                            <svg
                                aria-hidden="true"
                                className="h-8 w-8 animate-spin fill-blue-600 text-gray-200 dark:text-gray-600"
                                viewBox="0 0 100 101"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                    fill="currentColor"
                                />
                                <path
                                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                    fill="currentFill"
                                />
                            </svg>
                            {loadingText && <span className="font-bold text-black">{loadingText}</span>}
                        </div>
                    )}
                </div>
            </DialogComponent>
            {showAkunDialog && (
                <DialogAKunBank
                    isOpen={showAkunDialog}
                    onClose={(dataPassing: any) => {
                        if (dataPassing) {
                            setBankDetails((prev) => {
                                const updated = prev.map((item) =>
                                    item.id === indexSelected
                                        ? {
                                              ...item,
                                              no_akun: dataPassing.no_akun || item.no_akun || '',
                                              nama_akun: dataPassing.nama_akun || item.nama_akun || '',
                                              kode_akun: dataPassing.kode_akun || item.kode_akun || '',
                                          }
                                        : item
                                );
                                if (gridDetailRef.current) {
                                    if (gridDetailRef.current.isEdit) {
                                        gridDetailRef.current.endEdit();
                                    }
                                    gridDetailRef.current.dataSource = updated.filter((item) => item.nama_bank === selectedNamaBankRow);
                                    gridDetailRef.current.dataBind();
                                    gridDetailRef.current.refreshColumns();
                                    gridDetailRef.current.refresh();
                                }
                                return updated;
                            });
                        }
                        setShowAkunDialog(false);
                        setShowAkunDialog(false);
                    }}
                    entitas={entitas}
                    token={token}
                    userid={userid}
                />
            )}
        </>
    );
};
export default BankDialog;
