import React, { useEffect, useRef, useState } from 'react';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { GridComponent, ColumnsDirective, ColumnDirective, Inject, Edit, Toolbar, Grid, ContextMenu } from '@syncfusion/ej2-react-grids';
import { fetchCheckData, fetchKecamatanKelurahanData, postSimpanKecamatanKelurahan } from './api';
import swal from 'sweetalert2';
interface Props {
    isOpen: boolean;
    onClose: () => void;
    entitas: string;
    token: string;
    userid: string;
}
interface MasterListType {
    id: number;
    nama_kecamatan: string;
}
interface DetailListType {
    id: number;
    nama_kecamatan: string;
    nama_kelurahan: string;
    nama_kodepos: string;
}
const KecamatanKelurahanDialog = ({ isOpen, onClose, entitas, token, userid }: Props) => {
    const [loading, setLoading] = useState(false);
    const [dsMaster, setDsMaster] = useState<MasterListType[]>([]);
    const [dsDetails, setDsDetails] = useState<DetailListType[]>([]);
    const [selectedNamaKecamatanRow, setSelectedNamaKecamatanRow] = useState<string>('');
    const [selectedNamaKelurahanRow, setSelectedNamaKelurahanRow] = useState<string>('');
    const [loadingButton, setLoadingButton] = useState(false);
    const internalDelete = useRef(false);
    const gridDetailRef = useRef<GridComponent | null>(null);
    const gridMasterRef = useRef<GridComponent | null>(null);
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
    // Function
    const simpanKecamatanKelurahan = async () => {
        // document.activeElement && (document.activeElement as HTMLElement).blur();
        // gridMasterRef.current?.endEdit();
        // gridDetailRef.current?.endEdit();
        setLoading(true);
        setLoadingButton(true);
        setTimeout(async () => {
            try {
                if (!loadingButton) {
                    const newObject = {
                        entitas: entitas,
                        Kecamatan: dsMaster, //currentDataKecamatan, // dsMaster,
                        Kelurahan: dsDetails, //currentDataKelurahan, // dsDetails,
                    };

                    // const currentDataKecamatan = gridMasterRef.current?.getCurrentViewRecords() ?? [];
                    // const currentDataKelurahan = gridDetailRef.current?.getCurrentViewRecords() ?? [];

                    // const newObject = {
                    //     entitas: entitas,
                    //     Kecamatan: currentDataKecamatan,
                    //     Kelurahan: currentDataKelurahan,
                    // };

                    const response = await postSimpanKecamatanKelurahan(token, newObject);

                    if (response.status === true) {
                        swalToast.fire({
                            icon: 'success',
                            title: `<p style="font-size:12px">${response.message}</p>`,
                            width: '100%',
                            target: '#KecamanataKelurahanDialog',
                        });
                        setDsMaster([]);
                        setDsDetails([]);
                        setSelectedNamaKecamatanRow('');
                        // onClose();
                        const resultData = await fetchKecamatanKelurahanData(entitas, token);
                        setTimeout(() => {
                            setDsMaster(
                                resultData.KecamatanList.map((item: any, index: number) => ({
                                    ...item,
                                    id: index + 1,
                                }))
                            );

                            setDsDetails(
                                resultData.KelurahanList.map((item: any, index: number) => ({
                                    ...item,
                                    id: index + 1,
                                }))
                            );
                            setLoading(false);
                        }, 500);

                        setLoading(false);
                        setLoadingButton(false);
                    } else {
                        alert('Terjadi kesalahan saat menyimpan data.');
                        setLoading(false);
                        setLoadingButton(false);
                    }
                }
            } catch (error) {
                setLoading(false);
                setLoadingButton(false);
                alert('Terjadi kesalahan saat menyimpan data.');
            }
        }, 200);
    };
    const footerTemplate = () => {
        return (
            <div className="mx-auto flex items-center justify-between">
                <div className="flex items-center justify-between "></div>

                <div className="flex gap-2">
                    <button
                        onClick={async () => {
                            if (dsDetails.length > 0) {
                                document.activeElement && (document.activeElement as HTMLElement).blur();
                                gridMasterRef.current?.endEdit();
                                gridDetailRef.current?.endEdit();
                                setTimeout(() => {
                                    simpanKecamatanKelurahan();
                                }, 200);
                            } else {
                                swalToast.fire({
                                    icon: 'error',
                                    title: `<p style="font-size:12px">Tidak ada data yang akan diupdate</p>`,
                                    width: '100%',
                                    target: '#KecamanataKelurahanDialog',
                                });
                                return;
                            }
                        }}
                        disabled={loadingButton}
                        type="button"
                        className={`rounded-md bg-[#3b3f5c] px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 ${
                            loadingButton ? 'cursor-not-allowed opacity-50' : ''
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
                            // gridDetailRef.current?.endEdit();
                            // gridMasterRef.current?.endEdit();
                            setSelectedNamaKelurahanRow('');
                            onClose();
                        }}
                        disabled={loadingButton}
                        type="button"
                        className={`rounded-md bg-[#3b3f5c] px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 ${
                            loadingButton ? 'cursor-not-allowed opacity-50' : ''
                        }`}
                    >
                        Batal
                    </button>
                </div>
            </div>
        );
    };
    const actionBeginMaster = async (args: any): Promise<void> => {
        if (args.requestType === 'save') {
            const data = args.data as MasterListType;

            const nama = data.nama_kecamatan?.trim();
            if (!nama) {
                alert('Nama bank tidak boleh kosong.');
                args.cancel = true;
                return;
            }

            const isDuplicate = dsMaster.some((item) => item.nama_kecamatan.trim().toLowerCase() === nama.toLowerCase() && item.id !== data.id);

            if (isDuplicate) {
                alert(`Nama Kecamatan "${nama}" sudah ada.`);
                args.cancel = true;
                return;
            }

            // Tetapkan ID baru jika belum ada
            if (!data.id || isNaN(Number(data.id))) {
                const nextId = Math.max(...dsMaster.map((x) => Number(x.id) || 0)) + 1;
                args.data.id = nextId;
            } else {
                args.data.id = Number(data.id); // Pastikan ID berupa number
            }
        }

        if (args.requestType === 'add') {
            const nextId = Math.max(...dsMaster.map((x) => Number(x.id) || 0)) + 1;
            args.data.id = nextId;
        }
        if (args.requestType === 'delete') {
            const deletedData = args.data;
            const dataToDelete = Array.isArray(deletedData) ? deletedData : [deletedData];

            for (const kecamatan of dataToDelete) {
                const hasDetail = dsDetails.some((d) => d.nama_kecamatan === kecamatan.nama_kecamatan);
                if (hasDetail) {
                    args.cancel = true;
                    alert(`Masih terdapat data kelurahan, tidak bisa dihapus.`);
                    break;
                } else {
                    const apiRes = await fetchCheckData(entitas, token, 'KECAMATAN', selectedNamaKecamatanRow);
                    if (apiRes?.length) {
                        args.cancel = true;
                        alert(`Kecamatan "${selectedNamaKecamatanRow}" masih direferensi data lain, tidak dapat dihapus.`);
                        break;
                    }
                }
            }
        }
    };

    const actionCompleteMaster = (args: any): void => {
        const data = args.data as MasterListType;

        if (args.requestType === 'save') {
            // Tambah / Edit
            if (args.action === 'add' || args.action === 'edit') {
                const now = new Date().toISOString();
                const updatedData = {
                    ...data,
                };

                setDsMaster((prev) => {
                    const exists = prev.some((item) => item.id === data.id);
                    const updated = exists ? prev.map((item) => (item.id === data.id ? updatedData : item)) : [...prev, updatedData];

                    return updated.sort((a, b) => a.id - b.id); // ✅ Urut berdasarkan ID
                });
            }
            if (args.action === 'edit' && args.previousData?.nama_kecamatan && args.previousData.nama_kecamatan !== data.nama_kecamatan) {
                const oldNamaKecamatan = args.previousData.nama_kecamatan;
                const newNamaKecamatan = data.nama_kecamatan;

                setDsDetails((prevDetails) => prevDetails.map((detail) => (detail.nama_kecamatan === oldNamaKecamatan ? { ...detail, nama_kecamatan: newNamaKecamatan } : detail)));

                if (selectedNamaKecamatanRow === oldNamaKecamatan) {
                    setSelectedNamaKecamatanRow(newNamaKecamatan);
                }
            }
        }
    };
    const onMasterRowSelected = (args: any) => {
        setSelectedNamaKecamatanRow(args.data.nama_kecamatan);
    };
    const onDetailRowSelected = (args: any) => {
        setSelectedNamaKelurahanRow(args.data.nama_kelurahan);
    };
    const defaultKelurahanDetail = {
        id: null,
        nama_kecamatan: '',
        nama_kelurahan: '',
        nama_kodepos: '',
    };

    const actionBeginDetail = async (args: any): Promise<void> => {
        if (internalDelete.current && args.requestType === 'delete') {
            internalDelete.current = false;
            return;
        }
        if (args.requestType === 'save') {
            args.data.nama_kecamatan = selectedNamaKecamatanRow;
            const kelurahan = args.data.nama_kelurahan?.trim();
            const kodepos = args.data.nama_kodepos?.trim();
            if (!kelurahan) {
                alert('Kelurahan belum diisi..');
                args.cancel = true;
                return;
            }
            if (!kodepos) {
                alert('Kode Pos belum diisi.');
                args.cancel = true;
                return;
            }
            if (!args.data.id) {
                const maxId = Math.max(...dsDetails.map((d) => Number(d.id) || 0), 0);
                args.data.id = maxId + 1;
            }
        }
        if (args.requestType === 'delete') {
            args.cancel = true;

            const rows = Array.isArray(args.data) ? args.data : [args.data];
            const row = rows[0];
            const kelurahan = row.nama_kelurahan;

            const apiRes = await fetchCheckData(entitas, token, 'KELURAHAN', kelurahan);

            if (apiRes?.length) {
                alert(`Kelurahan "${kelurahan}" masih direferensi.`);
                return;
            }

            internalDelete.current = true;
            gridDetailRef.current?.deleteRecord('id', row);

            setDsDetails((prev) => prev.filter((d) => d.id !== row.id));
        }
    };

    const actionCompleteDetail = (args: any) => {
        if (args.requestType === 'save') {
            const data = { ...defaultKelurahanDetail, ...args.data };

            setDsDetails((prev) => {
                const index = prev.findIndex((d) => d.id === data.id);
                if (index !== -1) {
                    const updated = [...prev];
                    updated[index] = { ...defaultKelurahanDetail, ...prev[index], ...data };
                    return updated;
                } else {
                    // Tambahkan data baru di bagian bawah
                    return [...prev, data];
                }
            });
        }
    };
    const toolbarClickDetail = (args: any) => {
        if (args.item.id.includes('KelurahanDetailGrid_add')) {
            if (!selectedNamaKecamatanRow) {
                args.cancel = true;
                alert('Silakan pilih Kecamatan terlebih dahulu sebelum menambahkan kelurahan.');
            }
        }
    };
    // UseEffect
    useEffect(() => {
        setLoading(true);
        const fetchViewData = async () => {
            try {
                const resultData = await fetchKecamatanKelurahanData(entitas, token);
                setTimeout(() => {
                    setDsMaster(
                        resultData.KecamatanList.map((item: any, index: number) => ({
                            ...item,
                            id: index + 1,
                        }))
                    );

                    setDsDetails(
                        resultData.KelurahanList.map((item: any, index: number) => ({
                            ...item,
                            id: index + 1,
                        }))
                    );
                    setLoading(false);
                }, 1000);
            } catch (error) {
                setLoading(false);
                console.error('Error fetching data Kecamatan dan Kelurahan:', error);
            }
        };
        fetchViewData();
    }, [isOpen]);
    return (
        <DialogComponent
            id="KecamanataKelurahanDialog"
            name="KecamanataKelurahanDialog"
            target="#master-layout"
            header={'Kecamatan dan Kelurahan'}
            visible={isOpen}
            isModal={true}
            animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
            width="80%"
            height="80%"
            position={{ X: 'center', Y: 0 }}
            style={{ position: 'fixed' }}
            close={onClose}
            footerTemplate={footerTemplate}
            // showCloseIcon={true}
            open={(args: any) => {
                args.preventFocus = true;
            }}
            allowDragging={true}
            enableResize={true}
        >
            <div className="relative block  rounded-lg border border-gray-100 bg-white  dark:border-gray-800 dark:bg-gray-800">
                <div className="flex items-center justify-between border border-l-[#c4c7c5] border-r-[#c4c7c5] border-t-[#c4c7c5] bg-[#EEEEEE] p-[0.4em] px-2 text-[#5d676e]">
                    <h2 className="text-[11px] font-bold text-[#5d676e]">Daftar Kecamatan, Kelurahan dan Kodepos</h2>
                </div>
                <div className={`${loading && 'opacity-20'}`}>
                    {/* Content */}
                    <div className="grid grid-cols-12">
                        <div className="col-span-3">
                            <GridComponent
                                id="KecamatanGrid"
                                name="KecamatanGrid"
                                dataSource={dsMaster}
                                selectionSettings={{ mode: 'Row', type: 'Single' }}
                                editSettings={{ allowEditing: true, allowAdding: true, allowDeleting: true, mode: 'Normal', newRowPosition: 'Bottom' }}
                                actionBegin={actionBeginMaster}
                                actionComplete={actionCompleteMaster}
                                gridLines={'Both'}
                                loadingIndicator={{ indicatorType: 'Shimmer' }}
                                height={470}
                                autoFit={true}
                                sortSettings={{ columns: [{ field: 'id', direction: 'Ascending' }] }}
                                rowHeight={22}
                                selectedRowIndex={0}
                                rowSelected={onMasterRowSelected}
                                allowSorting={false}
                                toolbar={['Add', 'Edit', 'Delete', 'Update', 'Cancel']}
                                ref={gridMasterRef}
                                contextMenuItems={['Edit', 'Delete']}
                            >
                                <ColumnsDirective>
                                    <ColumnDirective field="id" headerText="No" headerTextAlign="Center" isPrimaryKey={true} width={30} visible={false} />
                                    <ColumnDirective field="nama_kecamatan" headerText="Nama Kecamatan" headerTextAlign="Center" />
                                </ColumnsDirective>
                                <Inject services={[Edit, Toolbar, ContextMenu]} />
                            </GridComponent>
                        </div>
                        <div className="col-span-9">
                            <GridComponent
                                id="KelurahanDetailGrid"
                                ref={gridDetailRef}
                                dataSource={dsDetails.filter((item) => item.nama_kecamatan === selectedNamaKecamatanRow)}
                                selectionSettings={{ mode: 'Row', type: 'Single' }}
                                editSettings={{ allowEditing: true, allowAdding: true, allowDeleting: true, mode: 'Normal', newRowPosition: 'Bottom' }}
                                toolbar={['Add', 'Edit', 'Delete', 'Update', 'Cancel']}
                                actionBegin={actionBeginDetail}
                                actionComplete={actionCompleteDetail}
                                gridLines="Both"
                                loadingIndicator={{ indicatorType: 'Shimmer' }}
                                height={470}
                                allowSorting={false}
                                autoFit={true}
                                toolbarClick={toolbarClickDetail}
                                rowHeight={22}
                                rowSelected={onDetailRowSelected}
                                contextMenuItems={['Edit', 'Delete']}
                            >
                                <ColumnsDirective>
                                    <ColumnDirective field="id" headerText="ID" width="100" isPrimaryKey={true} textAlign="Center" visible={false} />
                                    <ColumnDirective field="nama_kelurahan" headerTextAlign="Center" headerText="Kelurahan" width="500" />
                                    <ColumnDirective field="nama_kodepos" headerTextAlign="Center" headerText="Kodepos" width="250" />
                                </ColumnsDirective>
                                <Inject services={[Edit, Toolbar, ContextMenu]} />
                            </GridComponent>
                        </div>
                    </div>
                </div>
                {loading && (
                    <div role="status" className="absolute left-1/2 top-2/4 -translate-x-1/2 -translate-y-1/2">
                        <svg aria-hidden="true" className="h-8 w-8 animate-spin fill-blue-600 text-gray-200 dark:text-gray-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                fill="currentColor"
                            />
                            <path
                                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                fill="currentFill"
                            />
                        </svg>
                        <span className="sr-only">Loading...</span>
                    </div>
                )}
            </div>
        </DialogComponent>
    );
};

export default KecamatanKelurahanDialog;
