import React, { useState, useEffect, useRef } from 'react';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { DropDownListComponent, ChangeEventArgs as ChangeEventArgsDropDown } from '@syncfusion/ej2-react-dropdowns';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { GridComponent, ColumnsDirective, ColumnDirective, Inject, Edit, Toolbar, Grid, ContextMenu, Reorder } from '@syncfusion/ej2-react-grids';
import { TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { fetchYears, fetchDataList, AnggaranTypes, postProsesData } from './api';
import DialogAKunBank from './components/AkunDialog';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import moment from 'moment';
interface Props {
    isOpen: boolean;
    onClose: () => void;
    entitas: string;
    token: string;
    userid: string;
}
const AnggaranAkun = ({ isOpen, onClose, entitas, token, userid }: Props) => {
    // Definition
    const [dsMaster, setDsMaster] = useState<AnggaranTypes[]>([]);
    const [loading, setLoading] = useState(false);
    const [indexSelected, setIndexSelected] = useState(0);
    const [loadingButton, setLoadingButton] = useState(false);
    const [years, setYears] = useState<string[]>([]);
    const [selectedYear, setSelectedYear] = useState<string>('');
    const gridMasterRef = useRef<GridComponent | null>(null);
    const [showAkunDialog, setShowAkunDialog] = useState(false);
    const swalToast = Swal.mixin({
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
    const getDataReady = () => {
        return dsMaster
            .filter((item) => item.state !== undefined)
            .map((item) => ({
                ...item,
                budget1: item.budget1 ?? null,
                budget2: item.budget2 ?? null,
                budget3: item.budget3 ?? null,
                budget4: item.budget4 ?? null,
                budget5: item.budget5 ?? null,
                budget6: item.budget6 ?? null,
                budget7: item.budget7 ?? null,
                budget8: item.budget8 ?? null,
                budget9: item.budget9 ?? null,
                budget10: item.budget10 ?? null,
                budget11: item.budget11 ?? null,
                budget12: item.budget12 ?? null,
            }));
    };
    const saveDoc = async () => {
        setLoadingButton(true);
        setLoading(true);
        try {
            const dataReady = {
                entitas: entitas,
                data: getDataReady(),
            };
            if (dataReady.data.length > 0) {
                await postProsesData(dataReady, token).then((response) => {
                    if (response.status === true) {
                        withReactContent(swalToast).fire({
                            icon: 'success',
                            title: `<p style="font-size:12px">Data berhasil disimpan.</p>`,
                            width: '100%',
                            // target: '#BankDialog',
                        });
                        onClose();
                        setLoading(false);
                        setLoadingButton(false);
                    } else {
                        withReactContent(swalToast).fire({
                            icon: 'error',
                            title: `<p style="font-size:12px">Terjadi kesalahan saat menyimpan data.</p>`,
                            width: '100%',
                            target: '#AnggaranAkunDialog',
                        });
                        setLoading(false);
                        setLoadingButton(false);
                    }
                });
            } else {
                onClose();
                setLoading(false);
                setLoadingButton(false);
            }
        } catch (error: any) {
            setLoading(false);
            setLoadingButton(false);
            console.error('Error saving data:', error);
            withReactContent(swalToast).fire({
                icon: 'error',
                title: `<p style="font-size:12px">${error.response.data.error}</p>`,
                width: '100%',
                target: '#AnggaranAkunDialog',
            });
        }
    };
    const actionBeginMaster = (args: any): void => {
        if (args.requestType === 'save') {
            const data = args.data as AnggaranTypes;
            if (!data.id || isNaN(Number(data.id))) {
                // Data baru
                const nextId = Math.max(...dsMaster.map((x) => Number(x.id) || 0), 0) + 1;
                args.data = {
                    ...data,
                    id: nextId,
                    state: 'EDIT', // Set state untuk data baru
                };
            } else {
                // Data yang sudah ada
                args.data = {
                    ...data,
                    id: Number(data.id),
                    state: data.state === 'NEW' ? 'NEW' : 'EDIT', // Pertahankan NEW atau set EDIT
                };
            }
        }

        if (args.requestType === 'add') {
            const nextId = Math.max(...dsMaster.map((x) => Number(x.id) || 0), 0) + 1;
            const newData: AnggaranTypes = {
                ...args.data,
                id: nextId,
                tahun: selectedYear,
                tgl_update: new Date().toISOString(),
                userid: userid.toUpperCase(),
                state: 'NEW',
                budget1: 0,
                budget2: 0,
                budget3: 0,
                budget4: 0,
                budget5: 0,
                budget6: 0,
                budget7: 0,
                budget8: 0,
                budget9: 0,
                budget10: 0,
                budget11: 0,
                budget12: 0,
            };

            args.cancel = true;

            setTimeout(() => {
                // Tambahkan record baru
                gridMasterRef.current?.addRecord(newData);

                // Tunggu sedikit agar record benar-benar ditambahkan
                setTimeout(() => {
                    const viewRecords = gridMasterRef.current?.getCurrentViewRecords();
                    const index = viewRecords?.findIndex((item: any) => item.id === nextId);
                    if (index !== undefined && index >= 0) {
                        gridMasterRef.current?.selectRow(index);
                        gridMasterRef.current?.startEdit();
                    }
                }, 100); // Atur timing ini sesuai kebutuhan
            }, 0);
        }
    };

    const actionCompleteMaster = (args: any): void => {
        const data = args.data as AnggaranTypes;

        if (args.requestType === 'save') {
            if (args.action === 'add' || args.action === 'edit') {
                // const now = new Date().toISOString();
                const now = moment().format('YYYY-MM-DD HH:mm:ss');
                const updatedData: AnggaranTypes = {
                    ...data,
                    tahun: selectedYear,
                    tgl_update: now,
                    userid: userid.toUpperCase(),
                    state: data.state === 'NEW' ? 'NEW' : 'EDIT', // Pertahankan NEW atau set EDIT
                };

                setDsMaster((prev) => {
                    const exists = prev.some((item) => item.id === data.id);
                    const updated = exists ? prev.map((item) => (item.id === data.id ? updatedData : item)) : [...prev, updatedData];

                    return updated.sort((a, b) => a.id - b.id); // Urut berdasarkan ID
                });
            }
        }

        if (args.requestType === 'delete') {
            const toDelete = args.data as AnggaranTypes[];
            setDsMaster((prev) => {
                const updated = prev.map((item) => {
                    const isDeleted = toDelete.some((del) => del.id === item.id);
                    if (isDeleted) {
                        if (item.state === 'NEW') {
                            // Hapus langsung jika data baru
                            return null;
                        } else {
                            // Tandai DELETE untuk data dari API
                            return { ...item, state: 'DELETE' };
                        }
                    }
                    return item;
                });

                // Filter data yang tidak null (hapus data baru) dan urutkan
                return updated.filter((item): item is AnggaranTypes => item !== null).sort((a, b) => a.id - b.id);
            });

            // Hapus pilihan jika yang terpilih terhapus
            if (toDelete.some((d) => d.id === indexSelected)) {
                setIndexSelected(0);
            }
        }
    };
    const handleChange = (e: ChangeEventArgsDropDown) => {
        const newYear = e.value as string;
        setSelectedYear(newYear);
    };
    const footerTemplate = () => {
        return (
            <div className="mx-auto flex items-center justify-between">
                <div className="flex items-center justify-between "></div>

                <div className="flex gap-2">
                    <button
                        onClick={async () => {
                            await saveDoc();
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
                        onClick={onClose}
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
    const AkunTemplate = (props: any, field: string) => {
        return (
            <div className="col-xs-6 col-sm-6 col-lg-6 col-md-6" style={{ paddingRight: '20px' }}>
                <TextBoxComponent id={props[field]} name={props[field]} value={props[field]} readOnly={true} showClearButton={false} />

                <ButtonComponent
                    type="button" //Solusi tdk refresh halaman saat selesai onClick
                    cssClass="e-primary e-small e-round"
                    iconCss="e-icons e-small e-search"
                    onClick={() => {
                        setIndexSelected(props.id);
                        setShowAkunDialog(true);
                    }}
                    style={{ backgroundColor: '#3b3f5c' }}
                />
            </div>
        );
    };
    const refreshData = async () => {
        try {
            setLoading(true);
            // await fetchDataList(setDsMaster, token, entitas);
            if (gridMasterRef.current) {
                gridMasterRef.current.dataSource = dsMaster.filter((item: any) => item.tahun === selectedYear);
                gridMasterRef.current.refresh();
            }
            setLoading(false);
        } catch (error) {}
    };
    // UseEffect
    useEffect(() => {
        const loadYears = async () => {
            setLoading(true);
            await fetchYears(setYears, setSelectedYear, token, entitas, {
                yearsBefore: 3,
                yearsAfter: 3,
            });
            await fetchDataList(setDsMaster, token, entitas);
            setLoading(false);
        };
        loadYears();
    }, []);
    return (
        <>
            <DialogComponent
                id="AnggaranAkunDialog"
                name="AnggaranAkunDialog"
                target="#master-layout"
                header={'Daftar Budget Per Akun'}
                visible={isOpen}
                isModal={true}
                animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
                width="80%"
                height="80%"
                position={{ X: 'center', Y: 'center' }}
                style={{ position: 'fixed' }}
                close={onClose}
                footerTemplate={footerTemplate}
                showCloseIcon={true}
                open={(args: any) => {
                    args.preventFocus = true;
                }}
                allowDragging={true}
                enableResize={true}
            >
                <div className="relative block  rounded-lg border border-gray-100 bg-white  dark:border-gray-800 dark:bg-gray-800">
                    <div className="flex items-center justify-between border border-l-[#c4c7c5] border-r-[#c4c7c5] border-t-[#c4c7c5] bg-[#EEEEEE] p-[0.4em] px-2 text-[#5d676e]">
                        <h2 className="text-[11px] font-bold text-[#5d676e]">Daftar Bugdet per Akun</h2>
                    </div>
                    <div className="flex items-center justify-between border border-l-[#c4c7c5] border-r-[#c4c7c5] border-t-[#c4c7c5] bg-[#EEEEEE] p-[0.4em] px-2 text-[#5d676e]">
                        <div className="flex items-center gap-2">
                            <div className="form-input w-32">
                                <DropDownListComponent
                                    id="tahun"
                                    dataSource={years}
                                    change={(args: ChangeEventArgsDropDown) => {
                                        handleChange(args);
                                    }}
                                    value={selectedYear}
                                />
                            </div>
                            <button
                                onClick={() => {
                                    refreshData();
                                }}
                                disabled={loadingButton}
                                type="button"
                                className={`rounded-md bg-[#3b3f5c] px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 ${
                                    loadingButton ? 'cursor-not-allowed opacity-50' : ''
                                }`}
                            >
                                Refresh
                            </button>
                        </div>
                    </div>
                    <div className={`${loading && 'opacity-20'}`}>
                        <GridComponent
                            id="KecamatanGrid"
                            name="KecamatanGrid"
                            dataSource={dsMaster.filter((item: AnggaranTypes) => item.tahun === selectedYear && item.state !== 'DELETE')}
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
                            allowReordering={true}
                            allowSorting={false}
                            toolbar={['Add', 'Edit', 'Delete', 'Update', 'Cancel']}
                            ref={gridMasterRef}
                            contextMenuItems={['Edit', 'Delete']}
                        >
                            <ColumnsDirective>
                                <ColumnDirective field="id" headerText="No" headerTextAlign="Center" isPrimaryKey={true} width={30} visible={false} />
                                <ColumnDirective field="no_akun" headerText="No. Akun" headerTextAlign="Center" width={100} editTemplate={(e: any) => AkunTemplate(e, 'no_akun')} />
                                <ColumnDirective field="nama_akun" headerText="Nama Akun" headerTextAlign="Center" width={200} editTemplate={(e: any) => AkunTemplate(e, 'nama_akun')} />
                                <ColumnDirective
                                    field="budget1"
                                    headerText="Januari"
                                    headerTextAlign="Center"
                                    width={110}
                                    textAlign="Right"
                                    editType="numericedit"
                                    format="N2"
                                    // template={(props: any) => {
                                    // return <span>{props.budget1 ? props.budget1.toLocaleString('en-US', { minimumFractionDigits: 2 }) : ''}</span>;
                                    // }}
                                    edit={{
                                        params: {
                                            format: 'N2',
                                            decimals: 2,
                                            showSpinButton: false,
                                        },
                                    }}
                                />
                                <ColumnDirective
                                    field="budget2"
                                    headerText="Februari"
                                    headerTextAlign="Center"
                                    width={110}
                                    textAlign="Right"
                                    editType="numericedit"
                                    format="N2"
                                    // template={(props: any) => {
                                    // return <span>{props.budget2 ? props.budget2.toLocaleString('en-US', { minimumFractionDigits: 2 }) : ''}</span>;
                                    // }}
                                    edit={{
                                        params: {
                                            format: 'N2',
                                            decimals: 2,
                                            showSpinButton: false,
                                        },
                                    }}
                                />
                                <ColumnDirective
                                    field="budget3"
                                    headerText="Maret"
                                    headerTextAlign="Center"
                                    width={110}
                                    textAlign="Right"
                                    editType="numericedit"
                                    format="N2"
                                    // template={(props: any) => {
                                    // return <span>{props.budget3 ? props.budget3.toLocaleString('en-US', { minimumFractionDigits: 2 }) : ''}</span>;
                                    // }}
                                    edit={{
                                        params: {
                                            format: 'N2',
                                            decimals: 2,
                                            showSpinButton: false,
                                        },
                                    }}
                                />
                                <ColumnDirective
                                    field="budget4"
                                    headerText="April"
                                    headerTextAlign="Center"
                                    width={110}
                                    textAlign="Right"
                                    editType="numericedit"
                                    format="N2"
                                    // template={(props: any) => {
                                    // return <span>{props.budget4 ? props.budget4.toLocaleString('en-US', { minimumFractionDigits: 2 }) : ''}</span>;
                                    // }}
                                    edit={{
                                        params: {
                                            format: 'N2',
                                            decimals: 2,
                                            showSpinButton: false,
                                        },
                                    }}
                                />
                                <ColumnDirective
                                    field="budget5"
                                    headerText="Mei"
                                    headerTextAlign="Center"
                                    width={110}
                                    textAlign="Right"
                                    editType="numericedit"
                                    format="N2"
                                    // template={(props: any) => {
                                    // return <span>{props.budget5 ? props.budget5.toLocaleString('en-US', { minimumFractionDigits: 2 }) : ''}</span>;
                                    // }}
                                    edit={{
                                        params: {
                                            format: 'N2',
                                            decimals: 2,
                                            showSpinButton: false,
                                        },
                                    }}
                                />
                                <ColumnDirective
                                    field="budget6"
                                    headerText="Juni"
                                    headerTextAlign="Center"
                                    width={110}
                                    textAlign="Right"
                                    editType="numericedit"
                                    format="N2"
                                    // template={(props: any) => {
                                    // return <span>{props.budget6 ? props.budget6.toLocaleString('en-US', { minimumFractionDigits: 2 }) : ''}</span>;
                                    // }}
                                    edit={{
                                        params: {
                                            format: 'N2',
                                            decimals: 2,
                                            showSpinButton: false,
                                        },
                                    }}
                                />
                                <ColumnDirective
                                    field="budget7"
                                    headerText="Juli"
                                    headerTextAlign="Center"
                                    width={110}
                                    textAlign="Right"
                                    editType="numericedit"
                                    format="N2"
                                    // template={(props: any) => {
                                    // return <span>{props.budget7 ? props.budget7.toLocaleString('en-US', { minimumFractionDigits: 2 }) : ''}</span>;
                                    // }}
                                    edit={{
                                        params: {
                                            format: 'N2',
                                            decimals: 2,
                                            showSpinButton: false,
                                        },
                                    }}
                                />
                                <ColumnDirective
                                    field="budget8"
                                    headerText="Agustus"
                                    headerTextAlign="Center"
                                    width={110}
                                    textAlign="Right"
                                    editType="numericedit"
                                    format="N2"
                                    // template={(props: any) => {
                                    // return <span>{props.budget8 ? props.budget8.toLocaleString('en-US', { minimumFractionDigits: 2 }) : ''}</span>;
                                    // }}
                                    edit={{
                                        params: {
                                            format: 'N2',
                                            decimals: 2,
                                            showSpinButton: false,
                                        },
                                    }}
                                />
                                <ColumnDirective
                                    field="budget9"
                                    headerText="September"
                                    headerTextAlign="Center"
                                    width={110}
                                    textAlign="Right"
                                    editType="numericedit"
                                    format="N2"
                                    // template={(props: any) => {
                                    // return <span>{props.budget9 ? props.budget9.toLocaleString('en-US', { minimumFractionDigits: 2 }) : ''}</span>;
                                    // }}
                                    edit={{
                                        params: {
                                            format: 'N2',
                                            decimals: 2,
                                            showSpinButton: false,
                                        },
                                    }}
                                />
                                <ColumnDirective
                                    field="budget10"
                                    headerText="Oktober"
                                    headerTextAlign="Center"
                                    width={110}
                                    textAlign="Right"
                                    editType="numericedit"
                                    format="N2"
                                    // template={(props: any) => {
                                    // return <span>{props.budget10 ? props.budget10.toLocaleString('en-US', { minimumFractionDigits: 2 }) : ''}</span>;
                                    // }}
                                    edit={{
                                        params: {
                                            format: 'N2',
                                            decimals: 2,
                                            showSpinButton: false,
                                        },
                                    }}
                                />
                                <ColumnDirective
                                    field="budget11"
                                    headerText="November"
                                    headerTextAlign="Center"
                                    width={110}
                                    textAlign="Right"
                                    editType="numericedit"
                                    format="N2"
                                    // template={(props: any) => {
                                    // return <span>{props.budget11 ? props.budget11.toLocaleString('en-US', { minimumFractionDigits: 2 }) : ''}</span>;
                                    // }}
                                    edit={{
                                        params: {
                                            format: 'N2',
                                            decimals: 2,
                                            showSpinButton: false,
                                        },
                                    }}
                                />
                                <ColumnDirective
                                    field="budget12"
                                    headerText="Desember"
                                    headerTextAlign="Center"
                                    width={110}
                                    textAlign="Right"
                                    editType="numericedit"
                                    format="N2"
                                    // template={(props: any) => {
                                    // return <span>{props.budget12 ? props.budget12.toLocaleString('en-US', { minimumFractionDigits: 2 }) : ''}</span>;
                                    // }}
                                    edit={{
                                        params: {
                                            format: 'N2',
                                            decimals: 2,
                                            showSpinButton: false,
                                        },
                                    }}
                                />
                            </ColumnsDirective>
                            <Inject services={[Edit, Toolbar, ContextMenu, Reorder]} />
                        </GridComponent>
                    </div>
                    {loading && (
                        <div role="status" className="absolute left-1/2 top-2/4 -translate-x-1/2 -translate-y-1/2">
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
                            <span className="sr-only">Loading...</span>
                        </div>
                    )}
                </div>
            </DialogComponent>
            {showAkunDialog && (
                <DialogAKunBank
                    isOpen={showAkunDialog}
                    onClose={(dataPassing: any) => {
                        if (dataPassing) {
                            setDsMaster((prev) =>
                                prev.map((item) =>
                                    item.id === indexSelected
                                        ? {
                                              ...item,
                                              ...(item.state !== 'NEW' && {
                                                  Old_kode_akun: item.kode_akun,
                                                  Old_tahun: item.tahun,
                                              }),
                                              no_akun: dataPassing.no_akun,
                                              nama_akun: dataPassing.nama_akun,
                                              kode_akun: dataPassing.kode_akun,
                                              state: item.state === 'NEW' ? 'NEW' : 'EDIT',
                                          }
                                        : item
                                )
                            );
                        }
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

export default AnggaranAkun;
