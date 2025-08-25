import { DialogComponent } from '@syncfusion/ej2-react-popups';
import React, { Fragment, useEffect, useState } from 'react';
import { fecthDataJabatan, fetchDataDetailKaryawan, KaryawanSingleType, postSimpanKaryawan } from '.';
import { TextBoxComponent, ChangeEventArgs as ChangeEventArgsTextBox } from '@syncfusion/ej2-react-inputs';
import { Tab } from '@headlessui/react';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { ChangeEventArgs as ChangeEventArgsDropDown, ComboBoxComponent } from '@syncfusion/ej2-react-dropdowns';
import FrmSalesDlg from './DialogSalesman';
import { myAlertGlobal } from '@/utils/routines';
import moment from 'moment';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    entitas: string;
    token: string;
    userid: string;
    KaryawanSelected: string;
    state: string;
}
const KaryawanDialog = ({ isOpen, onClose, entitas, token, userid, KaryawanSelected, state }: Props) => {
    // Definition
    const [dialogSalesman, setDialogSalesman] = useState(false);
    const [dsMaster, setDsMaster] = useState<KaryawanSingleType>({
        kode_kry: '',
        nama_kry: '',
        kode_sales: '',
        kode_hrm: null,
        jabatan: '',
        userid: '',
        tgl_update: '',
        tgl_gabung: null,
        tgl_masuk: null,
        tgl_keluar: null,
        aktif: 'Y',
        bank_account: null,
        bank_code: null,
        account_name: null,
        nama_sales: '',
    });
    const [jabatanList, setJabatanList] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingButton, setLoadingButton] = useState(false);
    const tabItems = [
        {
            Name: '1. Informasi Karyawan',
            slug: 'informasi',
        },
    ];
    // function
    const updateFieldMasterValue = (field: any, value: any) => {
        setDsMaster((prev) => ({
            ...prev,
            [field]: value,
        }));
    };
    const closeForm = () => {
        setDsMaster({
            kode_kry: '',
            nama_kry: '',
            kode_sales: '',
            kode_hrm: null,
            jabatan: '',
            userid: '',
            tgl_update: '',
            tgl_gabung: null,
            tgl_masuk: null,
            tgl_keluar: null,
            aktif: 'Y',
            bank_account: null,
            bank_code: null,
            account_name: null,
            nama_sales: '',
        });
        onClose();
    };
    const saveDoc = async (buttonType: string) => {
        if (dsMaster.nama_kry.trim() === '') {
            myAlertGlobal('Nama Karyawan Tidak Boleh Kosong', 'FrmKaryawan', 'error');
            return;
        }
        setLoading(true);
        setLoadingButton(true);
        try {
            const newObject = {
                ...dsMaster,
                entitas: entitas,
                userid: userid.toUpperCase(),
                tgl_update: moment().format('YYYY-MM-DD HH:mm:ss'),
            };
            console.log('state', state);
            await postSimpanKaryawan(state === 'edit' ? 'update' : 'create', token, newObject).then((response: any) => {
                setLoading(false);
                setLoadingButton(false);
                if (response.status) {
                    if (buttonType === 'next') {
                        myAlertGlobal('Data Berhasil Disimpan', 'FrmKaryawan', 'success');
                        setDsMaster({
                            kode_kry: '',
                            nama_kry: '',
                            kode_sales: '',
                            kode_hrm: null,
                            jabatan: '',
                            userid: '',
                            tgl_update: '',
                            tgl_gabung: null,
                            tgl_masuk: null,
                            tgl_keluar: null,
                            aktif: 'Y',
                            bank_account: null,
                            bank_code: null,
                            account_name: null,
                            nama_sales: '',
                        });
                    } else {
                        myAlertGlobal(response.message, 'daftarKaryawan', 'success');
                        closeForm();
                    }
                } else {
                    console.log('error', response);
                    myAlertGlobal(response.error, 'FrmKaryawan', 'error');
                }
                setLoading(false);
                setLoadingButton(false);
            });
            //   {
            //     status: true,
            //     message: 'Create Karyawan Berhasil',
            //     data: { kode_kry: 'PG0000000080' }
            //   }
        } catch (error) {
            setLoading(false);
            setLoadingButton(false);
            myAlertGlobal('Terjadi kesalahan, Mohon hubungi admnistrator anda', 'FrmKaryawan', 'warning');
        }
    };
    const footerTemplate = () => {
        return (
            <div className="mx-auto flex items-center justify-between">
                <div className="flex items-center justify-between "></div>
                <div className="flex gap-2">
                    <button
                        onClick={() => saveDoc('next')}
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
                        {loadingButton ? 'Berikut... ' : 'Berikut'}
                    </button>
                    <button
                        onClick={() => saveDoc('close')}
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
                        onClick={() => closeForm()}
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
    const refreshData = async () => {
        console.log(' selectedKaryawan: ', KaryawanSelected);
        setLoading(true);
        const newData = await fetchDataDetailKaryawan(entitas, token, KaryawanSelected);
        setDsMaster(newData[0]);
    };
    // useEffect

    useEffect(() => {
        const refreshJabatan = async () => {
            setLoading(true);
            const newData = await fecthDataJabatan(entitas, token);
            setJabatanList(newData);
            setLoading(false);
        };
        refreshJabatan();
    }, []);
    useEffect(() => {
        const fetchData = async () => {
            await refreshData();
            setTimeout(() => {
                setLoading(false);
            }, 500);
        };
        if (KaryawanSelected) {
            fetchData();
        }
    }, [KaryawanSelected]);
    return (
        <>
            <DialogComponent
                id="FrmKaryawan"
                name="FrmKaryawan"
                target="#daftarKaryawan"
                header={state === 'edit' || KaryawanSelected !== '' ? 'Karyawan : ' + dsMaster?.nama_kry : 'Karyawan Baru'}
                visible={isOpen}
                isModal={true}
                animationSettings={{ effect: 'FadeZoom', duration: 400, delay: 0 }}
                width="40%"
                height="37%"
                position={{ X: 'center', Y: 'center' }}
                style={{ position: 'fixed' }}
                // buttons={buttonsInputData}
                footerTemplate={footerTemplate}
                close={() => {
                    closeForm();
                }}
                closeOnEscape={true}
                open={(args: any) => {
                    args.preventFocus = true;
                }}
                showCloseIcon={true}
                allowDragging={true}
            >
                <div>
                    <div className="relative block ">
                        <div className={`${loading && 'opacity-20'}`}>
                            <Tab.Group defaultIndex={0}>
                                <Tab.List className="flex max-h-20 w-full flex-wrap border-b border-white-light dark:border-[#191e3a]">
                                    {tabItems.map((item: { Name: string; slug: string }, index: number) => (
                                        <Tab key={index} as={Fragment}>
                                            {({ selected }) => (
                                                <button
                                                    onClick={() => {
                                                        // setSelectedTab(item.title);
                                                    }}
                                                    className={`${
                                                        selected ? '!border-white-light !border-b-white font-bold text-gray-900 dark:!border-[#191e3a] dark:!border-b-black' : 'text-gray-400'
                                                    } -mb-[1px] flex items-center border border-transparent p-3.5 py-2 !outline-none transition duration-300 hover:text-danger`}
                                                >
                                                    {item.Name}
                                                </button>
                                            )}
                                        </Tab>
                                    ))}
                                </Tab.List>
                                <Tab.Panels className="w-full flex-1 border border-t-0 border-white-light p-2  text-sm dark:border-[#191e3a]">
                                    {tabItems.map(
                                        (item: { Name: string; slug: string }, index: number) =>
                                            item.slug === 'informasi' && (
                                                <div key={index}>
                                                    <div className="mb-2">
                                                        <label htmlFor="nama_kry" className="block text-xs font-medium text-gray-900 dark:text-white">
                                                            Nama Karyawan
                                                        </label>
                                                        <div className={`rounded border border-gray-300 px-2`}>
                                                            <TextBoxComponent
                                                                name="nama_kry"
                                                                floatLabelType="Never"
                                                                value={dsMaster?.nama_kry}
                                                                onChange={(args: ChangeEventArgsTextBox) => {
                                                                    const value: any = args.value;
                                                                    updateFieldMasterValue('nama_kry', value);
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="mb-2">
                                                        <label htmlFor="jabatah" className="block text-xs font-medium text-gray-900 dark:text-white">
                                                            Jabatan
                                                        </label>
                                                        <div className={`rounded border border-gray-300 px-2`}>
                                                            <ComboBoxComponent
                                                                name="jabatan"
                                                                fields={{
                                                                    text: 'jabatan',
                                                                    value: 'jabatan',
                                                                }}
                                                                id="jabatan"
                                                                dataSource={jabatanList}
                                                                change={(args: ChangeEventArgsDropDown) => {
                                                                    const value: any = args.value;
                                                                    updateFieldMasterValue('jabatan', value);
                                                                }}
                                                                value={dsMaster?.jabatan}
                                                                showClearButton={false}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="">
                                                        <label htmlFor="nama_sales" className="block text-xs font-medium text-gray-900 dark:text-white">
                                                            Nama Salesman
                                                        </label>
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-full rounded border border-gray-300 px-2`}>
                                                                <TextBoxComponent
                                                                    id="nama_sales"
                                                                    name="nama_sales"
                                                                    floatLabelType="Never"
                                                                    value={dsMaster?.nama_sales}
                                                                    change={(args: ChangeEventArgsTextBox) => {
                                                                        const value: any = args.value;
                                                                        updateFieldMasterValue('nama_sales', value);
                                                                    }}
                                                                    readOnly
                                                                />
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <ButtonComponent
                                                                    type="button"
                                                                    cssClass="e-primary e-small e-round"
                                                                    iconCss="e-icons e-small e-search"
                                                                    onClick={() => setDialogSalesman(true)}
                                                                    style={{ backgroundColor: '#3b3f5c' }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs italic text-red-600">{`<Link Data Salesman>`}</p>
                                                </div>
                                            )
                                    )}
                                </Tab.Panels>
                            </Tab.Group>
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
                </div>
            </DialogComponent>
            {dialogSalesman && (
                <FrmSalesDlg
                    isOpen={dialogSalesman}
                    onClose={function (selectedSales: any): void {
                        console.log('selectedSales', selectedSales);
                        if (selectedSales !== null) {
                            updateFieldMasterValue('kode_sales', selectedSales.kode_sales);
                            updateFieldMasterValue('nama_sales', selectedSales.nama_sales);
                        }
                        setDialogSalesman(false);
                    }}
                    entitas={entitas}
                    token={token}
                    KodeSales={dsMaster?.kode_sales ?? ''}
                />
            )}
        </>
    );
};

export default KaryawanDialog;
